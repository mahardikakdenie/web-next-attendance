import React from 'react';
import { CreditCard, Rocket, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptySubscriptionProps {
  title?: string;
  message?: string;
  onAction?: () => void;
}

export function EmptySubscription({ 
  title = "No Active Plan Found", 
  message = "Your organization doesn't have an active subscription plan yet. Choose a plan to unlock all workforce management features.",
  onAction
}: EmptySubscriptionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-10 bg-white rounded-[40px] border border-dashed border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
          <CreditCard size={40} />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl shadow-lg flex items-center justify-center text-white animate-bounce">
          <Rocket size={20} fill="currentColor" />
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">
        {title}
      </h3>
      
      <p className="max-w-md text-slate-500 font-medium leading-relaxed mb-10 text-sm sm:text-base">
        {message}
      </p>

      <Button 
        onClick={onAction}
        className="h-16 px-10 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95"
      >
        <Plus size={18} className="mr-2" />
        Choose a Plan Now
      </Button>
    </div>
  );
}
