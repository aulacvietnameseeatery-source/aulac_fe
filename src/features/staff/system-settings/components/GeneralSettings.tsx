'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { SettingGroupCard } from './SettingGroupCard';
import { LandingPageSettingsCard } from './LandingPageSettingsCard';
import { Loader2, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddSettingModal } from './AddSettingModal';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

export const GeneralSettings: React.FC = () => {
    const t = useTranslations('settings');
    const { grouped, isLoading, savingGroups, load, saveGroup } = useSystemSettings();

    useEffect(() => {
        load();
    }, [load]);

    if (isLoading && Object.keys(grouped).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground animate-pulse">{t('loading')}</p>
            </div>
        );
    }

    // Filter out the 'store' group as it has its own specialized form
    // Also filter out settings with key containing 'password' (case-insensitive)
    const filteredGrouped: typeof grouped = {};
    for (const group of Object.keys(grouped)) {
        if (group === 'store') continue;
        const filteredSettings = grouped[group].filter(s => !/password/i.test(s.settingKey));
        if (filteredSettings.length > 0) filteredGrouped[group] = filteredSettings;
    }
    const groups = Object.keys(filteredGrouped).sort();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {groups.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4" />
                    <h3 className="text-base font-medium text-gray-900">{t('General.empty')}</h3>
                    <p className="text-sm text-gray-500 max-w-xs mt-1">
                        {t('General.emptyDesc')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {groups.map((groupName) => (
                        groupName === 'landing_page' ? (
                            <LandingPageSettingsCard key={groupName} settings={filteredGrouped[groupName]} />
                        ) : (
                            <SettingGroupCard
                                key={groupName}
                                groupName={groupName}
                                settings={filteredGrouped[groupName]}
                                isSaving={savingGroups[groupName] || false}
                                onSave={(items) => saveGroup(groupName, items, t('notifications.saveSuccess', { group: groupName }))}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
};
