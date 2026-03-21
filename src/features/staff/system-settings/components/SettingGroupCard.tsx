'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Loader2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { SystemSettingDetailDto, BulkUpdateSettingItemDto } from '../types/system-setting.types';
import { SettingField } from './SettingField';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { ALCard } from '@/components/ui/al-card';
import { cn } from '@/lib/utils';

interface SettingGroupCardProps {
    groupName: string;
    settings: SystemSettingDetailDto[];
    isSaving: boolean;
    onSave: (items: BulkUpdateSettingItemDto[]) => Promise<void>;
}

export const SettingGroupCard: React.FC<SettingGroupCardProps> = ({
    groupName,
    settings,
    isSaving,
    onSave,
}) => {
    const t = useTranslations('SystemSettings');
    const [values, setValues] = useState<Record<string, string>>({});
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const initial: Record<string, string> = {};
        settings.forEach((s) => {
            if (!s.isSensitive) {
                initial[s.settingKey] = s.value != null ? String(s.value) : '';
            }
        });
        setValues(initial);
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const items: BulkUpdateSettingItemDto[] = Object.entries(values).map(
            ([key, value]) => ({ key, value })
        );
        await onSave(items);
    };

    const groupLabel = groupName.charAt(0).toUpperCase() + groupName.slice(1).replace(/_/g, ' ');
    const editableCount = settings.filter((s) => !s.isSensitive).length;

    return (
        <ALCard variant="default" elevation="sm" radius="2xl" padding="none" className="border border-amber-200/50 shadow-sm transition-all hover:shadow-md flex flex-col h-full bg-white">
            <div
                className="cursor-pointer select-none p-6"
                onClick={() => setCollapsed((v) => !v)}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-[#1A3A52]/5 border border-[#1A3A52]/10 shrink-0">
                            <Settings2 className="h-5 w-5 text-[#1A3A52]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold capitalize text-gray-900 leading-tight">{groupLabel}</h3>
                            <p className="text-sm text-gray-500 font-[Inter] mt-1">
                                {settings.length} {t('settingCount', { count: settings.length })}
                                {editableCount < settings.length && (
                                    <span className="ml-1 text-amber-600/80">
                                        · {settings.length - editableCount} {t('sensitiveHidden')}
                                    </span>
                                )}
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
                collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
            )}>
                <div className="flex-1 flex flex-col">
                    <div className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {settings.map((setting) => (
                                <SettingField
                                    key={setting.settingKey}
                                    setting={setting}
                                    value={values[setting.settingKey] ?? ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50/80 border-t border-amber-200/20 flex justify-end mt-auto rounded-b-2xl">
                        <PermissionGuard permission={Permissions.ManageSystemSettings}>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || editableCount === 0}
                                className="h-10 px-6 bg-[#1A3A52] hover:bg-[#1A3A52]/90 text-white shadow-md gap-2 font-[Inter]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {t('save')}
                                    </>
                                )}
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>
            </div>
        </ALCard>
    );
};
