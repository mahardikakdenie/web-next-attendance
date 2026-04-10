"use client";

import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import {  useState } from "react";

export default function GreetingCard() {
  const {user} = useAuthStore();
  const [now] = useState<dayjs.Dayjs>(dayjs());

  if (!now) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl p-6 min-h-25 animate-pulse">
        <div className="h-7 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
      </div>
    );
  }

  const hour = now.hour();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
      <h1 className="text-xl font-semibold text-slate-900 capitalize">
        {greeting}, {user?.name} 👋
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        {now.format("dddd, DD MMMM YYYY")}
      </p>
    </div>
  );
}
