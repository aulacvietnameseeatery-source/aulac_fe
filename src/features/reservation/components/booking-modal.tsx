import React from 'react';
import Image from 'next/image';
import { X, Info, User, Phone, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableData: {
    id: string;
    name: string;
    guests: number;
    image: string;
    date: string;
    time: string;
  } | null;
  guestInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function BookingModal({ isOpen, onClose, onConfirm, tableData, guestInfo } : BookingModalProps) {
  const t = useTranslations('Reservation.BookingModal');

  if (!isOpen || !tableData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#132538]/80 backdrop-blur-sm transition-all">
      <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 md:hidden bg-white/20 p-1 rounded-full text-white">
            <X size={24} />
        </button>

        {/* Left Side: Image */}
        <div className="relative w-full md:w-[50%] h-64 md:h-auto">
          <Image 
            src={tableData.image} 
            alt={tableData.name} 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-start p-8 text-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 opacity-90">{t('selectedTable')}</span>
            <h2 className="text-5xl font-serif font-bold">{tableData.name}</h2>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 md:p-12 relative">
          {/* Close Button Desktop */}
          <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-[#132538] transition-colors hidden md:block">
            <X size={24} strokeWidth={1.5} />
          </button>

          <h3 className="text-3xl font-serif font-semibold text-[#1A3A52] mb-1">{t('title')}</h3>
          <p className="text-stone-400 font-serif italic text-sm mb-8">{t('restaurantName')}</p>

          <div className="grid grid-cols-2 gap-8 mb-8 border-b border-stone-100 pb-8">
            <div>
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('date')}</span>
              <p className="text-[#1A3A52] font-bold text-lg">{tableData.date}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('time')}</span>
              <p className="text-[#1A3A52] font-bold text-lg">{tableData.time}</p>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('guests')}</span>
              <p className="text-[#1A3A52] font-bold text-lg">{t('guestsCount', { count: tableData.guests })}</p>
            </div>
          </div>

          {/* === GUEST INFO DISPLAY === */}
          {guestInfo && (
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 mb-8 space-y-3">
               <h4 className="text-xs font-bold text-[#132538] uppercase tracking-wider mb-2">{t('guestInfo')}</h4>
               
               {guestInfo.name && (
                 <div className="flex items-center gap-3 text-sm text-stone-600">
                  <User size={16} className="text-[#DEA048]"/> 
                  <span className="font-bold text-[#132538]">{guestInfo.name}</span>
                 </div>
               )}
               <div className="flex items-center gap-3 text-sm text-stone-600">
                  <Phone size={16} className="text-[#DEA048]"/> 
                  <span>{guestInfo.phone}</span>
               </div>
               {guestInfo.email && (
                 <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Mail size={16} className="text-[#DEA048]"/> 
                    <span>{guestInfo.email}</span>
                 </div>
               )}
            </div>
          )}

          <div className="flex gap-3 text-stone-500 text-xs mb-8 bg-stone-50 p-3 rounded-lg border border-stone-100">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t('policy')}</p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={onConfirm}
              className="w-full bg-[#1A3A52] text-white py-4 rounded font-bold text-sm tracking-widest hover:bg-[#1a2c42] transition-colors shadow-lg cursor-pointer"
            >
              {t('confirm')}
            </button>
            <button 
              onClick={onClose}
              className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-[#132538] transition-colors cursor-pointer"
            >
              {t('changeSelection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};