"use client";

import { useQuery } from '@tanstack/react-query';
import { getPublicGroupSettings } from '@/features/staff/system-settings/services/system-setting.service';
import { BASE_URL } from '@/lib/http';

const normalizeMediaUrl = (value: string): string => {
    if (!value) return '';
    if (/^(https?:|blob:|data:)/i.test(value)) return value;

    const base = BASE_URL.replace(/\/+$/, '');
    const normalized = value.replace(/\\/g, '/').trim();

    if (normalized.startsWith('/uploads/')) {
        return `${base}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
        return `${base}/${normalized}`;
    }

    const relative = normalized.replace(/^\/+/, '');
    return `${base}/uploads/${relative}`;
};

export interface StoreSettings {
    logoUrl: string;
    name: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    openingHours: string;
    facebookLink: string;
    instagramLink: string;
    tiktokLink: string;
    promoVideoUrl: string;
}

export const useStoreSettings = () => {
    const locale = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'en') : 'en';

    return useQuery({
        queryKey: ['system-settings', 'store', 'public', locale],
        queryFn: async () => {
            const settings = await getPublicGroupSettings('store');
            const data: StoreSettings = {
                logoUrl: '',
                name: '',
                streetAddress: '',
                postalCode: '',
                city: '',
                country: '',
                email: '',
                phone: '',
                openingHours: '',
                facebookLink: '',
                instagramLink: '',
                tiktokLink: '',
                promoVideoUrl: '',
            };
            
            settings.forEach(s => {
                const fullKey = s.settingKey.replace('store.', '');
                
                // If key has locale suffix (e.g. name_en), check if it matches current locale
                let key = fullKey;
                let isMatch = true;
                
                const localeSuffix = `_${locale}`;
                if (fullKey.endsWith(localeSuffix)) {
                    key = fullKey.replace(localeSuffix, '');
                    isMatch = true;
                } else if (fullKey.includes('_')) {
                    // It's a localized key but for a DIFFERENT locale
                    const parts = fullKey.split('_');
                    const suffix = parts[parts.length - 1];
                    if (['en', 'vi', 'fr'].includes(suffix)) {
                        isMatch = false; 
                    }
                }

                if (isMatch && key in data) {
                    let value = s.value?.toString() || '';

                    // Specific logic for URLs
                    if ((key === 'logoUrl' || key === 'promoVideoUrl') && value) {
                        value = normalizeMediaUrl(value);
                    }

                    (data as any)[key] = value;
                }
            });

            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
