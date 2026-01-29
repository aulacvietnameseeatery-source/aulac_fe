"use client";

import { ArrowRight, Lock } from "lucide-react";

interface Props {
  password: string;
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: () => void;
}

export function ResetPasswordForm({
  password,
  confirmPassword,
  error,
  isLoading,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="z-10 flex flex-col gap-6"
    >
      <div className="text-center">
        <h2 className="font-serif text-2xl text-[#132538] font-semibold mb-2">
          Set New Password
        </h2>
        <p className="font-sans text-sm text-gray-500">
          Please create a new password you don’t use elsewhere.
        </p>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label className="font-serif text-sm font-semibold text-[#132538]">
          New Password
        </label>
        <div className="rounded-2xl border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538]">
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="w-full outline-none text-sm"
          />
          <Lock size={18} className="text-gray-400" />
        </div>
      </div>

      {/* Confirm */}
      <div className="flex flex-col gap-2">
        <label className="font-serif text-sm font-semibold text-[#132538]">
          Confirm Password
        </label>
        <div className="rounded-2xl border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538]">
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="w-full outline-none text-sm"
          />
          <Lock size={18} className="text-gray-400" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-2xl bg-[#132538] py-3.5 text-white flex justify-center gap-2 disabled:opacity-70"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
        {!isLoading && <ArrowRight size={18} className="text-[#D5BA98]" />}
      </button>
    </form>
  );
}
