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
        // SHARED / USER DASHBOARD (Visible first)
        {
          targetId: "tour-clock-card",
          title: "Personal Attendance",
          content: "Ini adalah terminal absensi Anda. Lakukan Clock In dan Clock Out harian dengan mudah di sini.",
          position: "bottom"
        },
        {
          targetId: "tour-leave-request",
          title: "Quick Requests",
          content: "Butuh izin, lembur, atau reimbursement? Kirim permintaan Anda langsung melalui modul akses cepat ini.",
          position: "bottom"
        },
        {
          targetId: "tour-attendance-log",
          title: "Presence History",
          content: "Pantau riwayat kehadiran Anda secara transparan untuk memastikan semua data tercatat dengan benar.",
          position: "top"
        },
        // MANAGER DASHBOARD (If applicable)
        {
          targetId: "tour-manager-header",
          title: "Command Center",
          content: "Halaman ini memberikan gambaran umum operasional tim Anda secara real-time.",
          position: "bottom"
        },
        {
          targetId: "tour-manager-approvals",
          title: "Team Approvals",
          content: "Semua permintaan dari tim Anda akan muncul di sini untuk segera diproses.",
          position: "top"
        },
        // HR ANALYTICS
        {
          targetId: "tour-hr-stats",
          title: "Organizational KPIs",
          content: "Pantau kesehatan organisasi melalui indikator utama seperti tingkat kehadiran dan staf berisiko.",
          position: "bottom"
        },
        {
          targetId: "tour-hr-heatmap",
          title: "Activity Heatmap",
          content: "Visualisasikan kepadatan aktivitas karyawan untuk mengidentifikasi pola kerja tim.",
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
