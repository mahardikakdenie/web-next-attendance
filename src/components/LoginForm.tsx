"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

type ErrorResponse = {
  message?: string;
};

type APIError = {
  response?: {
    data?: ErrorResponse;
  };
};

export default function LoginForm() {
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as APIError;
      alert(
        error?.response?.data?.message ||
          "We couldn’t sign you in. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
              Welcome back
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Sign in to continue managing your attendance and daily activity.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email ?? ""}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-gray-700"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password ?? ""}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 5 9 7a12.97 12.97 0 01-2.17 3.36M6.53 6.53A12.97 12.97 0 003 12c0 2 4 7 9 7 1.13 0 2.2-.22 3.18-.62"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? "Signing you in..." : "Sign in to your account"}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            Secure access to your attendance system.
          </div>
        </div>
      </div>
    </div>
  );
}
