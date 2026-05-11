"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  error?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  className = "",
  disabled = false,
  searchable = false,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: Option) => {
    if (disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-5 h-12 bg-white border rounded-2xl text-[13px] font-black tracking-tight transition-all text-left outline-none ${
          isOpen 
            ? "ring-4 ring-blue-500/5 border-blue-500 shadow-sm" 
            : error 
              ? "border-rose-200 bg-rose-50/30" 
              : "border-slate-200 hover:border-slate-300 shadow-sm"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50/50" : "cursor-pointer active:scale-[0.98]"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption?.icon && <div className="shrink-0">{selectedOption.icon}</div>}
          <span className={`truncate ${!selectedOption ? "text-slate-400 font-bold" : "text-slate-900"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 shrink-0 transition-transform duration-500 ease-out ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border border-slate-100 rounded-[24px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out origin-top">
          {searchable && (
            <div className="p-3 border-b border-slate-50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          )}
          
          <div className="p-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
            {filteredOptions.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] text-[13px] font-bold transition-all group ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {option.icon && (
                      <div className={`shrink-0 transition-colors ${isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
                        {option.icon}
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={16} strokeWidth={3} className="shrink-0" />}
                </button>
              );
            })}
            
            {filteredOptions.length === 0 && (
              <div className="py-10 px-4 text-center">
                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No matching results</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 ml-1 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
