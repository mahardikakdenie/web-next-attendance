'use client';

import { Clock, MapPin, ShieldCheck, Loader2, History, ArrowRightCircle, ArrowRight, Info, Users, PartyPopper, UserCheck, AlertCircle } from 'lucide-react';
import CameraModal from '../attendance/CameraModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EMPTY_IMAGE } from '@/lib/todayAttendance';
import { useClockCardLogic } from './hooks/useClockCardLogic';

export default function ClockCard() {
	const router = useRouter();
	const {
		now, mounted, attendance, openCamera, setOpenCamera, loading,
		location, isOffToday, isOnLeave, isOfficeClosed, todayEvent,
		shiftInfo, hasProfileImage, handleClockClick, handleCapture,
		availableActions, selectedAction, setStatus, user, tenantSettings,
		isProcessingFace
	} = useClockCardLogic();

	const getEventIcon = (type: string) => {
		switch (type) {
			case 'National Holiday': return <PartyPopper size={14} className="text-amber-500" />;
			case 'Meeting': return <Users size={14} className="text-blue-500" />;
			default: return <Info size={14} className="text-indigo-500" />;
		}
	};

	if (!mounted || !now) return null;

	return (
		<>
			<div id="tour-clock-card" className='w-full mx-auto rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col group/card'>
				
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

					{/* Background Processing Indicator */}
					{isProcessingFace && (
						<div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-10">
							<Loader2 size={14} className="animate-spin text-blue-500" />
							<span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Memverifikasi wajah...</span>
						</div>
					)}

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
					{!hasProfileImage ? (
						<div className="w-full max-w-sm mt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
							<div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex flex-col items-center gap-4 text-center">
								<div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
									<AlertCircle size={24} strokeWidth={2.5} />
								</div>
								<div>
									<h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Profil Belum Lengkap</h4>
									<p className="text-[11px] font-bold text-rose-600/70 mt-1 leading-relaxed">Anda wajib mengupload foto profil sebelum dapat melakukan absensi mandiri.</p>
								</div>
								<button 
									onClick={() => router.push('/request-profile-update')}
									className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
								>
									<UserCheck size={16} strokeWidth={3} />
									Lengkapi Profil Sekarang
								</button>
							</div>
						</div>
					) : (
						<div className={`w-full max-w-sm gap-3 pt-2 ${availableActions.length > 1 ? 'grid grid-cols-2' : 'flex flex-col'}`}>
							{availableActions.length === 0 ? (
								<div className="w-full text-center p-4 bg-slate-50 border border-slate-100/80 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
									Semua sesi absensi hari ini selesai
								</div>
							) : (
								availableActions.map((action, idx) => {
									const isOut = action.action_type === 'clock_out' || action.action_type.includes('end');
									return (
										<button
											key={idx}
											onClick={() => handleClockClick(action.action_type)}
											disabled={loading}
											className={`h-14 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 w-full ${
												isOut
													? 'bg-white border border-slate-200 text-slate-900 shadow-md hover:border-orange-500 hover:text-orange-600 hover:-translate-y-0.5 active:scale-95'
													: 'bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 active:scale-95'
											}`}
										>
											{loading && selectedAction === action.action_type ? (
												<Loader2 className={`animate-spin ${isOut ? 'text-orange-500' : ''}`} size={18} />
											) : isOut ? (
												<ArrowRightCircle size={18} strokeWidth={3} className="rotate-180" />
											) : (
												<ArrowRight size={18} strokeWidth={3} />
											)}
											<span className="text-[10px] font-black uppercase tracking-widest">
												{action.name}
											</span>
										</button>
									);
								})
							)}
						</div>
					)}
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
												{item.type === 'clock_in' ? 'IN' : 'OUT'}
											</span>
											<span className='text-[11px] font-black text-slate-800 tabular-nums'>
												{item.time}
											</span>
										</div>
										<p className='text-[10px] font-bold text-slate-400 truncate'>
											{item.location.split(',')[0]}
										</p>
									</div>
									<ShieldCheck size={14} className='text-emerald-500' />
								</div>
							))
						)}
					</div>
				</div>
			</div>

			<CameraModal
				open={openCamera}
				onClose={() => {
					setOpenCamera(false);
					setStatus('idle');
				}}
				onCapture={handleCapture}
			/>
		</>
	);
}
