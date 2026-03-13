'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { SettingGroupCard } from './SettingGroupCard';
import { Loader2, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddSettingModal } from './AddSettingModal';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

export const GeneralSettings: React.FC = () => {
    const t = useTranslations('SystemSettings');
    const { grouped, isLoading, savingGroups, load, saveGroup, addSetting } = useSystemSettings();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

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
    const groups = Object.keys(grouped).filter(g => g !== 'store').sort();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold tracking-tight">System Parameters</h2>
                </div>

                <PermissionGuard permission={Permissions.ManageSystemSettings}>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="shadow-sm hover:shadow-md transition-all gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Setting
                    </Button>
                </PermissionGuard>
            </div>

            {groups.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Settings className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">No general settings found</h3>
                    <p className="text-sm text-gray-500 max-w-xs mt-1">
                        Use the &quot;Add New Setting&quot; button above to create a group like &quot;reservation&quot;.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {groups.map((groupName) => (
                        <SettingGroupCard
                            key={groupName}
                            groupName={groupName}
                            settings={grouped[groupName]}
                            isSaving={savingGroups[groupName] || false}
                            onSave={(items) => saveGroup(groupName, items, t('saveSuccess'))}
                        />
                    ))}
                </div>
            )}

            <AddSettingModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={async () => {
                    await load();
                    setIsAddModalOpen(false);
                }}
            />
        </div>
    );
};
