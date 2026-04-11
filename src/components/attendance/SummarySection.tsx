import { CheckCircle2, Clock, Users } from "lucide-react";
import SummaryCard from "./SummaryCard";
import { Skeleton } from "@/components/ui/Skeleton";

export interface SummaryData {
  total_record: number;
  total_record_diff: number;
  ontime_summary: number;
  ontime_summary_diff: number;
  late_summary: number;
  late_summary_diff: number;
}

interface SummarySectionProps {
  data?: SummaryData | null;
  isLoading?: boolean;
}

export default function SummarySection({ data, isLoading }: SummarySectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-32 rounded-3xl w-full" />
        <Skeleton className="h-32 rounded-3xl w-full" />
        <Skeleton className="h-32 rounded-3xl w-full" />
      </div>
    );
  }

  const total = data?.total_record || 0;
  const totalDiff = data?.total_record_diff || 0;
  
  const onTime = data?.ontime_summary || 0;
  const onTimeDiff = data?.ontime_summary_diff || 0;
  
  const late = data?.late_summary || 0;
  const lateDiff = data?.late_summary_diff || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard 
        title="Total Attendance" 
        value={total.toString()} 
        change={totalDiff} 
        icon={<Users size={24} />} 
      />
      <SummaryCard 
        title="On Time" 
        value={onTime.toString()} 
        change={onTimeDiff} 
        icon={<CheckCircle2 size={24} />} 
      />
      <SummaryCard 
        title="Late Arrival" 
        value={late.toString()} 
        change={lateDiff} 
        icon={<Clock size={24} />} 
      />
    </div>
  );
}
