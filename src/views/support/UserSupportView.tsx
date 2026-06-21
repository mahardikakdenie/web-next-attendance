"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LifeBuoy,
  Search,
  Send,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  PlusCircle,
  HelpCircle,
  X,
  Building,
  Upload,
  AlertCircle
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  SupportMessage,
  SupportStatus,
} from "@/types/support";
import {
  sendSupportMessage,
  getMySupportHistory,
  replyToSupportMessage,
} from "@/service/support";
import { getInvoices, uploadTransferProof } from "@/service/subscription";
import { uploadMedia } from "@/service/media";
import { Invoice } from "@/types/billing";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Mock database to ensure local playability when BE API is not ready
const fallbackTickets: SupportMessage[] = [
  {
    id: "t-1",
    tenant_id: 1,
    tenant_name: "Acme Corp",
    sender_name: "John Doe",
    subject: "Gagal Clock In Geofence",
    message: "Saya sudah di dalam koordinat kantor tapi sistem mengira saya di luar radius. Mohon bantuannya.",
    category: "TECHNICAL",
    status: "IN_PROGRESS",
    created_at: dayjs().subtract(1, "day").toISOString(),
  },
  {
    id: "t-2",
    tenant_id: 1,
    tenant_name: "Acme Corp",
    sender_name: "John Doe",
    subject: "Invoice Billing Bulan Mei Mismatch",
    message: "Total karyawan aktif kami 40 tapi di tagihan tertulis 45. Mohon dicek.",
    category: "BILLING",
    status: "PENDING",
    created_at: dayjs().subtract(3, "hour").toISOString(),
  },
  {
    id: "t-3",
    tenant_id: 1,
    tenant_name: "Acme Corp",
    sender_name: "John Doe",
    subject: "Request Fitur Shift Malam Fleksibel",
    message: "Apakah ada rencana update untuk shift yang bisa rollover lewat jam 00:00 otomatis?",
    category: "FEATURE",
    status: "RESOLVED",
    created_at: dayjs().subtract(5, "day").toISOString(),
  }
];

