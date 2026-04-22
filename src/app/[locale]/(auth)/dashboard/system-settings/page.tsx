import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { GeneralSettings } from "@/features/staff/system-settings/components/GeneralSettings";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

// _OLD: import { AddSettingHeader } from "@/features/staff/system-settings/components/AddSettingHeader";
import { ALTitleCard } from "@/components/ui/al-title-card";

const SystemSettingsContent = () => {
    const st = useTranslations("settings");
    const headerActions = undefined;
    // _OLD: const headerActions = <AddSettingHeader />;

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
            <ALTitleCard
                title={st("title")}
                description={st("description")}
                actions={headerActions}
                className="shrink-0"
            />
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
