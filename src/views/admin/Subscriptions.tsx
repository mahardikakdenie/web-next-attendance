"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { SubscriptionStatus } from "@/types/subscription";
import { Can } from "@/components/auth/PermissionGuard";
import PlanManagement from "@/components/admin/PlanManagement";
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";

export default function SubscriptionsView() {
  const [selectedView, setSelectedView] = useState<"subscriptions" | "plans">("subscriptions");
  const [activeTab, setActiveTab] = useState<SubscriptionStatus | "all">("all");

  return (
    <Can permission="analytics.executive">
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
        
        {/* Header */}
        <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">
                <ShieldCheck size={16} className="fill-current" />
                Financial Oversight Command
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Billing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">& Subscriptions</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Monitor recurring revenue streams, manage enterprise license cycles, and maintain the financial health of the global ecosystem.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit self-end">
                {(["subscriptions", "plans"] as const).map((view) => (
                  <button 
                    key={view} 
                    onClick={() => setSelectedView(view)} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedView === view ? "bg-white text-slate-950 shadow-xl" : "text-slate-400 hover:text-white"}`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {selectedView === "subscriptions" && (
                <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
                  {(["all", "Active", "Past Due", "Canceled"] as const).map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-slate-950 shadow-xl" : "text-slate-400 hover:text-white"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        {selectedView === "subscriptions" ? (
          <SubscriptionManagement 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        ) : (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 min-h-[600px]">
            <PlanManagement />
          </div>
        )}

      </div>
    </Can>
  );
}
