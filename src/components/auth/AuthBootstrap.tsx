"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ForcedChangePassword } from "./ForcedChangePassword";

export default function AuthBootstrap() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (user || loading || hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;
    void fetchUser();
  }, [fetchUser, loading, user]);

  return <ForcedChangePassword />;
}
