import { Lock } from "lucide-react";

export function ResetPasswordSuccess() {
  return (
    <div className="z-10 flex flex-col items-center text-center gap-4 py-8">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
        <Lock size={32} />
      </div>
      <h2 className="font-display text-2xl text-[#132538] font-bold">
        All set!
      </h2>
      <p className="font-sans text-sm text-gray-500">
        Your password has been reset successfully.
      </p>
    </div>
  );
}
