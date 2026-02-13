"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";
import { useRateLimit } from "@/hooks/use-rate-limit";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { mutate: login, isPending, isError, error } = useLogin();
  const { isRateLimited, remainingAttempts, resetTime } = useRateLimit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (isRateLimited) {
      return;
    }
    
    // Call login mutation
    login({ username, password });
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-4xl bg-stone-50 p-10 shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.40)] outline-1 -outline-offset-1 outline-white/60 backdrop-blur-[2px]">
      {/* Top gradient line */}
      <div className="absolute left-px top-px h-1 w-[calc(100%-2px)] opacity-50 bg-linear-to-r from-red-300/0 via-red-300 to-red-300/0" />

      {/* Rate limit warning */}
      {isRateLimited && resetTime && (
        <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
          Too many login attempts. Please try again at {resetTime.toLocaleTimeString()}.
        </div>
      )}

      {/* Error message */}
      {isError && !isRateLimited && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error?.message || "Login failed. Please check your credentials."}
        </div>
      )}

      {/* Remaining attempts warning */}
      {!isRateLimited && remainingAttempts !== null && remainingAttempts <= 3 && remainingAttempts > 0 && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
          Warning: {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
        </div>
      )}

      {/* FORM */}
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Username */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold leading-5 tracking-tight text-gray-800"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={isRateLimited}
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm leading-5 text-gray-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold leading-5 tracking-tight text-gray-800"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isRateLimited}
              className="w-full rounded-2xl bg-white px-4 py-3.5 pr-12 text-sm leading-5 text-gray-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-blue-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              <span className="material-icons text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isPending || isRateLimited}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gray-800 px-4 py-3.5 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline-1 -outline-offset-1 outline-black/0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base font-bold leading-6 tracking-wide text-white">
            {isPending ? "Signing In..." : isRateLimited ? "Too Many Attempts" : "Sign In"}
          </span>
          {!isPending && !isRateLimited && (
            <span className="ml-2 material-icons text-sm leading-5 text-red-300">
              arrow_forward
            </span>
          )}
        </button>
      </form>

      {/* Divider + link */}
      <div className="mt-7 border-t border-blue-950/5 pt-7 text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-medium leading-5 text-blue-950/60 hover:text-blue-950"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
