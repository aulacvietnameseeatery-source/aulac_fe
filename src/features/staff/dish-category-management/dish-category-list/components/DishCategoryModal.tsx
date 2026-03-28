"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

import type { DishCategory } from "../types";

const LANGUAGES = ["en", "vi", "fr"] as const;
type Language = typeof LANGUAGES[number];

interface DishCategoryModalProps {
    isOpen: boolean;
    mode: "add" | "edit";
    category?: DishCategory | null;
    onClose: () => void;
    onSubmit: (data: SaveCategoryRequest) => void;
    isSubmitting?: boolean;
}

export interface CategoryI18nContent {
    name: string;
    description: string;
}

export interface SaveCategoryRequest {
    i18n: Record<Language, CategoryI18nContent>;
    isDisabled: boolean;
}

type I18nFormData = Record<Language, CategoryI18nContent>;
type I18nErrors = Partial<Record<Language, { name?: string; description?: string }>>;

const makeEmptyLang = (): CategoryI18nContent => ({ name: "", description: "" });

const initialI18n: I18nFormData = { en: makeEmptyLang(), vi: makeEmptyLang(), fr: makeEmptyLang() };

const LANG_LABELS: Record<Language, string> = {
    en: "EN",
    vi: "VI",
    fr: "FR",
};

const DishCategoryModal: React.FC<DishCategoryModalProps> = ({
    isOpen,
    mode,
    category,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const t = useTranslations("DishCategory");
    const [activeTab, setActiveTab] = useState<Language>("en");
    const [i18n, setI18n] = useState<I18nFormData>(initialI18n);
    const [isDisabled, setIsDisabled] = useState(false);
    const [errors, setErrors] = useState<I18nErrors>({});

    useEffect(() => {
        if (mode === "edit" && category) {
            setI18n({
                en: {
                    name: category.nameI18n?.en ?? category.categoryName,
                    description: category.descriptionI18n?.en ?? category.description ?? "",
                },
                vi: {
                    name: category.nameI18n?.vi ?? category.categoryName,
                    description: category.descriptionI18n?.vi ?? category.description ?? "",
                },
                fr: {
                    name: category.nameI18n?.fr ?? category.categoryName,
                    description: category.descriptionI18n?.fr ?? category.description ?? "",
                },
            });
            setIsDisabled(category.isDisabled);
        } else {
            setI18n(initialI18n);
            setIsDisabled(false);
        }
        setErrors({});
        setActiveTab("en");
    }, [mode, category, isOpen]);

    const handleLangChange = (lang: Language, field: keyof CategoryI18nContent, value: string) => {
        setI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
        if (errors[lang]?.[field]) {
            setErrors((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], [field]: undefined },
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: I18nErrors = {};

        for (const lang of LANGUAGES) {
            if (!i18n[lang].name.trim()) {
                newErrors[lang] = { ...newErrors[lang], name: t("Add.validation.nameRequired") };
            } else if (i18n[lang].name.length > 100) {
                newErrors[lang] = { ...newErrors[lang], name: t("Add.validation.nameMaxLength") };
            }

            if (i18n[lang].description.length > 100) {
                newErrors[lang] = { ...newErrors[lang], description: t("Add.validation.descriptionMaxLength") };
            }
        }

        setErrors(newErrors);

        const hasErrors = Object.keys(newErrors).length > 0;
        if (hasErrors) {
            // Switch to first tab with an error
            const firstErrorLang = LANGUAGES.find((l) => newErrors[l]);
            if (firstErrorLang) setActiveTab(firstErrorLang);
        }
        return !hasErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData: SaveCategoryRequest = {
            i18n: {
                en: { name: i18n.en.name.trim(), description: i18n.en.description.trim() },
                vi: { name: i18n.vi.name.trim(), description: i18n.vi.description.trim() },
                fr: { name: i18n.fr.name.trim(), description: i18n.fr.description.trim() },
            },
            isDisabled,
        };

        onSubmit(submitData);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={mode === "add" ? t("Add.title") : t("Edit.title")}
            width="640px"
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {t("List.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="category-form"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {mode === "add" ? t("Add.saveButton") : t("Edit.saveButton")}
                    </Button>
                </div>
            }
        >
            <form id="category-form" onSubmit={handleSubmit}>
                <div className="space-y-5 p-5">
                    {/* Language Tabs */}
                    <div className="flex border-b border-gray-200">
                        {LANGUAGES.map((lang) => {
                            const hasError = !!errors[lang];
                            return (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveTab(lang)}
                                    className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === lang
                                            ? "border-primary text-primary"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                    } ${hasError ? "text-red-500" : ""}`}
                                >
                                    {LANG_LABELS[lang]}
                                    {hasError && <span className="ml-1 text-red-500">•</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Per-language fields */}
                    {LANGUAGES.map((lang) => (
                        <div key={lang} className={lang === activeTab ? "space-y-4" : "hidden"}>
                            {/* Name */}
                            <ALInput
                                title={t("Add.categoryName")}
                                required
                                placeholder={t("Add.categoryNamePlaceholder")}
                                value={i18n[lang].name}
                                onChange={(e) => handleLangChange(lang, "name", e.target.value)}
                                error={errors[lang]?.name}
                            />

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t("Add.description")}
                                </label>
                                <textarea
                                    className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors[lang]?.description ? "border-red-500" : "border-gray-300"
                                    }`}
                                    rows={3}
                                    placeholder={t("Add.descriptionPlaceholder")}
                                    value={i18n[lang].description}
                                    onChange={(e) => handleLangChange(lang, "description", e.target.value)}
                                    disabled={isSubmitting}
                                />
                                {errors[lang]?.description && (
                                    <p className="text-xs text-red-500">{errors[lang]?.description}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Status Toggle (edit mode only) */}
                    {mode === "edit" && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900">
                                    {t("Edit.status")}
                                </h5>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {t("Edit.statusDescription")}
                                </p>
                            </div>
                            <Switch
                                checked={!isDisabled}
                                onChange={(checked) => setIsDisabled(!checked)}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </div>
            </form>
        </Dialog>
    );
};

export default DishCategoryModal;

