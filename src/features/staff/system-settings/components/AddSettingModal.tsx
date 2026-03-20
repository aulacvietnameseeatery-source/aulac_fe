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
            await addSetting(dto, t('notifications.createSuccess'));
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
                {t('cancel')}
            </Button>
            <Button variant="default" onClick={handleSubmit} disabled={isSubmitting || !key.trim()}>
                {isSubmitting ? t('saving') : t('add')}
            </Button>
        </div>
    );

    return (
        <Dialog open={open} onClose={onClose} title={t('AddModal.addTitle')} width="500px" footer={footer}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t('AddModal.key')}</label>
                    <Input
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={t('AddModal.keyPlaceholder')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t('AddModal.name')}</label>
                    <Input
                        value={settingName}
                        onChange={(e) => setSettingName(e.target.value)}
                        placeholder={t('AddModal.namePlaceholder')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t('AddModal.type')}</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={valueType}
                        onChange={(e) => setValueType(e.target.value as SettingValueType)}
                        disabled={isSubmitting}
                    >
                        <option value="STRING">{t('Field.types.STRING')}</option>
                        <option value="INT">{t('Field.types.INT')}</option>
                        <option value="DECIMAL">{t('Field.types.DECIMAL')}</option>
                        <option value="BOOL">{t('Field.types.BOOL')}</option>
                        <option value="JSON">{t('Field.types.JSON')}</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t('AddModal.value')}</label>
                    {valueType === 'BOOL' ? (
                        <div className="flex items-center gap-2 mt-1">
                            <Switch checked={valueBool} onChange={setValueBool} disabled={isSubmitting} />
                            <span className="text-sm text-gray-600">{valueBool ? t('AddModal.true') : t('AddModal.false')}</span>
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
                            placeholder={t('AddModal.valuePlaceholder')}
                            disabled={isSubmitting}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t('AddModal.description')}</label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('AddModal.descriptionPlaceholder')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50/50 mt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{t('AddModal.sensitive')}</span>
                        <span className="text-xs text-muted-foreground">{t('AddModal.sensitiveDesc')}</span>
                    </div>
                    <Switch checked={isSensitive} onChange={setIsSensitive} disabled={isSubmitting} />
                </div>
            </div>
        </Dialog>
    );
};
