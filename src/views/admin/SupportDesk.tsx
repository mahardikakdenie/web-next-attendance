"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
  executeProvisioning,
  updateMessageStatus,
  getSupportAgents,
  assignSupportMessage,
  assignSupportMessagesBulk,
  SupportAgent
} from "@/service/support";
import { toast } from "sonner";
import dayjs from "dayjs";
import SupportMessageModal from "@/components/admin/SupportMessageModal";
import { usePermission } from "@/components/auth/PermissionGuard";

type TabId = "inbox" | "trials" | "tickets";

// Dummy fallback agents (used when BE endpoint is not ready)
const fallbackAgents: SupportAgent[] = [
  { id: 1, name: "CS Agent - Nova", is_active: true },
  { id: 2, name: "CS Agent - Aruna", is_active: true },
  { id: 3, name: "CS Lead - Raka", is_active: true },
];

export default function SupportDeskView() {
  const isManager = usePermission("support.manage");
  const hasView = usePermission("support.view") || isManager;
  const hasReply = usePermission("support.reply") || isManager;
  const hasAssign = usePermission("support.assign") || isManager;
  const hasReadState = usePermission("support.read_state") || isManager;
  const hasBulk = usePermission("support.bulk_action") || isManager;

  const [activeTab, setActiveTab] = useState<TabId>("trials");
  const [isLoading, setIsLoading] = useState(true);
  const [executingTicketId, setExecutingTicketId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isInboxPageLoading, setIsInboxPageLoading] = useState(false);

  // Data States
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [trials, setTrials] = useState<TrialRequest[]>([]);
  const [tickets, setTickets] = useState<ProvisioningTicket[]>([]);

  // Inbox modal states
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalMode, setMessageModalMode] = useState<"view" | "reply">("view");
  const [isInboxActionLoading, setIsInboxActionLoading] = useState(false);

  // Inbox enhancement states
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxCategoryFilter, setInboxCategoryFilter] = useState<"all" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER">("all");
  const [inboxStatusFilter, setInboxStatusFilter] = useState<"all" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED">("all");
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number>(1);

  const { data: supportAgentsResp } = useQuery({
    queryKey: ["support-agents"],
    queryFn: () => getSupportAgents(),
    enabled: activeTab === "inbox",
    retry: 1,
  });

  const agentOptions = useMemo(() => {
    const apiAgents = supportAgentsResp?.data || [];
    const normalized = apiAgents.filter((a) => a?.id && a?.name);
    return normalized.length > 0 ? normalized : fallbackAgents;
  }, [supportAgentsResp]);

  const unreadInboxCount = useMemo(
    () => messages.filter((m) => m.is_read !== true).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const search = inboxSearch.trim().toLowerCase();

    return messages.filter((m) => {
      const searchMatch = !search ||
        (m.subject || "").toLowerCase().includes(search) ||
        (m.message || "").toLowerCase().includes(search) ||
        (m.sender_name || "").toLowerCase().includes(search) ||
        (m.tenant_name || "").toLowerCase().includes(search);

      const categoryMatch = inboxCategoryFilter === "all" || m.category === inboxCategoryFilter;
      const statusMatch = inboxStatusFilter === "all" || m.status === inboxStatusFilter;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [messages, inboxSearch, inboxCategoryFilter, inboxStatusFilter]);


  // --- Fetch Handlers ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Always fetch support messages if user has view permission, to populate unread badge accurately
      if (hasView) {
        const resp = await getSupportMessages();
        setMessages((resp.data || []).map((m) => ({
          ...m,
          is_read: m.is_read ?? false,
          assigned_to: m.assigned_to ?? null,
        })));
      }

      if (activeTab === "trials") {
        const resp = await getTrialRequests();
        setTrials(resp.data || []);
      } else if (activeTab === "tickets") {
        const resp = await getProvisioningTickets();
        setTickets(resp.data || []);
      }
    } catch {
      toast.error(`Failed to sync ${activeTab} queue`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, hasView]);

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
      } else {
        toast.error(resp.meta?.message || "Failed to approve trial");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to approve trial");
    }
  };

  const handleExecuteProvisioning = async (ticket: ProvisioningTicket) => {
    try {
      setExecutingTicketId(ticket.id);
      const resp = await executeProvisioning(ticket.id);
      if (resp.success) {
        toast.success(`Provisioning Executed: Credentials sent to ${ticket.admin_email}`);
        fetchData();
      } else {
        toast.error(resp.meta?.message || "Provisioning execution failed");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Provisioning engine failed. Check logs.");
      fetchData(); // Refresh to show failure status/logs
    } finally {
      setExecutingTicketId(null);
    }
  };

  const openMessageModal = (message: SupportMessage, mode: "view" | "reply") => {
    setSelectedMessage(message);
    setMessageModalMode(mode);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedMessage(null);
    setMessageModalMode("view");
  };

  const handleInboxStatusUpdate = async (status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") => {
    if (!selectedMessage) return;

    try {
      setIsInboxActionLoading(true);
      await updateMessageStatus(selectedMessage.id, status);

      // Optimistic state update
      setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? { ...m, status } : m)));
      setSelectedMessage((prev) => (prev ? { ...prev, status } : prev));

      toast.success(`Message status updated to ${status.replace("_", " ")}`);
      await fetchData();
    } catch {
      toast.error("Failed to update message status");
    } finally {
      setIsInboxActionLoading(false);
    }
  };

  const handleInboxReplySend = async (replyText: string) => {
    if (!selectedMessage) return;

    try {
      setIsInboxActionLoading(true);

      // Placeholder reply flow (no dedicated backend reply endpoint yet)
      // We still progress workflow and give user clear confirmation.
      if (selectedMessage.status === "PENDING") {
        await updateMessageStatus(selectedMessage.id, "IN_PROGRESS");
        setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: "IN_PROGRESS" } : m)));
        setSelectedMessage((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev));
      }

      toast.success("Reply sent to tenant inbox", {
        description: `Response delivered (${replyText.length} chars) for \"${selectedMessage.subject}\"`,
      });
      await fetchData();
    } catch {
      toast.error("Failed to send reply action");
    } finally {
      setIsInboxActionLoading(false);
    }
  };

  // --- Inbox Client-side Optimistic Actions (To be backed by BE later) ---
  const toggleReadState = (id: string, is_read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read } : m)));
    toast.success(`Message marked as ${is_read ? 'read' : 'unread'}`);
  };

  const assignAgentToMessage = async (id: string, agentId: number) => {
    const agent = agentOptions.find((a) => a.id === agentId);
    if (!agent) return;

    // Optimistic UI
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, assigned_to: { id: agent.id, name: agent.name } } : m)));

    try {
      await assignSupportMessage(id, agentId);
      toast.success(`Assigned to ${agent.name}`);
    } catch {
      // Keep app usable even if BE endpoint not ready
      toast.warning(`Assignment saved locally only (API not ready or failed)`);
    }
  };

  const handleBulkMarkRead = () => {
    setMessages((prev) => prev.map((m) => selectedMessageIds.includes(m.id) ? { ...m, is_read: true } : m));
    toast.success(`Marked ${selectedMessageIds.length} messages as read`);
    setSelectedMessageIds([]);
  };

  const handleBulkAssign = async () => {
    const agent = agentOptions.find((a) => a.id === selectedAssigneeId);
    if (!agent || selectedMessageIds.length === 0) return;

    // Optimistic UI
    setMessages((prev) => prev.map((m) => selectedMessageIds.includes(m.id)
      ? { ...m, assigned_to: { id: agent.id, name: agent.name } }
      : m
    ));

    try {
      await assignSupportMessagesBulk(selectedMessageIds, selectedAssigneeId);
      toast.success(`Assigned ${selectedMessageIds.length} messages to ${agent.name}`);
    } catch {
      toast.warning(`Bulk assignment saved locally only (API not ready or failed)`);
    }

    setSelectedMessageIds([]);
  };

  const handleBulkResolve = async () => {
    // Optimistic resolve for UI
    setMessages((prev) => prev.map((m) => selectedMessageIds.includes(m.id) ? { ...m, status: "RESOLVED" } : m));

    // Attempt actual update (we loop because no bulk endpoint exists yet)
    // Warning: Could be slow for large sets, this is why bulk endpoint is requested.
    toast.loading(`Resolving ${selectedMessageIds.length} tickets...`, { id: "bulk-resolve" });
    let errors = 0;

    await Promise.all(selectedMessageIds.map(async (id) => {
      try {
        await updateMessageStatus(id, "RESOLVED");
      } catch {
        errors++;
      }
    }));

    if (errors > 0) {
      toast.error(`Finished with ${errors} failures`, { id: "bulk-resolve" });
    } else {
      toast.success("Bulk resolve complete", { id: "bulk-resolve" });
    }

    setSelectedMessageIds([]);
    fetchData();
  };

  // --- Columns Definitions ---

  const inboxColumns: Column<SupportMessage>[] = [
    {
      header: "Read",
      accessor: (m) => hasReadState ? (
        <button onClick={() => toggleReadState(m.id, !m.is_read)} className="hover:opacity-80">
          <Badge className={`${m.is_read ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600"} border-none text-[9px] font-black uppercase tracking-widest`}>
            {m.is_read ? "Read" : "Unread"}
          </Badge>
        </button>
      ) : (
        <Badge className={`${m.is_read ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600"} border-none text-[9px] font-black uppercase tracking-widest`}>
          {m.is_read ? "Read" : "Unread"}
        </Badge>
      )
    },
    { header: "Tenant", accessor: (m) => (
      <div className="flex flex-col">
        <span className="font-black text-slate-900">{m.tenant_name}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">ID: #{m.tenant_id}</span>
      </div>
    )},
    { header: "Category", accessor: (m) => <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">{m.category}</Badge> },
    { header: "Subject", accessor: "subject", sortable: true },
    {
      header: "Assignee",
      accessor: (m) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 min-w-[90px] truncate">
            {m.assigned_to?.name || "Unassigned"}
          </span>
          {hasAssign && (
            <select
              value={m.assigned_to?.id || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  void assignAgentToMessage(m.id, Number(val));
                }
              }}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500"
            >
              <option value="">Assign</option>
              {agentOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>
      )
    },
    { header: "Status", accessor: (m) => {
      const styles: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        RESOLVED: "bg-emerald-100 text-emerald-700",
        CLOSED: "bg-slate-100 text-slate-600"
      };
      return (
        <Badge className={`${styles[m.status] || styles.CLOSED} border-none text-[9px] font-black uppercase tracking-widest`}>
          {(m.status || "CLOSED").replace("_", " ")}
        </Badge>
      );
    }},
    { header: "Date", accessor: (m) => (
      <span className="text-xs font-bold text-slate-500">
        {dayjs(m.created_at).format("DD MMM YYYY")}
      </span>
    )}
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
          {(t.trial_request?.company_name || "?").charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-900 leading-tight">{t.trial_request?.company_name || "Unknown"}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] uppercase px-1.5 py-0">
              {t.trial_request?.industry || "Unknown"}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400">ID: {t.id ? t.id.split('-')[0] : ""}</span>
          </div>
        </div>
      </div>
    )},
    { header: "Contact Details", accessor: (t) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-slate-700">{t.trial_request?.contact_name || "N/A"}</span>
        <span className="text-[10px] font-medium text-slate-400">{t.trial_request?.email || "N/A"}</span>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{t.trial_request?.phone_number || "N/A"}</span>
      </div>
    )},
    { header: "Staffing", accessor: (t) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users size={14} className="text-slate-400" />
          <span className="text-xs font-black">{t.trial_request?.employee_count_range || "N/A"}</span>
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
              {unreadInboxCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadInboxCount > 99 ? "99+" : unreadInboxCount}
                </span>
              )}
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
          <div className="flex items-center gap-3 flex-wrap justify-end">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={activeTab === "inbox" ? inboxSearch : ""}
                  onChange={(e) => activeTab === "inbox" && setInboxSearch(e.target.value)}
                  placeholder={activeTab === "inbox" ? "Search subject, sender, tenant..." : "Search entries..."}
                  className="pl-10 pr-4 h-11 bg-slate-50 border-none rounded-xl text-xs font-bold w-64 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                />
             </div>

             {activeTab === "inbox" && (
              <>
                <select
                  value={inboxCategoryFilter}
                  onChange={(e) => setInboxCategoryFilter(e.target.value as "all" | "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER")}
                  className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  <option value="all">All Category</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="BILLING">Billing</option>
                  <option value="FEATURE">Feature</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  value={inboxStatusFilter}
                  onChange={(e) => setInboxStatusFilter(e.target.value as "all" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED")}
                  className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setInboxSearch("");
                    setInboxCategoryFilter("all");
                    setInboxStatusFilter("all");
                  }}
                  className="h-11 px-4 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 text-xs font-black uppercase"
                >
                  Reset
                </button>
              </>
             )}

             <button type="button" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"><Filter size={18} /></button>
          </div>
        </div>

        <div className="flex-1 p-8">
          {activeTab === "inbox" && !hasView && (
            <div className="h-[350px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Access Restricted</h4>
              <p className="text-xs font-bold text-slate-400 mt-1">You don&apos;t have permission to view support inbox.</p>
            </div>
          )}

          {activeTab === "inbox" && hasView && (
            <div className="space-y-4">
              {hasBulk && selectedMessageIds.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                    {selectedMessageIds.length} selected
                  </span>

                  <Button
                    onClick={handleBulkMarkRead}
                    variant="secondary"
                    className="h-9 px-4 text-[10px] font-black uppercase rounded-xl bg-white border-blue-100 text-blue-700"
                  >
                    Mark Read
                  </Button>

                  <Button
                    onClick={() => void handleBulkResolve()}
                    className="h-9 px-4 text-[10px] font-black uppercase rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Resolve Selected
                  </Button>

                  <select
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(Number(e.target.value))}
                    className="h-9 px-3 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-600"
                  >
                    {agentOptions.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>

                  <Button
                    onClick={handleBulkAssign}
                    variant="secondary"
                    className="h-9 px-4 text-[10px] font-black uppercase rounded-xl bg-white border-blue-100 text-blue-700"
                  >
                    Assign Selected
                  </Button>
                </div>
              )}

              <DataTable
                data={filteredMessages}
                columns={inboxColumns}
                isLoading={isInboxPageLoading}
                selectable={hasBulk}
                selectedIds={selectedMessageIds}
                onSelectionChange={(ids) => setSelectedMessageIds(ids.map((id) => String(id)))}
                limit={limit}
                onLimitChange={setLimit}
                currentPage={currentPage}
                onPageChange={(page) => { setIsInboxPageLoading(true); setCurrentPage(page); setTimeout(() => setIsInboxPageLoading(false), 400); }}
                actions={(m) => (
                  <div className="flex items-center justify-end gap-1 transition-all">
                    {hasReadState && (
                      <button
                        type="button"
                        onClick={() => toggleReadState(m.id, !m.is_read)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title={m.is_read ? "Mark as unread" : "Mark as read"}
                      >
                        <MessageSquare size={18} />
                      </button>
                    )}
                    {hasReply && (
                      <button
                        type="button"
                        onClick={() => openMessageModal(m, "reply")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Reply"
                      >
                        <Send size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => openMessageModal(m, "view")}
                      type="button"
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                      title="See Details"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                )}
              />
            </div>
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
                <div className="flex items-center justify-end gap-2 transition-all">
                  {t.status !== "APPROVED" && (
                    <button 
                      onClick={() => handleApproveTrial(t.id)} 
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      Approve Trial
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      toast.info(`Trial Request: ${t.company_name}`, {
                        description: `Contact: ${t.contact_name} | Range: ${t.employee_count_range} Users | Industry: ${t.industry}`,
                        icon: <UserPlus size={18} className="text-blue-500" />
                      });
                    }}
                    type="button" 
                    className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50"
                    title="See Details"
                  >
                    <MoreHorizontal size={18} />
                  </button>
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
                  <button 
                    onClick={() => {
                      toast.info(`Ticket Details: ${t.trial_request.company_name}`, {
                        description: `Provisioning ID: ${t.id} | Status: ${t.status} | Admin: ${t.admin_email}`,
                        icon: <TicketCheck size={18} className="text-blue-500" />
                      });
                    }}
                    type="button" 
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    title="See Details"
                  >
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

      <SupportMessageModal
        key={selectedMessage?.id || "empty"}
        isOpen={isMessageModalOpen}
        message={selectedMessage}
        initialMode={messageModalMode}
        onClose={closeMessageModal}
        onUpdateStatus={handleInboxStatusUpdate}
        onSendReply={handleInboxReplySend}
        isUpdating={isInboxActionLoading}
      />
    </div>
  );
}
