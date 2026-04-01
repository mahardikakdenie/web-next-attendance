import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-200">
          <TopNavbar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto space-y-6">
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
