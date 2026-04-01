export function RecentAttendance() {
  const data = [
    { date: "Mon", in: "09:02", out: "17:01", status: "On Time" },
    { date: "Tue", in: "09:30", out: "17:10", status: "Late" },
    { date: "Wed", in: "08:55", out: "17:00", status: "On Time" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Recent Attendance</p>
        <span className="text-xs text-slate-400">This week</span>
      </div>

      <div className="flex flex-col">
        {data.map((item, i) => {
          const isLate = item.status === "Late";

          return (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b last:border-none border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLate ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    {item.date}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.in} - {item.out}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isLate
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
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
