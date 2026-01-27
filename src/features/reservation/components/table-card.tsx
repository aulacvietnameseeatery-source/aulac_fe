import React from 'react';
import Image from 'next/image';
import { Users, Lock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; 
export type TableStatus = 'available' | 'reserved' | 'selected';

interface TableCardProps {
  id: string;
  name: string;
  guests: number;
  image: string;
  status: TableStatus;
  onClick?: () => void;
}

export default function TableCard({ id, name, guests, image, status, onClick } : TableCardProps) {
  const isDisabled = status === 'reserved';

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        "relative flex flex-col p-3 rounded-2xl border transition-all duration-300 group bg-white",
        status === 'selected' ? "border-[2.5px] border-[#1A3A52] bg-[#F4F4F0]" : "border-slate-200 hover:shadow-lg",
        isDisabled && "cursor-not-allowed opacity-80",
        !isDisabled && "cursor-pointer"
      )}
    >
      {status === 'selected' && (
        <div className="absolute -top-3 -right-3 z-20 bg-[#1A3A52] text-white rounded-full p-1.5 shadow-md">
          <Check size={16} strokeWidth={3} />
        </div>
      )}

      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden mb-4">
        <Image src={image} alt={name} fill className={cn("object-cover transition-all duration-500", isDisabled && "blur-[2px] scale-105")} />
        
        {status === 'reserved' && (
          <div className="absolute inset-0 bg-stone-500/40 flex items-center justify-center z-10">
            <Lock className="text-white/80 w-10 h-10" strokeWidth={1.5} />
          </div>
        )}

        {status === 'available' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-[#10B981] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm">Available</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end px-1 pb-1">
        <div className="flex flex-col gap-1">
          <h3 className={cn("text-lg font-bold", status === 'selected' ? "text-[#1A3A52]" : "text-slate-800")}>{name}</h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <Users size={16} /> <span>{guests} Guests</span>
          </div>
        </div>
        <div>
          {status === 'available' && <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#1A3A52] group-hover:text-white transition-colors"><ArrowRight size={16} /></div>}
          {status === 'reserved' && <span className="text-xs font-bold text-slate-300 uppercase">Reserved</span>}
          {status === 'selected' && <span className="text-xs font-bold text-[#1A3A52] uppercase">Selected</span>}
        </div>
      </div>
    </div>
  );
};