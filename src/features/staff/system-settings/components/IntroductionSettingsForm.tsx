import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Trash2, ImagePlus, UploadCloud, Eye, Languages, Globe, Building2, UserCircle, PlayCircle, Camera, Sparkles, History, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, updateGroupSettings, uploadFile, translateSystemSettings } from "../services/system-setting.service";
import { BulkUpdateSettingItemDto } from "../types/system-setting.types";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/http";
import { MediaPreviewModal } from "@/components/shared/MediaPreviewModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DishSelectionModal } from './DishSelectionModal';
import { DishDetailResponse } from '../../view-dish-detail/types/dish-detail.types';


const LOCALES = ["en", "vi", "fr"];

const TEXT_KEYS = [
    "intro.hero.title", "intro.hero.quote",
    "intro.virtualTour.label", "intro.virtualTour.title", "intro.virtualTour.desc",
    "intro.collection.label", "intro.collection.title",
    ...[1, 2, 3].flatMap(i => [
        `intro.collection.dish${i}.mainTitle`,
        `intro.collection.dish${i}.cardCategory`,
        `intro.collection.dish${i}.cardTitle`,
    ])
];

const MEDIA_KEYS = [
    "intro.hero.image",
    "intro.virtualTour.videoUrl",
    "intro.collection.dish1.image",
    "intro.collection.dish2.image",
    "intro.collection.dish3.image",
];

const getInitialData = () => {
    const data: Record<string, string> = {};
    TEXT_KEYS.forEach(k => LOCALES.forEach(l => data[`${k}_${l}`] = ""));
    MEDIA_KEYS.forEach(k => data[k] = "");
    return data;
};

