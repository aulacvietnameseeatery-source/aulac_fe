'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GroupedSettingsMap, BulkUpdateSettingItemDto, CreateSystemSettingDto } from '../types/system-setting.types';
import { getGroupedSettings, updateGroupSettings, createSetting } from '../services/system-setting.service';

export const useSystemSettings = () => {
    const [grouped, setGrouped] = useState<GroupedSettingsMap>({});
    const [isLoading, setIsLoading] = useState(false);
    const [savingGroups, setSavingGroups] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getGroupedSettings();
            setGrouped(data ?? {});
        } catch (err: any) {
            console.error('Failed to load system settings:', err);
            toast.error(err?.response?.data?.userMessage ?? 'Failed to load system settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveGroup = useCallback(
        async (group: string, items: BulkUpdateSettingItemDto[], successMsg: string) => {
            setSavingGroups((prev) => ({ ...prev, [group]: true }));
            try {
                await updateGroupSettings(group, { items });
                toast.success(successMsg);
                // Refresh groupdata
                const data = await getGroupedSettings();
                setGrouped(data ?? {});
            } catch (err: any) {
                console.error(`Failed to save group '${group}':`, err);
                toast.error(err?.response?.data?.userMessage ?? `Failed to save settings for group '${group}'.`);
            } finally {
                setSavingGroups((prev) => ({ ...prev, [group]: false }));
            }
        },
        []
    );

    const addSetting = useCallback(
        async (data: CreateSystemSettingDto, successMsg: string) => {
            setIsLoading(true);
            try {
                await createSetting(data);
                toast.success(successMsg);
                // Refresh group data
                const freshData = await getGroupedSettings();
                setGrouped(freshData ?? {});
            } catch (err: any) {
                console.error('Failed to create setting:', err);
                toast.error(err?.response?.data?.userMessage ?? 'Failed to create setting.');
                throw err; // throw to let UI close logic know it failed
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { grouped, isLoading, savingGroups, load, saveGroup, addSetting };
};
