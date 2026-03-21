"use client";

import React, { useEffect } from "react";
import { EmailTemplate, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from "../types";
import { useUpdateEmailTemplate, useCreateEmailTemplate } from "../hooks/use-email-templates";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, Eye, Code } from "lucide-react";
import {
    Dialog,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

const schema = zod.object({
    templateCode: zod.string().min(1, "Vui lòng nhập mã template"),
    templateName: zod.string().min(1, "Vui lòng nhập tên template"),
    subject: zod.string().min(1, "Vui lòng nhập tiêu đề email"),
    bodyHtml: zod.string().min(1, "Vui lòng nhập nội dung HTML"),
    description: zod.string().optional(),
});

interface TemplateDialogProps {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit" | "view";
    template?: EmailTemplate | null;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
    open,
    onClose,
    mode,
    template,
}) => {
    const t = useTranslations("EmailTemplates");
    const { mutate: update, isPending: isUpdating } = useUpdateEmailTemplate();
    const { mutate: create, isPending: isCreating } = useCreateEmailTemplate();

    const isPending = isUpdating || isCreating;
    const isViewOnly = mode === "view";

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: {
            templateCode: "",
            templateName: "",
            subject: "",
            bodyHtml: "",
            description: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (template) {
                reset({
                    templateCode: template.templateCode,
                    templateName: template.templateName,
                    subject: template.subject,
                    bodyHtml: template.bodyHtml,
                    description: template.description || "",
                });
            } else {
                reset({
                    templateCode: "",
                    templateName: "",
                    subject: "",
                    bodyHtml: "",
                    description: "",
                });
            }
        }
    }, [open, template, reset]);

    const templateName = watch("templateName");
    const bodyHtml = watch("bodyHtml");

    useEffect(() => {
        if (mode === "create" && templateName) {
            const code = templateName
                .normalize("NFD")
                // eslint-disable-next-line no-control-regex
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .trim()
                .replace(/\s+/g, "_")
                .toUpperCase();
            setValue("templateCode", code);
        }
    }, [templateName, mode, setValue]);

    const onSubmit = (data: any) => {
        if (mode === "edit" && template) {
            update(
                { id: template.templateId, data },
                {
                    onSuccess: () => onClose(),
                }
            );
        } else if (mode === "create") {
            create(data as CreateEmailTemplateRequest, {
                onSuccess: () => onClose(),
            });
        }
    };

    const getTitle = () => {
        const titleText = mode === "create"
            ? t("dialog.createTitle")
            : mode === "edit"
                ? t("dialog.editTitle")
                : t("dialog.viewTitle");

        return (
            <div className="flex flex-col gap-0.5 font-lexend">
                <span className="text-xl font-bold text-[#1A3A52] tracking-tight">{titleText}</span>
                {template?.templateName && (
                    <span className="text-xs text-muted-foreground font-normal">
                        {template.templateName}
                    </span>
                )}
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={getTitle()}
            width="600px"
            bodyOverflowY="hidden"
            footer={
                <div className="flex justify-end gap-3 w-full font-lexend">
                    <Button variant="outline" type="button" onClick={onClose} size="sm" className="px-6">
                        {t("dialog.close")}
                    </Button>
                    {!isViewOnly && (
                        <Button
                            disabled={isPending}
                            variant="default"
                            onClick={handleSubmit(onSubmit)}
                            size="sm"
                            className="min-w-[120px] px-6 bg-[#1A3A52] hover:bg-[#1A3A52]/90"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                            {mode === "create" ? t("dialog.create") : t("dialog.save")}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6 font-lexend p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A3A52]/80 uppercase tracking-wider">{t("dialog.code")}</label>
                        <Input
                            {...register("templateCode")}
                            readOnly
                            placeholder={t("dialog.codePlaceholder")}
                            className="h-10 border-[#D5BA98]/40 focus:border-[#D5BA98] focus:ring-0 transition-all bg-[#FDFBF9] cursor-not-allowed text-[#1A3A52]/60"
                        />
                        {errors.templateCode && <p className="text-destructive text-[11px]">{(errors.templateCode as any).message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A3A52]/80 uppercase tracking-wider">{t("dialog.name")}</label>
                        <Input
                            {...register("templateName")}
                            disabled={isViewOnly || isPending}
                            placeholder={t("dialog.namePlaceholder")}
                            className="h-10 border-[#D5BA98]/40 focus:border-[#D5BA98] focus:ring-0 transition-all bg-[#FDFBF9]"
                        />
                        {errors.templateName && <p className="text-destructive text-[11px]">{(errors.templateName as any).message}</p>}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-[#1A3A52]/80 uppercase tracking-wider">{t("dialog.subject")}</label>
                        <Input
                            {...register("subject")}
                            disabled={isViewOnly || isPending}
                            placeholder={t("dialog.subjectPlaceholder")}
                            className="h-10 border-[#D5BA98]/40 focus:border-[#D5BA98] focus:ring-0 transition-all bg-[#FDFBF9]"
                        />
                        {errors.subject && <p className="text-destructive text-[11px]">{(errors.subject as any).message}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A3A52]/80 uppercase tracking-wider">{t("dialog.description")}</label>
                    <Input
                        {...register("description")}
                        disabled={isViewOnly || isPending}
                        placeholder={t("dialog.descriptionPlaceholder")}
                        className="h-10 border-[#D5BA98]/40 focus:border-[#D5BA98] focus:ring-0 transition-all bg-[#FDFBF9]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70">{t("dialog.body")}</label>
                    <Tabs defaultValue="editor" className="w-full">
                        <TabsList className="bg-[#D5BA98]/10 p-1 border border-[#D5BA98]/30 mb-3 h-auto">
                            <TabsTrigger value="editor" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9] py-1 text-xs">
                                <Code size={12} className="mr-1.5" /> {t("dialog.tabEditor")}
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9] py-1 text-xs">
                                <Eye size={12} className="mr-1.5" /> {t("dialog.tabPreview")}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="editor" className="mt-0">
                            <textarea
                                {...register("bodyHtml")}
                                disabled={isViewOnly || isPending}
                                className="w-full h-[300px] bg-[#FDFBF9] border border-[#D5BA98]/40 rounded-lg p-4 font-mono text-[13px] text-[#1A3A52] focus:outline-none focus:border-[#D5BA98] transition-all resize-none shadow-inner scrollbar-thin scrollbar-thumb-[#D5BA98]/40"
                                placeholder={t("dialog.bodyPlaceholder")}
                            />
                            {errors.bodyHtml && <p className="text-destructive text-[11px] mt-1">{(errors.bodyHtml as any).message}</p>}
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                            <div className="w-full h-[300px] bg-white border border-[#D5BA98]/40 rounded-lg overflow-hidden shadow-sm">
                                <iframe
                                    title="Preview"
                                    className="w-full h-full border-none"
                                    srcDoc={bodyHtml}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Dialog>
    );
};
