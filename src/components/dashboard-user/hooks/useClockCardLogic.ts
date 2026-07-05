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
import { clockAttendance, getTodayAttendance, endAttendanceSession } from '@/service/attendance';
import { uploadMedia } from '@/service/media';
import { getCalendarEvents, CalendarEvent } from '@/service/calendar';
import { useAuthStore } from '@/store/auth.store';
import { useRefresh } from '@/lib/RefreshContext';
import { getProfileImage } from '@/lib/utils';
import { CustomApiError } from '@/types/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';

type Coordinates = {
	latitude: number;
	longitude: number;
};

export type SessionActionType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'overtime_start' | 'overtime_end' | 'end_session' | 'custom';

export interface AttendanceSessionConfig {
	id: string;
	name: string;
	action_type: SessionActionType;
	sequence: number;
	time_start?: string;
	time_end?: string;
	is_flexible: boolean;
}

interface TenantSettingsData {
	allowMultipleCheck: boolean;
	clockInStart?: string;
	clockInEnd?: string;
	clockOutStart?: string;
	clockOutEnd?: string;
	sessionsConfig?: AttendanceSessionConfig[];
	requireSelfie?: boolean;
	requireLocation?: boolean;
	allowRemote?: boolean;
	maxRadiusMeter?: number;
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
	const [isProcessingFace, setIsProcessingFace] = useState(false);
	const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
	const [isEndingSession, setIsEndingSession] = useState(false);
	const [coords, setCoords] = useState<Coordinates>({ latitude: 0, longitude: 0 });
	const [location, setLocation] = useState<string>('Mencari lokasi...');
	const [selectedAction, setSelectedAction] = useState<SessionActionType | null>(null);
	const [isOffToday, setIsOffToday] = useState(false);
	const [isOnLeave, setIsOnLeave] = useState(false);
	const [isOfficeClosed, setIsOfficeClosed] = useState(false);
	const [todayEvent, setTodayEvent] = useState<CalendarEvent | null>(null);
	const [shiftInfo, setShiftInfo] = useState<string>('Memuat jadwal...');
	const [tenantSettings, setTenantSettings] = useState<TenantSettingsData>({ allowMultipleCheck: false });

