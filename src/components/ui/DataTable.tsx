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

  // Sync effective page
  const currentPage = externalPage !== undefined ? externalPage : internalPage;

  const handlePageChange = (page: number) => {
    if (externalPage === undefined) {
      setInternalPage(page);
    }
    onPageChange?.(page);
  };

  // Handle Sorting logic
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Process data (Filter -> Sort)
  const processedData = useMemo(() => {
    // Safety check to ensure data is an array
    const safeData = Array.isArray(data) ? data : [];
    let filtered = [...safeData];

    // Search filter (only if not server-side paginated or if we want client-side search on current page)
    if (searchTerm && searchKey) {
      filtered = filtered.filter((item) => {
        const value = item[searchKey];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Client-side pagination (if not server-side)
    if (limit && !totalPages) {
      const start = ((currentPage || 1) - 1) * limit;
      return filtered.slice(start, start + limit);
    }

    return filtered;
  }, [data, sortConfig, searchTerm, searchKey, limit, currentPage, totalPages]);

  const internalTotalPages = totalPages || (limit ? Math.ceil(data.length / limit) : 0);
  const effectiveCurrentPage = currentPage || 1;

  const showPagination = internalTotalPages > 0 && (onPageChange || onLimitChange);

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
      <div className="bg-white rounded-4xl border border-neutral-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
                        onClick={() => handleSort(col.accessor as keyof T)}
                        className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
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
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                       <p className="text-sm font-bold text-neutral-400 mt-2">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : processedData.length > 0 ? (
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
              ) : (
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
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="px-6 py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between bg-neutral-50/30 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-tight">
                Page {effectiveCurrentPage} of {internalTotalPages}
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
                  onClick={() => handlePageChange(effectiveCurrentPage - 1)}
                  disabled={effectiveCurrentPage === 1 || isLoading}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(internalTotalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show current, first, last, and pages around current
                    if (
                      page === 1 ||
                      page === internalTotalPages ||
                      (page >= effectiveCurrentPage - 1 && page <= effectiveCurrentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all active:scale-95 ${
                            effectiveCurrentPage === page
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 2 && effectiveCurrentPage > 3) ||
                      (page === internalTotalPages - 1 && effectiveCurrentPage < internalTotalPages - 2)
                    ) {
                      return <span key={page} className="px-1 text-neutral-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(effectiveCurrentPage + 1)}
                  disabled={effectiveCurrentPage === internalTotalPages || isLoading}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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
