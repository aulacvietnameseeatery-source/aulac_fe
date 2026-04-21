'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { ALTitleCard } from '@/components/ui/al-title-card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { TaxSettingsForm } from '@/features/staff/tax-management';

export default function TaxManagementPage() {
    const t = useTranslations('Tax');
    const [isAddTaxOpen, setIsAddTaxOpen] = useState(false);

    return (
        <ProtectedRoute permission={Permissions.ViewSystemSettings}>
            <div className="w-full h-full flex flex-col">
                <ALTitleCard
                    title={t('title')}
                    description={t('description')}
                    className="mb-4"
                    actions={
                        <Button
                            onClick={() => setIsAddTaxOpen(true)}
                            className="w-full gap-2 sm:w-auto bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90"
                        >
                            <Plus className="h-4 w-4" />
                            {t('addTax')}
                        </Button>
                    }
                />

                {/* Content Section */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="w-full">
                        <TaxSettingsForm
                            isAddOpen={isAddTaxOpen}
                            onAddOpenChange={setIsAddTaxOpen}
                        />
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

