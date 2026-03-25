import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    BadgePercent,
    Pencil,
    Trash2,
    AlertCircle,
    Plus,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALCard } from '@/components/ui/al-card';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { useTaxesQuery, useCreateTaxMutation, useUpdateTaxMutation, useDeleteTaxMutation } from '../hooks/useTaxMutation';
import { toast } from 'sonner';
import { ALConfirmDialog } from '@/components/ui/al-confirm-dialog';
import { Loader2 } from 'lucide-react';
import { TaxFormDialog } from './TaxFormDialog';
import { TaxDTO } from '../services/tax.service';

interface TaxSettingsFormProps {
    isAddOpen?: boolean;
    onAddOpenChange?: (open: boolean) => void;
}

export const TaxSettingsForm: React.FC<TaxSettingsFormProps> = ({ isAddOpen, onAddOpenChange }) => {
    const t = useTranslations('Tax');
    const commonT = useTranslations('settings.Common');

    const { data: taxes = [], isLoading } = useTaxesQuery(false);
    const deleteMutation = useDeleteTaxMutation();
    const updateMutation = useUpdateTaxMutation();
    const createMutation = useCreateTaxMutation();

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [internalFormOpen, setInternalFormOpen] = useState(false);
    const [editingTax, setEditingTax] = useState<TaxDTO | null>(null);

    const isFormOpen = typeof isAddOpen === 'boolean' ? isAddOpen || internalFormOpen : internalFormOpen;
    const setIsFormOpen = (open: boolean) => {
        if (!open && onAddOpenChange) onAddOpenChange(false);
        setInternalFormOpen(open);
    };

    // Keep sync if parent opens it for "Add New"
    React.useEffect(() => {
        if (isAddOpen) {
            setEditingTax(null);
        }
    }, [isAddOpen]);

    const handleDelete = async () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSuccess: () => {
                toast.success(t('deleteSuccess'));
                setDeleteId(null);
            },
            onError: () => toast.error(t('deleteError'))
        });
    };

    const handleEdit = (tax: TaxDTO) => {
        setEditingTax(tax);
        setIsFormOpen(true);
    };

    const handleCreateNew = () => {
        setEditingTax(null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: any) => {
        if (editingTax) {
            updateMutation.mutate({ id: editingTax.taxId, data }, {
                onSuccess: () => {
                    toast.success(t('updateSuccess'));
                    setIsFormOpen(false);
                },
                onError: () => toast.error(t('updateError'))
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t('createSuccess'));
                    setIsFormOpen(false);
                },
                onError: () => toast.error(t('createError'))
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary-DEFAULT" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* List Section */}
            <div className="space-y-0 rounded-xl border border-slate-200 overflow-hidden bg-white">
                {taxes.length > 0 ? (
                    taxes.map((tax: any) => (
                        <div
                            key={tax.taxId}
                            className={`flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${!tax.isActive ? 'opacity-60 grayscale' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="body" className="font-semibold text-navy-DEFAULT">
                                            {tax.taxName}
                                        </Typography>
                                        {tax.isDefault && (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] px-1.5 py-0 uppercase tracking-widest">
                                                {t('default')}
                                            </Badge>
                                        )}

                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none font-mono px-1.5 py-0 text-xs">
                                            {tax.taxRate * 100}%
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                border-none px-1.5 py-0 text-xs rounded-full font-medium
                                                ${tax.taxType === 'INCLUSIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-amber-500/10 text-amber-600'}
                                            `}
                                        >
                                            {t(`types.${tax.taxType.toLowerCase()}`)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Tooltip content={commonT('edit')}>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-navy-DEFAULT/60 hover:text-navy-DEFAULT hover:bg-primary-DEFAULT/10" onClick={() => handleEdit(tax)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content={commonT('delete')}>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500/60 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(tax.taxId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <ALCard variant="default" padding="lg" radius="xl" className="border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 py-12">
                        <AlertCircle className="h-10 w-10 text-slate-200" />
                        <Typography variant="body" className="text-slate-400 italic">
                            {t('noTaxes')}
                        </Typography>
                    </ALCard>
                )}
            </div>

            <ALConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title={t('deleteTitle')}
                message={t('deleteDescription')}
                isLoading={deleteMutation.isPending}
            />

            <TaxFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingTax}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
};
