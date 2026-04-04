'use client';
import React, { Suspense } from 'react';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { StoreProfileForm } from '@/features/staff/system-settings/components/StoreProfileForm';
import { IntroductionSettingsForm } from '@/features/staff/system-settings/components/IntroductionSettingsForm';
import { AboutUsSettingsForm } from '@/features/staff/system-settings/components/AboutUsSettingsForm';
import { useSearchParams } from 'next/navigation';
import { ALCard } from '@/components/ui/al-card';

const SystemSettingsContent = () => {
    const t = useTranslations('navigation.adminSidebar');
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    return (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-gray-50">
            <ALCard className="p-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {t('storeSettings')}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {activeTab === 'profile' && t('storeProfile')}
                            {activeTab === 'introduction' && t('storeIntroduction')}
                            {activeTab === 'about' && t('storeAboutUs')}
                        </p>
                    </div>
                </div>
            </ALCard>

            <main className="mt-3 flex-1 min-h-0 overflow-hidden">
                <div className="w-full h-full min-h-0">
                    {activeTab === 'profile' && <StoreProfileForm />}
                    {activeTab === 'introduction' && <IntroductionSettingsForm />}
                    {activeTab === 'about' && <AboutUsSettingsForm />}
                </div>
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