	const { data: todayData } = useQuery({
		queryKey: ['today-attendance'],
		queryFn: async () => {
			const res = await getTodayAttendance();
			return res.data;
		},
		staleTime: 60000,
	});

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
			const [todayDataInit, eventsResp] = await Promise.all([
				queryClient.fetchQuery({
					queryKey: ['today-attendance'],
					queryFn: async () => {
						const res = await getTodayAttendance();
						return res.data;
					},
					staleTime: 60000
				}),
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
					sessionsConfig: settings.attendance_sessions_config || [],
					requireSelfie: Boolean(settings.require_selfie),
					requireLocation: Boolean(settings.require_location),
					allowRemote: Boolean(settings.allow_remote),
					maxRadiusMeter: settings.max_radius_meter,
				});
			}

			if (todayDataInit?.status === 'On Leave') {
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

	const handleDirectClock = async (type: SessionActionType) => {
		try {
			setLoading(true);
			await clockAttendance({ action: type, latitude: coords.latitude, longitude: coords.longitude, media_url: '' });
			const nowTime = dayjs().format('HH:mm');
			setAttendance((prev) => [{ type, image: '', time: dayjs().format('HH:mm:ss'), location }, ...prev]);
			triggerRefresh();

			queryClient.setQueryData(['today-attendance'], (oldData: any) => {
				if (!oldData) return oldData;
				
				let updatedSessions = oldData.sessions ? [...oldData.sessions] : [];
				if (tenantSettings.allowMultipleCheck) {
					if (type === 'clock_in') {
						updatedSessions.push({
							id: `temp-${Date.now()}`,
							clock_in_time: nowTime,
							clock_out_time: "",
							status: "on time"
						});
					} else if (type === 'clock_out' || type === 'end_session') {
						if (updatedSessions.length > 0 && !updatedSessions[updatedSessions.length - 1].clock_out_time) {
							updatedSessions[updatedSessions.length - 1].clock_out_time = nowTime;
						} else if (type === 'clock_out') {
							updatedSessions.push({
								id: `temp-${Date.now()}`,
								clock_in_time: "",
								clock_out_time: nowTime,
								status: "completed"
							});
						}
					}
				}

				return {
					...oldData,
					clock_in_time: type === 'clock_in' && !oldData.clock_in_time ? nowTime : oldData.clock_in_time,
					clock_out_time: type === 'clock_out' ? nowTime : oldData.clock_out_time,
					sessions: tenantSettings.allowMultipleCheck ? updatedSessions : oldData.sessions,
				};
			});

			setTimeout(() => queryClient.invalidateQueries({ queryKey: ['today-attendance'] }), 1500);
			toast.success(`${type === 'clock_in' ? 'Clock In' : type === 'clock_out' ? 'Clock Out' : type} berhasil`);
		} catch (error) {
			console.log(error);
			const apiErr = error as CustomApiError;
			const detailedMessage = typeof apiErr.response?.data?.data === 'string' ? apiErr.response.data.data : null;
			toast.error(detailedMessage || apiErr.response?.data?.meta?.message || 'Terjadi kesalahan.');
		} finally {
			setLoading(false);
		}
	};

	const handleClockClick = (type: SessionActionType) => {
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
		const capturedAction = selectedAction!;
		const capturedCoords = { ...coords };
		const capturedLocation = location;

		setOpenCamera(false);
		setStatus('idle');

		setIsProcessingFace(true);

		const toastId = toast.loading('Memproses verifikasi wajah...', {
			description: 'Mohon tunggu, proses ini hanya beberapa detik.',
			duration: Infinity,
		});

		try {
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
			if (!selfieAnalysis.ok) {
				toast.error(getFaceAnalysisErrorMessage(selfieAnalysis.error), { id: toastId });
				return;
			}

			const profileAnalysis = await analyzeFace(profileImg);
			if (!profileAnalysis.ok) {
				toast.error('Foto profil tidak valid. Silakan update foto profil Anda.', { id: toastId });
				return;
			}

			if (!compareFace(selfieAnalysis.metrics.descriptor, profileAnalysis.metrics.descriptor).isMatch) {
				toast.error('Wajah tidak cocok dengan foto profil.', { id: toastId });
				return;
			}

			toast.loading('Mengunggah foto...', { id: toastId, description: undefined });
			const file = await dataUrlToFile(img);
			const mediaUrl = await uploadMedia(file);

			toast.loading('Mencatat absensi...', { id: toastId, description: undefined });
			await clockAttendance({ action: capturedAction, latitude: capturedCoords.latitude, longitude: capturedCoords.longitude, media_url: mediaUrl });

			const nowTime = dayjs().format('HH:mm');
			setAttendance((prev) => [{ type: capturedAction, image: mediaUrl, time: dayjs().format('HH:mm:ss'), location: capturedLocation }, ...prev]);
			triggerRefresh();

			queryClient.setQueryData(['today-attendance'], (oldData: any) => {
				if (!oldData) return oldData;
				
				let updatedSessions = oldData.sessions ? [...oldData.sessions] : [];
				if (tenantSettings.allowMultipleCheck) {
					if (capturedAction === 'clock_in') {
						updatedSessions.push({
							id: `temp-${Date.now()}`,
							clock_in_time: nowTime,
							clock_out_time: "",
							status: "on time"
						});
					} else if (capturedAction === 'clock_out' || capturedAction === 'end_session') {
						if (updatedSessions.length > 0 && !updatedSessions[updatedSessions.length - 1].clock_out_time) {
							updatedSessions[updatedSessions.length - 1].clock_out_time = nowTime;
						} else if (capturedAction === 'clock_out') {
							updatedSessions.push({
								id: `temp-${Date.now()}`,
								clock_in_time: "",
								clock_out_time: nowTime,
								status: "completed"
							});
						}
					}
				}

				return {
					...oldData,
					clock_in_time: capturedAction === 'clock_in' && !oldData.clock_in_time ? nowTime : oldData.clock_in_time,
					clock_out_time: capturedAction === 'clock_out' ? nowTime : oldData.clock_out_time,
					sessions: tenantSettings.allowMultipleCheck ? updatedSessions : oldData.sessions,
				};
			});

			setTimeout(() => queryClient.invalidateQueries({ queryKey: ['today-attendance'] }), 1500);

			toast.success('Absensi berhasil! ✅', {
				id: toastId,
				description: `${capturedAction === 'clock_in' ? 'Clock In' : capturedAction === 'clock_out' ? 'Clock Out' : capturedAction} tercatat pada ${nowTime}`,
			});
		} catch (error) {
			console.log(error);
			const apiErr = error as CustomApiError;
			const detailedMessage = typeof apiErr.response?.data?.data === 'string' ? apiErr.response.data.data : null;
			toast.error(detailedMessage || apiErr.response?.data?.meta?.message || 'Terjadi kesalahan saat memproses absensi.', { id: toastId });
		} finally {
			setIsProcessingFace(false);
		}
	};

	const confirmEndSession = async () => {
		setIsEndingSession(true);
		try {
			await endAttendanceSession();
			toast.success("Sesi absensi Anda hari ini telah ditutup.");
			
			// Refresh data agar status yang baru (terkunci) termuat dari backend
			queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
			triggerRefresh();
			
			// Tutup modal
			setShowEndSessionConfirm(false);
		} catch (error: any) {
			console.log(error);
			const apiErr = error as CustomApiError;
			const errMsg = typeof apiErr.response?.data?.data === 'string' 
				? apiErr.response.data.data 
				: (apiErr.response?.data?.meta?.message || "Gagal mengakhiri sesi.");
			toast.error(errMsg);
		} finally {
			setIsEndingSession(false);
		}
	};

	const getAvailableActions = () => {
		if (isOffToday || isOnLeave || isOfficeClosed) return [];

		const isLocked = todayData?.status?.toLowerCase() === 'done' || todayData?.status?.toLowerCase() === 'completed';

		// 1. Jika skema dinamis dikonfigurasi di backend
		if (tenantSettings.sessionsConfig && tenantSettings.sessionsConfig.length > 0) {
			const completedTypes = attendance.map(a => a.type);
			const nextSession = tenantSettings.sessionsConfig.find(s => !completedTypes.includes(s.action_type));
			
			if (nextSession) {
				if (!nextSession.is_flexible && nextSession.time_start && nextSession.time_end) {
					const nowTime = now ? now.format('HH:mm') : dayjs().format('HH:mm');
					if (nowTime >= nextSession.time_start && nowTime <= nextSession.time_end) {
						return [nextSession];
					}
					return [];
				}
				return [nextSession];
			}
			return [];
		}

		// 2. Fallback Mode Bebas (Toggle in/out berkali-kali)
		if (tenantSettings.allowMultipleCheck) {
			const hasEndedSession = attendance.some((a) => a.type === 'end_session');
			const allSessionsDone = todayData?.sessions && todayData.sessions.length > 0 && todayData.sessions.every((s: any) => s?.status?.toLowerCase() === 'done' || s?.clock_out_time);
			
			// Jika user sudah melakukan end_session, maka tidak ada tombol lagi yang ditampilkan
			if (hasEndedSession || isLocked || allSessionsDone) return [];

			const inCount = attendance.filter((a) => a.type === 'clock_in').length;
			const outCount = attendance.filter((a) => a.type === 'clock_out').length;
			
			return [
				{ action_type: 'clock_in' as SessionActionType, name: `Clock In ${inCount > 0 ? `(Sesi ${inCount + 1})` : ''}`.trim() },
				{ action_type: 'clock_out' as SessionActionType, name: `Clock Out ${outCount > 0 || inCount > 0 ? `(Sesi ${outCount + 1})` : ''}`.trim() },
				{ action_type: 'end_session' as SessionActionType, name: 'End Session' }
			];
		}

		// 3. Fallback Mode Standard (Sekali In, Sekali Out)
		if (isLocked) return [];

		const hasClockIn = attendance.some((a) => a.type === 'clock_in');
		const hasClockOut = attendance.some((a) => a.type === 'clock_out');

		if (!hasClockIn) return [{ action_type: 'clock_in' as SessionActionType, name: 'Clock In' }];
		if (hasClockIn && !hasClockOut) return [{ action_type: 'clock_out' as SessionActionType, name: 'Clock Out' }];

		return [];
	};

	const availableActions = getAvailableActions();

	const isMultipleAttendanceDone = tenantSettings.allowMultipleCheck && 
		todayData?.sessions && 
		todayData.sessions.length > 0 && 
		todayData.sessions.every((s: any) => s?.status?.toLowerCase() === 'done' || s?.clock_out_time);

	return {
		now, mounted, attendance, openCamera, setOpenCamera, loading,
		location, isOffToday, isOnLeave, isOfficeClosed, todayEvent,
		shiftInfo, hasProfileImage, handleClockClick, handleCapture,
		availableActions, selectedAction, setStatus, user, tenantSettings,
		isProcessingFace,
		showEndSessionConfirm, setShowEndSessionConfirm,
		isEndingSession, confirmEndSession,
		todayData, isMultipleAttendanceDone
	};
}
