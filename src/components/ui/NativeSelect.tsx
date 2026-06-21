import { forwardRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string | number;
};

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options: Option[];
  variant?: "default" | "ghost" | "flush";
  size?: "default" | "sm";
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
};

const NativeSelect = forwardRef<HTMLSelectElement, Props>(
  (
    {
      className,
      options,
      variant = "default",
      size = "default",
      label,
      error,
      helperText,
      required,
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const selectElement = (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          {...props}
          className={clsx(
            "w-full px-5 pr-12 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed",
            {
              // Height sizes
              "h-14": size === "default",
              "h-12": size === "sm",

              // Variants
              "bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900":
                variant === "default" && !error,
              "bg-neutral-100/70 border border-transparent hover:bg-neutral-200/50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900":
                variant === "ghost" && !error,
              "bg-transparent border-b border-neutral-200 rounded-none px-0 hover:border-neutral-300 focus:border-blue-600 focus:ring-0 text-neutral-900 focus:shadow-none":
                variant === "flush" && !error,

              // Error state
              "border-rose-400 bg-rose-50/20 text-neutral-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10":
                !!error,
            },
            className
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 text-slate-400 pointer-events-none select-none flex items-center justify-center">
          <ChevronDown size={18} />
        </div>
      </div>
    );

    if (label || error || helperText) {
      return (
        <div className="w-full flex flex-col items-start">
          {label && (
            <label
              htmlFor={selectId}
              className={clsx(
                "block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-left",
                error ? "text-rose-500" : "text-slate-400"
              )}
            >
              {label}
              {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
            </label>
          )}
          {selectElement}
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

    return selectElement;
  }
);

NativeSelect.displayName = "NativeSelect";

export default NativeSelect;
