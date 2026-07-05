import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
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
} from '@/lib/todayAttendance';
import { clockAttendance, getTodayAttendance } from '@/service/attendance';
import { uploadMedia } from '@/service/media';
import { getCalendarEvents, CalendarEvent } from '@/service/calendar';
import { useAuthStore } from '@/store/auth.store';
import { useRefresh } from '@/lib/RefreshContext';
import { getProfileImage } from '@/lib/utils';
import { CustomApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

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

export function useClockCardLogic() {
	const { user } = useAuthStore();
	const { triggerRefresh } = useRefresh();
	const queryClient = useQueryClient();
	const [mounted, setMounted] = useState(false);
	const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
	const [now, setNow] = useState<dayjs.Dayjs | null>(null);
	const [openCamera, setOpenCamera] = useState(false);
	const [loading, setLoading] = useState(false);
	const [, setStatus] = useState<'idle' | 'camera' | 'processing'>('idle');
	const [coords, setCoords] = useState<Coordinates>({ latitude: 0, longitude: 0 });
	const [location, setLocation] = useState<string>('Mencari lokasi...');
	const [selectedAction, setSelectedAction] = useState<'clock_in' | 'clock_out' | null>(null);
	const [isOffToday, setIsOffToday] = useState(false);
	const [isOnLeave, setIsOnLeave] = useState(false);
	const [isOfficeClosed, setIsOfficeClosed] = useState(false);
	const [todayEvent, setTodayEvent] = useState<CalendarEvent | null>(null);
	const [shiftInfo, setShiftInfo] = useState<string>('Memuat jadwal...');
	const [tenantSettings, setTenantSettings] = useState<TenantSettingsData>({ allowMultipleCheck: false });

	const hasProfileImage = !!getProfileImage(user?.media_url);

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
				getTodayAttendance(true),
				getCalendarEvents(dayjs().year())
			]);

			const settings = user.tenant_setting || user.tenant?.tenant_settings;
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
					setShiftInfo(`${currentShift.name} (${currentShift.startTime} - ${currentShift.endTime})`);
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
				loadFaceModels().catch(err => console.error("Failed to pre-load face models:", err));
			}, 0);
			return () => clearTimeout(timeoutId);
		}
	}, [mounted, initData]);

	useEffect(() => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			const timeoutId = setTimeout(() => setLocation('Lokasi tidak didukung'), 0);
			return () => clearTimeout(timeoutId);
		}
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const lat = Number(pos.coords.latitude.toFixed(6));
				const lng = Number(pos.coords.longitude.toFixed(6));
				setCoords({ latitude: lat, longitude: lng });
				try {
					const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
					const data = await res.json();
					if (data?.address) {
						const shortAddress = [data.address.road, data.address.village || data.address.suburb].filter(Boolean).join(', ');
						setLocation(shortAddress || data.display_name || `${lat}, ${lng}`);
					}
				} catch {
					setLocation(`${lat}, ${lng}`);
				}
			},
			() => setLocation('Akses lokasi ditolak'),
		);
	}, []);

	const handleDirectClock = async (type: 'clock_in' | 'clock_out') => {
		try {
			setLoading(true);
			await clockAttendance({ action: type, latitude: coords.latitude, longitude: coords.longitude, media_url: '' });
			const nowTime = dayjs().format('HH:mm');
			setAttendance((prev) => [{ type, image: '', time: dayjs().format('HH:mm:ss'), location }, ...prev]);
			triggerRefresh();

			queryClient.setQueryData(['today-attendance'], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					clock_in_time: type === 'clock_in' ? nowTime : oldData.clock_in_time,
					clock_out_time: type === 'clock_out' ? nowTime : oldData.clock_out_time,
				};
			});

			setTimeout(() => queryClient.invalidateQueries({ queryKey: ['today-attendance'] }), 1500);
			toast.success(`${type === 'clock_in' ? 'Clock In' : 'Clock Out'} berhasil`);
		} catch (error) {
			console.log(error);
			const apiErr = error as CustomApiError;
			const detailedMessage = typeof apiErr.response?.data?.data === 'string' ? apiErr.response.data.data : null;
			toast.error(detailedMessage || apiErr.response?.data?.meta?.message || 'Terjadi kesalahan.');
		} finally {
			setLoading(false);
		}
	};

	const handleClockClick = (type: 'clock_in' | 'clock_out') => {
		if (!hasProfileImage) return toast.error('Silakan upload foto profil terlebih dahulu untuk dapat melakukan absensi.');
		if (isOffToday || isOnLeave || isOfficeClosed) return toast.error('Anda tidak memiliki jadwal kerja hari ini.');
		setSelectedAction(type);
		const settings = user?.tenant_setting || user?.tenant?.tenant_settings;
		if (settings?.require_selfie) {
			setStatus('camera');
			setOpenCamera(true);
		} else {
			handleDirectClock(type);
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
			profileImg.src = getProfileImage(user?.media_url) || '/profile.jpg';
			await Promise.all([
				new Promise((r) => (selfieImg.onload = r)),
				new Promise((r) => (profileImg.onload = r)),
			]);
			
			const selfieAnalysis = await analyzeFace(selfieImg);
			if (!selfieAnalysis.ok) return toast.error(getFaceAnalysisErrorMessage(selfieAnalysis.error));

			const profileAnalysis = await analyzeFace(profileImg);
			if (!profileAnalysis.ok) return toast.error('Foto profil tidak valid.');
			if (!compareFace(selfieAnalysis.metrics.descriptor, profileAnalysis.metrics.descriptor).isMatch) return toast.error('Wajah tidak cocok.');

			const file = await dataUrlToFile(img);
			const mediaUrl = await uploadMedia(file);
			await clockAttendance({ action: selectedAction!, latitude: coords.latitude, longitude: coords.longitude, media_url: mediaUrl });
			
			const nowTime = dayjs().format('HH:mm');
			setAttendance((prev) => [{ type: selectedAction, image: mediaUrl, time: dayjs().format('HH:mm:ss'), location }, ...prev]);
			setOpenCamera(false);
			triggerRefresh();

			queryClient.setQueryData(['today-attendance'], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					clock_in_time: selectedAction === 'clock_in' ? nowTime : oldData.clock_in_time,
					clock_out_time: selectedAction === 'clock_out' ? nowTime : oldData.clock_out_time,
				};
			});

			setTimeout(() => queryClient.invalidateQueries({ queryKey: ['today-attendance'] }), 1500);
			toast.success('Absensi berhasil');
		} catch (error) {
			console.log(error);
			const apiErr = error as CustomApiError;
			const detailedMessage = typeof apiErr.response?.data?.data === 'string' ? apiErr.response.data.data : null;
			toast.error(detailedMessage || apiErr.response?.data?.meta?.message || 'Terjadi kesalahan.');
		} finally {
			setLoading(false);
			setStatus('idle');
		}
	};

	const latestLog = attendance.length > 0 ? attendance[0] : null;
	const canClockIn = (tenantSettings.allowMultipleCheck ? !latestLog || latestLog.type === 'clock_out' : !attendance.some((a) => a.type === 'clock_in')) && !isOffToday && !isOnLeave && !isOfficeClosed;
	const canClockOut = (tenantSettings.allowMultipleCheck ? latestLog && latestLog.type === 'clock_in' : attendance.some((a) => a.type === 'clock_in') && !attendance.some((a) => a.type === 'clock_out')) && !isOffToday && !isOnLeave && !isOfficeClosed;

	return {
		now, mounted, attendance, openCamera, setOpenCamera, loading,
		location, isOffToday, isOnLeave, isOfficeClosed, todayEvent,
		shiftInfo, hasProfileImage, handleClockClick, handleCapture,
		canClockIn, canClockOut, selectedAction, setStatus, user, tenantSettings
	};
}