export const IntroductionSettingsForm = () => {
    const t = useTranslations("SystemSettings");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState("en");

    const [formData, setFormData] = useState(getInitialData());
    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [selectingDishIndex, setSelectingDishIndex] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<{ url: string; title: string, type: 'image' | 'video' } | null>(null);

    const handleDishSelect = (dish: DishDetailResponse, index: number) => {
        console.log("Selected dish:", dish, "for index:", index);
        const baseKey = `intro.collection.dish${index}`;
        const primaryImage = dish.media.find(m => m.isPrimary && m.mediaType === 'IMAGE')?.url || dish.media.find(m => m.mediaType === 'IMAGE')?.url || "";

        setFormData(prev => {
            const next = { ...prev };
            LOCALES.forEach(lang => {
                type Lang = 'en' | 'vi' | 'fr';
                const l = lang as Lang;
                const dish_i18n = dish.i18n;
                const dishInfo = dish_i18n[l];
                const categoryNames = dish.categoryName;
                const category = categoryNames[l];

                next[`${baseKey}.image`] = primaryImage;
                next[`${baseKey}.cardTitle_${lang}`] = dishInfo?.dishName || "";
                next[`${baseKey}.cardCategory_${lang}`] = category || "";
                next[`${baseKey}.mainTitle_${lang}`] = dishInfo?.dishName || "";
            });
            return next;
        });
        setIsDishModalOpen(false);
        setSelectingDishIndex(null);
    };
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

    // --- Translation Mutation ---
    const translateMutation = useMutation({
        mutationFn: translateSystemSettings,
        onSuccess: (data) => {
            setFormData((prev) => {
                const newData = { ...prev };
                Object.entries(data.translations).forEach(([lang, translations]) => {
                    Object.entries(translations).forEach(([key, value]) => {
                        newData[`${key}_${lang}`] = value;
                    });
                });
                return newData;
            });
            toast.success("Translated successfully!");
        },
        onError: () => {
            toast.error("Translation failed.");
        }
    });

    const handleAutoTranslate = () => {
        const dataToTranslate: Record<string, string> = {};
        TEXT_KEYS.forEach(key => {
            const val = formData[`${key}_${activeLocale}`];
            if (val) dataToTranslate[key] = val;
        });

        if (Object.keys(dataToTranslate).length === 0) {
            toast.warning("Nothing to translate.");
            return;
        }

        translateMutation.mutate({
            sourceLang: activeLocale,
            data: dataToTranslate
        });
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const settings = await getGroupSettings("store");
            const data: Record<string, string> = getInitialData();
            settings.forEach((s) => {
                const key = s.settingKey.replace("store.", "");
                if (key in data || TEXT_KEYS.some(tk => key.startsWith(tk))) {
                    data[key] = s.value?.toString() || "";
                }
            });
            setFormData(data);
        } catch (error) {
            console.error("Failed to load intro settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string, isMedia = false) => {
        const key = isMedia ? field : `${field}_${activeLocale}`;
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const getValue = (field: string, isMedia = false) => {
        const key = isMedia ? field : `${field}_${activeLocale}`;
        return formData[key] || "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, isVideo = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(t("StoreProfile.fileSizeError") || `File too large (max ${isVideo ? '100MB' : '5MB'})`);
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldKey]: localUrl }));

        setIsUploading(fieldKey);
        try {
            const publicUrl = await uploadFile(file);
            handleChange(fieldKey, publicUrl, true);
            toast.success(t("StoreProfile.uploadSuccess"));
        } catch (error) {
            toast.error(t("StoreProfile.uploadError"));
            if (!getValue(fieldKey, true)) {
                setLocalPreviews(prev => { delete prev[fieldKey]; return { ...prev }; });
            }
        } finally {
            setIsUploading(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const items: BulkUpdateSettingItemDto[] = Object.entries(formData)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => ({
                    key: `store.${key}`,
                    settingName: `Introduction - ${key}`,
                    value: value as string,
                    description: `Introduction Page ${key}`,
                }));

            await updateGroupSettings("store", { items });
            toast.success(t("StoreProfile.updateSuccess"));
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || t("StoreProfile.updateError"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const MediaUploadUI = ({ fieldKey, title, isVideo = false, compact = false }: { fieldKey: string, title?: string, isVideo?: boolean, compact?: boolean }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const url = getValue(fieldKey, true);
        const previewUrl = localPreviews[fieldKey];
        const fullUrl = previewUrl || (url ? ((url.startsWith('http')) ? url : `${BASE_URL}${url}`) : '');

        return (
            <div className="flex flex-col space-y-2">
                {title && <label className="text-sm font-medium leading-none mb-1">{title}</label>}
                <div className="flex flex-col gap-3 mt-1">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed transition-all cursor-pointer hover:border-primary/50",
                            (isVideo || fieldKey.includes('hero')) ? "w-72 aspect-video" : "w-24 aspect-square",
                            compact && !isVideo && "w-16 aspect-square",
                            fullUrl && "border-solid shadow-sm"
                        )}
                        onClick={() => {
                            if (fullUrl) setPreviewData({ url: fullUrl, title: title || "Preview", type: isVideo ? 'video' : 'image' });
                            else inputRef.current?.click();
                        }}
                    >
                        {fullUrl ? (
                            isVideo ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                    <video src={fullUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    <PlayCircle className="w-4 h-4 text-white z-10" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                        <Eye className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img src={fullUrl} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-4 h-4 text-white" />
                                    </div>
                                </>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                {isVideo ? <UploadCloud className="w-5 h-5" /> : <ImagePlus className="w-5 h-5" />}
                            </div>
                        )}
                        {isUploading === fieldKey && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className={cn("h-8 text-xs px-3", compact && "h-7 px-2 text-[10px]")}>
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                                {fullUrl ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {fullUrl && (
                                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleChange(fieldKey, "", true); }} className={cn("h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100", compact && "h-7 w-7")}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                        {!compact && (
                            <p className="text-[10px] text-muted-foreground truncate">
                                {isVideo ? "MP4 < 100MB" : "IMG < 5MB"}
                            </p>
                        )}
                    </div>
                    <input type="file" ref={inputRef} className="hidden" accept={isVideo ? "video/mp4,video/webm" : "image/*"} onChange={(e) => handleFileChange(e, fieldKey, isVideo)} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* --- HEADER ACTIONS --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {LOCALES.map((loc) => (
                            <Button
                                key={loc}
                                variant={activeLocale === loc ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "px-4 py-1.5 h-8 text-xs font-medium uppercase transition-all duration-200",
                                    activeLocale === loc && "bg-white shadow-sm text-blue-600"
                                )}
                                onClick={() => setActiveLocale(loc)}
                            >
                                {loc}
                            </Button>
                        ))}
                    </div>

                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold px-4 transition-all" onClick={handleAutoTranslate} disabled={translateMutation.isPending}>
                        {translateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('Common.autoTranslate')}</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-2 bg-[#1E3C52] hover:bg-[#12283A] text-white shadow-md shadow-blue-900/10"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t("Common.saveChanges") || "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* --- FORM COLUMN --- */}
                <div className="space-y-8 min-w-0">
                    <div className="space-y-6 animate-in fade-in duration-500">

                        <div className="grid grid-cols-1 gap-6 items-start">
                            <div className="flex flex-col gap-6">

                                {/* --- HERO SECTION --- */}
                                <div className="p-10 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-8">
                                        <div className="pb-4 border-b border-slate-100">
                                            <div className="mb-1">
                                                <h3 className="text-xl font-bold text-slate-800">{t('Introduction.sections.hero.title')}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{t('Introduction.sections.hero.description')}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                            <div className="md:col-span-8 space-y-6">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.hero.mainTitle')}</label>
                                                        <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.hero.title")} onChange={(e) => handleChange("intro.hero.title", e.target.value)} placeholder={t('Introduction.sections.hero.placeholders.mainTitle')} />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.hero.brandQuote')}</label>
                                                        <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.hero.quote")} onChange={(e) => handleChange("intro.hero.quote", e.target.value)} placeholder={t('Introduction.sections.hero.placeholders.brandQuote')} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:col-span-4 border-l border-slate-100 md:pl-8 pt-4 md:pt-0">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t('Introduction.sidebar.heroBackground')}</label>
                                                <MediaUploadUI fieldKey="intro.hero.image" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- AMBIANCE SECTION --- */}
                                <div className="p-10 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                    <div className="space-y-8">
                                        <div className="pb-4 border-b border-slate-100">
                                            <div className="mb-1">
                                                <h3 className="text-xl font-bold text-slate-800">{t('Introduction.sections.ambiance.title')}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{t('Introduction.sections.ambiance.description')}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                            <div className="md:col-span-8 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.ambiance.navLabel')}</label>
                                                        <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.virtualTour.label")} onChange={(e) => handleChange("intro.virtualTour.label", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.ambiance.sectionTitle')}</label>
                                                        <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.virtualTour.title")} onChange={(e) => handleChange("intro.virtualTour.title", e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.ambiance.summary')}</label>
                                                    <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.virtualTour.desc")} onChange={(e) => handleChange("intro.virtualTour.desc", e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="md:col-span-4 border-l border-slate-100 md:pl-8 pt-4 md:pt-0">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t('Introduction.sidebar.ambianceVideo')}</label>
                                                <MediaUploadUI fieldKey="intro.virtualTour.videoUrl" isVideo />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- COLLECTION SECTION --- */}
                                <div className="p-10 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-10">
                                        <div className="pb-4 border-b border-slate-100">
                                            <div className="mb-1">
                                                <h3 className="text-xl font-bold text-slate-800">{t('Introduction.sections.collection.title')}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{t('Introduction.sections.collection.description')}</p>
                                        </div>

                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-50">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.collection.galleryLabel')}</label>
                                                    <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.collection.label")} onChange={(e) => handleChange("intro.collection.label", e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Introduction.sections.collection.mainTitle')}</label>
                                                    <Input className="h-11 border-slate-200 bg-white/50" value={getValue("intro.collection.title")} onChange={(e) => handleChange("intro.collection.title", e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-12">
                                                {[1, 2, 3].map(i => {
                                                    const p = `intro.collection.dish${i}`;
                                                    return (
                                                        <div key={p} className="p-6 md:p-8 rounded-2xl border bg-slate-50/30 flex flex-col md:flex-row gap-8 relative group border-dashed hover:border-primary/20 transition-all duration-300">
                                                            <div className="flex-shrink-0">
                                                                <MediaUploadUI
                                                                    fieldKey={`${p}.image`}
                                                                    title={t('Introduction.sidebar.dishImage', { index: i })}
                                                                    compact
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full mt-2 h-7 text-[10px] gap-1.5 border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/5 transition-all"
                                                                    onClick={() => {
                                                                        setSelectingDishIndex(i);
                                                                        setIsDishModalOpen(true);
                                                                    }}
                                                                >
                                                                    {t('Common.selectFromMenu') || "Select from Menu"}
                                                                </Button>
                                                            </div>
                                                            <div className="flex-1 space-y-6">
                                                                <div className="space-y-2">
                                                                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{t('Introduction.sections.collection.dishMainTitle')}</label>
                                                                    <Input className="h-12 text-lg font-bold border-slate-200 focus:border-primary focus:ring-primary/10 transition-all bg-white" value={getValue(`${p}.mainTitle`)} onChange={(e) => handleChange(`${p}.mainTitle`, e.target.value)} />
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{t('Introduction.sections.collection.cardTitle')}</label>
                                                                        <Input className="h-11 text-sm border-slate-200 focus:border-primary/30 bg-white" value={getValue(`${p}.cardTitle`)} onChange={(e) => handleChange(`${p}.cardTitle`, e.target.value)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{t('Introduction.sections.collection.cardCategory')}</label>
                                                                        <Input className="h-11 text-sm border-slate-200 focus:border-primary/30 bg-white" value={getValue(`${p}.cardCategory`)} onChange={(e) => handleChange(`${p}.cardCategory`, e.target.value)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MediaPreviewModal
                isOpen={!!previewData}
                onClose={() => setPreviewData(null)}
                url={previewData?.url || ""}
                title={previewData?.title || "Preview"}
                type={previewData?.type || 'image'}
            />

            <DishSelectionModal
                isOpen={isDishModalOpen}
                onClose={() => setIsDishModalOpen(false)}
                onSelect={(dish) => selectingDishIndex !== null && handleDishSelect(dish, selectingDishIndex)}
                targetLocale={activeLocale}
            />
        </div>
    );
};
