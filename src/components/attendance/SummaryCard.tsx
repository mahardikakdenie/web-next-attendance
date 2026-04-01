type Props = {
  title: string;
  value: number;
  change: number;
};

export default function SummaryCard({ title, value, change }: Props) {
  const isPositive = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-100 rounded-full opacity-30" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">{title}</p>

        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${
            isPositive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isPositive ? "↑" : "↓"}
        </div>
      </div>

      <h2 className="text-3xl font-bold mt-4 tracking-tight text-gray-900">
        {value}
      </h2>

      <div className="flex items-center gap-2 mt-3">
        <span
          className={`text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>

        <span className="text-xs text-gray-400">vs yesterday</span>
      </div>
    </div>
  );
}