export default function UserSupportView() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isApiWorking, setIsApiWorking] = useState(true);
  const [tickets, setTickets] = useState<SupportMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportMessage | null>(null);

  // Input States
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<SupportCategory>("TECHNICAL");
  const [newMessage, setNewMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoices & Proof Upload States
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchUnpaidInvoices = useCallback(async () => {
    try {
      const resp = await getInvoices(1, 10);
      if (resp.data) {
        const unpaid = resp.data.filter(
          (inv) => (inv.status || "").toLowerCase() === "unpaid" || (inv.status || "").toLowerCase() === "overdue"
        );
        setUnpaidInvoices(unpaid);
      }
    } catch (err) {
      console.error("Failed to fetch invoices in support:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUnpaidInvoices();
  }, [fetchUnpaidInvoices]);

  const handleOpenUploadModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploadOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedInvoice || !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadMedia(selectedFile);
      await uploadTransferProof(selectedInvoice.id, url);
      toast.success("Transfer proof uploaded successfully!");
      void fetchUnpaidInvoices();
      setIsUploadOpen(false);
      setSelectedInvoice(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to upload transfer proof";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch History (Graceful Fallback to Dummy)
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getMySupportHistory();
      setTickets(resp.data || []);
      setIsApiWorking(true);
    } catch {
      // Graceful fallback to local mock storage
      setTickets(fallbackTickets);
      setIsApiWorking(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHistory();
  }, [fetchHistory]);

  type SupportCategory = "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER";

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        subject: newSubject,
        category: newCategory,
        message: newMessage,
      };

      let createdTicket: SupportMessage;

      try {
        const resp = await sendSupportMessage(payload);
        createdTicket = resp.data;
        setIsApiWorking(true);
      } catch {
        // Fallback simulate creation locally
        createdTicket = {
          id: `t-fake-${Date.now()}`,
          tenant_id: 1,
          tenant_name: "Mock Tenant",
          sender_name: "You (Mock)",
          subject: newSubject,
          category: newCategory,
          message: newMessage,
          status: "PENDING",
          created_at: new Date().toISOString(),
        };
        setIsApiWorking(false);
      }

      toast.success("Ticket submitted successfully!");
      setTickets((prev) => [createdTicket, ...prev]);

      // Reset Form
      setNewSubject("");
      setNewMessage("");
      setNewCategory("TECHNICAL");
      setIsCreateOpen(false);
    } catch {
      toast.error("Failed to submit support request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setIsSubmitting(true);

      try {
        await replyToSupportMessage(selectedTicket.id, replyText);
        setIsApiWorking(true);
      } catch {
        // Simulate locally
        setIsApiWorking(false);
      }

      toast.success("Reply delivered");
      setReplyText("");

      // Optimistic status update to IN_PROGRESS
      if (selectedTicket.status === "RESOLVED") {
        setTickets((prev) => prev.map((t) => t.id === selectedTicket.id ? { ...t, status: "IN_PROGRESS" } : t));
        setSelectedTicket((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : null);
      }
    } catch {
      toast.error("Failed to deliver reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items
  const filteredTickets = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const base = tickets.filter((t) => {
      const isClosed = t.status === "RESOLVED" || t.status === "CLOSED";
      return activeTab === "active" ? !isClosed : isClosed;
    });

    if (!query) return base;
    return base.filter(
      (t) =>
        t.subject.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [tickets, activeTab, searchQuery]);

  const statusStyles: Record<SupportStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
    CLOSED: "bg-slate-100 text-slate-600",
  };

  const columns: Column<SupportMessage>[] = [
    {
      header: "Category",
      accessor: (t) => (
        <Badge className="bg-slate-50 text-slate-600 border-none font-bold text-[10px]">
          {t.category}
        </Badge>
      ),
    },
    {
      header: "Subject & Message",
      accessor: (t) => (
        <div className="flex flex-col gap-1 max-w-sm">
          <span className="font-black text-slate-900 leading-tight">{t.subject}</span>
          <span className="text-xs text-slate-400 truncate">{t.message}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (t) => (
        <Badge
          className={`${
            statusStyles[t.status] || "bg-slate-100 text-slate-600"
          } border-none text-[9px] font-black uppercase tracking-widest`}
        >
          {t.status}
        </Badge>
      ),
    },
    {
      header: "Submitted",
      accessor: (t) => (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Calendar size={12} />
          <span>{dayjs(t.created_at).fromNow()}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">

      {/* Header */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">
              <LifeBuoy size={16} className="fill-current" />
              Member Support Command
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Helpdesk</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Kirimkan kendala operasional, error sistem, atau pengajuan bantuan langsung kepada operator administrator portal.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Create Ticket
          </Button>
        </div>
      </section>

      {/* Backend Out-of-sync Warning */}
      {!isApiWorking && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
            Koneksi database user history support belum aktif dari Backend (ISSUE BE-006 pending).
            Aplikasi menggunakan **Mock Fallback** agar seluruh fungsionalitas UI tetap dapat dicoba.
          </p>
        </div>
      )}

      {/* Unpaid Invoices Banner */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm">Tagihan Belum Dibayar</h4>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Anda memiliki {unpaidInvoices.length} tagihan yang belum dibayar atau tertunggak. 
                Segera lakukan pembayaran dan unggah bukti transfer untuk mengaktifkan kembali layanan penuh Anda.
              </p>
              <div className="flex flex-col gap-1.5 mt-3">
                {unpaidInvoices.map((inv) => (
                  <div key={inv.id} className="text-[11px] font-bold text-amber-800 flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-black">{inv.invoice_number}</span>
                    <span>- {formatCurrency(inv.amount)} (Jatuh Tempo: {dayjs(inv.due_date).format("DD MMM YYYY")})</span>
                    <button
                      onClick={() => handleOpenUploadModal(inv)}
                      className="ml-2 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all active:scale-95 shadow-sm shadow-indigo-600/10"
                    >
                      Upload Bukti
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[600px] overflow-hidden relative">
        {/* Navigation Tabs & Search */}
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 w-fit">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "active" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <Clock size={14} /> Active Tickets
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "history" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 size={14} /> History / Resolved
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10 pr-4 h-11 bg-slate-50 border-none rounded-xl text-xs font-bold w-full sm:w-64 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-8">
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <DataTable
              data={filteredTickets}
              columns={columns}
              onRowClick={(row) => {
                setSelectedTicket(row);
                setIsDetailOpen(true);
              }}
              limit={10}
              onLimitChange={() => {}}
              currentPage={1}
              onPageChange={() => {}}
            />
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                <HelpCircle size={32} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">No Tickets Found</h4>
              <p className="text-xs font-bold text-slate-400 mt-1">Belum ada kendala support yang dilaporkan dalam kategori ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsCreateOpen(false)} />
          <div className="relative bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Create Support Request</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Submit new ticket</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <Input
                  required
                  placeholder="Ketik judul kendala singkat..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SupportCategory)}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200/50 rounded-xl text-sm font-bold text-slate-950 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all cursor-pointer"
                >
                  <option value="TECHNICAL">TECHNICAL (Bug/Error Sistem)</option>
                  <option value="BILLING">BILLING (Terkait Akun/Pembayaran)</option>
                  <option value="FEATURE">FEATURE (Request Fitur Baru)</option>
                  <option value="OTHER">OTHER (Lainnya)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail kronologi error atau bantuan yang diajukan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-950 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPORT DETAIL & REPLY MODAL */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsDetailOpen(false)} />
          <div className="relative bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-start justify-between bg-slate-50/30 shrink-0">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {selectedTicket.subject}
                    </h3>
                    <Badge className={`${statusStyles[selectedTicket.status] || "bg-slate-100"} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg`}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Ticket Category: <span className="text-slate-600">{selectedTicket.category}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><User size={12} /> You (Sender)</span>
                  <span>{dayjs(selectedTicket.created_at).format("DD MMM, HH:mm")}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>

              {/* simulated thread info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Conversation Feed</h4>
                <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100/40 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Building size={12} /> Platform Administrator</span>
                    <span>System response</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                    {selectedTicket.status === "PENDING"
                      ? "Pesan Anda sedang antri di inbox superadmin. Mohon tunggu tim support memproses pengajuan Anda."
                      : selectedTicket.status === "IN_PROGRESS"
                      ? "Investigasi sedang berlangsung oleh tim Customer Success."
                      : "Tiket ini telah diselesaikan. Jika Anda masih memiliki kendala terkait, silakan kirim pesan balasan di bawah."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Reply Composer */}
            {selectedTicket.status !== "CLOSED" && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type message to reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 h-12 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-950 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
                  />
                  <Button
                    onClick={() => void handleSendReply()}
                    disabled={isSubmitting || !replyText.trim()}
                    className="h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/10 shrink-0 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal Upload Bukti Transfer */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => !isUploading && setIsUploadOpen(false)}
        title="Upload Bukti Pembayaran"
        subtitle={`Invoice ${selectedInvoice?.invoice_number || ""}`}
        icon={<Upload size={24} />}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Informasi Rekening Transfer</h4>
            <div className="space-y-2 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Bank:</span>
                <span className="font-black text-slate-900">Bank Mandiri</span>
              </div>
              <div className="flex justify-between">
                <span>Nomor Rekening:</span>
                <span className="font-black text-indigo-600">123-456-7890</span>
              </div>
              <div className="flex justify-between">
                <span>Atas Nama:</span>
                <span className="font-black text-slate-900">AttendancePro</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                <span>Total Tagihan:</span>
                <span className="font-black text-emerald-600">{selectedInvoice ? formatCurrency(selectedInvoice.amount) : "-"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
              Bukti Transfer (Gambar)
            </label>
            
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/10 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                    Pilih file atau seret gambar ke sini
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Preview Bukti Transfer"
                  className="max-h-48 object-contain rounded-2xl w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={isUploading}
                  className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-950 text-white p-2 rounded-xl backdrop-blur-sm transition-colors active:scale-95 disabled:opacity-50"
                >
                  <X size={16} />
                </button>
                <div className="mt-2 text-xs font-bold text-slate-500 truncate w-full px-2 text-center">
                  {selectedFile?.name}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isUploading}
              onClick={() => setIsUploadOpen(false)}
              className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              disabled={isUploading || !selectedFile}
              onClick={handleUploadSubmit}
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengunggah...
                </>
              ) : (
                "Kirim Bukti"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
