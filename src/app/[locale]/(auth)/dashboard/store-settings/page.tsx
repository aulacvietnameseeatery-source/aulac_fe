'use client';
import React, { Suspense } from 'react';

import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { StoreProfileForm } from '@/features/staff/system-settings/components/StoreProfileForm';
import { IntroductionSettingsForm } from '@/features/staff/system-settings/components/IntroductionSettingsForm';
import { AboutUsSettingsForm } from '@/features/staff/system-settings/components/AboutUsSettingsForm';
import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";

const SystemSettingsContent = () => {
    const t = useTranslations('AdminSidebar');
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="mb-6 md:mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                    {t('storeSettings')}
                </h1>
                <p className="text-sm text-gray-500 tracking-wide">
                    {activeTab === 'profile' && t('storeProfile')}
                    {activeTab === 'introduction' && t('storeIntroduction')}
                    {activeTab === 'about' && t('storeAboutUs')}
                </p>
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full space-y-8 pb-20">
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
