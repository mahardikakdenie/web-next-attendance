"use client";

import { useState } from "react";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";
import { ReimbursementRequestCard } from "@/components/dashboard-user/ReimbursementRequestCard";
import { AttendanceRequestCard } from "@/components/dashboard-user/AttendanceRequestCard";
// import { Button } from "@/components/ui/button";
import { Calendar, Clock, Timer, Receipt, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

type RequestType = 'timeoff' | 'attendance' | 'overtime' | 'reimbursement' | null;

export default function RequestsTab() {
  const [activeForm, setActiveForm] = useState<RequestType>(null);

  const requestOptions = [
    {
      id: 'timeoff',
      title: 'Timeoff',
      description: 'Request leave, vacation, or sick days.',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Request attendance adjustments or corrections.',
      icon: Clock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'overtime',
      title: 'Overtime',
      description: 'Submit an overtime request for approval.',
      icon: Timer,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'reimbursement',
      title: 'Reimbursements',
      description: 'Submit expenses for reimbursement.',
      icon: Receipt,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ] as const;

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'timeoff':
        return <LeaveRequestCard />;
      case 'attendance':
        return <AttendanceRequestCard />;
      case 'overtime':
        return <OvertimeRequestCard />;
      case 'reimbursement':
        return <ReimbursementRequestCard />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!activeForm ? (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">What would you like to request?</h2>
            <p className="text-sm text-gray-500 mt-1">Select a category below to open the request form.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {requestOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveForm(option.id as RequestType)}
                className="group relative flex flex-col items-start p-6 bg-white border border-gray-100 rounded-[24px] hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left overflow-hidden cursor-pointer"
              >
                <div className={`p-3 rounded-2xl ${option.bgColor} ${option.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{option.description}</p>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-[24px] transition-colors pointer-events-none" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveForm(null)}
              className="text-gray-500 hover:text-gray-900 rounded-full h-10 px-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Options
            </Button>
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderActiveForm()}
          </div>
        </div>
      )}
    </div>
  );
}
