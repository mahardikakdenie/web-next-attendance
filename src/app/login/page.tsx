// src/app/login/page.tsx
import LoginView from "@/views/login/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Gateway | AttendancePro",
  description: "Securely sign in to your organization or request a 14-day high-performance trial.",
};

export default function Page() {
  return <LoginView />;
}
