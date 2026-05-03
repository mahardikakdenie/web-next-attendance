"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Select from "./Select";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  sortable?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  // Pagination Props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export function DataTable<T extends { id: string | number }>({
  data = [],
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  onRowClick,
  actions,
  currentPage: externalPage,
  totalPages,
  onPageChange,
  isLoading = false,
  limit,
  onLimitChange,
  limitOptions = [5, 10, 15, 25]
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);

  // Determine active page
  const activePage = externalPage !== undefined ? externalPage : internalPage;

  // Failsafe for total pages calculation
  const totalPagesCount = Math.max(1, Math.floor(
    totalPages !== undefined 
      ? totalPages 
      : (limit ? Math.ceil(data.length / limit) : 1)
  ));

  const handlePageChange = (newPage: number) => {
    // Only block if clicking the same page
    if (newPage === activePage) return;
    
    // Boundary checks
    if (newPage < 1 || newPage > totalPagesCount) return;

    if (externalPage === undefined) {
      setInternalPage(newPage);
    }
    
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle Sorting logic
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Process data
  const processedData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    let filtered = [...safeData];

    if (searchTerm && searchKey) {
      filtered = filtered.filter((item) => {
        const value = item[searchKey];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (!totalPages && limit) {
      const start = (activePage - 1) * limit;
      return filtered.slice(start, start + limit);
    }

    return filtered;
  }, [data, sortConfig, searchTerm, searchKey, limit, activePage, totalPages]);

  const showPagination = onPageChange || onLimitChange;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      {searchKey && (
        <div className="relative group max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-hidden transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-4xl border border-neutral-100 shadow-xs">
        <div className={`overflow-x-auto rounded-4xl relative ${isLoading ? "cursor-wait" : ""}`}>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
               <div className="flex flex-col items-center gap-2 bg-white px-8 py-5 rounded-[2.5rem] shadow-2xl border border-slate-100 scale-110">
                  <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Syncing...</p>
               </div>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                {columns.map((col, idx) => (
                  <th 
                    key={idx}
                    className={`px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ${col.className || ""}`}
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.sortable && typeof col.accessor === "string" ? (
                      <button 
                        type="button"
                        onClick={() => handleSort(col.accessor as keyof T)}
                        className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
                      >
                        {col.header}
                        {sortConfig?.key === col.accessor ? (
                          sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="opacity-30" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                {actions && <th className="px-6 py-5 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {processedData.length > 0 ? (
                processedData.map((item, rowIdx) => (
                  <tr 
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={`group hover:bg-neutral-50/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col, idx) => (
                      <td 
                        key={idx}
                        className={`px-6 py-4 text-sm ${col.className || ""}`}
                        style={{ textAlign: col.align || "left" }}
                      >
                        {typeof col.accessor === "function" 
                          ? col.accessor(item, rowIdx) 
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))
              ) : !isLoading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-neutral-50 rounded-full">
                        <Search size={24} className="text-neutral-300" />
                      </div>
                      <p className="text-sm font-bold text-neutral-400">No data found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-32"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {showPagination && (
          <div className="px-6 py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between bg-neutral-50/30 gap-4 relative z-20">
            <div className="flex items-center gap-4">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-tight">
                Page {activePage} of {totalPagesCount}
              </p>
              
              {onLimitChange && limit !== undefined && (
                <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rows:</span>
                  <Select
                    value={limit}
                    onChange={(val) => onLimitChange(Number(val))}
                    options={limitOptions.map(opt => ({ label: String(opt), value: opt }))}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {onPageChange && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage === 1}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPagesCount)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPagesCount ||
                      (pageNum >= activePage - 1 && pageNum <= activePage + 1)
                    ) {
                      const isActive = activePage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all active:scale-95 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 cursor-default"
                              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === 2 && activePage > 3) ||
                      (pageNum === totalPagesCount - 1 && activePage < totalPagesCount - 2)
                    ) {
                      return <span key={pageNum} className="px-1 text-neutral-400 font-bold cursor-default">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage === totalPagesCount}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
