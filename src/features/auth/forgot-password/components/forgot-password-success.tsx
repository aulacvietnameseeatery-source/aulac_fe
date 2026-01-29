import { Mail } from "lucide-react";

export function ForgotPasswordSuccess({ email }: { email: string }) {
  return (
    <div className="z-10 flex flex-col items-center text-center gap-4 py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
        <Mail size={32} />
      </div>
      <h2 className="font-serif text-2xl text-[#132538] font-semibold">
        Check your email
      </h2>
      <p className="font-sans text-sm text-gray-500">
        We have sent password recovery instructions to <br />
        <span className="font-semibold text-[#132538]">{email}</span>
      </p>
    </div>
  );
}
