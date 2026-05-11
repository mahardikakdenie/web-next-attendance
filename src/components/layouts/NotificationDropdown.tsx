"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Wallet, 
  CalendarDays, 
  UserCog, 
  Clock, 
  Receipt, 
  MessageSquare, 
  Settings, 
  CheckCircle2,
  MoreHorizontal,
  Circle,
  X
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationPayload } from "@/types/api";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "../ui/Button";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationPayload['type']) => {
    switch (type) {
      case 'payroll': return <Wallet className="text-emerald-500" size={16} />;
      case 'leave': return <CalendarDays className="text-blue-500" size={16} />;
      case 'profile': return <UserCog className="text-purple-500" size={16} />;
      case 'overtime': return <Clock className="text-amber-500" size={16} />;
      case 'expense': return <Receipt className="text-rose-500" size={16} />;
      case 'support': return <MessageSquare className="text-indigo-500" size={16} />;
      default: return <Settings className="text-slate-500" size={16} />;
    }
  };

  const handleNotificationClick = async (notif: NotificationPayload) => {
    if (!notif.is_read) {
      await markRead(notif.id);
    }
    setIsOpen(false);

    switch (notif.type) {
      case 'payroll': router.push('/payroll'); break;
      case 'leave': router.push('/leaves'); break;
      case 'profile': router.push('/request-profile-update'); break;
      case 'overtime': router.push('/overtime'); break;
      case 'expense': router.push('/finance/expenses'); break;
      case 'support': router.push('/admin/support'); break;
      default: router.push('/');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-800 hover:bg-slate-100/80"
        }`}
      >
        <Bell size={18} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Notifications</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{unreadCount} Unread Messages</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={markAllRead}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Mark all as read"
              >
                <CheckCircle2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications && notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full flex items-start gap-4 p-4 text-left transition-all hover:bg-slate-50 group relative ${
                      !notif.is_read ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-black truncate ${!notif.is_read ? "text-slate-900" : "text-slate-500"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                          {dayjs(notif.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                         <Circle fill="currentColor" className="text-blue-500" size={6} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Bell size={32} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications at the moment.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-50 bg-slate-50/50">
            <Button 
              variant="secondary" 
              className="w-full h-10 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white shadow-sm border-slate-100"
              onClick={() => {
                router.push('/'); // Or a dedicated notifications page if it exists
                setIsOpen(false);
              }}
            >
              View Activity History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
