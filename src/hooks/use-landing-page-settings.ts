"use client";

import { useQuery } from '@tanstack/react-query';
import { getPublicGroupSettings } from '@/features/staff/system-settings/services/system-setting.service';

export interface LandingPageSettings {
    showDishImage: boolean;
    showDishImage360: boolean;
    showDishVideo: boolean;
}

export const useLandingPageSettings = () => {
    return useQuery({
        queryKey: ['system-settings', 'landing_page', 'public'],
        queryFn: async () => {
            const settings = await getPublicGroupSettings('landing_page');
            const data: LandingPageSettings = {
                showDishImage: true,
                showDishImage360: true,
                showDishVideo: true,
            };

            settings.forEach(s => {
                const key = s.settingKey.replace('landing_page.', '');

                if (key === 'show_dish_image') {
                    data.showDishImage = s.value === true || s.value === 'true';
                } else if (key === 'show_dish_image360') {
                    data.showDishImage360 = s.value === true || s.value === 'true';
                } else if (key === 'show_dish_video') {
                    data.showDishVideo = s.value === true || s.value === 'true';
                }
            });

            return data;
        },
        staleTime: 0,
    });
};
