"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Calendar,
  Wallet,
  Loader2,
  AlertCircle,
  Check,
  FileText,
  Download,
  History,
  TrendingUp,
  ArrowUpRight,
  SearchX,
  Upload,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMySubscription, upgradePlan, getInvoices, getAvailablePlans, downloadInvoicePDF, uploadTransferProof } from "@/service/subscription";
import { useAuthStore } from "@/store/auth.store";
import { uploadMedia } from "@/service/media";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { AccessDenied } from "@/components/ui/AccessDenied";
import { EmptySubscription } from "@/components/ui/EmptySubscription";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Can } from "@/components/auth/PermissionGuard";
import { CustomApiError } from "@/types/api";
import { Invoice } from "@/types/billing";

export default function BillingView() {
  const queryClient = useQueryClient();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [showPlans, setShowPlans] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["my-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      void fetchUser(); // Sync Zustand state with latest DB status
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

  const { data: subResp, isLoading: isSubLoading, error: subError } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => getMySubscription(),
    retry: 1
  });

  const { data: plansResp } = useQuery({
    queryKey: ["available-plans"],
    queryFn: () => getAvailablePlans(),
    enabled: showPlans
  });

  const { data: invResp, isLoading: isInvLoading } = useQuery({
    queryKey: ["my-invoices", currentPage],
    queryFn: () => getInvoices(currentPage, 10)
  });

  const upgradeMutation = useMutation({
    mutationFn: (planId: number) => upgradePlan({ plan_id: planId }),
    onSuccess: () => {
      toast.success("Upgrade request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      setShowPlans(false);
    },
    onError: (error: CustomApiError) => {
      toast.error(error?.response?.data?.meta?.message || "Failed to process upgrade. Please contact support.");
    }
  });

  const mySub = subResp?.data;
  const isError403 = (subError as CustomApiError)?.response?.status === 403;
  
  // Requirement 3: Handle empty state ({}) or null/undefined
  const hasNoSubscription = !mySub || Object.keys(mySub).length === 0;

  const availablePlans = plansResp?.data || [];
  const invoices = invResp?.data || [];
  const pagination = invResp?.meta?.pagination;

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      setDownloadingId(invoiceId);
      const data = await downloadInvoicePDF(invoiceId);
      const blob = new Blob([data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePayNow = (inv: Invoice) => {
    toast.info("Instruksi Pembayaran", {
      description: `Silakan transfer senilai ${formatCurrency(inv.amount)} ke Rekening Bank Mandiri: 123-456-7890 a.n AttendancePro, lalu kirim bukti pembayaran ke finance@attendancepro.com.`,
      duration: 10000,
    });
  };

  const handleUpgrade = (planId: number, planName: string) => {
    if (window.confirm(`Are you sure you want to upgrade to the ${planName} plan?`)) {
      upgradeMutation.mutate(planId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to get icon/color for dynamic plans
  const getPlanVisuals = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("pro")) return { color: "blue", icon: Zap, popular: true };
    if (lower.includes("enterprise") || lower.includes("unlimited")) return { color: "indigo", icon: Crown, popular: false };
    return { color: "slate", icon: ShieldCheck, popular: false };
  };

  const invoiceColumns: Column<Invoice>[] = [
    {
      header: "Invoice Number",
      accessor: (inv) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <FileText size={16} />
          </div>
          <span className="font-bold text-slate-900">{inv.invoice_number}</span>
        </div>
      )
    },
    {
      header: "Issued Date",
      accessor: (inv) => (
        <span className="text-sm font-medium text-slate-500">
          {dayjs(inv.issued_date).format("DD MMM YYYY")}
        </span>
      )
    },
    {
      header: "Amount",
      accessor: (inv) => (
        <span className="font-bold text-slate-900">{formatCurrency(inv.amount)}</span>
      )
    },
    {
      header: "Status",
      accessor: (inv) => {
        const styles = {
          paid: "bg-emerald-100 text-emerald-700",
          unpaid: "bg-amber-100 text-amber-700",
          overdue: "bg-rose-100 text-rose-700",
          canceled: "bg-slate-100 text-slate-400",
          verifying: "bg-blue-100 text-blue-700"
        };
        const statusKey = (inv.status || "unpaid").toLowerCase() as keyof typeof styles;
        return (
          <Badge className={`${styles[statusKey] || styles.canceled} border-none font-black text-[9px] uppercase tracking-widest`}>
            {inv.status === "verifying" ? "VERIFIKASI" : inv.status}
          </Badge>
        );
      }
    },
    {
      header: "Action",
      accessor: (inv) => (
        <div className="flex items-center gap-2">
          <button 
            disabled={downloadingId === inv.id}
            onClick={() => handleDownloadPDF(inv.id)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
            title="Download PDF"
          >
            {downloadingId === inv.id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>

          {(inv.status || "").toLowerCase() === "unpaid" && (
            <Button
              onClick={() => handlePayNow(inv)}
              className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
            >
              Bayar Sekarang
            </Button>
          )}

          {((inv.status || "").toLowerCase() === "unpaid" || (inv.status || "").toLowerCase() === "overdue") && (
            <Button
              onClick={() => handleOpenUploadModal(inv)}
              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
            >
              Upload Bukti
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isSubLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Financial Data...</p>
      </div>
    );
  }

  // Requirement 2: Handle 403 Forbidden
  if (isError403) {
    return <AccessDenied message="Akses Ditolak: Halaman billing hanya dapat diakses oleh Admin atau Finance perusahaan." />;
  }

  const currentMonthStr = dayjs().format("YYYY-MM");
  const hasPaidCurrentMonth = invoices.some((inv) => {
    const statusLower = (inv.status || "").toLowerCase();
    const isPaidInPeriod = statusLower === "paid" || statusLower === "verifying";
    const isCurrentPeriod = dayjs(inv.issued_date).format("YYYY-MM") === currentMonthStr;
    return isPaidInPeriod && isCurrentPeriod;
  });

  const hasUnpaidOrOverdue = invoices.some(
    (inv) => {
      const s = (inv.status || "").toLowerCase();
      return s === "unpaid" || s === "overdue";
    }
  );
  
  const isSubscriptionWarningActive = ((mySub?.status as string) === "non_active" || hasUnpaidOrOverdue) && !hasPaidCurrentMonth;

  return (
    <Can permission="billing.manage" fallback={<AccessDenied />}>
      <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
                <CreditCard size={16} className="fill-current" />
                Financial Command Center
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Billing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">& Invoices</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Manage your organization&apos;s financial health, track recurring cycles, and oversee license distributions.
              </p>
            </div>

            <Button 
              onClick={() => setShowPlans(!showPlans)}
              className="relative z-10 h-14 px-8 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              {showPlans ? "Back to Dashboard" : "Upgrade Subscription"}
              <ArrowUpRight size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </section>

        {/* Warning Banner */}
        {isSubscriptionWarningActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm">Pemberitahuan Tagihan & Layanan</h4>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                {(mySub?.status as string) === "non_active" 
                  ? "Layanan langganan Anda saat ini tidak aktif. Harap segera lakukan pembayaran untuk mengaktifkan kembali layanan." 
                  : "Anda memiliki tagihan yang belum dibayar. Harap segera lakukan pembayaran untuk menghindari gangguan layanan."}
              </p>
            </div>
          </div>
        )}

        {!showPlans ? (
          <>
            {/* Requirement 3: Empty State Handling */}
            {hasNoSubscription ? (
              <EmptySubscription onAction={() => setShowPlans(true)} />
            ) : (
              <>
                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Upcoming Billing */}
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <TrendingUp size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Wallet size={22} strokeWidth={2.5} />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">{mySub?.status || "Active"}</Badge>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming Billing</p>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">{mySub ? formatCurrency(mySub.amount) : "IDR 0"}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} /> Due {mySub ? dayjs(mySub.next_billing_date).format("MMM DD, YYYY") : "-"}
                    </div>
                  </div>

                  {/* Current Plan */}
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Crown size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <ShieldCheck size={22} strokeWidth={2.5} />
                      </div>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Tier</p>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">{mySub?.plan?.name || "None"}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      Billed {mySub?.billing_cycle || "Monthly"}
                    </div>
                  </div>

                  {/* Employee Capacity */}
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Zap size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Zap size={22} strokeWidth={2.5} />
                      </div>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">License Capacity</p>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">
                      {mySub?.plan?.max_employees === 0 ? "Unlimited" : `${mySub?.plan?.max_employees || 0} Seats`}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                      Enterprise Ready
                    </div>
                  </div>
                </div>

                {/* Billing History Section */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[500px] overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                      <History size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Billing History</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Previous transaction records</p>
                    </div>
                  </div>

                  <div className="p-8 flex-1">
                    {isInvLoading ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Invoices...</p>
                      </div>
                    ) : invoices.length > 0 ? (
                      <DataTable 
                        data={invoices}
                        columns={invoiceColumns}
                        currentPage={currentPage}
                        totalPages={pagination?.last_page || 1}
                        onPageChange={setCurrentPage}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-80 text-center">
                        <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                          <SearchX size={40} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Invoices Found</h4>
                        <p className="text-sm font-medium text-slate-400 mt-1">Your organization has no billing history yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* Pricing Grid (Visible only when Upgrade Subscription is clicked) */
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Available Subscription Tiers</h2>
               <p className="text-slate-500 font-medium">Select a plan that fits your organization&apos;s growth and scale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
              {availablePlans.map((plan) => {
                const isCurrent = mySub?.plan?.id === plan.id;
                const visuals = getPlanVisuals(plan.name);
                const PlanIcon = visuals.icon;
                
                return (
                  <div 
                    key={plan.id} 
                    className={`relative flex flex-col bg-white rounded-[40px] p-10 shadow-sm border transition-all duration-500 group ${
                      visuals.popular ? "border-indigo-200 shadow-indigo-100 shadow-xl scale-105 z-10" : "border-slate-100 hover:shadow-xl hover:-translate-y-2"
                    }`}
                  >
                    {visuals.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                        Recommended
                      </div>
                    )}

                    <div className="mb-8">
                      <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center transition-transform group-hover:rotate-6 ${
                        visuals.color === 'blue' ? "bg-blue-50 text-blue-600" : visuals.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600"
                      }`}>
                        <PlanIcon size={32} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                      <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed">
                        Access to {plan.features.length} core business modules and features.
                      </p>
                    </div>

                    <div className="mb-8 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">{formatCurrency(plan.price)}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ {plan.days} Days</span>
                    </div>

                    <div className="space-y-4 flex-1 mb-10">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-30">Included Features</p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${visuals.popular ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                            <Check size={12} strokeWidth={4} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 capitalize">{feature.replace('.', ' ')}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                         <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${visuals.popular ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                            <Check size={12} strokeWidth={4} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {plan.max_employees === 0 ? "Unlimited Employees" : `Up to ${plan.max_employees} Employees`}
                          </span>
                      </div>
                    </div>

                    <Button 
                      disabled={isCurrent || upgradeMutation.isPending}
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                      className={`h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
                        isCurrent 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none" 
                        : visuals.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
                        : "bg-slate-900 hover:bg-indigo-600 text-white"
                      }`}
                    >
                      {isCurrent ? (
                        <div className="flex items-center gap-2">
                           <CheckCircle2 size={16} /> Current Plan
                        </div>
                      ) : upgradeMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Support Banner */}
        <div className="bg-slate-50 rounded-[40px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-100">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
               <AlertCircle size={28} />
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-900 tracking-tight">Need a custom plan?</h4>
               <p className="text-sm font-medium text-slate-500">Contact our sales team for personalized enterprise quotes and bulk licensing.</p>
            </div>
          </div>
          <Button variant="secondary" className="px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-slate-200">
             Contact Sales
          </Button>
        </div>

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
    </Can>
  );
}
