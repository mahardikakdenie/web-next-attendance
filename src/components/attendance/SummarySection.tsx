import SummaryCard from "./SummaryCard";

export default function SummarySection() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SummaryCard title="On Time" value={265} change={12} />
      <SummaryCard title="Late" value={62} change={-6} />
      <SummaryCard title="Early" value={224} change={-6} />
    </div>
  );
}
