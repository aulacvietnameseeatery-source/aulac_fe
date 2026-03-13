'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { StoreProfileForm } from '@/features/staff/system-settings/components/StoreProfileForm';

const SystemSettingsContent = () => {
    const t = useTranslations('AdminSidebar');

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-auto">
            <header className="w-full max-w-7xl mx-auto space-y-6 mt-6 px-4 md:px-0">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {t('storeSettings')}
                    </h1>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto pb-16 space-y-6 mt-6 px-4 md:px-0">
                <StoreProfileForm />
            </main>
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
