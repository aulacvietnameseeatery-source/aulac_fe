'use client';

import React, { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { SettingGroupCard } from './SettingGroupCard';
import { LandingPageSettingsCard } from './LandingPageSettingsCard';
import { ShiftSettingsCard } from './ShiftSettingsCard';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { ALCard } from '@/components/ui/al-card';

// Groups that have their own dedicated tab
const DEDICATED_GROUPS = new Set(['store', 'landing_page', 'shift', 'notification']);

export const GeneralSettings: React.FC = () => {
    const t = useTranslations('settings');
    const { grouped, isLoading, savingGroups, load, saveGroup } = useSystemSettings();
    const tabTriggerClassName = 'px-4 py-2 text-[#1A3A52]/70 data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9]';

    useEffect(() => {
        load();
    }, [load]);

    // Generic groups (everything except dedicated ones and password keys)
    const genericGroups = useMemo(() => {
        const result: typeof grouped = {};
        for (const group of Object.keys(grouped)) {
            if (DEDICATED_GROUPS.has(group)) continue;
            const filtered = grouped[group].filter((s) => !/password/i.test(s.settingKey));
            if (filtered.length > 0) result[group] = filtered;
        }
        return result;
    }, [grouped]);

    const genericGroupNames = useMemo(
        () => Object.keys(genericGroups).sort(),
        [genericGroups]
    );

    if (isLoading && Object.keys(grouped).length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground animate-pulse">{t('loading')}</p>
            </div>
        );
    }

    return (

        <Tabs defaultValue="general" className="flex h-full min-h-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ALCard className="inline-flex w-fit p-2">
                <TabsList className="h-auto gap-1 bg-transparent">
                    <TabsTrigger value="general" className={tabTriggerClassName}>{t('Tabs.general')}</TabsTrigger>
                    <TabsTrigger value="notifications" className={tabTriggerClassName}>{t('Tabs.notifications')}</TabsTrigger>
                    <TabsTrigger value="shift" className={tabTriggerClassName}>{t('Tabs.shift')}</TabsTrigger>
                    <TabsTrigger value="landing_page" className={tabTriggerClassName}>{t('Tabs.landingPage')}</TabsTrigger>
                </TabsList>
            </ALCard>


            {/* General settings */}
            <TabsContent forceMount value="general" className="mt-4 w-full min-h-0 flex-1 overflow-y-auto pb-6 data-[state=inactive]:hidden">
                {genericGroupNames.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4" />
                        <h3 className="text-base font-medium text-gray-900">{t('General.empty')}</h3>
                        <p className="text-sm text-gray-500 max-w-xs mt-1">
                            {t('General.emptyDesc')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 pr-1">
                        {genericGroupNames.map((groupName) => (
                            <SettingGroupCard
                                key={groupName}
                                groupName={groupName}
                                settings={genericGroups[groupName]}
                                isSaving={savingGroups[groupName] || false}
                                onSave={(items) =>
                                    saveGroup(groupName, items, t('notifications.saveSuccess', { group: groupName }))
                                }
                            />
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Notification email settings */}
            <TabsContent forceMount value="notifications" className="mt-4 w-full min-h-0 flex-1 overflow-hidden pb-6 data-[state=inactive]:hidden [&>*]:h-full">
                <NotificationSettingsSection />
            </TabsContent>

            {/* Shift settings */}
            <TabsContent forceMount value="shift" className="mt-4 w-full min-h-0 flex-1 overflow-hidden pb-6 data-[state=inactive]:hidden [&>*]:h-full">
                {grouped['shift'] ? (
                    <ShiftSettingsCard
                        settings={grouped['shift']}
                        isSaving={savingGroups['shift'] || false}
                        onSave={(items) =>
                            saveGroup('shift', items, t('notifications.saveSuccess', { group: 'shift' }))
                        }
                    />
                ) : (
                    <p className="text-sm text-muted-foreground py-8 text-center">{t('General.empty')}</p>
                )}
            </TabsContent>

            {/* Landing page settings */}
            <TabsContent forceMount value="landing_page" className="mt-4 w-full min-h-0 flex-1 overflow-hidden pb-6 data-[state=inactive]:hidden [&>*]:h-full">
                {grouped['landing_page'] ? (
                    <LandingPageSettingsCard settings={grouped['landing_page']} />
                ) : (
                    <p className="text-sm text-muted-foreground py-8 text-center">{t('General.empty')}</p>
                )}
            </TabsContent>
        </Tabs>
    );
};
