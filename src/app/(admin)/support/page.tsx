import { Metadata } from "next";
import UserSupportView from "@/views/support/UserSupportView";

export const metadata: Metadata = {
  title: "Helpdesk Support | Attendance App",
  description: "Submit support tickets, track status updates, and reply to helpdesk conversations.",
};

export default function Page() {
  return <UserSupportView />;
}
