import { MapPin } from "lucide-react";

export default function OrderLocation() {
  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        <MapPin size={16} />
        <b className="tracking-[1px] uppercase text-xs">
          Collection Point
        </b>
      </div>

      <div className="font-serif text-[16px] text-[#1A3951]">
        Quai du Mont-Blanc 13, Geneva
      </div>
    </div>
  );
}
