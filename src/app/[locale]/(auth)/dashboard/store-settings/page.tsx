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
import { ALTitleCard } from '@/components/ui/al-title-card';

const SystemSettingsContent = () => {
    const t = useTranslations('navigation.adminSidebar');
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    return (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-gray-50">
            <ALTitleCard
                title={t('storeSettings')}
                description={
                    <>
                        {activeTab === 'profile' && t('storeProfile')}
                        {activeTab === 'introduction' && t('storeIntroduction')}
                        {activeTab === 'about' && t('storeAboutUs')}
                    </>
                }
                className="shrink-0"
            />

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
