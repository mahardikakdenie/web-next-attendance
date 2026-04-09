"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send, 
  ShieldCheck,
  Building
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "../ui/Button";

export default function UpdateRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert("System: Your update request has been submitted to HR for review.");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Card className="p-8! bg-white shadow-xl shadow-blue-500/5 rounded-[32px] border border-neutral-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] -z-0" />
      
      {/* Header Section */}
      <div className="mb-10 relative z-10">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
          <ShieldCheck size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verification Protocol</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-neutral-900">
          Request Profile Update
        </h2>
        <p className="text-sm font-medium text-neutral-400 mt-1">
          Changes will be verified by HR before taking effect on your official profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Personal Info Group */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-50 pb-2">
            <User size={16} className="text-neutral-400" />
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Personal & Contact</h3>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">New Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="Enter legal name"
                  className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email"
                  placeholder="name@company.com"
                  className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="+62 8..."
                  className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">Department (Optional)</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 transition-all outline-none appearance-none">
                  <option>Engineering</option>
                  <option>Human Resources</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Reason Group */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-50 pb-2">
            <MapPin size={16} className="text-neutral-400" />
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Additional Details</h3>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">Current Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
              <textarea 
                rows={3}
                placeholder="Enter your full residential address"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 ml-1">Reason for Update</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-neutral-300 group-focus-within:text-blue-500 transition-colors" size={18} />
              <textarea 
                rows={2}
                placeholder="Briefly explain why you're requesting these changes..."
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-medium text-neutral-600 italic focus:bg-white focus:ring-2 focus:ring-neutral-100 transition-all outline-none resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-end gap-4 pt-8 border-t border-neutral-100">
          <button 
            type="button" 
            className="px-6 py-3 text-sm font-black text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest"
          >
            Discard
          </button>
          <Button 
            disabled={isSubmitting}
            className={`h-14 px-10 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/20 flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50`}
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} />
            )}
            <span>{isSubmitting ? 'Processing...' : 'Submit for Review'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
