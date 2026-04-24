"use client";

import React, { useMemo } from "react";
import { EmailTemplate } from "../types";
import { useEmailTemplates } from "../hooks/use-email-templates";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { Button } from "@/components/ui/button";
import { Edit2, Mail, Plus, Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/ui/tooltip";
import { useDeleteEmailTemplate } from "../hooks/use-email-templates";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog/al-confirm-dialog";

interface TemplateListProps {
    onEdit: (template: EmailTemplate) => void;
    onView: (template: EmailTemplate) => void;
    onCreate: () => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onView, onCreate }) => {
    const t = useTranslations("EmailTemplates");
    const { data: templates, isLoading, refetch } = useEmailTemplates();
    const { mutate: deleteTemplate } = useDeleteEmailTemplate();

    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const columns: TableColumn[] = useMemo(() => [
        {
            field: "templateName",
            header: t("table.name"),
            width: "250px",
        },
        {
            field: "templateCode",
            header: t("table.code"),
            width: "200px",
            cellRender: ({ value }: { value: string }) => (
                <code className="text-[12px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono font-medium">
                    {value}
                </code>
            ),
        },
        {
            field: "subject",
            header: t("table.subject"),
            width: "400px",
            cellRender: ({ value }: { value: string }) => (
                <span className="text-muted-foreground truncate block max-w-[380px]">
                    {value}
                </span>
            ),
        },
    ], [t]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<EmailTemplate>
                data={templates || []}
                loading={isLoading}
                columns={columns}
                rowKey="templateId"
                onRefresh={refetch}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 20, 50]}
                renderTitle={() => (
                    <ALTitleCard
                        title={t("title")}
                        description={t("description")}
                        actions={
                            <Button
                                onClick={onCreate}
                                className="w-full gap-2 sm:w-auto bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90"
                            >
                                <Plus className="h-4 w-4" />
                                {t("actions.add")}
                            </Button>
                        }
                    />
                )}
                renderActionColumn={(item) => (
                    <div className="flex items-center gap-1">
                        <Tooltip content={t("actions.view")}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onView(item)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <Eye size={16} />
                            </Button>
                        </Tooltip>

                        <Tooltip content={t("actions.edit")}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(item)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <Edit2 size={16} />
                            </Button>
                        </Tooltip>

                        <Tooltip content={t("actions.delete")}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(item.templateId)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </Tooltip>
                    </div>
                )}
            />

            <ALConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                title={t("deleteDialog.title")}
                message={t("deleteDialog.description")}
                variant="delete"
                onConfirm={() => {
                    if (deleteId) {
                        deleteTemplate(deleteId);
                        setDeleteId(null);
                    }
                }}
            />
        </div>
    );
};
