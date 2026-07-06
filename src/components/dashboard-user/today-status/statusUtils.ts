export const getBadgeClassName = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "on time" || s === "working" || s === "sedang bekerja") return "bg-emerald-50 text-emerald-600 border border-emerald-100/50";
  if (s === "late") return "bg-amber-50 text-amber-600 border border-amber-100/50";
  if (s === "absent") return "bg-rose-50 text-rose-600 border border-rose-100/50";
  if (s === "on leave") return "bg-blue-50 text-blue-600 border border-blue-100/50";
  if (s === "selesai" || s === "done" || s === "completed") return "bg-indigo-50 text-indigo-600 border border-indigo-100/50";
  return "bg-neutral-50 text-neutral-500 border border-neutral-200/50";
};
