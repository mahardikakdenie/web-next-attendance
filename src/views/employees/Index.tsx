"use client";

import { 
  Users, 
  Search, 
  Mail, 
  Phone,
  MoreHorizontal,
  MapPin,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
// import { Input } from "@/components/ui/Input";
// import { Avatar } from "@/components/ui/Avatar";

const MOCK_EMPLOYEES = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Senior Software Engineer",
    department: "Engineering",
    location: "Jakarta",
    phone: "+62 812-3456-7890",
    avatar: "/profile.jpg",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Product Designer",
    department: "Design",
    location: "Bandung",
    phone: "+62 812-9876-5432",
    avatar: "/profile.jpg",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "HR Manager",
    department: "Human Resources",
    location: "Jakarta",
    phone: "+62 811-2233-4455",
    avatar: "/profile.jpg",
  },
];

export default function EmployeesView() {

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employees</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and view your organization&apos;s directory</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl transition-all shadow-sm">
            <Filter size={18} />
            <span>Filter</span>
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20">
            <Users size={18} />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <Input
          placeholder="Search by name, email, or department..." 
          className="pl-12 py-6 bg-white border-neutral-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Employee Grid/Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Organization Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-5 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Department</th>
                <th className="px-5 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Location</th>
                <th className="px-5 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={emp.avatar} />
                      <div>
                        <p className="text-[13px] font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{emp.name}</p>
                        <p className="text-[11px] text-neutral-500">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-600">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Mail size={12} />
                        <span className="text-[11px]">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Phone size={12} />
                        <span className="text-[11px]">{emp.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <MapPin size={14} className="text-neutral-400" />
                      <span className="text-[12px] font-medium">{emp.location}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
