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
          "w-full h-14 px-5 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none placeholder:text-neutral-400 placeholder:font-normal disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900":
              variant === "default",
            "bg-neutral-100/70 border border-transparent hover:bg-neutral-200/50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900":
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
