import { Skeleton } from "@/components/ui/Skeleton";

export default function TodayStatusSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 space-y-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-30 rounded-2xl" />
        <Skeleton className="h-30 rounded-2xl" />
      </div>
      <Skeleton className="h-18 rounded-2xl mt-4" />
    </div>
  );
}
