export default function DashboardLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-in fade-in duration-1000">
      <div className="relative">
        <div className="w-20 h-20 rounded-[24px] border-4 border-slate-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 animate-pulse" />
        </div>
      </div>
      <p className="font-black text-slate-900 tracking-[0.2em] uppercase text-xs">Initializing Terminal</p>
    </div>
  );
}
