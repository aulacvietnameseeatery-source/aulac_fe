"use client";

import { ArrowRight, Mail } from "lucide-react";

interface Props {
  email: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
}

export function ForgotPasswordForm({
  email,
  error,
  isLoading,
  onEmailChange,
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
          Forgot Password
        </h2>
        <p className="font-sans text-sm text-gray-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-serif text-[#132538] tracking-[0.35px] font-semibold text-sm">
          Email Address
        </label>
        <div className="shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-[#D1D5DB] flex items-center py-3.5 px-4 focus-within:border-[#132538] transition-colors">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@lamaison.com"
            className="w-full outline-none text-[#132538] placeholder:text-gray-400 font-sans text-sm"
          />
          <Mail size={18} className="text-gray-400" />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-2xl bg-[#132538] py-3.5 px-4 text-white flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors disabled:opacity-70"
      >
        <span className="font-sans font-bold tracking-[0.4px] text-[16px]">
          {isLoading ? "Sending..." : "Send Instructions"}
        </span>
        {!isLoading && <ArrowRight size={20} className="text-[#D5BA98]" />}
      </button>
    </form>
  );
}
