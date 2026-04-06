import Image from "next/image";
import { Eye, Pencil } from "lucide-react";

type AttendanceStatus = "On Time" | "Late";

interface Attendance {
  id: number;
  name: string;
  avatar: string;
  checkIn: string;
  checkOut: string;
  overtime: string;
  status: AttendanceStatus;
}

export const attendanceDummy: Attendance[] = [
  {
    id: 1,
    name: "Bagus Fikri",
    avatar: "https://i.pravatar.cc/150?u=bagus",
    checkIn: "10:02 AM",
    checkOut: "07:00 PM",
    overtime: "2h 12m",
    status: "On Time",
  },
  {
    id: 2,
    name: "Ihdizein",
    avatar: "https://i.pravatar.cc/150?u=ihdizein",
    checkIn: "09:30 AM",
    checkOut: "07:12 PM",
    overtime: "1h 30m",
    status: "Late",
  },
  {
    id: 3,
    name: "Mufti Hidayat",
    avatar: "https://i.pravatar.cc/150?u=mufti",
    checkIn: "09:24 AM",
    checkOut: "05:00 PM",
    overtime: "-",
    status: "On Time",
  },
];

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const isLate = status === "Late";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
        isLate
          ? "bg-rose-50 text-rose-600"
          : "bg-emerald-50 text-emerald-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isLate ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      {status}
    </span>
  );
}

function ActionsMenu() {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-white hover:text-blue-600 transition"
        >
          <Eye size={16} />
        </button>

        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:bg-white hover:text-blue-600 transition"
        >
          <Pencil size={16} />
        </button>
      </div>
    </div>
  );
}

function AttendanceRow({ item }: { item: Attendance }) {
  return (
    <tr className="group border-b last:border-none border-slate-100 hover:bg-slate-50/70 transition">
      <td className="px-4 py-3 sm:px-6 w-12">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          aria-label={`select-${item.id}`}
        />
      </td>

      <td className="px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image
              src={item.avatar}
              fill
              sizes="36px"
              alt={item.name}
              className="rounded-full object-cover ring-1 ring-slate-200"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {item.name}
            </p>
            <p className="text-xs text-slate-500">
              EMP-{item.id.toString().padStart(3, "0")}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 sm:px-6 text-sm font-medium text-slate-800">
        {item.checkIn}
      </td>

      <td className="px-4 py-3 sm:px-6 text-sm text-slate-600">
        {item.checkOut}
      </td>

      <td className="px-4 py-3 sm:px-6 text-sm">
        {item.overtime !== "-" ? (
          <span className="text-slate-700 font-medium">
            {item.overtime}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>

      <td className="px-4 py-3 sm:px-6">
        <StatusBadge status={item.status} />
      </td>

      <td className="px-4 py-3 sm:px-6">
        <ActionsMenu />
      </td>
    </tr>
  );
}

export function AttendanceTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider font-medium">
            <tr>
              <th className="px-4 py-3 sm:px-6 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  aria-label="select-all"
                />
              </th>
              <th className="px-4 py-3 sm:px-6">Employee</th>
              <th className="px-4 py-3 sm:px-6">Clock In</th>
              <th className="px-4 py-3 sm:px-6">Clock Out</th>
              <th className="px-4 py-3 sm:px-6">Overtime</th>
              <th className="px-4 py-3 sm:px-6">Status</th>
              <th className="px-4 py-3 sm:px-6 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {attendanceDummy.map((item) => (
              <AttendanceRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-slate-50/50 text-sm text-slate-500 flex justify-between">
        <span>
          Showing <span className="font-medium text-slate-900">3</span> of{" "}
          <span className="font-medium text-slate-900">3</span> results
        </span>
      </div>
    </div>
  );
}
