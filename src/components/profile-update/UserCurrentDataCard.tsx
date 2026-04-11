"use client";

import Card from "@/components/ui/Card";
import { User, Mail, Phone, IdCard, Briefcase, MapPin } from "lucide-react";

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

// --- Component ---
export default function UserCurrentDataCard({ data, isLoading = false }: UserCurrentDataCardProps) {
  // Menambahkan icon dan pengaturan lebar kolom (span) untuk efek Bento
  // col-span-1 memastikan tampilan di mobile menumpuk rapi satu kolom ke bawah
  const bentoItems = [
    { 
      label: "Full Name", 
      value: data?.fullName, 
      icon: User, 
      span: "col-span-1 md:col-span-2 lg:col-span-2" 
    },
    { 
      label: "Email Address", 
      value: data?.email, 
      icon: Mail, 
      span: "col-span-1 md:col-span-1 lg:col-span-1" 
    },
    { 
      label: "Phone Number", 
      value: data?.phoneNumber, 
      icon: Phone, 
      span: "col-span-1 md:col-span-1 lg:col-span-1" 
    },
    { 
      label: "Employee ID", 
      value: data?.employeeId, 
      icon: IdCard, 
      span: "col-span-1 md:col-span-1 lg:col-span-1" 
    },
    { 
      label: "Department", 
      value: data?.department, 
      icon: Briefcase, 
      span: "col-span-1 md:col-span-1 lg:col-span-1" 
    },
    { 
      label: "Current Address", 
      value: data?.address, 
      icon: MapPin, 
      span: "col-span-1 md:col-span-2 lg:col-span-3" 
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-5 md:p-8!">
        <div className="mb-8 h-10 w-48 md:w-64 animate-pulse rounded-lg bg-neutral-100" />
        <div className="grid w-full grid-cols-1 gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 md:h-48 animate-pulse rounded-4xl bg-neutral-50" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card className="p-5 md:p-8!">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h2 className="text-lg md:text-xl font-black tracking-tight text-neutral-900">
              Current Profile Information
            </h2>
          </div>
          <p className="text-xs md:text-sm font-medium text-neutral-400">
            Real-time read-only data from your current verified profile.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid w-full grid-cols-1 gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl md:rounded-4xl border border-neutral-100 bg-neutral-50/40 p-5 md:p-6 transition-all duration-500 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 ${item.span}`}
              >
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 h-20 w-20 md:h-24 md:w-24 rounded-full bg-blue-50/30 blur-2xl transition-all duration-500 group-hover:bg-blue-100/50" />

                {/* Icon Box */}
                <div className="relative mb-6 md:mb-8 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/50 transition-all duration-500 group-hover:scale-110 group-hover:shadow-md group-hover:ring-blue-100">
                  <Icon 
                    size={20} 
                    strokeWidth={1.8} 
                    className="text-neutral-400 transition-colors duration-300 group-hover:text-blue-600 md:h-6 md:w-6" 
                  />
                </div>

                {/* Text Content */}
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 transition-colors duration-300 group-hover:text-blue-400">
                    {item.label}
                  </p>
                  {/* Penambahan break-words agar email/alamat panjang tidak merusak layout di layar kecil */}
                  <p className="mt-1.5 text-base md:text-lg font-bold tracking-tight text-neutral-900 wrap-break-word">
                    {item.value || "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
