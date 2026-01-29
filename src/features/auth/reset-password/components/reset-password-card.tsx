import Link from "next/link";

export function ResetPasswordCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-4">
      <div className="w-full shadow-[0px_20px_40px_-12px_rgba(213,186,152,0.4)] backdrop-blur-sm rounded-[32px] bg-[#FFFCF8] border border-[#E5E7EB] overflow-hidden p-10 relative isolate flex flex-col gap-6">
        <div className="w-[calc(100%-2px)] h-1 absolute top-px left-px bg-linear-to-r from-transparent via-[#D5BA98] to-transparent opacity-50 z-0" />
        {children}
        <div className="border-t border-[#E5E7EB] pt-6 flex justify-center z-10">
          <Link href="/login" className="text-[#4B5563] text-sm font-medium hover:text-[#132538]">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
