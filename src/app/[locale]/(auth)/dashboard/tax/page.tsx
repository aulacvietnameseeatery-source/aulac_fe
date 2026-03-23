'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { TaxSettingsForm } from '@/features/staff/tax-management';

export default function TaxManagementPage() {
    const t = useTranslations('Tax');
    const [isAddTaxOpen, setIsAddTaxOpen] = useState(false);

    return (
        <ProtectedRoute permission={Permissions.ViewSystemSettings}>
            <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="flex justify-between items-center w-full mb-6 py-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('description')}
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsAddTaxOpen(true)}
                        variant="outline"
                        className="shadow-md"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addTax')}
                    </Button>
                </div>

                {/* Content Section */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl">
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

