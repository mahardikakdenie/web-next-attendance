"use client";

import { Eye, Pencil, MoreHorizontal } from "lucide-react";

export function ActionsMenu() {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-white hover:text-blue-600 transition"
          aria-label="View"
        >
          <Eye size={16} />
        </button>

        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-white hover:text-blue-600 transition"
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition"
          aria-label="More"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
