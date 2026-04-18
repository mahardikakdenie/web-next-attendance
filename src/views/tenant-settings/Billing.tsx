"use client";

import React from "react";
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
  Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMySubscription, upgradePlan } from "@/service/subscription";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Can } from "@/components/auth/PermissionGuard";
import { SubscriptionPlan } from "@/types/subscription";

const PRICING_PLANS = [
  {
    name: "Starter" as SubscriptionPlan,
    price: 0,
    description: "Essential for small teams just getting started.",
    features: ["Up to 10 Employees", "Basic Attendance Logs", "Manual Reports", "Email Support"],
    color: "slate",
    icon: ShieldCheck
  },
  {
    name: "Business" as SubscriptionPlan,
    price: 500000,
    description: "Advanced features for growing organizations.",
    features: ["Up to 100 Employees", "Advanced Analytics", "Geofence Rules", "Priority Support", "Payroll Integration"],
    color: "blue",
    icon: Zap,
    popular: true
  },
  {
    name: "Enterprise" as SubscriptionPlan,
    price: 1500000,
    description: "Maximum scale and dedicated enterprise support.",
    features: ["Unlimited Employees", "Custom Integrations", "Dedicated Manager", "White-label Options", "SLA Guarantee"],
    color: "indigo",
    icon: Crown
  }
];

export default function BillingView() {
  const queryClient = useQueryClient();

  const { data: subResp, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => getMySubscription()
  });

  const upgradeMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) => upgradePlan({ plan }),
    onSuccess: () => {
      toast.success("Upgrade request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
    },
    onError: () => {
      toast.error("Failed to process upgrade. Please contact support.");
    }
  });

  const mySub = subResp?.data;

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (window.confirm(`Are you sure you want to upgrade to the ${plan} plan?`)) {
      upgradeMutation.mutate(plan);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
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
                Subscription Management
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Fuel Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Organization</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Scale your operations with high-performance plans designed for modern enterprise agility and workforce precision.
              </p>
            </div>

            {/* Current Plan Summary Card */}
            {mySub && (
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-w-[280px] shadow-xl ring-1 ring-white/20">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Plan</span>
                   <Badge className="bg-indigo-500 text-white border-none font-black text-[9px] uppercase px-2 py-0.5">{mySub.status}</Badge>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black">{mySub.plan}</span>
                  <span className="text-xs font-bold text-slate-500 mb-1.5">Elite Edition</span>
                </div>
                <div className="space-y-2 border-t border-white/5 pt-4">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} /> Next Billing: {dayjs(mySub.next_billing_date).format("MMM DD, YYYY")}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Wallet size={14} /> Amount: {formatCurrency(mySub.amount)}
                   </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = mySub?.plan === plan.name;
            const PlanIcon = plan.icon;
            
            return (
              <div 
                key={plan.name} 
                className={`relative flex flex-col bg-white rounded-[40px] p-10 shadow-sm border transition-all duration-500 group ${
                  plan.popular ? "border-indigo-200 shadow-indigo-100 shadow-xl scale-105 z-10" : "border-slate-100 hover:shadow-xl hover:-translate-y-2"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center transition-transform group-hover:rotate-6 ${
                    plan.color === 'blue' ? "bg-blue-50 text-blue-600" : plan.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600"
                  }`}>
                    <PlanIcon size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{formatCurrency(plan.price)}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                </div>

                <div className="space-y-4 flex-1 mb-10">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-30">Included Features</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  disabled={isCurrent || upgradeMutation.isPending}
                  onClick={() => handleUpgrade(plan.name)}
                  className={`h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
                    isCurrent 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none" 
                    : plan.popular
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
