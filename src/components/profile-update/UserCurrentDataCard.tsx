"use client";

import { useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Pencil, 
  Check, 
  X,
  Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/service/users";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

// --- Types ---
type UserCurrentData = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  employeeId?: string;
  department?: string;
  address?: string;
};

type UserCurrentDataCardProps = {
  data?: UserCurrentData;
  isLoading?: boolean;
};

export default function UserCurrentDataCard({ data, isLoading = false }: UserCurrentDataCardProps) {
  const [editedData, setEditedData] = useState<UserCurrentData>(data || {});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Synchronize internal state with external props during render
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setEditedData(data || {});
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(editedData);
  }, [data, editedData]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        name: editedData.fullName,
        email: editedData.email,
        phone_number: editedData.phoneNumber,
        address: editedData.address,
      });
      toast.success("Change request submitted! Awaiting HR approval.");
      
      // Reset local state to original data because changes are not applied yet
      setEditedData(data || {});
      setEditingField(null);
      
      // We don't need to fetchUser yet as data hasn't actually changed in BE users table
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit change request");
    } finally {
      setIsUpdating(false);
    }
  };

  const bentoItems = [
    { 
      id: "fullName",
      label: "Full Name", 
      value: editedData.fullName, 
      icon: User, 
      span: "col-span-1 sm:col-span-2",
      editable: true
    },
    { 
      id: "email",
      label: "Email Address", 
      value: editedData.email, 
      icon: Mail, 
      span: "col-span-1",
      editable: true
    },
    { 
      id: "phoneNumber",
      label: "Phone", 
      value: editedData.phoneNumber, 
      icon: Phone, 
      span: "col-span-1",
      editable: true
    },
    { 
      id: "employeeId",
      label: "Employee ID", 
      value: editedData.employeeId, 
      icon: IdCard, 
      span: "col-span-1",
      editable: false
    },
    { 
      id: "department",
      label: "Department", 
      value: editedData.department, 
      icon: Briefcase, 
      span: "col-span-1",
      editable: false
    },
    { 
      id: "address",
      label: "Current Address", 
      value: editedData.address, 
      icon: MapPin, 
      span: "col-span-1 sm:col-span-2",
      editable: true
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-6 md:p-10!">
        <div className="mb-10 space-y-3">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-neutral-50" />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-32 animate-pulse rounded-[2.5rem] bg-neutral-50/50 ${i === 0 || i === 5 ? 'sm:col-span-2' : ''}`} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full h-full">
      <Card className="p-6 md:p-10! h-full border-neutral-200/60 shadow-xl shadow-neutral-200/30 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50/40 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-50/30 blur-3xl pointer-events-none" />

        <div className="mb-10 relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900 leading-tight">
                Profile Information
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/70 mt-1">
                Personal Data Management
              </p>
            </div>
          </div>

          {isDirty && (
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-2xl px-8 h-12 shadow-xl shadow-neutral-900/10 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              <span className="font-bold">Save Changes</span>
            </Button>
          )}
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 relative">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            const isEditing = editingField === item.id;

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
                  isEditing 
                    ? "border-blue-500 bg-white shadow-2xl shadow-blue-500/10" 
                    : "border-neutral-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
                } p-6 ${item.span}`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-300 ${isEditing ? "bg-blue-600 text-white" : "bg-neutral-50 group-hover:bg-blue-50 text-neutral-400 group-hover:text-blue-600"}`}>
                        <Icon size={14} />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${isEditing ? "text-blue-600" : "text-neutral-400 group-hover:text-blue-400"}`}>
                        {item.label}
                      </p>
                    </div>
                    
                    {item.editable && !isEditing && (
                      <button 
                        onClick={() => setEditingField(item.id)}
                        className="p-2 bg-neutral-50 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                      {item.id === "address" ? (
                        <textarea
                          autoFocus
                          value={item.value || ""}
                          onChange={(e) => setEditedData(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-sm font-bold text-neutral-900 outline-none focus:bg-white focus:border-blue-300 transition-all resize-none"
                          rows={2}
                        />
                      ) : (
                        <input
                          autoFocus
                          type={item.id === "email" ? "email" : "text"}
                          value={item.value || ""}
                          onChange={(e) => setEditedData(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-3 h-10 text-sm font-bold text-neutral-900 outline-none focus:bg-white focus:border-blue-300 transition-all"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => setEditingField(null)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditedData(prev => ({ ...prev, [item.id]: data?.[item.id as keyof UserCurrentData] }));
                            setEditingField(null);
                          }}
                          className="p-2 bg-neutral-100 text-neutral-400 rounded-lg hover:bg-neutral-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm md:text-base font-black tracking-tight text-neutral-900 break-words line-clamp-2">
                      {item.value || "-"}
                    </p>
                  )}
                </div>
                
                {!isEditing && (
                  <div className={`absolute right-4 top-4 h-1.5 w-1.5 rounded-full transition-colors ${item.value !== data?.[item.id as keyof UserCurrentData] ? "bg-amber-500 animate-pulse" : "bg-neutral-100 group-hover:bg-blue-400"}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
