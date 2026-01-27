"use client";

import { useState } from "react";

export default function LoginUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen w-full bg-neutral-700 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0">
        <img
          src="/images/authen/auth-login-background/login-background.png"
          alt="Cozy background"
          className="absolute inset-0 h-full w-full object-cover opacity-30 blur-[2px]"
        />
        <div className="absolute inset-0 mix-blend-multiply bg-orange-50/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-red-300/10" />
      </div>

      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full bg-red-300/20 blur-[32px]" />
      <div className="pointer-events-none absolute left-10 bottom-10 h-80 w-80 rounded-full bg-blue-950/10 blur-[32px]" />

      {/* Center container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="flex flex-col items-center">
            <div className="pb-2">
              <div className="rounded-full bg-white/80 px-4 pt-4 pb-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-red-300/20 backdrop-blur-[2px]">
                <span className="material-icons text-4xl leading-10 text-gray-800">
                  spa
                </span>
              </div>
            </div>

            <div className="pt-2 text-center text-4xl font-bold leading-10 text-gray-800">
              Au Lac
            </div>

            <div className="pt-2 text-center text-xs font-semibold uppercase leading-4 tracking-[2.40px] text-blue-950/70">
              Restaurant Portal
            </div>
          </div>

          {/* Card */}
          <div className="relative mt-6 overflow-hidden rounded-[32px] bg-stone-50 p-10 shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.40)] outline outline-1 outline-offset-[-1px] outline-white/60 backdrop-blur-[2px]">
            {/* Top gradient line */}
            <div className="absolute left-[1px] top-[1px] h-1 w-[calc(100%-2px)] opacity-50 bg-gradient-to-r from-red-300/0 via-red-300 to-red-300/0" />

            {/* FORM (UI only) */}
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold leading-5 tracking-tight text-gray-800"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lamaison.com"
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
                  className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm leading-5 text-gray-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 placeholder:text-gray-400 focus:outline-blue-950/40"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gray-800 px-4 py-3.5 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md outline outline-1 outline-offset-[-1px] outline-black/0"
              >
                <span className="text-base font-bold leading-6 tracking-wide text-white">
                  Sign In
                </span>
                <span className="ml-2 material-icons text-sm leading-5 text-red-300">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Divider + link */}
            <div className="mt-7 border-t border-blue-950/5 pt-7 text-center">
              <button
                type="button"
                className="text-sm font-medium leading-5 text-blue-950/60 hover:text-blue-950"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center text-[8.90px] leading-4 text-blue-950/40">
            © 2025 La Maison. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
