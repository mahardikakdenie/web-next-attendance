import FormField from "@/components/forms/FormField";
// import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Button } from "../ui/Button";

const mockUpdateRequest = {
  fullName: "Rizky Maulana",
  email: "rizky.maulana@example.com",
  phoneNumber: "+62 812-3456-7890",
  employeeId: "EMP-2024-017",
  department: "Engineering",
  address: "Jl. Merdeka No. 12, Jakarta",
  reason: "Need profile update because my personal contact changed.",
};

export default function UpdateRequestForm() {
  return (
    <Card className="p-8!">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <h2 className="text-xl font-black tracking-tight text-neutral-900">
            Request Data Update
          </h2>
        </div>
        <p className="text-sm font-medium text-neutral-400">
          Fill in the fields you wish to update. Changes will be reviewed by HR.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
            <FormField label="New Full Name" name="new_full_name" value={mockUpdateRequest.fullName} />
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
            <FormField label="New Email Address" name="new_email" type="email" value={mockUpdateRequest.email} />
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
            <FormField label="New Phone Number" name="new_phone" value={mockUpdateRequest.phoneNumber} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
              <FormField label="Employee ID" name="employee_id" value={mockUpdateRequest.employeeId} />
            </div>
            <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
              <FormField label="Department" name="department" value={mockUpdateRequest.department} />
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
            <FormField label="New Address" name="address" value={mockUpdateRequest.address} />
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Reason for update</p>
            <textarea 
              className="mt-2 w-full resize-none bg-transparent text-sm font-bold text-neutral-900 outline-none placeholder:text-neutral-300"
              rows={2}
              defaultValue={mockUpdateRequest.reason}
              placeholder="Explain why you need this update..."
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-neutral-100 pt-8">
        <button type="button" className="text-sm font-bold text-neutral-400 transition-colors hover:text-neutral-600">
          Discard Changes
        </button>
        <Button type="button" className="rounded-2xl bg-neutral-900 px-8 py-4 text-sm font-bold tracking-tight text-white transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-95">
          Submit Update Request
        </Button>
      </div>
    </Card>
  );
}
