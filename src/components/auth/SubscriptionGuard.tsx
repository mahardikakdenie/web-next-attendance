"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { getMySubscription } from "@/service/subscription";
import { Loader2, AlertTriangle, CreditCard, LogOut, Building, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Determine if the user is a superadmin (bypasses the guard)
  const isSuperadmin = 
    user?.tenant?.id === 1 || 
    user?.role?.name === ROLES.SUPERADMIN ||
    user?.base_role === "SUPERADMIN";

  // Strict Admin definition for suspension handling
  const isTenantAdmin = user?.role?.name === ROLES.ADMIN || user?.is_owner;
  const isSuspended = user?.tenant?.is_suspended || user?.billing_health?.lock_website || false;
  const suspendedReason = user?.tenant?.is_suspended 
    ? (user?.tenant?.suspended_reason || "Access to this organization has been temporarily suspended by the platform administrator.")
    : (user?.billing_health?.warning_message || "Akses ke dashboard terkunci sementara. Silakan selesaikan pembayaran tagihan Anda.");

  // Fetch subscription data
  const { data: subResp, isLoading: subLoading } = useQuery({
    queryKey: ["my-subscription", user?.id],
    queryFn: getMySubscription,
    enabled: isAuthenticated && !isSuperadmin && !!user && !isSuspended, 
    retry: 1
  });

  const [isBlocked, setIsBlocked] = useState(false);

  // Sync state during render to avoid cascading renders
  const hasSubscription = subResp?.data && Object.keys(subResp.data).length > 0;
  const shouldBeBlocked = isAuthenticated && !isSuperadmin && !subLoading && !hasSubscription && !isSuspended;

  if (isBlocked !== shouldBeBlocked) {
    setIsBlocked(shouldBeBlocked);
  }

  // If still checking auth or subscription, show a loader
  if (authLoading || (isAuthenticated && !isSuperadmin && subLoading && !isSuspended)) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // 1. SUPERADMIN BYPASS: Always show everything
  if (isSuperadmin) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // 2. SUSPENSION HANDLER (Highest Priority)
  if (isSuspended) {
    // If Admin is already on the billing page, let them see it
    if (isTenantAdmin && pathname === "/tenant-settings/billing") {
       return <>{children}</>;
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
        <div className="bg-white max-w-lg w-full rounded-[40px] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
            <ShieldAlert className="h-10 w-10 text-rose-500" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">
            Account Suspended
          </h1>
          
          {isTenantAdmin ? (
            <>
              <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                Akun organisasi Anda saat ini sedang ditangguhkan (Suspended). <br/>
                <span className="font-bold text-slate-800">Alasan:</span> {suspendedReason}
              </p>
              <div className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-8 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Required Action</p>
                <p className="text-xs font-bold text-slate-600 leading-relaxed text-center">
                   Silakan hubungi <span className="text-indigo-600">Admin SaaS</span> untuk bantuan pemulihan akses atau periksa status tagihan Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button 
                  onClick={() => router.push("/tenant-settings/billing")}
                  className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                >
                  Go to Invoice
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="secondary"
                  className="flex-1 h-14 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <LogOut className="mr-2" size={18} />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Akses ke workspace ini ditangguhkan. Silakan hubungi <span className="font-bold text-slate-800">Admin Perusahaan</span> Anda untuk informasi lebih lanjut.
              </p>
              <div className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-8 flex items-center justify-center gap-3">
                 <Building className="text-slate-400" size={20} />
                 <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{user?.tenant?.name || "Your Organization"}</span>
              </div>
              <Button 
                onClick={handleLogout}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-slate-800"
              >
                <LogOut className="mr-2" size={18} />
                Sign Out Securely
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 3. PLAN EXPIRATION HANDLER
  if (!isBlocked) {
    return <>{children}</>;
  }

  // If Blocked but trying to access Billing, let Admins see it
  if (isTenantAdmin && pathname === "/tenant-settings/billing") {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
      <div className="bg-white max-w-lg w-full rounded-[40px] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Service Interruption
        </h1>
        
        {isTenantAdmin ? (
          <>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Your organization currently does not have an active subscription plan. Please select a plan to restore access to the platform&apos;s features, or contact the SaaS Superadmin for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                onClick={() => router.push("/tenant-settings/billing")}
                className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                <CreditCard className="mr-2" size={18} />
                View & Select Plans
              </Button>
              <Button 
                onClick={handleLogout}
                variant="secondary"
                className="flex-1 h-14 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <LogOut className="mr-2" size={18} />
                Sign Out
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Your company&apos;s workspace is currently suspended due to an inactive subscription plan. Please contact your internal HR or Tenant Administrator to resolve this issue.
            </p>
            <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3">
               <Building className="text-slate-400" size={20} />
               <span className="text-sm font-bold text-slate-600">{user?.tenant?.name || "Your Organization"}</span>
            </div>
            <Button 
              onClick={handleLogout}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-slate-800"
            >
              <LogOut className="mr-2" size={18} />
              Sign Out Securely
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
