"use client";

import { useQuery } from '@tanstack/react-query';
import { getPublicGroupSettings } from '@/features/staff/system-settings/services/system-setting.service';

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
}

export const useStoreSettings = () => {
    return useQuery({
        queryKey: ['system-settings', 'store', 'public'],
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
            };

            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                if (key in data) {
                    (data as any)[key] = s.value?.toString() || '';
                }
            });

            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
