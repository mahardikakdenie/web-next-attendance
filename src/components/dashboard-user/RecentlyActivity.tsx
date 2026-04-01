export function RecentActivity() {
  const data = [
    { time: "09:02", label: "Clock In", status: "On Time" },
    { time: "12:00", label: "Break Start" },
    { time: "13:00", label: "Break End" },
  ];

  return (
    <div className="bg-slate-100/80 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-4">
        Today Activity
      </h3>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-medium text-slate-900">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
