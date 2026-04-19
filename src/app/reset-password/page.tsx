import ResetPasswordView from "@/views/login/ResetPassword";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Secure Account | AttendancePro",
  description: "Create a new password and secure your workspace access.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
