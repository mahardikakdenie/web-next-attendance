import AuthBootstrap from "@/components/auth/AuthBootstrap";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full flex-col bg-neutral-50 md:flex-row">
      <AuthBootstrap />

      <div className="md:shrink-0 md:z-20">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-neutral-200">
          <TopNavbar />
        </header>

        <main className="flex-1 overflow-y-auto overscroll-y-contain pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
