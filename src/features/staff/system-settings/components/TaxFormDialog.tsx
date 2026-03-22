import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ALInput } from '@/components/ui/al-input';
import { ALCard } from '@/components/ui/al-card';
import { ALCombobox } from '@/components/ui/al-combobox';
import { useTranslations } from 'next-intl';
import { TaxDTO, CreateTaxRequestDTO } from '../services/tax.service';
import { Switch } from '@/components/ui/switch';

const taxSchema = z.object({
    taxName: z.string().min(1, 'Tax name is required'),
    taxRate: z.number().min(0, 'Tax rate must be positive'),
    taxType: z.enum(['INCLUSIVE', 'EXCLUSIVE']),
    isActive: z.boolean(),
    isDefault: z.boolean(),
});

type TaxFormValues = z.infer<typeof taxSchema>;

interface TaxFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaxRequestDTO) => void;
    initialData?: TaxDTO | null;
    isLoading?: boolean;
}

export const TaxFormDialog: React.FC<TaxFormDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}) => {
    const t = useTranslations('settings.Tax');
    const commonT = useTranslations('settings.Common');
    const rootT = useTranslations('settings');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TaxFormValues>({
        resolver: zodResolver(taxSchema),
        defaultValues: {
            taxName: '',
            taxRate: 0,
            taxType: 'EXCLUSIVE',
            isActive: true,
            isDefault: false,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                taxName: initialData.taxName,
                taxRate: initialData.taxRate,
                taxType: initialData.taxType,
                isActive: initialData.isActive,
                isDefault: initialData.isDefault,
            });
        } else {
            reset({
                taxName: '',
                taxRate: 0,
                taxType: 'EXCLUSIVE',
                isActive: true,
                isDefault: false,
            });
        }
    }, [initialData, reset, isOpen]);

    const taxType = watch('taxType');
    const isActive = watch('isActive');
    const isDefault = watch('isDefault');

    const footer = (
        <div className="flex justify-end gap-2 px-4 pb-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                {commonT('cancel')}
            </Button>
            <Button type="button" variant="default" onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
                {rootT('save')}
            </Button>
        </div>
    );

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={initialData ? t('editTax') : t('addTax')}
            footer={footer}
        >
            <div className="px-4 py-2">
                <ALCard variant="soft" padding="md" elevation="none" className="space-y-4">
                    <ALInput
                        title={t('name')}
                        error={errors.taxName?.message}
                        {...register('taxName')}
                    />
                    <ALInput
                        title={t('rate')}
                        type="number"
                        step="0.01"
                        error={errors.taxRate?.message}
                        {...register('taxRate', { valueAsNumber: true })}
                    />

                    <ALCombobox
                        title={t('type')}
                        value={taxType}
                        searchable={false}
                        options={[
                            { label: t('types.exclusive'), value: 'EXCLUSIVE' },
                            { label: t('types.inclusive'), value: 'INCLUSIVE' }
                        ]}
                        onChange={(val) => setValue('taxType', val as 'INCLUSIVE' | 'EXCLUSIVE')}
                    />

                    <div className="space-y-2 pt-2 border-t border-slate-200/60 mt-4">
                        <div className="flex items-center justify-between py-2">
                            <label className="text-sm font-medium text-slate-700">{t('active')}</label>
                            <Switch
                                checked={isActive}
                                onChange={(checked: boolean) => setValue('isActive', checked)}
                                showLabel={false}
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <label className="text-sm font-medium text-slate-700">{t('isDefault')}</label>
                            <Switch
                                checked={isDefault}
                                onChange={(checked: boolean) => setValue('isDefault', checked)}
                                showLabel={false}
                            />
                        </div>
                    </div>
                </ALCard>
            </div>
        </Dialog>
    );
};
