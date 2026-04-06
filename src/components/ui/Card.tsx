import { HTMLAttributes, ReactNode } from "react";

// Mendukung semua atribut bawaan <div> (seperti id, onClick, style, dll)
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`w-full overflow-hidden rounded-4xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
