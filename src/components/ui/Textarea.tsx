import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: "default" | "ghost" | "flush";
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      className,
      variant = "default",
      label,
      error,
      helperText,
      leftIcon,
      required,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const textareaElement = (
      <div className="relative flex items-start w-full">
        {leftIcon && (
          <div className="absolute left-4 top-4 text-slate-400 pointer-events-none select-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          {...props}
          className={clsx(
            "w-full px-5 py-4 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none placeholder:text-neutral-400 placeholder:font-normal disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px]",
            {
              // Left padding for icons
              "pl-12": !!leftIcon,

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
        />
      </div>
    );

    if (label || error || helperText) {
      return (
        <div className="w-full flex flex-col items-start">
          {label && (
            <label
              htmlFor={textareaId}
              className={clsx(
                "block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-left",
                error ? "text-rose-500" : "text-slate-400"
              )}
            >
              {label}
              {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
            </label>
          )}
          {textareaElement}
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

    return textareaElement;
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
