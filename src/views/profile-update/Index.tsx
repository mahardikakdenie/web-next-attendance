import UpdateRequestForm from "@/components/profile-update/UpdateRequestForm";
import UserCurrentDataCard from "@/components/profile-update/UserCurrentDataCard";

const mockCurrentUser = {
  fullName: "Rizky Maulana",
  email: "rizky.maulana@company.com",
  phoneNumber: "+62 812-1111-2222",
  employeeId: "EMP-2024-017",
  department: "Engineering",
  address: "Jakarta, Indonesia",
};

export default function ProfileUpdateView() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Update Request: User Current Data</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare your profile data change request (UI only for now).</p>
      </div>

      <UserCurrentDataCard data={mockCurrentUser} />
      <UpdateRequestForm />
    </section>
  );
}
