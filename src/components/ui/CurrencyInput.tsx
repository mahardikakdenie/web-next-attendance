"use client";

import React, { useRef, useLayoutEffect } from "react";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  variant?: "default" | "ghost";
}

export default function CurrencyInput({
  value,
  onChange,
  label,
  error,
  variant = "default",
  className = "",
  ...props
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCursorPos = useRef<number | null>(null);

  // Format number to IDR style string (2.000.000)
  const formatDisplay = (val: number | undefined): string => {
    if (val === undefined || val === null || val === 0) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Sync cursor position after render to prevent jumping
  useLayoutEffect(() => {
    if (inputRef.current && lastCursorPos.current !== null) {
      inputRef.current.setSelectionRange(lastCursorPos.current, lastCursorPos.current);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value.replace(/\D/g, "");
    
    if (rawValue === "") {
      lastCursorPos.current = null;
      onChange(0);
      return;
    }
    
    const numericValue = parseInt(rawValue, 10);
    if (!isNaN(numericValue)) {
      // Calculate cursor position from the end to maintain position across formatting dots
      const suffixLength = input.value.length - (input.selectionStart || 0);
      
      onChange(numericValue);

      // Defer position restoration to useLayoutEffect
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = Math.max(0, inputRef.current.value.length - suffixLength);
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  return (
    <div className={label ? "space-y-2" : ""}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center group">
        <span className="absolute left-4 text-[11px] font-black text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
          Rp
        </span>
        <input
          {...props}
          ref={inputRef}
          type="text"
          value={formatDisplay(value)}
          onChange={handleChange}
          autoComplete="off"
          className={`w-full transition-all duration-300 outline-none h-12 pl-11 pr-5 rounded-2xl tabular-nums text-[13px] font-black shadow-sm ${
            variant === "default" 
              ? "bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-slate-900" 
              : "bg-slate-50 border-none focus:ring-4 focus:ring-blue-600/10 text-neutral-900"
          } ${className}`}
        />
      </div>
      {error && <p className="text-[9px] font-bold text-rose-500 ml-1 mt-1">{error}</p>}
    </div>
  );
}
