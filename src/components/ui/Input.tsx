import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "ghost";
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={clsx(
          "w-full h-11 px-4 rounded-xl text-sm transition-all outline-none placeholder:text-slate-400",
          "focus:ring-2 focus:ring-blue-500/20",
          {
            "bg-white border border-slate-200 focus:border-blue-500":
              variant === "default",
            "bg-slate-100/80 border border-transparent focus:bg-white":
              variant === "ghost",
          },
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
