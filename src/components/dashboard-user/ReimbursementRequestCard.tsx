"use client";

import { useState } from "react";
import { Receipt, Plus, Check } from "lucide-react";
import CreateExpenseModal from "@/components/finance/CreateExpenseModal";

export function ReimbursementRequestCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2rem] sm:rounded-[40px] p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 h-full flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-600/40 border border-white/10">
      
      {/* Decorative Background Ornaments */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-700 ease-out" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-400/30 rounded-full blur-[60px] pointer-events-none" />
      
      {/* TOP SECTION */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500 ease-out">
            <Receipt size={26} className="text-white" strokeWidth={2} />
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             Finance Ops
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Expense Claim
          </h3>
          <p className="text-indigo-100/90 text-sm font-medium leading-relaxed max-w-[90%]">
            Submit your business expenses or medical reimbursements for fast verification and payout.
          </p>
        </div>

        {/* Feature Checklist */}
        <div className="space-y-3.5 mb-10">
           {[
             "Upload clear receipt photo",
             "Specify category & amount",
             "Track approval status live"
           ].map((step, i) => (
             <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-indigo-100/90 group/list">
               <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover/list:bg-emerald-500/20 group-hover/list:border-emerald-500/30 group-hover/list:text-emerald-400 transition-colors">
                 <Check size={12} strokeWidth={3} />
               </div>
               {step}
             </div>
           ))}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="relative z-10 mt-auto pt-2">
        {/* Mengubah custom <Button> menjadi native <button> */}
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-white text-indigo-700 hover:bg-slate-50 hover:text-indigo-800 rounded-2xl font-black h-14 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
        >
          <Plus size={20} strokeWidth={3} className="transition-transform duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110" />
          Create New Request
        </button>
        <p className="text-center text-[10px] font-black text-indigo-200 mt-4 uppercase tracking-[0.2em] opacity-70">
          Standard processing: 2-3 working days
        </p>
      </div>

      <CreateExpenseModal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
