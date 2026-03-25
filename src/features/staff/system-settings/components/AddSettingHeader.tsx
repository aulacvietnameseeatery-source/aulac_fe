"use client";
import React, { useState } from "react";
import { AddSettingModal } from "./AddSettingModal";
import { PermissionGuard } from "@/components/permission-guard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Permissions } from "@/types/const";

export const AddSettingHeader: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const t = useTranslations("settings");
    return (
        <>
            <PermissionGuard permission={Permissions.ManageSystemSettings}>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    variant="outline"
                    className="shadow-sm hover:shadow-md transition-all gap-2"
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                    {t('General.addNew')}
                </Button>
            </PermissionGuard>
            <AddSettingModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => setIsAddModalOpen(false)}
            />
        </>
    );
}
