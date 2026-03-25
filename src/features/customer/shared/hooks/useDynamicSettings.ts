import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/http';
import { ApiResponse } from '@/types/api-response.types';
import { normalizeMediaUrl } from '@/lib/normalize-media-url';




type SettingItem = {
    settingKey: string;
    value: any;
};

export function useDynamicSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get<ApiResponse<{ settings: SettingItem[] }>>(
                    '/api/system-settings/public/groups/store'
                );

                const settingsData = response.data.settings;
                const newSettings: Record<string, string> = {};

                settingsData.forEach(item => {
                    // Extract the suffix after 'store.'
                    const key = item.settingKey.replace('store.', '');
                    newSettings[key] = item.value?.toString() || '';
                });

                setSettings(newSettings);
            } catch (error) {
                console.error('Failed to load public store settings', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const locale = useLocale();

    // Helper to get from dynamic settings, fallback to provided default
    const getSetting = (key: string, fallback: string) => {
        // Try getting the localized key first, e.g., 'intro.hero.title_en'
        const localizedKey = `${key}_${locale}`;
        const localizedValue = settings[localizedKey];
        if (localizedValue && localizedValue.trim() !== '') {
            return localizedValue;
        }

        // Fallback to base key if localized is not found
        const baseValue = settings[key];
        return baseValue && baseValue.trim() !== '' ? baseValue : fallback;
    };

    // Helper for media settings (images/videos)
    const getMediaSetting = (key: string, fallback: string) => {
        const val = settings[key];
        if (!val || val.trim() === '') return fallback;
        return normalizeMediaUrl(val);
    };

    return { settings, getSetting, getMediaSetting, isLoading };
}
