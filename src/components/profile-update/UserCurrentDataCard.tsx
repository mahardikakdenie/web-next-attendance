import Card from "@/components/ui/Card";

type UserCurrentData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  address: string;
};

type UserCurrentDataCardProps = {
  data: UserCurrentData;
};

export default function UserCurrentDataCard({ data }: UserCurrentDataCardProps) {
  const rows = [
    { label: "Full Name", value: data.fullName },
    { label: "Email", value: data.email },
    { label: "Phone Number", value: data.phoneNumber },
    { label: "Employee ID", value: data.employeeId },
    { label: "Department", value: data.department },
    { label: "Address", value: data.address },
  ];

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Current Data</h2>
        <p className="mt-1 text-sm text-slate-500">Read-only data from profile (placeholder for realtime DB integration).</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{row.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{row.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
