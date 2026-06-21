"use client";

import { startTransition, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Eye, EyeOff, Lock } from "lucide-react";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await login(email, password);
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch (err: unknown) {
      const error = err as APIError;
      setErrorMessage(
        error?.response?.data?.message ||
          "We couldn't sign you in. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Sign in to continue managing your attendance and daily activity.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start">
              <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email address"
              required
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="default"
              error={errorMessage ? " " : undefined}
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="default"
              error={errorMessage ?? undefined}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none rounded-lg transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
              <Lock className="w-4 h-4" />
              Secure access to your attendance system
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
