"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin } from "../hooks";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call login mutation
    login({ username, password });
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-[32px] bg-stone-50 p-10 shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.40)] outline outline-1 outline-offset-[-1px] outline-white/60 backdrop-blur-[2px]">
      {/* Top gradient line */}
      <div className="absolute left-[1px] top-[1px] h-1 w-[calc(100%-2px)] opacity-50 bg-gradient-to-r from-red-300/0 via-red-300 to-red-300/0" />

      {/* Error message */}
      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error?.message || "Login failed. Please check your credentials."}
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
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm leading-5 text-gray-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 placeholder:text-gray-400 focus:outline-blue-950/40"
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

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm leading-5 text-gray-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 placeholder:text-gray-400 focus:outline-blue-950/40"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gray-800 px-4 py-3.5 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md outline outline-1 outline-offset-[-1px] outline-black/0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base font-bold leading-6 tracking-wide text-white">
            {isPending ? "Signing In..." : "Sign In"}
          </span>
          {!isPending && (
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
