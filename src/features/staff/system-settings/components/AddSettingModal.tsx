'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ALInput } from '@/components/ui/al-input';
import { ALCombobox } from '@/components/ui/al-combobox';
import { CreateSystemSettingDto } from '../types/system-setting.types';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useAddSettingForm } from '../hooks/useAddSettingForm';
import { AddSettingFormValues } from '../types/add-setting.schema';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddSettingModal = ({ open, onClose, onSuccess }: Props) => {
    const t = useTranslations('settings');
    const { addSetting } = useSystemSettings();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useAddSettingForm();
    const valueType = form.watch('valueType');
    const valueBool = form.watch('valueBool');

    const onSubmit = async (values: AddSettingFormValues) => {
        setIsSubmitting(true);
        try {
            const dto: CreateSystemSettingDto = {
                key: values.key.trim(),
                settingName: values.settingName?.trim() || undefined,
                valueType: values.valueType,
                value: values.valueType === 'BOOL' ? (values.valueBool ?? false).toString() : (values.value ?? ""),
                description: values.description?.trim() || undefined,
                isSensitive: values.isSensitive ?? false,
            };
            await addSetting(dto, t('notifications.createSuccess'));
            form.reset();
            onSuccess();
        } catch (error) {
            // error is handled in hook toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = [
        { value: 'STRING', label: t('Field.types.STRING') },
        { value: 'INT', label: t('Field.types.INT') },
        { value: 'DECIMAL', label: t('Field.types.DECIMAL') },
        { value: 'BOOL', label: t('Field.types.BOOL') },
        { value: 'JSON', label: t('Field.types.JSON') },
    ];

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t('cancel')}
            </Button>
            <Button variant="default" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? t('saving') : t('add')}
            </Button>
        </div>
    );

    return (
        <Dialog open={open} onClose={onClose} title={t('AddModal.addTitle')} width="500px" footer={footer}>
            <div className="flex flex-col gap-4 py-4 px-6">
                <ALInput
                    title={t('AddModal.key')}
                    placeholder={t('AddModal.keyPlaceholder')}
                    disabled={isSubmitting}
                    {...form.register('key')}
                    error={form.formState.errors.key?.message}
                    required
                />

                <ALInput
                    title={t('AddModal.name')}
                    placeholder={t('AddModal.namePlaceholder')}
                    disabled={isSubmitting}
                    {...form.register('settingName')}
                    error={form.formState.errors.settingName?.message}
                />

                <ALCombobox
                    title={t('AddModal.type')}
                    options={typeOptions}
                    value={valueType}
                    onChange={(val) => form.setValue('valueType', val as any)}
                    disabled={isSubmitting}
                    searchable={false}
                />

                <div className="flex flex-col gap-2">
                    {valueType === 'BOOL' ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t('AddModal.value')}</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Switch
                                    checked={!!valueBool}
                                    onChange={(val) => form.setValue('valueBool', val)}
                                    disabled={isSubmitting}
                                    showLabel={false}
                                />
                                <span className="text-sm text-gray-600">{valueBool ? t('AddModal.true') : t('AddModal.false')}</span>
                            </div>
                        </div>
                    ) : (
                        <ALInput
                            title={t('AddModal.value')}
                            type={valueType === 'INT' || valueType === 'DECIMAL' ? 'number' : 'text'}
                            fieldVariant={valueType === 'JSON' ? 'textarea' : 'input'}
                            placeholder={valueType === 'JSON' ? '{"key": "value"}' : t('AddModal.valuePlaceholder')}
                            disabled={isSubmitting}
                            {...form.register('value')}
                            error={form.formState.errors.value?.message}
                            required
                        />
                    )}
                </div>

                <ALInput
                    title={t('AddModal.description')}
                    placeholder={t('AddModal.descriptionPlaceholder')}
                    disabled={isSubmitting}
                    {...form.register('description')}
                    error={form.formState.errors.description?.message}
                />

                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50/50 mt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{t('AddModal.sensitive')}</span>
                        <span className="text-xs text-muted-foreground">{t('AddModal.sensitiveDesc')}</span>
                    </div>
                    <Switch
                        checked={!!form.watch('isSensitive')}
                        onChange={(val) => form.setValue('isSensitive', val)}
                        disabled={isSubmitting}
                        showLabel={false}
                    />
                </div>
            </div>
        </Dialog>
    );
};
