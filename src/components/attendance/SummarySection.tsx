import { CheckCircle2, Clock, Timer } from "lucide-react";
import SummaryCard from "./SummaryCard";

export default function SummarySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard 
        title="On Time" 
        value="265" 
        change={12} 
        icon={<CheckCircle2 size={24} />} 
      />
      <SummaryCard 
        title="Late Arrival" 
        value="62" 
        change={-6} 
        icon={<Clock size={24} />} 
      />
      <SummaryCard 
        title="Early Leave" 
        value="24" 
        change={-2} 
        icon={<Timer size={24} />} 
      />
    </div>
  );
}
