import Image from "next/image";
import { Eye, MoreVertical, MapPin, Smartphone } from "lucide-react";

type AttendanceStatus = "On Time" | "Late" | "Absent" | "On Leave";

interface Attendance {
  id: number;
  name: string;
  avatar: string;
  checkIn: string;
  checkOut: string;
  overtime: string;
  status: AttendanceStatus;
  location: string;
}

export const attendanceDummy: Attendance[] = [
  {
    id: 1,
    name: "Bagus Fikri",
    avatar: "https://i.pravatar.cc/150?u=bagus",
    checkIn: "08:52 AM",
    checkOut: "05:30 PM",
    overtime: "0h 30m",
    status: "On Time",
    location: "Main Office"
  },
  {
    id: 2,
    name: "Ihdizein",
    avatar: "https://i.pravatar.cc/150?u=ihdizein",
    checkIn: "09:30 AM",
    checkOut: "06:12 PM",
    overtime: "1h 30m",
    status: "Late",
    location: "Remote / Home"
  },
  {
    id: 3,
    name: "Mufti Hidayat",
    avatar: "https://i.pravatar.cc/150?u=mufti",
    checkIn: "08:45 AM",
    checkOut: "05:00 PM",
    overtime: "-",
    status: "On Time",
    location: "Main Office"
  },
];

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const styles = {
    "On Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Late": "bg-amber-50 text-amber-700 border-amber-100",
    "Absent": "bg-rose-50 text-rose-700 border-rose-100",
    "On Leave": "bg-blue-50 text-blue-700 border-blue-100"
  };

  const dots = {
    "On Time": "bg-emerald-500",
    "Late": "bg-amber-500",
    "Absent": "bg-rose-500",
    "On Leave": "bg-blue-500"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function AttendanceRow({ item }: { item: Attendance }) {
  return (
    <tr className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={item.avatar}
              fill
              sizes="40px"
              alt={item.name}
              className="rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">
              {item.name}
            </p>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">
              EMP-{item.id.toString().padStart(3, "0")}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-neutral-700">{item.checkIn}</span>
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold mt-0.5 uppercase">
            <Smartphone size={10} /> Mobile App
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-bold text-neutral-700">
        {item.checkOut}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin size={14} className="text-neutral-300" />
          <span className="text-xs font-bold">{item.location}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={item.status} />
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Eye size={18} />
          </button>
          <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function AttendanceTable() {
  return (
    <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Employee</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Clock In</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Clock Out</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Location</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-50">
            {attendanceDummy.map((item) => (
              <AttendanceRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Showing <span className="text-neutral-900">3</span> of <span className="text-neutral-900">124</span> employees
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-black text-neutral-400 hover:text-neutral-900 transition-colors">Previous</button>
          <button className="px-4 py-2 text-xs font-black bg-white border border-neutral-200 rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all">Next</button>
        </div>
      </div>
    </div>
  );
}
