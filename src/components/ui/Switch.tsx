"use client";

import React, { ChangeEvent } from "react";

type SwitchProps = {
  checked: boolean;
  // Menambahkan tipe data untuk onChange sesuai dengan error yang kamu dapatkan
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export default function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
  return (
    // Mengubah div pembungkus menjadi label agar seluruh area bisa diklik (UX lebih baik)
    <label 
      className={`flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 ${
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>

      <div className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full">
        {/* Input asli disembunyikan secara visual (sr-only), tapi tetap menangani logic onChange dan checked */}
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
        
        {/* Latar Belakang Switch */}
        <div 
          className={`absolute inset-0 rounded-full transition ${
            checked ? "bg-blue-600" : "bg-slate-300"
          }`} 
        />
        
        {/* Lingkaran / Dot Switch */}
        <span
          className={`relative inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </div>
    </label>
  );
}
