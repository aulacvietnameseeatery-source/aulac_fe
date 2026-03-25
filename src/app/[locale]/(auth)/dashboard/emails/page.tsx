"use client";

import React, { useState } from "react";
import { TemplateList, TemplateDialog, EmailTemplate } from "@/features/staff/email-templates";
import { useTranslations } from "next-intl";

export default function EmailTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("view");
    const t = useTranslations("EmailTemplates");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreate = () => {
        setSelectedTemplate(null);
        setDialogMode("create");
        setIsDialogOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setDialogMode("edit");
        setIsDialogOpen(true);
    };

    const handleView = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setDialogMode("view");
        setIsDialogOpen(true);
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <TemplateList
                onEdit={handleEdit}
                onView={handleView}
                onCreate={handleCreate}
            />

            <TemplateDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                mode={dialogMode}
                template={selectedTemplate}
            />
        </div>
    );
}
