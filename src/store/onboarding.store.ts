import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  isDismissed: boolean;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  dismissTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      isDismissed: false,
      steps: [
        // SHARED / TOP LEVEL
        {
          targetId: "tour-manager-header",
          title: "Command Center",
          content: "Ini adalah ringkasan operasional Anda. Pantau status sistem dan jumlah antrean persetujuan di sini.",
          position: "bottom"
        },
        {
          targetId: "tour-clock-card",
          title: "Personal Attendance",
          content: "Meskipun Anda Manager, jangan lupa untuk mencatat kehadiran harian Anda sendiri di sini.",
          position: "bottom"
        },
        // MANAGER SPECIFIC
        {
          targetId: "tour-manager-metrics",
          title: "Workforce Metrics",
          content: "Pantau kesehatan tim Anda secara real-time. Lihat tingkat kehadiran dan staf yang membutuhkan perhatian.",
          position: "top"
        },
        {
          targetId: "tour-manager-approvals",
          title: "Approvals Hotline",
          content: "Semua permintaan izin dan cuti staf akan muncul di sini. Segera proses agar operasional tetap lancar.",
          position: "top"
        },
        {
          targetId: "tour-manager-leaderboard",
          title: "Punctuality Squad",
          content: "Apresiasi staf yang paling rajin dan tepat waktu melalui papan peringkat ini.",
          position: "top"
        },
        {
          targetId: "tour-manager-analytics",
          title: "Full Insights",
          content: "Butuh data lebih dalam? Akses analitik lengkap untuk melihat tren performa jangka panjang.",
          position: "top"
        },
        // HR SPECIFIC
        {
          targetId: "tour-hr-stats",
          title: "Organization KPIs",
          content: "Pantau kesehatan organisasi secara makro melalui indikator utama seperti Presence Rate dan At-Risk Staff.",
          position: "bottom"
        },
        {
          targetId: "tour-hr-heatmap",
          title: "Activity Heatmap",
          content: "Visualisasikan kepadatan aktivitas karyawan. Klik pada titik heatmap untuk melihat siapa saja yang aktif di jam tersebut.",
          position: "top"
        },
        {
          targetId: "tour-hr-leaderboard",
          title: "Attendance Legends",
          content: "Temukan bintang-bintang di perusahaan Anda dan identifikasi siapa yang membutuhkan dukungan tambahan.",
          position: "top"
        },
        {
          targetId: "tour-hr-matrix",
          title: "Performance Matrix",
          content: "Analisis mendalam setiap individu. Bandingkan skor, jam lembur, dan tingkat keterlambatan secara transparan.",
          position: "top"
        }
      ],
      startTour: () => set({ isActive: true, currentStep: 0 }),
      nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        } else {
          set({ isActive: false, isDismissed: true });
        }
      },
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },
      dismissTour: () => set({ isActive: false, isDismissed: true }),
      completeTour: () => set({ isActive: false, isDismissed: true }),
      resetTour: () => set({ isActive: true, currentStep: 0, isDismissed: false }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({ isDismissed: state.isDismissed }),
    }
  )
);
