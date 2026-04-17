'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import {
	Clock,
	MapPin,
	ShieldCheck,
	Loader2,
	History,
	ArrowRightCircle,
	ArrowRight,
  Info,
  Users,
  PartyPopper
} from 'lucide-react';
import CameraModal from '../attendance/CameraModal';
import Image from 'next/image';
import { toast } from 'sonner';
import {
	loadFaceModels,
	analyzeFace,
	compareFace,
	getFaceAnalysisErrorMessage,
} from '@/lib/faceRecognition';
import {
	getTodayAttendanceItems,
	type AttendanceItem,
	EMPTY_IMAGE,
} from '@/lib/todayAttendance';
import { clockAttendance, getTodayAttendance } from '@/service/attendance';
import { uploadMedia } from '@/service/media';
import { getCalendarEvents, CalendarEvent } from '@/service/calendar';
import { useAuthStore } from '@/store/auth.store';
import { useRefresh } from '@/lib/RefreshContext';

type Coordinates = {
	latitude: number;
	longitude: number;
};

interface TenantSettingsData {
	allowMultipleCheck: boolean;
	clockInStart?: string;
	clockInEnd?: string;
	clockOutStart?: string;
	clockOutEnd?: string;
}

const dataUrlToFile = async (dataUrl: string) => {
	const response = await fetch(dataUrl);
	const blob = await response.blob();
	const extension = blob.type.split('/')[1] || 'png';
	return new File([blob], `attendance-${Date.now()}.${extension}`, {
		type: blob.type || 'image/png',
	});
};

