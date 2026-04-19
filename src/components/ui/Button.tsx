"use client";

import { clsx, type ClassValue } from "clsx";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely.
 * Note: If tailwind-merge is not installed, it falls back to clsx.
 */
function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs));
  } catch {
    return clsx(inputs);
  }
}

type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "outline" 
  | "ghost" 
  | "danger" 
  | "success" 
  | "warning" 
  | "white"
  | "link";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({ 
  className, 
  variant = "primary", 
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border-transparent",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-transparent",
    outline: "bg-transparent text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent shadow-none",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200 border-transparent",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 border-transparent",
    warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200 border-transparent",
    white: "bg-white text-slate-900 hover:bg-slate-50 border-slate-100 shadow-sm",
    link: "bg-transparent text-blue-600 hover:underline px-0 py-0 h-auto border-transparent shadow-none"
  };

  const sizes = {
    xs: "h-8 px-3 text-[10px] rounded-lg",
    sm: "h-10 px-4 text-xs rounded-xl",
    md: "h-12 px-6 text-sm rounded-2xl",
    lg: "h-14 px-8 text-base rounded-[20px]",
    xl: "h-16 px-10 text-lg rounded-[24px]",
    icon: "h-12 w-12 p-0 rounded-2xl",
  };

  const isInternalDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all duration-300",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "border outline-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isInternalDisabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
      
      <span className={cn(
        "flex items-center gap-2 transition-opacity duration-300",
        isLoading ? "opacity-0" : "opacity-100"
      )}>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>
    </button>
  );
}
