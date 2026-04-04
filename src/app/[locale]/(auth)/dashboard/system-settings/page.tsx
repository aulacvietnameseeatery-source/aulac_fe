import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { GeneralSettings } from "@/features/staff/system-settings/components/GeneralSettings";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

import { AddSettingHeader } from "@/features/staff/system-settings/components/AddSettingHeader";
import { ALCard } from "@/components/ui/al-card";

const SystemSettingsContent = () => {
    const st = useTranslations("settings");
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
            <ALCard className="p-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {st("title")}
                        </h1>
                        <p className="text-sm text-gray-500">{st("description")}</p>
                    </div>
                    <AddSettingHeader />
                </div>
            </ALCard>
            <main className="mt-3 flex-1 min-h-0 w-full overflow-hidden">
                <GeneralSettings />
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
