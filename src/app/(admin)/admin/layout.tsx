import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Admin | Attendance Pro",
  description: "Global system administration and tenant management.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
