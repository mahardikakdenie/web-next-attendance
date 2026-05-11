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
  SearchX
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMySubscription, upgradePlan, getInvoices, getAvailablePlans } from "@/service/subscription";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Can } from "@/components/auth/PermissionGuard";
import { CustomApiError } from "@/types/api";
import { Invoice } from "@/types/billing";
import { SubscriptionPlan } from "@/types/subscription";

export default function BillingView() {
  const queryClient = useQueryClient();
  const [showPlans, setShowPlans] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: subResp, isLoading: isSubLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => getMySubscription()
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
  const availablePlans = plansResp?.data || [];
  const invoices = invResp?.data || [];
  const pagination = invResp?.meta?.pagination;

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
          Paid: "bg-emerald-100 text-emerald-700",
          Unpaid: "bg-amber-100 text-amber-700",
          Overdue: "bg-rose-100 text-rose-700",
          Canceled: "bg-slate-100 text-slate-400"
        };
        return (
          <Badge className={`${styles[inv.status] || styles.Canceled} border-none font-black text-[9px] uppercase tracking-widest`}>
            {inv.status}
          </Badge>
        );
      }
    },
    {
      header: "Action",
      accessor: (inv) => (
        <button 
          onClick={() => window.open(inv.pdf_url, '_blank')}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          title="Download PDF"
        >
          <Download size={18} />
        </button>
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

  return (
    <Can permission="billing.manage">
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

        {!showPlans ? (
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

      </div>
    </Can>
  );
}
