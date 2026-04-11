"use client";

import React, { ChangeEvent } from "react";

type SwitchProps = {
  checked: boolean;
  /** Legacy onChange handler */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Modern onCheckedChange handler */
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export function Switch({ 
  checked, 
  onChange, 
  onCheckedChange,
  label, 
  description, 
  disabled = false 
}: SwitchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onCheckedChange) onCheckedChange(e.target.checked);
  };

  const switchContent = (
    <div className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label || "Toggle"}
      />
      
      {/* Background */}
      <div 
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-blue-600 shadow-inner" : "bg-slate-200"
        }`} 
      />
      
      {/* Knob */}
      <span
        className={`relative inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </div>
  );

  // If label is provided, wrap in the card-like label tag
  if (label !== undefined) {
    return (
      <label 
        className={`flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all ${
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-slate-300"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {description ? (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {switchContent}
      </label>
    );
  }

  // Otherwise return just the switch (bare mode)
  return (
    <div className={disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}>
      {switchContent}
    </div>
  );
}
