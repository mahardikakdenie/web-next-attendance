import AuthBootstrap from "@/components/auth/AuthBootstrap";
import SessionTimeoutWatcher from "@/components/auth/SessionTimeoutWatcher";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import OnboardingTour from "@/components/ui/OnboardingTour";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 p-2 md:p-3 gap-2 md:gap-3 font-sans selection:bg-blue-500/30">
      <AuthBootstrap />
      <SessionTimeoutWatcher />
      <OfflineIndicator />
      <OnboardingTour />
      <FloatingHelpButton />

      {/* Modern Floating Sidebar Container (Desktop Only) */}
      <div className="hidden md:flex flex-col z-20 h-full relative">
        <Sidebar />
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />

      {/* Main Content Area - The "Floating Shell" */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative bg-white rounded-[2rem] md:rounded-[40px] shadow-2xl shadow-slate-300/40 border border-white ring-1 ring-slate-200/60">
        
        {/* Disappearing Top-Nav with Glassmorphism */}
        <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-100/60 transition-all duration-300">
          <TopNavbar />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
