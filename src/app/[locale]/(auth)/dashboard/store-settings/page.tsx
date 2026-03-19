'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { StoreProfileForm } from '@/features/staff/system-settings/components/StoreProfileForm';
import { IntroductionSettingsForm } from '@/features/staff/system-settings/components/IntroductionSettingsForm';
import { AboutUsSettingsForm } from '@/features/staff/system-settings/components/AboutUsSettingsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SystemSettingsContent = () => {
    const t = useTranslations('AdminSidebar');

    return (
        <div className="flex flex-col h-full overflow-auto">
            <header className="w-full space-y-6 mt-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {t('storeSettings')}
                    </h1>
                </div>
            </header>

            <main className="w-full pb-16 space-y-6 mt-6">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="mb-6 bg-white border border-gray-200">
                        <TabsTrigger value="profile">Store Profile</TabsTrigger>
                        <TabsTrigger value="introduction">Introduction Page</TabsTrigger>
                        <TabsTrigger value="about">About Us Page</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-0">
                        <StoreProfileForm />
                    </TabsContent>

                    <TabsContent value="introduction" className="mt-0">
                        <IntroductionSettingsForm />
                    </TabsContent>

                    <TabsContent value="about" className="mt-0">
                        <AboutUsSettingsForm />
                    </TabsContent>
                </Tabs>
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
