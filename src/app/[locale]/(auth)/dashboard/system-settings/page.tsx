import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { GeneralSettings } from "@/features/staff/system-settings/components/GeneralSettings";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

const SystemSettingsContent = () => {
    const t = useTranslations("AdminSidebar");
    const st = useTranslations("SystemSettings");

    return (
        <div className="flex flex-col h-full bg-gray-50/50 overflow-auto p-6 pb-10">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {st("title")}
                </h1>
                <p className="text-sm text-gray-500">{st("description")}</p>
            </div>

            <GeneralSettings />
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
