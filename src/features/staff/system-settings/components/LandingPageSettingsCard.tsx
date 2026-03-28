'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SystemSettingDetailDto } from '../types/system-setting.types';
import { updateBoolSetting } from '../services/system-setting.service';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ALCard } from '@/components/ui/al-card';
import { toast } from 'sonner';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingPageSettingsCardProps {
    settings: SystemSettingDetailDto[];
}

export const LandingPageSettingsCard: React.FC<LandingPageSettingsCardProps> = ({ settings }) => {
    const t = useTranslations('settings');
    const tField = useTranslations('settings.Field');
    const [collapsed, setCollapsed] = useState(false);
    const [updatingKeys, setUpdatingKeys] = useState<Record<string, boolean>>({});

    // Initialize local values from settings prop
    const [localValues, setLocalValues] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        settings.forEach(s => {
            initial[s.settingKey] = s.value === true || s.value === 'true';
        });
        return initial;
    });

    const handleToggle = async (key: string, checked: boolean) => {
        // Optimistically update local state
        setLocalValues(prev => ({ ...prev, [key]: checked }));
        setUpdatingKeys(prev => ({ ...prev, [key]: true }));
        try {
            await updateBoolSetting(key, checked);
            toast.success(t('notifications.saveSuccess', { group: t('landing_page.title') }));
        } catch (err: any) {
            console.error(`Failed to update setting ${key}:`, err);
            toast.error(err?.response?.data?.userMessage ?? t('notifications.saveError'));
            // Revert state on error
            setLocalValues(prev => ({ ...prev, [key]: !checked }));
        } finally {
            setUpdatingKeys(prev => ({ ...prev, [key]: false }));
        }
    };

    return (
        <ALCard variant="default" elevation="sm" radius="2xl" padding="none" className="border border-amber-200/50 shadow-sm transition-all hover:shadow-md flex flex-col h-full bg-white">
            <div
                className="cursor-pointer select-none p-6"
                onClick={() => setCollapsed((v) => !v)}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold capitalize text-gray-900 leading-tight">
                                {t('landing_page.title')}
                            </h3>
                            <p className="text-sm text-gray-500 font-[Inter] mt-1">
                                {t('landing_page.description')}
                            </p>
                        </div>
                    </div>
                    <div className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
                        {collapsed ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                collapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
            )}>
                <div className="px-6 pb-8 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {settings.map((setting) => {
                            const isUpdating = updatingKeys[setting.settingKey];
                            const label = t.has(setting.settingKey)
                                ? t(setting.settingKey)
                                : setting.settingName || setting.settingKey;
                            const desc = t.has(`${setting.settingKey}Desc`)
                                ? t(`${setting.settingKey}Desc`)
                                : setting.description;
                            const currentChecked = localValues[setting.settingKey] ?? (setting.value === true || setting.value === 'true');

                            return (
                                <div key={setting.settingKey} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                        {/* <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase">
                                            {tField('types.BOOL')}
                                        </Badge> */}
                                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                    </div>
                                    <div className="py-1">
                                        <Switch
                                            checked={currentChecked}
                                            onChange={(checked: boolean) => handleToggle(setting.settingKey, checked)}
                                            disabled={isUpdating}
                                            showLabel={true}
                                            activeLabel={tField('active')}
                                            inactiveLabel={tField('inactive')}
                                        />
                                    </div>
                                    {desc && <p className="text-xs text-gray-500">{desc}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </ALCard>
    );
};
