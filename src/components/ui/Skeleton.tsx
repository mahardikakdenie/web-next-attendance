import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-4">
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-3xl border border-neutral-100 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-48 h-8" />
      </div>
    </div>
  );
}
