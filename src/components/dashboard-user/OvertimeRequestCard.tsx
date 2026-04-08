"use client";

import { useState } from "react";
import { Calendar, Clock, MessageSquare, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import clsx from "clsx";

export function OvertimeRequestCard() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    start_time: "17:00",
    end_time: "19:00",
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Overtime Request:", formData);
  };

  return (
    <div className="w-full rounded-4xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Overtime Request
          </h2>
          <p className="text-xs font-medium text-neutral-500 mt-0.5">
            Submit your extra hours
          </p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
          <Clock size={20} strokeWidth={2.5} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* Date Section - Bento Item */}
        <div className="group rounded-3xl border border-blue-50 bg-blue-50/30 p-4 transition-all hover:bg-blue-50/60 hover:border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-blue-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
              Work Date
            </span>
          </div>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-white/80 border-blue-100 focus:border-blue-400 h-10 rounded-xl text-sm"
            required
          />
        </div>

        {/* Time Section - Bento Item */}
        <div className="group rounded-3xl border border-indigo-50 bg-indigo-50/30 p-4 transition-all hover:bg-indigo-50/60 hover:border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-indigo-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
              Time Range
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase ml-1">Start</span>
              <Input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="bg-white/80 border-indigo-100 focus:border-indigo-400 h-10 px-3 rounded-xl text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase ml-1">End</span>
              <Input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="bg-white/80 border-indigo-100 focus:border-indigo-400 h-10 px-3 rounded-xl text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Reason Section - Bento Item */}
        <div className="flex-1 rounded-3xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50 hover:border-neutral-200 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-neutral-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Justification
            </span>
          </div>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Describe your overtime activity..."
            className={clsx(
              "w-full flex-1 px-4 py-3 rounded-xl text-sm transition-all outline-none placeholder:text-neutral-400",
              "bg-white/80 border border-neutral-200 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-400/5",
              "resize-none min-h-20"
            )}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2 h-12 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold tracking-tight transition-all active:scale-[0.98] mt-2 shadow-xl shadow-neutral-900/10"
        >
          <Send size={16} strokeWidth={2.5} />
          Submit Application
        </Button>
      </form>
    </div>
  );
}
