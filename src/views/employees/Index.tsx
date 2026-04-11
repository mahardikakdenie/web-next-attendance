"use client";

import { 
  Users, 
  Mail, 
  Phone,
  MapPin,
  Filter,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useEffect, useState } from "react";
import { getDataUserslist } from "@/service/users";
import { DataTable, Column } from "@/components/ui/DataTable";
import { MetaResponse } from "@/types/api";

export interface EmployeeData {
  id: number;
  name: string;
  email: string;
  tenant_id: number;
  employee_id: string;
  department: string;
  address: string;
  media_url: string;
  phone_number: string;
  created_at: string;
}

export default function EmployeesView() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<MetaResponse | undefined>();

  useEffect(() => {
    const getData = async () => {
      try {
        const resp = (await getDataUserslist({
          limit: 2,
        }));
        setEmployees(resp.data);
        setMeta(resp.meta);
        
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, []);

  const columns: Column<EmployeeData>[] = [
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
      header: "Department",
      accessor: (emp) => (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-600">
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
          <span className="text-[12px] font-bold">{emp.address}</span>
        </div>
      ),
      sortable: true,
    },
  ];

  const actions = () => (
    <div className="flex items-center justify-end gap-1">
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
        title="Delete Record"
        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
          <Button className="flex items-center gap-2 bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 shadow-sm px-5 py-2.5 rounded-2xl transition-all">
            <Filter size={18} />
            <span className="font-bold">Filter</span>
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl transition-all">
            <Users size={18} />
            <span className="font-bold">Add Employee</span>
          </Button>
        </div>
      </div>

      <DataTable 
        data={employees} 
        columns={columns} 
        searchKey="name" 
        searchPlaceholder="Search employee by name..."
        actions={actions}
        currentPage={currentPage}
        totalPages={meta?.last_page}
        onPageChange={(page) => {
          console.log(page);
          setCurrentPage(page);
        }}
      />
    </div>
  );
}
