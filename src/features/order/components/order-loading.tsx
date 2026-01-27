import { Loader2 } from "lucide-react";

export default function OrderLoading() {
  return (
    <div className="w-full min-h-100 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-500">
      <Loader2 size={48} className="text-[#1A3951] animate-spin" />
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl text-[#1A3951]">Processing...</h2>
        <p className="text-slate-400 text-xs tracking-widest uppercase">
          Retrieving your order details
        </p>
      </div>
    </div>
  );
}