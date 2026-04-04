"use client";

import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";

export default function GreetingCard() {
  const {user} = useAuthStore();
  const hour = dayjs().hour();

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
        {dayjs().format("dddd, DD MMMM YYYY")}
      </p>
    </div>
  );
}
