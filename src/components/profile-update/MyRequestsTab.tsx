"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyChangeRequests, cancelChangeRequest } from "@/service/users";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ProfileChangeRequest, CustomApiError } from "@/types/api";
import dayjs from "dayjs";
import { XCircle, Info, Clock, CheckCircle } from "lucide-react";

export default function MyRequestsTab() {
  const queryClient = useQueryClient();

  const { data: requestsResp, isLoading } = useQuery({
    queryKey: ["my-profile-requests"],
    queryFn: getMyChangeRequests,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile-requests"] });
      toast.success("Request cancelled successfully");
    },
    onError: (err: CustomApiError) => {
      toast.error(err.response?.data?.meta?.message || "Failed to cancel request");
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1"><Clock size={10} /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1"><CheckCircle size={10} /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 flex items-center gap-1"><XCircle size={10} /> Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-neutral-50 text-neutral-400 border-neutral-100 flex items-center gap-1"><XCircle size={10} /> Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: Column<ProfileChangeRequest>[] = [
    {
      header: "Date Submitted",
      accessor: (row) => dayjs(row.created_at).format("DD MMM YYYY, HH:mm"),
      className: "font-bold text-neutral-700"
    },
    {
      header: "Fields Changed",
      accessor: (row) => {
        const fields = Object.keys(row.new_data);
        return (
          <div className="flex flex-wrap gap-1">
            {fields.map(f => (
              <span key={f} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md uppercase">
                {f.replace('_', ' ')}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status)
    },
    {
      header: "Admin Note",
      accessor: (row) => row.admin_notes || "-",
      className: "text-neutral-400 italic text-xs"
    }
  ];

  const actions = (row: ProfileChangeRequest) => {
    if (row.status === 'pending') {
      return (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-9"
          onClick={() => cancelMutation.mutate(row.id)}
          disabled={cancelMutation.isPending}
        >
          <XCircle size={14} className="mr-1.5" />
          Cancel
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full px-4 md:px-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
          <Clock size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 leading-tight">
            My Update Requests
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mt-1">
            Track your profile change history
          </p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
        <Info size={18} className="text-blue-600 shrink-0" />
        <p className="text-[11px] text-blue-800 font-medium">
          Profile changes are not applied immediately. Our HR team will review your request within 24 hours. 
          You can cancel a pending request if you made a mistake.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <DataTable
          data={requestsResp?.data || []}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
