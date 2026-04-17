"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { 
  FileEdit, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  SearchX,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  History
} from "lucide-react";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { getCorrections } from "@/service/attendance";
import { DataTable, Column } from "@/components/ui/DataTable";
import { AttendanceCorrectionData } from "@/types/api";
import { toast } from "sonner";
import CorrectionApprovalModal from "@/components/attendance/CorrectionApprovalModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CorrectionsView() {
  const { user, loading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;

  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrectionData | null>(null);
  const [approvalMode, setApprovalMode] = useState<'APPROVE' | 'REJECT' | null>(null);

  const { data: correctionsResp, isLoading, refetch } = useQuery({
    queryKey: ["corrections-list", statusFilter, limit, offset],
    queryFn: () => getCorrections({ 
      status: statusFilter === "ALL" ? "" : statusFilter, 
      limit, 
      offset 
    }),
  });

  const data = correctionsResp?.data?.data || [];
  const total = correctionsResp?.data?.meta?.total || 0;

  const handleAction = (correction: AttendanceCorrectionData, mode: 'APPROVE' | 'REJECT') => {
    setSelectedCorrection(correction);
    setApprovalMode(mode);
  };

  const columns: Column<AttendanceCorrectionData>[] = useMemo(() => [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={item.user?.media_url || "/profile.jpg"} 
              fill
              sizes="40px"
              alt={item.user?.name || "User"}
              className="rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">
              {item.user?.name || "Unknown"}
            </p>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">   
              ID: {item.user?.employee_id || item.user_id}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Date",
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-neutral-700">{item.date}</span>
          <span className="text-[10px] text-neutral-400 font-bold uppercase">Correction Date</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Proposed Times",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-emerald-600">In</span>
            <span className="text-xs font-bold text-neutral-700">{item.clock_in_time}</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-orange-600">Out</span>
            <span className="text-xs font-bold text-neutral-700">{item.clock_out_time}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Reason",
      accessor: (item) => (
        <div className="max-w-[200px]">
          <p className="text-xs font-medium text-neutral-500 line-clamp-2 italic">
            &quot;{item.reason}&quot;
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => {
        const status = item.status || "PENDING";
        const config = {
          PENDING: "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500",
          APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",
          REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500",
        }[status] || "bg-slate-50 text-slate-600 border-slate-200 dot-slate-400";

        return (
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${config.split(' ').slice(0, 3).join(' ')}`}>
            <span className={`w-2 h-2 rounded-full ${config.split(' ')[3].replace('dot-', 'bg-')}`} />
            {status}
          </span>
        );
      },
      sortable: true,
    },
  ], []);

  const actions = (item: AttendanceCorrectionData) => (
    <div className="flex items-center justify-end gap-2">
      {isAdmin && item.status === "PENDING" ? (
        <>
          <button 
            onClick={() => handleAction(item, 'APPROVE')}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="Approve"
          >
            <CheckCircle2 size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => handleAction(item, 'REJECT')}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Reject"
          >
            <XCircle size={18} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
          <MoreVertical size={18} />
        </button>
      )}
    </div>
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["corrections-list"] });
  };

  if (authLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Filters/Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-[22px] border border-neutral-100 w-fit shadow-xs">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setOffset(0);
              }}
              className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === tab 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
          <AlertCircle size={16} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {total} Correction Requests Found
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {data.length === 0 && !isLoading ? (
          <div className="bg-white rounded-[40px] border border-neutral-100 p-20 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <SearchX size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Requests Found</h3>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8 text-sm">
              We couldn&apos;t find any correction requests matching your current selection.
            </p>
            <Button 
              onClick={() => {
                setStatusFilter("ALL");
                setOffset(0);
              }}
              className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl transition-all"
            >
              <RotateCcw size={18} />
              <span className="font-black uppercase tracking-widest text-xs">Clear Filter</span>
            </Button>
          </div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            actions={actions}
            currentPage={Math.floor(offset / limit) + 1}
            totalPages={Math.ceil(total / limit)}
            onPageChange={(page) => setOffset((page - 1) * limit)}
            limit={limit}
            isLoading={isLoading}
          />
        )}
      </div>

      {selectedCorrection && approvalMode && (
        <CorrectionApprovalModal
          open={!!selectedCorrection}
          correction={selectedCorrection}
          mode={approvalMode}
          onClose={() => {
            setSelectedCorrection(null);
            setApprovalMode(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
