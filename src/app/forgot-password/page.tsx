import ForgotPasswordView from "@/views/login/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recover Account | AttendancePro",
  description: "Securely reset your password and regain access to your workspace.",
};

export default function Page() {
  return <ForgotPasswordView />;
}
