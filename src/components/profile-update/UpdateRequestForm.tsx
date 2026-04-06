import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
    <Card>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">Request Profile Data Update</h2>
        <p className="mt-1 text-sm text-slate-500">
          UI only for now. Submit action will be connected to API when backend is ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="New Full Name" name="new_full_name" value={mockUpdateRequest.fullName} />
        <FormField label="New Email" name="new_email" type="email" value={mockUpdateRequest.email} />
        <FormField label="New Phone Number" name="new_phone" value={mockUpdateRequest.phoneNumber} />
        <FormField label="Employee ID" name="employee_id" value={mockUpdateRequest.employeeId} />
        <FormField label="Department" name="department" value={mockUpdateRequest.department} />
        <FormField label="Address" name="address" value={mockUpdateRequest.address} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700">Reason for update</p>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{mockUpdateRequest.reason}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" className="cursor-not-allowed opacity-80">
          Submit Request (Disabled - API Not Ready)
        </Button>
        <Button type="button" className="bg-slate-200 text-slate-700 hover:bg-slate-300">
          Save as Draft
        </Button>
      </div>
    </Card>
  );
}
