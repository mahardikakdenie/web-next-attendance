export function WeeklySummary() {
  const data = [
    { day: "Mon", value: 8 },
    { day: "Tue", value: 7 },
    { day: "Wed", value: 8 },
    { day: "Thu", value: 6 },
    { day: "Fri", value: 8 },
  ];

  return (
    <div className="bg-slate-100/80 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-4">
        Weekly Hours
      </h3>

      <div className="flex items-end justify-between h-32">
        {data.map((item) => (
          <div key={item.day} className="flex flex-col items-center gap-2">
            <div
              className="w-6 rounded-lg bg-blue-500/80"
              style={{ height: `${item.value * 10}px` }}
            />
            <span className="text-xs text-slate-500">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
