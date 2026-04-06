'use client';

import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

import { getProfileImage } from "@/lib/utils";

export default function TopNavbar() {
  const user = useAuthStore((state) => state.user);

  const isLoading = !user;

  return (
    <div className="flex h-16 items-center justify-between px-6 bg-white/70 backdrop-blur border-b border-gray-200">
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold shadow">
          A
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Attendance</h1>
          <p className="text-xs text-gray-400">{user?.tenant?.name ?? ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-1.5 min-w-40">
          
          {/* Avatar */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
          ) : (
            <Image
              src={getProfileImage(user?.profile_photo_url)}
              width={32}
              height={32}
              alt="User avatar"
              className="rounded-full h-8 w-8 object-cover"
            />
          )}

          {/* Text */}
          <div className="hidden sm:block text-left space-y-1">
            {isLoading ? (
              <>
                <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-2 w-16 bg-gray-200 rounded animate-pulse" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role ?? ""}
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
