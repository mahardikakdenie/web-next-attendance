"use client";

import { 
  Users, 
  Mail, 
  Phone,
  MapPin,
  Filter,
  Eye,
  Edit,
  Trash2,
  ListChecks,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/PermissionGuard";
import Avatar from "@/components/ui/Avatar";
import { useEffect, useState, useCallback } from "react";
import { getDataUserslist } from "@/service/users";
import { DataTable, Column } from "@/components/ui/DataTable";
import { MetaResponse, UserData } from "@/types/api";
import { getRoleBadgeColor } from "@/lib/utils";
import CreateEmployeeModal from "@/components/employees/CreateEmployeeModal";
import LifecycleModal from "@/components/employees/LifecycleModal";
import QuotaModal from "@/components/employees/QuotaModal";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { formatCurrency } from "@/components/finance/CreateExpenseModal";

export default function EmployeesView() {
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [meta, setMeta] = useState<MetaResponse | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lifecycleEmployee, setLifecycleEmployee] = useState<{id: number, name: string} | null>(null);
  const [quotaEmployee, setQuotaEmployee] = useState<{id: number, name: string, quota: number} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const {user} = useAuthStore(); 

  const getData = useCallback(async (page: number = 1) => {
    try {
      if (!user?.id) return;
      const resp = await getDataUserslist({
        page,
        user_id: user.id,
        limit: 10,
      });
      if (resp.data) {
        setEmployees(resp.data);
        setMeta(resp.meta);
      }
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      getData(currentPage);
    });
    return () => cancelAnimationFrame(handle);
  }, [getData, currentPage]);

  const columns: Column<UserData>[] = [
    {
      header: "Employee",
      accessor: (emp) => (
        <div className="flex items-center gap-3">
          <Avatar src={emp.media_url || "/profile.jpg"} />
          <div>
            <p className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{emp.name}</p>
            <p className="text-[11px] text-neutral-500 font-medium">ID: {emp.employee_id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Role",
      accessor: (emp) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor(emp.role?.base_role)}`}>
            {emp.role?.name || 'N/A'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Monthly Quota",
      accessor: (emp) => (
        <div className="flex items-center gap-2 text-indigo-600 font-black text-sm tabular-nums">
          <Coins size={14} className="text-indigo-400" />
          {formatCurrency(emp.expense_quota || 0)}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Department",
      accessor: (emp) => (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200/50">
          {emp.department}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Contact",
      accessor: (emp) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
            <Mail size={12} />
            <span className="text-[11px]">{emp.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
            <Phone size={12} />
            <span className="text-[11px]">{emp.phone_number}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (emp) => (
        <div className="flex items-center gap-1.5 text-neutral-600">
          <MapPin size={14} className="text-neutral-400" />
          <span className="text-[12px] font-bold">{emp.address || 'Not set'}</span>
        </div>
      ),
      sortable: true,
    },
  ];

  const canEditQuota = user?.role?.name && [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.FINANCE].includes(user.role.name as 'admin' | 'superadmin' | 'finance');

  const actions = (emp: UserData) => (
    <div className="flex items-center justify-end gap-1">
      {canEditQuota && (
        <button
          onClick={() => setQuotaEmployee({ id: emp.id, name: emp.name, quota: emp.expense_quota })}
          title="Update Expense Quota"
          className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        >
          <Coins size={18} />
        </button>
      )}
      <button
        onClick={() => setLifecycleEmployee({ id: emp.id, name: emp.name })}
        title="Employee Lifecycle"
        className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
      >
        <ListChecks size={18} />
      </button>
      <button
        title="View Profile"
        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
      >
        <Eye size={18} />
      </button>
      <button
        title="Edit Employee"
        className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
      >
        <Edit size={18} />
      </button>
      <button
        disabled={emp.id === user?.id || emp.role?.name === 'superadmin'}
        title="Delete Record"
        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Employees</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">Manage and view your organization&apos;s directory</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="px-5 py-2.5 rounded-2xl">
            <Filter size={18} />
            <span className="font-bold">Filter</span>
          </Button>
          <Can permission="user.create">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl"
            >
              <Users size={18} />
              <span className="font-bold">Add Employee</span>
            </Button>
          </Can>
        </div>
      </div>

      <DataTable 
        data={employees} 
        columns={columns} 
        searchKey="name" 
        searchPlaceholder="Search employee by name..."
        actions={actions}
        currentPage={meta?.pagination?.current_page}
        totalPages={meta?.pagination?.last_page}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
      />

      <CreateEmployeeModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => getData(currentPage)}
      />

      {lifecycleEmployee && (
        <LifecycleModal 
          open={!!lifecycleEmployee}
          onClose={() => setLifecycleEmployee(null)}
          employeeId={lifecycleEmployee.id}
          employeeName={lifecycleEmployee.name}
        />
      )}

      {quotaEmployee && (
        <QuotaModal 
          open={!!quotaEmployee}
          onClose={() => setQuotaEmployee(null)}
          onSuccess={() => getData(currentPage)}
          employeeId={quotaEmployee.id}
          employeeName={quotaEmployee.name}
          currentQuota={quotaEmployee.quota}
        />
      )}
    </div>
  );
}