export default function ClockCard() {
	const { user } = useAuthStore();
	const { triggerRefresh } = useRefresh();
	const [mounted, setMounted] = useState(false);
	const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
	const [now, setNow] = useState<dayjs.Dayjs | null>(null);
	const [openCamera, setOpenCamera] = useState(false);
	const [loading, setLoading] = useState(false);
	const [, setStatus] = useState<'idle' | 'camera' | 'processing'>(
		'idle',
	);
	const [coords, setCoords] = useState<Coordinates>({
		latitude: 0,
		longitude: 0,
	});
	const [location, setLocation] = useState<string>('Mencari lokasi...');
	const [selectedAction, setSelectedAction] = useState<
		'clock_in' | 'clock_out' | null
	>(null);
	const [isOffToday, setIsOffToday] = useState(false);
	const [isOnLeave, setIsOnLeave] = useState(false);
  const [isOfficeClosed, setIsOfficeClosed] = useState(false);
  const [todayEvent, setTodayEvent] = useState<CalendarEvent | null>(null);
	const [shiftInfo, setShiftInfo] = useState<string>('Memuat jadwal...');

	const [tenantSettings, setTenantSettings] = useState<TenantSettingsData>({
		allowMultipleCheck: false,
	});

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setMounted(true);
			setNow(dayjs());
		}, 0);
		
		const intervalId = setInterval(() => setNow(dayjs()), 1000);
		
		return () => {
			clearTimeout(timeoutId);
			clearInterval(intervalId);
		};
	}, []);

	useEffect(() => {
		if (mounted) {
			const timeoutId = setTimeout(() => {
				setAttendance(getTodayAttendanceItems(user));
			}, 0);
			return () => clearTimeout(timeoutId);
		}
	}, [user, mounted]);

	const initData = useCallback(async () => {
		if (!user) return;
		try {
			setLoading(true);
			const [todayResp, eventsResp] = await Promise.all([
        getTodayAttendance(),
        getCalendarEvents(dayjs().year())
      ]);

			const settings =
				user.tenant_setting || user.tenant?.tenant_settings;
			if (settings) {
				setTenantSettings({
					allowMultipleCheck: Boolean(settings.allow_multiple_check),
					clockInStart: settings.clock_in_start_time,
					clockInEnd: settings.clock_in_end_time,
					clockOutStart: settings.clock_out_start_time,
					clockOutEnd: settings.clock_out_end_time,
				});
			}

			if (todayResp.data?.status === 'On Leave') {
				setIsOnLeave(true);
				setShiftInfo('Sedang Cuti');
				return;
			}

      // Check for calendar events today
      const todayStr = dayjs().format('YYYY-MM-DD');
      const eventToday = eventsResp.data?.find(e => dayjs(e.date).format('YYYY-MM-DD') === todayStr);
      
      if (eventToday) {
        setTodayEvent(eventToday);
        if (eventToday.category === 'OFFICE_CLOSED') {
          setIsOfficeClosed(true);
          setShiftInfo(`Kantor Tutup: ${eventToday.name}`);
          return;
        }
      }

			const currentShift = user.shift;
			if (currentShift) {
				if (currentShift.name === 'work_shift_tenant') {
					setShiftInfo(
						settings
							? `Jadwal Kantor (${settings.clock_in_start_time} - ${settings.clock_out_start_time})`
							: 'Jadwal Kantor',
					);
					setIsOffToday(false);
				} else if (currentShift.name.toLowerCase() === 'off') {
					setIsOffToday(true);
					setShiftInfo('Libur Terjadwal');
				} else if (currentShift.name === 'Sedang Cuti') {
					setIsOnLeave(true);
					setShiftInfo('Sedang Cuti');
				} else {
					setShiftInfo(
						`${currentShift.name} (${currentShift.startTime} - ${currentShift.endTime})`,
					);
					setIsOffToday(false);
				}
			} else {
				setShiftInfo('Tidak ada jadwal');
				setIsOffToday(true);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (mounted) {
			const timeoutId = setTimeout(() => {
				initData();
			}, 0);
			return () => clearTimeout(timeoutId);
		}
	}, [mounted, initData]);

	useEffect(() => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			const timeoutId = setTimeout(() => {
				setLocation('Lokasi tidak didukung');
			}, 0);
			return () => clearTimeout(timeoutId);
		}
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const lat = Number(pos.coords.latitude.toFixed(6));
				const lng = Number(pos.coords.longitude.toFixed(6));
				setCoords({ latitude: lat, longitude: lng });
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
					);
					const data = await res.json();
					if (data?.address) {
						const shortAddress = [
							data.address.road,
							data.address.village || data.address.suburb,
						]
							.filter(Boolean)
							.join(', ');
						setLocation(
							shortAddress ||
								data.display_name ||
								`${lat}, ${lng}`,
						);
					}
				} catch {
					setLocation(`${lat}, ${lng}`);
				}
			},
			() => setLocation('Akses lokasi ditolak'),
		);
	}, []);

	if (!mounted || !now) return null;

	const handleClockClick = (type: 'clock_in' | 'clock_out') => {
		if (isOffToday || isOnLeave || isOfficeClosed)
			return toast.error('Anda tidak memiliki jadwal kerja hari ini.');
		setSelectedAction(type);
		const settings = user?.tenant_setting || user?.tenant?.tenant_settings;
		if (settings?.require_selfie) {
			setStatus('camera');
			setOpenCamera(true);
		} else {
			handleDirectClock(type);
		}
	};

	const handleDirectClock = async (type: 'clock_in' | 'clock_out') => {
		try {
			setLoading(true);
			await clockAttendance({
				action: type,
				latitude: coords.latitude,
				longitude: coords.longitude,
				media_url: '',
			});
			setAttendance((prev) => [
				{ type, image: '', time: dayjs().format('HH:mm:ss'), location },
				...prev,
			]);
			triggerRefresh();
			toast.success(
				`${type === 'clock_in' ? 'Clock In' : 'Clock Out'} berhasil`,
			);
		} catch (error) {
			console.log(error);
			toast.error('Terjadi kesalahan.');
		} finally {
			setLoading(false);
		}
	};

	const handleCapture = async (img: string) => {
		try {
			setLoading(true);
			setStatus('processing');
			await loadFaceModels();
			const selfieImg = new window.Image();
			selfieImg.src = img;
			const profileImg = new window.Image();
			profileImg.src = '/profile.jpg';
			await Promise.all([
				new Promise((r) => (selfieImg.onload = r)),
				new Promise((r) => (profileImg.onload = r)),
			]);
			const selfieAnalysis = await analyzeFace(selfieImg);
			if (!selfieAnalysis.ok)
				return toast.error(
					getFaceAnalysisErrorMessage(selfieAnalysis.error),
				);

			const profileAnalysis = await analyzeFace(profileImg);
			if (!profileAnalysis.ok)
				return toast.error('Foto profil tidak valid.');
			if (
				!compareFace(
					selfieAnalysis.metrics.descriptor,
					profileAnalysis.metrics.descriptor,
				).isMatch
			)
				return toast.error('Wajah tidak cocok.');

			const file = await dataUrlToFile(img);
			const mediaUrl = await uploadMedia(file);
			await clockAttendance({
				action: selectedAction!,
				latitude: coords.latitude,
				longitude: coords.longitude,
				media_url: mediaUrl,
			});
			setAttendance((prev) => [
				{
					type: selectedAction,
					image: mediaUrl,
					time: dayjs().format('HH:mm:ss'),
					location,
				},
				...prev,
			]);
			setOpenCamera(false);
			triggerRefresh();
			toast.success('Absensi berhasil');
		} catch (error) {
      console.log(error);
      
			toast.error('Terjadi kesalahan.');
		} finally {
			setLoading(false);
			setStatus('idle');
		}
	};

	const latestLog = attendance.length > 0 ? attendance[0] : null;
	const canClockIn =
		(tenantSettings.allowMultipleCheck
			? !latestLog || latestLog.type === 'clock_out'
			: !attendance.some((a) => a.type === 'clock_in')) &&
		!isOffToday &&
		!isOnLeave &&
    !isOfficeClosed;
	const canClockOut =
		(tenantSettings.allowMultipleCheck
			? latestLog && latestLog.type === 'clock_in'
			: attendance.some((a) => a.type === 'clock_in') &&
				!attendance.some((a) => a.type === 'clock_out')) &&
		!isOffToday &&
		!isOnLeave &&
    !isOfficeClosed;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'National Holiday': return <PartyPopper size={14} className="text-amber-500" />;
      case 'Meeting': return <Users size={14} className="text-blue-500" />;
      default: return <Info size={14} className="text-indigo-500" />;
    }
  };

	return (
		<>
			<div className='w-full mx-auto rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col group/card'>
				
        {/* Info Banner for INFORMATION category events */}
        {!isOfficeClosed && todayEvent && todayEvent.category === 'INFORMATION' && (todayEvent.is_all_users || (user && todayEvent.user_ids?.includes(user.id))) && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3 animate-in slide-in-from-top duration-500">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              {getEventIcon(todayEvent.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Today&lsquo;s Agenda</p>
              <p className="text-xs font-bold text-slate-700 truncate">{todayEvent.name}</p>
            </div>
            {todayEvent.description && (
              <div className="group/desc relative">
                <div className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-blue-100 transition-colors cursor-help">
                  <Info size={14} className="text-blue-400" />
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all z-50 leading-relaxed">
                  {todayEvent.description}
                </div>
              </div>
            )}
          </div>
        )}

				<div className='p-6 sm:p-8 flex flex-col items-center gap-6 relative'>
					<div className='absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none'></div>

					{/* Status Pill */}
					<div className='flex gap-2 z-10'>
						<div className='px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2'>
							<Clock size={12} />{' '}
							{now.format('dddd, DD MMM YYYY')}
						</div>
						{isOnLeave ? (
							<div className='px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200'>
								On Leave
							</div>
						) : isOfficeClosed ? (
              <div className='px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200'>
								Closed
							</div>
            ) : isOffToday ? (
							<div className='px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200'>
								Off Day
							</div>
						) : (
							<div className='px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest'>
								Active
							</div>
						)}
					</div>

					{/* Clock Display */}
					<div className='text-center'>
						<h2 className='text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none'>
							{now.format('HH:mm')}
							<span className='text-lg ml-1 text-slate-300 font-bold opacity-50 animate-pulse'>
								{now.format('ss')}
							</span>
						</h2>
					</div>

					{/* Location & Shift Group */}
					<div className='w-full max-w-sm flex flex-col gap-2'>
						<div className='flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-sm'>
							<div className='w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 shadow-xs'>
								<MapPin size={14} strokeWidth={2.5} />
							</div>
							<p className='text-xs font-bold text-slate-600 truncate flex-1'>
								{location}
							</p>
						</div>
						<div className='flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-sm'>
							<div className='w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-xs'>
								<Clock size={14} strokeWidth={2.5} />
							</div>
							<p className='text-xs font-bold text-slate-600 truncate flex-1'>
								{shiftInfo}
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='w-full max-w-sm grid grid-cols-2 gap-3 pt-2'>
						<button
							onClick={() => handleClockClick('clock_in')}
							disabled={loading || !canClockIn}
							className={`h-14 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${!canClockIn ? 'bg-slate-50 text-slate-300' : 'bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 active:scale-95'}`}>
							{loading && selectedAction === 'clock_in' ? (
								<Loader2 className='animate-spin' size={18} />
							) : (
								<ArrowRight size={18} strokeWidth={3} />
							)}
							<span className='text-[10px] font-black uppercase tracking-widest'>
								Clock In - {canClockIn}
							</span>
						</button>
						<button
							onClick={() => handleClockClick('clock_out')}
							disabled={loading || !canClockOut}
							className={`h-14 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 border-2 ${!canClockOut ? 'bg-slate-50 border border-slate-100 text-slate-300' : 'bg-white border-slate-200 text-slate-900 shadow-md hover:border-orange-500 hover:text-orange-600 hover:-translate-y-0.5 active:scale-95'}`}>
							{loading && selectedAction === 'clock_out' ? (
								<Loader2
									className='animate-spin text-orange-500'
									size={18}
								/>
							) : (
								<ArrowRightCircle
									size={18}
									strokeWidth={3}
									className='rotate-180'
								/>
							)}
							<span className='text-[10px] font-black uppercase tracking-widest'>
								Clock Out
							</span>
						</button>
					</div>
				</div>

				{/* Activity Log Section */}
				<div className='bg-slate-50/30 border-t border-slate-100 p-6'>
					<div className='flex items-center gap-3 mb-4 px-1'>
						<History size={14} className='text-slate-400' />
						<h3 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex-1'>
							Recent Activity
						</h3>
						{tenantSettings.allowMultipleCheck && (
							<span className='text-[8px] font-black text-indigo-500 bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-xs'>
								MULTI
							</span>
						)}
					</div>

					<div className='space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar'>
						{attendance.length === 0 ? (
							<p className='text-center py-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
								No logs today
							</p>
						) : (
							attendance.map((item, idx) => (
								<div
									key={idx}
									className='bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 group/item transition-all hover:border-indigo-100'>
									<div className='relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-50 bg-slate-50'>
										<Image
											src={item.image || EMPTY_IMAGE}
											alt='Log'
											fill
											className='object-cover'
											unoptimized
										/>
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between'>
											<span
												className={`text-[9px] font-black uppercase tracking-widest ${item.type === 'clock_in' ? 'text-emerald-600' : 'text-orange-600'}`}>
												{item.type === 'clock_in'
													? 'IN'
													: 'OUT'}
											</span>
											<span className='text-[11px] font-black text-slate-800 tabular-nums'>
												{item.time}
											</span>
										</div>
										<p className='text-[10px] font-bold text-slate-400 truncate'>
											{item.location.split(',')[0]}
										</p>
									</div>
									<ShieldCheck
										size={14}
										className='text-emerald-500'
									/>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			<CameraModal
				open={openCamera}
				loading={loading}
				onClose={() => {
					setOpenCamera(false);
					setStatus('idle');
				}}
				onCapture={handleCapture}
			/>
		</>
	);
}
