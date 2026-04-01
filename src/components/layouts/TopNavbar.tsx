import Image from "next/image";

export default function TopNavbar() {
  return (
    <div className="flex h-16 items-center justify-between px-6 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold shadow">
          A
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Attendance</h1>
          <p className="text-xs text-gray-400">Dashboard overview</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-1.5">
          <Image
            src="https://i.pravatar.cc/40"
            width={32}
            height={32}
            alt="User avatar"
            className="rounded-full object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900">Mahardika</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
