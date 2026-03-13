import React, { useState } from 'react';
import { X, Phone, Copy, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useStoreSettings } from '@/hooks/use-store-settings';

interface CallRestaurantPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CallRestaurantPopup({ isOpen, onClose }: CallRestaurantPopupProps) {
    const t = useTranslations('Reservation.CallButton');
    const [copied, setCopied] = useState(false);
    const { data: storeSettings, isLoading } = useStoreSettings();

    if (!isOpen) return null;

    const phoneNumber = storeSettings?.phone || "+84 28 3822 5264";
    const phoneDisplay = storeSettings?.phone || "(+84) 28 3822 5264";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(phoneNumber);
            setCopied(true);
            toast.success(t('copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={20} className="text-slate-600" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Phone size={32} className="text-emerald-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                    {t('title')}
                </h2>

                {/* Subtitle */}
                <p className="text-center text-slate-600 mb-6">
                    {t('description')}
                </p>

                {/* Restaurant Name */}
                <div className="text-center mb-4">
                    <p className="text-sm text-slate-500 mb-1">{t('restaurant')}</p>
                    <p className="font-semibold text-slate-800">
                        {isLoading ? "..." : (storeSettings?.name || "Au Lac Vietnamese Eatery")}
                    </p>
                </div>

                {/* Phone Number */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <p className="text-sm text-slate-500 text-center mb-2">{t('phoneLabel')}</p>
                    <a
                        href={`tel:${phoneNumber}`}
                        className="block text-3xl font-bold text-emerald-600 text-center hover:text-emerald-700 transition-colors mb-4"
                    >
                        {isLoading ? "..." : phoneDisplay}
                    </a>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Copy size={16} className="text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                            {copied ? t('copied') : t('copyNumber')}
                        </span>
                    </button>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-6 font-medium">
                    <Clock size={16} className="text-emerald-600" />
                    <span>{isLoading ? "..." : (storeSettings?.openingHours || t('hours'))}</span>
                </div>

                {/* Call Now Button */}
                <a
                    href={`tel:${phoneNumber}`}
                    onClick={() => toast.info(t('dialing'))}
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl text-center transition-colors shadow-lg shadow-emerald-600/30"
                >
                    {t('callNow')}
                </a>
            </div>
        </div>
    );
}
