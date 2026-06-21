import React from "react";
import clsx from "clsx";

type Props = {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
};

export default function FormGroup({
  label,
  error,
  helperText,
  required,
  children,
  htmlFor,
  className,
}: Props) {
  return (
    <div className={clsx("w-full flex flex-col items-start", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={clsx(
            "block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-left",
            error ? "text-rose-500" : "text-slate-400"
          )}
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}
      <div className="w-full">{children}</div>
      {error && (
        <p className="mt-1.5 ml-1 text-[10px] font-bold text-rose-500 text-left animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 ml-1 text-[10px] font-medium text-slate-400 text-left">
          {helperText}
        </p>
      )}
    </div>
  );
}
