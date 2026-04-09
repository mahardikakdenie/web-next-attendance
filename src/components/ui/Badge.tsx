import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
  children?: React.ReactNode;
}

export function Badge({ text, children, className, ...props }: BadgeProps) {
  return (
    <span className={`text-xs bg-gray-100 px-2 py-1 rounded-md ${className || ""}`} {...props}>
      {children || text}
    </span>
  );
}
