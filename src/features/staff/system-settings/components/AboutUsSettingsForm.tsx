"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Languages } from "lucide-react";
import { useAboutUsForm } from "../hooks/useAboutUsForm";
import { AboutUsFormValues, LOCALES, SupportedLocale, mapAboutUsSettingsToFormValues, mapFormValuesToAboutUsSettings } from "../types/schema";
import { getGroupSettings } from "../services/system-setting.service";
import { useUpdateStoreSettingsMutation, useTranslateSettingsMutation } from "../hooks/useSystemSettingsMutation";
import { ALCard } from "@/components/ui/al-card";
import { ALInput } from "@/components/ui/al-input";
import { cn } from "@/lib/utils";


export const AboutUsSettingsForm = () => {
    const t = useTranslations("settings");
    const [isLoading, setIsLoading] = useState(true);
    const [activeLocale, setActiveLocale] = useState<SupportedLocale>("en");

    const form = useAboutUsForm();
    const { register, handleSubmit, formState: { errors }, reset, getValues } = form;

    const translateMutation = useTranslateSettingsMutation();
    const updateMutation = useUpdateStoreSettingsMutation();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const settings = await getGroupSettings("store");
            const kv: Record<string, string> = {};
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                kv[key] = s.value?.toString() || '';
            });
            const formattedData = mapAboutUsSettingsToFormValues(kv);
            reset(formattedData);
        } catch (error) {
            console.error("Failed to load about us settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoTranslate = () => {
        const currentData = getValues();
        const activeI18n = currentData.i18n[activeLocale];

        const dataToTranslate = Object.entries(activeI18n).reduce((acc, [k, v]) => {
            if (v) acc[k] = v as string;
            return acc;
        }, {} as Record<string, string>);

        if (Object.keys(dataToTranslate).length === 0) {
            toast.warning(t('StoreProfile.nothingToTranslate'));
            return;
        }

        translateMutation.mutate({
            sourceLang: activeLocale,
            data: dataToTranslate
        }, {
            onSuccess: (data) => {
                const newValues = { ...currentData };
                Object.entries(data.translations).forEach(([lang, translations]) => {
                    const l = lang as SupportedLocale;
                    Object.entries(translations).forEach(([key, value]) => {
                        // @ts-expect-error: dynamic key access for translated values i18n
                        newValues.i18n[l][key] = value;
                    });
                });
                reset(newValues);
                toast.success(t('StoreProfile.translatedSuccessfully'));
            },
            onError: () => {
                toast.error(t('StoreProfile.translationFailed'));
            }
        });
    };

    const onSubmit = (values: AboutUsFormValues) => {
        const mappedSettings = mapFormValuesToAboutUsSettings(values);
        const items = Object.entries(mappedSettings).map(([key, value]) => ({
            key: `store.${key}`,
            settingName: `About Us - ${key}`,
            value: value,
            description: `About Us Page ${key}`,
        }));

        updateMutation.mutate({ items }, {
            onSuccess: () => {
                toast.success(t('StoreProfile.updateSuccess'));
                loadSettings();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.userMessage || t('StoreProfile.updateError'));
            }
        });
    };

    const onInvalid = (errors: any) => {
        console.error('Form Validation errors:', errors);
        toast.error(t('Common.invalidForm'));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6 w-full pb-12 relative">
            <div className="py-4 -mx-4 px-4">
                <ALCard variant="glass" elevation="sm" padding="sm" radius="xl" className="flex items-center justify-between gap-4 border-amber-200/30 shadow-md">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-inner">
                            {LOCALES.map((loc) => (
                                <Button
                                    key={loc}
                                    type="button"
                                    variant={activeLocale === loc ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "px-3 sm:px-5 py-1.5 h-8 text-[10px] sm:text-xs font-bold uppercase transition-all duration-300 rounded-lg",
                                        activeLocale === loc
                                            ? "bg-white shadow-md text-[#1A3A52] hover:bg-white/50"
                                            : "text-gray-500 hover:text-[#1A3A52] hover:bg-white/40"
                                    )}
                                    onClick={() => setActiveLocale(loc)}
                                >
                                    {loc}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold px-4 transition-all"
                            onClick={handleAutoTranslate}
                            isLoading={translateMutation.isPending}
                        >
                            <Languages className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('Common.autoTranslate')}</span>
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 gap-2 bg-[#1E3C52] hover:bg-[#12283A] text-white shadow-lg shadow-blue-900/20 font-semibold px-4 transition-all"
                            isLoading={updateMutation.isPending}
                        >
                            <Save className="w-4 h-4" />
                            {t("Common.saveChanges")}
                        </Button>
                    </div>
                </ALCard>
            </div>

            <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="slide-up">


                <div className="p-6 md:p-8 space-y-8">

                    <ALInput
                        title={t('AboutUs.subtitleLabel')}
                        fieldVariant="textarea"
                        textareaRows={2}
                        placeholder="An Lạc không phải là nơi phô trương. Đó là nơi của sự bình yên."
                        wrapperClassName="bg-white/60 focus-within:bg-white focus-within:border-amber-200"
                        textareaClassName="resize-none leading-relaxed"
                        {...register(`i18n.${activeLocale}.about_subtitle` as const)}
                    />

                    <ALInput
                        title={`${t('AboutUs.paragraphLabel')} 1`}
                        fieldVariant="textarea"
                        textareaRows={4}
                        placeholder="An Lạc được dẫn dắt bởi..."
                        wrapperClassName="bg-white/60 focus-within:bg-white focus-within:border-amber-200"
                        textareaClassName="resize-none leading-relaxed"
                        {...register(`i18n.${activeLocale}.about_paragraph_1` as const)}
                    />

                    <ALInput
                        title={`${t('AboutUs.paragraphLabel')} 2`}
                        fieldVariant="textarea"
                        textareaRows={4}
                        placeholder="Tại An Lạc, chúng tôi..."
                        wrapperClassName="bg-white/60 focus-within:bg-white focus-within:border-amber-200"
                        textareaClassName="resize-none leading-relaxed"
                        {...register(`i18n.${activeLocale}.about_paragraph_2` as const)}
                    />

                    <ALInput
                        title={`${t('AboutUs.paragraphLabel')} 3`}
                        fieldVariant="textarea"
                        textareaRows={4}
                        placeholder="Các kỹ thuật quen thuộc..."
                        wrapperClassName="bg-white/60 focus-within:bg-white focus-within:border-amber-200"
                        textareaClassName="resize-none leading-relaxed"
                        {...register(`i18n.${activeLocale}.about_paragraph_3` as const)}
                    />

                    <ALInput
                        title={t('AboutUs.closingQuoteLabel')}
                        wrapperClassName="bg-white/60 focus-within:bg-white focus-within:border-amber-200 h-14"
                        placeholder="An Lạc là lời mời..."
                        {...register(`i18n.${activeLocale}.about_closing_quote` as const)}
                    />
                </div>
            </ALCard>
        </form>
    );
};
