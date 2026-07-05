import { useAuthStore } from "@/store/auth.store";
import { useIsMobile } from "@/hooks/useIsMobile";

export const useUserDashboard = () => {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  return {
    user,
    isMobile
  };
};
