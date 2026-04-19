"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  MessageSquare, 
  UserPlus, 
  TicketCheck, 
  Search,
  Filter, 
  X, 
  Building2, 
  MoreHorizontal,
  ShieldCheck,
  Zap,
  Send,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Users
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  SupportMessage, 
  TrialRequest, 
  ProvisioningTicket 
} from "@/types/support";
import { 
  getSupportMessages, 
  getTrialRequests, 
  getProvisioningTickets, 
  updateTrialStatus,
  executeProvisioning
} from "@/service/support";
import { toast } from "sonner";
import dayjs from "dayjs";

type TabId = "inbox" | "trials" | "tickets";

export default function SupportDeskView() {
  const [activeTab, setActiveTab] = useState<TabId>("trials");
  const [isLoading, setIsLoading] = useState(true);
  const [executingTicketId, setExecutingTicketId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data States
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [trials, setTrials] = useState<TrialRequest[]>([]);
  const [tickets, setTickets] = useState<ProvisioningTicket[]>([]);

  // --- Fetch Handlers ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === "inbox") {
        const resp = await getSupportMessages();
        setMessages(resp.data || []);
      } else if (activeTab === "trials") {
        const resp = await getTrialRequests();
        setTrials(resp.data || []);
      } else {
        const resp = await getProvisioningTickets();
        setTickets(resp.data || []);
      }
    } catch {
      toast.error(`Failed to sync ${activeTab} queue`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  // --- Action Handlers ---

  const handleApproveTrial = async (id: string) => {
    try {
      const resp = await updateTrialStatus(id, "APPROVED");
      if (resp.success) {
        toast.success(`Request approved! Ticket generated for activation.`);
        fetchData();
      }
    } catch {
      toast.error("Failed to approve trial");
    }
  };

  const handleExecuteProvisioning = async (ticket: ProvisioningTicket) => {
    try {
      setExecutingTicketId(ticket.id);
      const resp = await executeProvisioning(ticket.id);
      if (resp.success) {
        toast.success(`Provisioning Executed: Credentials sent to ${ticket.admin_email}`);
        fetchData();
      }
    } catch {
      toast.error("Provisioning engine failed. Check logs.");
      fetchData(); // Refresh to show failure status/logs
    } finally {
      setExecutingTicketId(null);
    }
  };

  // --- Columns Definitions ---

  const inboxColumns: Column<SupportMessage>[] = [
    { header: "Tenant", accessor: (m) => (
      <div className="flex flex-col">
        <span className="font-black text-slate-900">{m.tenant_name}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">ID: #{m.tenant_id}</span>
      </div>
    )},
    { header: "Category", accessor: (m) => <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">{m.category}</Badge> },
    { header: "Subject", accessor: "subject", sortable: true },
    { header: "Status", accessor: (m) => (
      <Badge className={`${m.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"} border-none text-[9px] font-black uppercase tracking-widest`}>
        {m.status}
      </Badge>
    )},
    { header: "Date", accessor: "created_at" }
  ];

  const trialColumns: Column<TrialRequest>[] = [
    { header: "Company", accessor: (t) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
          <Building2 size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-900 leading-tight">{t.company_name}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.industry}</span>
        </div>
      </div>
    ), sortable: true },
    { header: "Contact", accessor: (t) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-700">{t.contact_name}</span>
        <span className="text-xs text-slate-400">{t.email}</span>
      </div>
    )},
    { header: "Size", accessor: (t) => <span className="font-bold text-slate-600">{t.employee_count_range} Users</span> },
    { header: "Status", accessor: (t) => (
      <Badge className={`${t.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"} border-none text-[9px] font-black uppercase tracking-widest`}>
        {t.status}
      </Badge>
    )}
  ];

  const ticketColumns: Column<ProvisioningTicket>[] = [
    { header: "Organization", accessor: (t) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
          {t.trial_request.company_name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-900 leading-tight">{t.trial_request.company_name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] uppercase px-1.5 py-0">
              {t.trial_request.industry}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400">ID: {t.id.split('-')[0]}</span>
          </div>
        </div>
      </div>
    )},
    { header: "Contact Details", accessor: (t) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-slate-700">{t.trial_request.contact_name}</span>
        <span className="text-[10px] font-medium text-slate-400">{t.trial_request.email}</span>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{t.trial_request.phone_number}</span>
      </div>
    )},
    { header: "Staffing", accessor: (t) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users size={14} className="text-slate-400" />
          <span className="text-xs font-black">{t.trial_request.employee_count_range}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Licenses</span>
      </div>
    )},
    { header: "Provisioning Intelligence", accessor: (t) => {
      const isSuccess = t.status === "COMPLETED" && !t.error_log;
      const isFailed = t.status === "FAILED" || (t.status === "COMPLETED" && t.error_log);

      if (isSuccess) {
        return (
          <div className="flex flex-col gap-1">
            <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black uppercase tracking-widest w-fit">
              Successfully Activated
            </Badge>
            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
              <CheckCircle2 size={10} className="text-emerald-500" />
              {t.completed_at ? dayjs(t.completed_at).format("DD MMM, HH:mm") : "N/A"}
            </div>
          </div>
        );
      }
      
      if (isFailed) {
        return (
          <div className="flex flex-col gap-1.5 max-w-[250px]">
            <Badge className="bg-rose-100 text-rose-700 border-none text-[9px] font-black uppercase tracking-widest w-fit">
              Execution Error
            </Badge>
            <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 group/log relative">
              <p className="text-[9px] font-mono text-rose-500 leading-tight line-clamp-2 italic">
                {t.error_log || "Unknown provisioning failure"}
              </p>
              {/* Tooltip for full error log */}
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/log:block z-50 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-2xl max-w-sm border border-white/10 font-mono">
                {t.error_log}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] font-black uppercase tracking-widest w-fit animate-pulse">
            {t.status === "EXECUTING" ? "Processing..." : "Waiting in Queue"}
          </Badge>
          <span className="text-[9px] font-bold text-slate-400 italic px-1">Awaiting system trigger</span>
        </div>
      );
    }},
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">
              <Zap size={16} className="fill-current" />
              Support & Growth Engine
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Success Desk</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Manage inbound support requests, qualify trial leads, and automate the provisioning pipeline for new SaaS organizations.
            </p>
          </div>
          
          <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
            <button type="button" onClick={() => setActiveTab("inbox")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "inbox" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>
              <MessageSquare size={16} /> Inbox
            </button>
            <button type="button" onClick={() => setActiveTab("trials")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "trials" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>
              <UserPlus size={16} /> Trials
            </button>
            <button type="button" onClick={() => setActiveTab("tickets")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "tickets" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>
              <TicketCheck size={16} /> Tickets
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[650px] overflow-hidden relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Tab-specific Toolbar */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              {activeTab === "inbox" ? <MessageSquare size={24} /> : activeTab === "trials" ? <UserPlus size={24} /> : <TicketCheck size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Queue</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                <input type="text" placeholder="Search entries..." className="pl-10 pr-4 h-11 bg-slate-50 border-none rounded-xl text-xs font-bold w-64 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
             </div>
             <button type="button" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"><Filter size={18} /></button>
          </div>
        </div>

        <div className="flex-1 p-8">
          {activeTab === "inbox" && (
            <DataTable 
              data={messages} 
              columns={inboxColumns} 
              limit={limit}
              onLimitChange={setLimit}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              actions={() => (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Reply"><Send size={18} /></button>
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><MoreHorizontal size={18} /></button>
                </div>
              )}
            />
          )}

          {activeTab === "trials" && (
            <DataTable 
              data={trials} 
              columns={trialColumns} 
              limit={limit}
              onLimitChange={setLimit}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              actions={(t) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {t.status !== "APPROVED" && (
                    <button 
                      onClick={() => handleApproveTrial(t.id)} 
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      Approve Trial
                    </button>
                  )}
                  <button type="button" className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><X size={18} /></button>
                </div>
              )}
            />
          )}

          {activeTab === "tickets" && (
            <DataTable 
              data={tickets} 
              columns={ticketColumns} 
              limit={limit}
              onLimitChange={setLimit}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              actions={(t) => (
                <div className="flex items-center justify-end gap-2">
                  {!t.is_executed && t.status !== "COMPLETED" && t.status !== "EXECUTING" && (
                    <Button 
                      disabled={executingTicketId === t.id}
                      onClick={() => handleExecuteProvisioning(t)}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 h-10 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      {executingTicketId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                      Execute Provisioning
                    </Button>
                  )}
                  {t.status === "FAILED" && (
                    <button 
                      onClick={() => handleExecuteProvisioning(t)}
                      className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center gap-2"
                    >
                      <RotateCcw size={14} strokeWidth={3} /> Retry
                    </button>
                  )}
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck size={12} className="text-blue-500" />
              Encrypted Management Session
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Success Hub • Build 2026.4</p>
        </div>
      </div>
    </div>
  );
}
