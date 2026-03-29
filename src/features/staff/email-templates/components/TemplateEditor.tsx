"use client";

import React, { useEffect } from "react";
import { EmailTemplate, UpdateEmailTemplateRequest } from "../types";
import { useUpdateEmailTemplate } from "../hooks/use-email-templates";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, Eye, Code } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

const schema = zod.object({
    templateName: zod.string().min(1, "Vui lòng nhập tên template"),
    subject: zod.string().min(1, "Vui lòng nhập tiêu đề email"),
    bodyHtml: zod.string().min(1, "Vui lòng nhập nội dung HTML"),
    description: zod.string().optional(),
});

interface TemplateEditorProps {
    template: EmailTemplate;
    onCancel: () => void;
    onSuccess: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onCancel, onSuccess }) => {
    const t = useTranslations("EmailTemplates");
    const { mutate: update, isPending } = useUpdateEmailTemplate();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<UpdateEmailTemplateRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            templateName: template.templateName,
            subject: template.subject,
            bodyHtml: template.bodyHtml,
            description: template.description,
        },
    });

    useEffect(() => {
        reset({
            templateName: template.templateName,
            subject: template.subject,
            bodyHtml: template.bodyHtml,
            description: template.description || "",
        });
    }, [template, reset]);

    const bodyHtml = watch("bodyHtml");

    const onSubmit = (data: UpdateEmailTemplateRequest) => {
        update({ id: template.templateId, data }, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Code className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold font-lexend">
                        {t("dialog.editTitle")}: {template.templateName}
                    </CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <X size={18} />
                </Button>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 pt-2 font-lexend">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/70">{t("dialog.name")}</label>
                            <Input
                                {...register("templateName")}
                                placeholder={t("dialog.namePlaceholder")}
                                className="border-border focus:ring-primary"
                            />
                            {errors.templateName && <p className="text-destructive text-xs mt-1">{errors.templateName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/70">{t("dialog.subject")}</label>
                            <Input
                                {...register("subject")}
                                placeholder={t("dialog.subjectPlaceholder")}
                                className="border-border focus:ring-primary"
                            />
                            {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/70">{t("dialog.description")}</label>
                        <Input
                            {...register("description")}
                            placeholder={t("dialog.descriptionPlaceholder")}
                            className="border-border focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/70">{t("dialog.body")}</label>
                        <Tabs defaultValue="editor" className="w-full">
                            <TabsList className="bg-muted/50 border border-border mb-4">
                                <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Code size={14} className="mr-2" /> {t("dialog.tabEditor")}
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Eye size={14} className="mr-2" /> {t("dialog.tabPreview")}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="editor" className="mt-0">
                                <textarea
                                    {...register("bodyHtml")}
                                    className="w-full h-96 bg-white border border-border rounded-md p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none shadow-sm"
                                    placeholder={t("dialog.bodyPlaceholder")}
                                />
                                {errors.bodyHtml && <p className="text-destructive text-xs mt-1">{errors.bodyHtml.message}</p>}
                                <p className="text-muted-foreground text-[11px] mt-2 italic">
                                    {t("dialog.placeholderHint")}
                                </p>
                            </TabsContent>

                            <TabsContent value="preview" className="mt-0">
                                <div className="w-full h-96 bg-white border border-border rounded-md overflow-hidden shadow-sm">
                                    <iframe
                                        title="Preview"
                                        className="w-full h-full border-none"
                                        srcDoc={bodyHtml}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3 border-t pt-4 font-lexend">
                    <Button variant="outline" type="button" onClick={onCancel} size="sm">
                        {t("dialog.close")}
                    </Button>
                    <Button
                        disabled={isPending}
                        variant="default"
                        size="sm"
                        className="min-w-[120px]"
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                        {t("dialog.save")}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};
