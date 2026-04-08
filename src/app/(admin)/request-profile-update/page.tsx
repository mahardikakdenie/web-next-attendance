import ProfileUpdateView from "@/views/profile-update/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Update | Attendance Management",
  description: "Request an update for your profile information.",
};

export default function ProfileUpdatePage() {
  return <ProfileUpdateView />;
}