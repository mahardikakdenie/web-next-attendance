import { forwardRef } from "react";
import clsx from "clsx";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label?: string;
  description?: string;
  onChange?: (checked: boolean) => void;
  error?: string;
  variant?: "default" | "card";
};

const Checkbox = forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      label,
      description,
      onChange,
      error,
      variant = "default",
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e.target.checked);
    };

    const checkboxElement = (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center h-6">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            onClick={() => !disabled && onChange?.(!checked)}
            className={clsx(
              "w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-200 select-none",
              {
                "bg-blue-600 border-blue-600 text-white shadow-sm": checked && !disabled,
                "bg-white border-neutral-200 hover:border-neutral-300": !checked && !disabled && !error,
                "border-rose-400 bg-rose-50/20": error && !checked,
                "opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200": disabled,
                "ring-4 ring-blue-600/10": checked && !disabled,
              }
            )}
          >
            {checked && (
              <svg
                className="w-3 h-3 stroke-current stroke-[3]"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <label
                htmlFor={checkboxId}
                className={clsx(
                  "text-[13px] font-bold select-none cursor-pointer leading-6",
                  disabled ? "text-neutral-400 cursor-not-allowed" : "text-neutral-900"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-[11px] text-neutral-400 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );

    if (variant === "card") {
      return (
        <div
          onClick={() => !disabled && onChange?.(!checked)}
          className={clsx(
            "p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col w-full text-left",
            {
              "bg-white border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow": !checked && !disabled,
              "bg-blue-50/10 border-blue-600 shadow-sm ring-4 ring-blue-600/5": checked && !disabled,
              "bg-neutral-50 border-neutral-200 opacity-60 cursor-not-allowed": disabled,
              "border-rose-300 bg-rose-50/10": error,
            }
          )}
        >
          {checkboxElement}
          {error && (
            <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col">
          {checkboxElement}
          <p className="mt-1.5 ml-8 text-[10px] font-bold text-rose-500 text-left animate-in slide-in-from-top-1">
            {error}
          </p>
        </div>
      );
    }

    return checkboxElement;
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
