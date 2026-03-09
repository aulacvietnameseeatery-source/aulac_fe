'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { StoreProfileForm } from '@/features/staff/system-settings/components/StoreProfileForm';

const SystemSettingsContent = () => {
    const t = useTranslations('SystemSettings');

    return (
        <div className="flex flex-col h-full bg-gray-50/50 overflow-auto p-6 pb-10">
            <div className="flex justify-between items-center w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
                </div>
            </div>

            <StoreProfileForm />
        </div>
    );
};

export default function SystemSettingsPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewSystemSettings}>
            <Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                }
            >
                <SystemSettingsContent />
            </Suspense>
        </ProtectedRoute>
    );
}
