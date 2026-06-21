"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Building2,
  Calendar,
  Send,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Archive,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SupportMessage, SupportStatus } from "@/types/support";
import { usePermission } from "@/components/auth/PermissionGuard";
import dayjs from "dayjs";

interface SupportMessageModalProps {
  isOpen: boolean;
  message: SupportMessage | null;
  initialMode: "view" | "reply";
  onClose: () => void;
  onUpdateStatus: (status: SupportStatus) => Promise<void>;
  onSendReply: (replyText: string) => Promise<void>;
  isUpdating: boolean;
}

export default function SupportMessageModal({
  isOpen,
  message,
  initialMode,
  onClose,
  onUpdateStatus,
  onSendReply,
  isUpdating,
}: SupportMessageModalProps) {
  const [mode, setMode] = useState<"view" | "reply">(initialMode);
  const [replyText, setReplyText] = useState("");

  const isManager = usePermission("support.manage");
  const hasStatus = usePermission("support.status") || isManager;
  const hasReply  = usePermission("support.reply")  || isManager;

  // State is reset via key remount from parent — no sync effect needed.

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const handleSend = async () => {
    if (!replyText.trim()) return;
    await onSendReply(replyText);
    setReplyText("");
    setMode("view");
  };

  // Status visual mapping
  const statusStyles: Record<SupportStatus, { color: string; label: string }> = {
    PENDING: { color: "bg-amber-100 text-amber-700", label: "Waiting" },
    IN_PROGRESS: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    RESOLVED: { color: "bg-emerald-100 text-emerald-700", label: "Resolved" },
    CLOSED: { color: "bg-slate-100 text-slate-600", label: "Closed" },
  };

  // Helper for workflow actions based on current status
  const renderWorkflowActions = () => {
    if (!hasStatus) {
      return (
        <Button
          disabled
          variant="secondary"
          className="flex-1 h-12 rounded-xl border-slate-200 text-slate-400"
        >
          No status permission
        </Button>
      );
    }

    if (message.status === "PENDING") {
      return (
        <Button
          onClick={() => onUpdateStatus("IN_PROGRESS")}
          disabled={isUpdating}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 shadow-sm"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin mr-2" /> : <PlayCircle size={16} className="mr-2" />}
          Start Investigation
        </Button>
      );
    }

    if (message.status === "IN_PROGRESS") {
      return (
        <>
          <Button
            onClick={() => onUpdateStatus("RESOLVED")}
            disabled={isUpdating}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 shadow-sm"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
            Mark as Resolved
          </Button>
          <Button
            onClick={() => onUpdateStatus("PENDING")}
            disabled={isUpdating}
            variant="secondary"
            className="w-12 h-12 p-0 rounded-xl"
            title="Revert to Pending"
          >
            <RefreshCw size={16} />
          </Button>
        </>
      );
    }

    if (message.status === "RESOLVED") {
      return (
        <>
          <Button
            onClick={() => onUpdateStatus("CLOSED")}
            disabled={isUpdating}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 shadow-sm"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Archive size={16} className="mr-2" />}
            Close Ticket
          </Button>
          <Button
            onClick={() => onUpdateStatus("IN_PROGRESS")}
            disabled={isUpdating}
            variant="secondary"
            className="w-12 h-12 p-0 rounded-xl"
            title="Reopen"
          >
            <RefreshCw size={16} />
          </Button>
        </>
      );
    }

    // CLOSED
    return (
      <Button
        onClick={() => onUpdateStatus("IN_PROGRESS")}
        disabled={isUpdating}
        variant="secondary"
        className="flex-1 h-12 rounded-xl border-slate-200"
      >
        <RefreshCw size={16} className="mr-2" />
        Reopen Ticket
      </Button>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-start justify-between bg-slate-50/30 shrink-0">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
              <MessageSquare size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {message.subject}
                </h2>
                <Badge
                  className={`${statusStyles[message.status].color} border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg`}
                >
                  {statusStyles[message.status].label}
                </Badge>
                <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                  {message.category}
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Ticket ID: <span className="text-slate-600">{message.id.split('-')[0]}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 size={12} /> Tenant
              </p>
              <p className="text-sm font-black text-slate-900 truncate" title={message.tenant_name}>
                {message?.tenant?.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} /> Sender
              </p>
              <p className="text-sm font-black text-slate-900 truncate" title={message.sender_name}>
                {message.user?.email}
              </p>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={12} /> Created
              </p>
              <p className="text-sm font-black text-slate-900">
                {dayjs(message.created_at).format("DD MMM YYYY, HH:mm")}
              </p>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Message Payload</h4>
            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm leading-relaxed text-sm text-slate-700 whitespace-pre-wrap font-medium">
              {message.message}
            </div>
          </div>

          {/* Reply Area (Collapsible) */}
          {mode === "reply" && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Send size={14} /> Send Response
              </h4>
              <div className="p-2 rounded-[24px] bg-blue-50/50 border border-blue-100">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Draft your reply to the tenant admin..."
                  className="w-full min-h-[120px] p-4 bg-transparent border-none resize-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  autoFocus
                />
                <div className="flex items-center justify-end p-2 border-t border-blue-100/50 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setMode("view")}
                    className="h-10 text-xs px-4 rounded-xl bg-white border-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleSend()}
                    disabled={isUpdating || !replyText.trim()}
                    className="h-10 text-xs px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                    Send Mail
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <div className="flex-1 flex gap-2">
            {renderWorkflowActions()}
          </div>
          {mode === "view" && message.status !== "CLOSED" && hasReply && (
            <Button
              onClick={() => setMode("reply")}
              className="flex-1 bg-white border-slate-200 text-slate-900 hover:bg-slate-100 rounded-xl h-12 shadow-sm"
            >
              <Send size={16} className="mr-2 text-blue-600" />
              Reply Message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
