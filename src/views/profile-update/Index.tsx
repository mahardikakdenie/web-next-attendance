"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import UpdateRequestForm from "@/components/profile-update/UpdateRequestForm";
import UserCurrentDataCard from "@/components/profile-update/UserCurrentDataCard";
import ProfileImageUpdate from "@/components/profile-update/ProfileImageUpdate";

export default function ProfileUpdateView() {
  const { user, loading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const userData = {
    fullName: user?.name,
    email: user?.email,
    phoneNumber: "+62 812-1111-2222", // Placeholder for phone if not in user model yet
    employeeId: "EMP-2024-017",      // Placeholder
    department: "Engineering",       // Placeholder
    address: "Jakarta, Indonesia",   // Placeholder
  };

  return (
    <section className="mx-auto max-w-6xl space-y-10 pb-20 pt-6">
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900">
          Profile Management
        </h1>
        <p className="text-base font-medium text-neutral-400">
          Manage your current data and request updates through HR verification.
        </p>
      </div>

      <div className="space-y-12">
        <ProfileImageUpdate currentImage={user?.media_url || user?.profile_photo_url} />
        <UserCurrentDataCard data={userData} isLoading={loading} />
        <UpdateRequestForm />
      </div>
    </section>
  );
}
