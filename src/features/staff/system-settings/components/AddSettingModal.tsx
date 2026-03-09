'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreateSystemSettingDto, SettingValueType } from '../types/system-setting.types';
import { useSystemSettings } from '../hooks/useSystemSettings';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddSettingModal = ({ open, onClose, onSuccess }: Props) => {
    const t = useTranslations('SystemSettings');
    const { addSetting } = useSystemSettings();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [key, setKey] = useState('');
    const [settingName, setSettingName] = useState('');
    const [valueType, setValueType] = useState<SettingValueType>('STRING');
    const [valueStr, setValueStr] = useState('');
    const [valueBool, setValueBool] = useState(false);
    const [description, setDescription] = useState('');
    const [isSensitive, setIsSensitive] = useState(false);

    const handleSubmit = async () => {
        if (!key.trim()) return;
        setIsSubmitting(true);
        try {
            const dto: CreateSystemSettingDto = {
                key: key.trim(),
                settingName: settingName.trim() || undefined,
                valueType,
                value: valueType === 'BOOL' ? valueBool.toString() : valueStr,
                description: description.trim() || undefined,
                isSensitive,
            };
            // Try to create the setting
            await addSetting(dto, t('notifications.createSuccess') || 'Setting created successfully.');
            // Reset form
            setKey('');
            setSettingName('');
            setValueType('STRING');
            setValueStr('');
            setValueBool(false);
            setDescription('');
            setIsSensitive(false);
            onSuccess();
        } catch (error) {
            // error is handled in hook toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t('cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !key.trim()}>
                {isSubmitting ? t('saving') || 'Saving...' : t('add') || 'Add Setting'}
            </Button>
        </div>
    );

    return (
        <Dialog open={open} onClose={onClose} title={t('addSetting') || 'Add New Setting'} width="500px" footer={footer}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Setting Key</label>
                    <Input
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="e.g. default_password, password.min_length"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Setting Name (Optional)</label>
                    <Input
                        value={settingName}
                        onChange={(e) => setSettingName(e.target.value)}
                        placeholder="A readable name for this setting"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Value Type</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={valueType}
                        onChange={(e) => setValueType(e.target.value as SettingValueType)}
                        disabled={isSubmitting}
                    >
                        <option value="STRING">String</option>
                        <option value="INT">Integer</option>
                        <option value="DECIMAL">Decimal</option>
                        <option value="BOOL">Boolean</option>
                        <option value="JSON">JSON</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Value</label>
                    {valueType === 'BOOL' ? (
                        <div className="flex items-center gap-2 mt-1">
                            <Switch checked={valueBool} onChange={setValueBool} disabled={isSubmitting} />
                            <span className="text-sm text-gray-600">{valueBool ? 'True' : 'False'}</span>
                        </div>
                    ) : valueType === 'JSON' ? (
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            value={valueStr}
                            onChange={(e) => setValueStr(e.target.value)}
                            placeholder='{"key": "value"}'
                            disabled={isSubmitting}
                        />
                    ) : (
                        <Input
                            type={valueType === 'INT' || valueType === 'DECIMAL' ? 'number' : 'text'}
                            value={valueStr}
                            onChange={(e) => setValueStr(e.target.value)}
                            placeholder="Setting value..."
                            disabled={isSubmitting}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this setting for?"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50/50 mt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Sensitive Data</span>
                        <span className="text-xs text-muted-foreground">Hide value by default (e.g. passwords, API keys)</span>
                    </div>
                    <Switch checked={isSensitive} onChange={setIsSensitive} disabled={isSubmitting} />
                </div>
            </div>
        </Dialog>
    );
};
