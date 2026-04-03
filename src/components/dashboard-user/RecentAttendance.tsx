import { ArrowDownRight, ArrowUpRight, Calendar } from "lucide-react";

export function RecentAttendance() {
  const data = [
    { date: "Mon, 30 Mar", in: "09:02", out: "17:01", status: "On Time" },
    { date: "Tue, 31 Mar", in: "09:30", out: "17:10", status: "Late" },
    { date: "Wed, 01 Apr", in: "08:55", out: "17:00", status: "On Time" },
  ];

  return (
    <div className="w-full rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-neutral-800">Recent Attendance</h2>
        <button className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wide hover:bg-neutral-200 transition-colors">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => {
          const isLate = item.status === "Late";

          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-[20px] border border-neutral-100 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100/60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white border border-neutral-200 text-neutral-500">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-900">{item.date}</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight size={14} className="text-blue-500" strokeWidth={2.5} />
                      {item.in}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-1">
                      <ArrowUpRight size={14} className="text-orange-400" strokeWidth={2.5} />
                      {item.out}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                  isLate
                    ? "bg-rose-100/60 text-rose-600 border border-rose-200/50"
                    : "bg-emerald-100/60 text-emerald-600 border border-emerald-200/50"
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
