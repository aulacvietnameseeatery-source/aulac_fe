'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Loader2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { SystemSettingDetailDto, BulkUpdateSettingItemDto } from '../types/system-setting.types';
import { SettingField } from './SettingField';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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

    // Initialize form values from settings
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

    // Human-readable group label: e.g. "password" → "Password"
    const groupLabel = groupName.charAt(0).toUpperCase() + groupName.slice(1).replace(/_/g, ' ');

    // Count non-sensitive settings (the only ones we render inputs for)
    const editableCount = settings.filter((s) => !s.isSensitive).length;

    return (
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setCollapsed((v) => !v)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Settings2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold capitalize">{groupLabel}</CardTitle>
                            <CardDescription className="text-xs">
                                {settings.length} {t('settingCount', { count: settings.length })}
                                {editableCount < settings.length && (
                                    <span className="ml-1 text-amber-600">
                                        · {settings.length - editableCount} {t('sensitiveHidden')}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    {collapsed ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </CardHeader>

            {!collapsed && (
                <>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </CardContent>

                    <CardFooter className="justify-end border-t pt-4">
                        <PermissionGuard permission={Permissions.ManageSystemSettings}>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || editableCount === 0}
                                size="sm"
                                className="min-w-[100px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {t('save')}
                                    </>
                                )}
                            </Button>
                        </PermissionGuard>
                    </CardFooter>
                </>
            )}
        </Card>
    );
};
