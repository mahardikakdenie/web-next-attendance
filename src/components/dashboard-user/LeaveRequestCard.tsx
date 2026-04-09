"use client";

import { useState } from "react";
import { Calendar, MessageSquare, Send, Plane } from "lucide-react";
// import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import clsx from "clsx";
import { Button } from "../ui/Button";

export function LeaveRequestCard() {
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    type: "Annual Leave",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Leave Request:", formData);
  };

  return (
    <div className="w-full h-full rounded-4xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Request Leave
          </h2>
          <p className="text-xs font-medium text-neutral-500 mt-0.5">
            Plan your time off
          </p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
          <Plane size={20} strokeWidth={2.5} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* Leave Type Selector - Bento Style */}
        <div className="group rounded-3xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-white hover:border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
              Leave Category
            </span>
          </div>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-200 rounded-xl h-10 px-3 text-sm font-bold text-neutral-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none"
          >
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Personal Leave</option>
            <option>Unpaid Leave</option>
          </select>
        </div>

        {/* Date Range - Bento Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="group rounded-3xl border border-blue-50 bg-blue-50/30 p-4 transition-all hover:bg-blue-50/60 hover:border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-blue-600" strokeWidth={3} />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                Start Date
              </span>
            </div>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="bg-white/80 border-blue-100 focus:border-blue-400 h-10 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>

          <div className="group rounded-3xl border border-rose-50 bg-rose-50/30 p-4 transition-all hover:bg-rose-50/60 hover:border-rose-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-rose-600" strokeWidth={3} />
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">
                End Date
              </span>
            </div>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="bg-white/80 border-rose-100 focus:border-rose-400 h-10 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Justification - Bento Item */}
        <div className="flex-1 rounded-3xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-white hover:border-neutral-200 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-neutral-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Justification
            </span>
          </div>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Reason for your leave..."
            className={clsx(
              "w-full flex-1 px-4 py-3 rounded-xl text-sm transition-all outline-none placeholder:text-neutral-400 font-medium",
              "bg-white border border-neutral-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5",
              "resize-none min-h-20"
            )}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all active:scale-[0.98] mt-2 shadow-xl shadow-emerald-600/20"
        >
          <Send size={18} strokeWidth={2.5} />
          Submit Leave Application
        </Button>
      </form>
    </div>
  );
}
