"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Select from "./Select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
  limitOptions = [5, 10, 25, 50],
  isLoading = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  
  const handlePageChange = (page: number) => {
    if (isLoading || page === currentPage || page < 1 || page > safeTotalPages) return;
    onPageChange(page);
  };

  return (
    <div className="px-6 py-5 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
      {/* Page Info & Limit */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Navigation</span>
          <p className="text-sm font-black text-neutral-900 tracking-tight">
            Page {currentPage} <span className="text-neutral-300 mx-1">of</span> {safeTotalPages}
          </p>
        </div>
        
        {onLimitChange && limit !== undefined && (
          <div className="flex items-center gap-3 border-l border-neutral-100 pl-6">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rows:</span>
            <Select
              value={limit}
              onChange={(val) => onLimitChange(Number(val))}
              options={limitOptions.map(opt => ({ label: String(opt), value: opt }))}
              className="w-24"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Page Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="group flex items-center justify-center w-12 h-12 rounded-2xl border border-neutral-200 bg-white text-neutral-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed transition-all duration-300 active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {[...Array(safeTotalPages)].map((_, i) => {
            const pageNum = i + 1;
            
            // Logic to show limited page numbers with ellipsis
            const isFirst = pageNum === 1;
            const isLast = pageNum === safeTotalPages;
            const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;

            if (isFirst || isLast || isNearCurrent) {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[48px] h-12 rounded-2xl text-xs font-black transition-all duration-300 active:scale-90 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 cursor-default"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              (pageNum === 2 && currentPage > 3) ||
              (pageNum === safeTotalPages - 1 && currentPage < safeTotalPages - 2)
            ) {
              return <span key={pageNum} className="w-8 text-center text-neutral-300 font-bold tracking-widest">...</span>;
            }
            return null;
          })}
        </div>

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === safeTotalPages || isLoading}
          className="group flex items-center justify-center w-12 h-12 rounded-2xl border border-neutral-200 bg-white text-neutral-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed transition-all duration-300 active:scale-90"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
