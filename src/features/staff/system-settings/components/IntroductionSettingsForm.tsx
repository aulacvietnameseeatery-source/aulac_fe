import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Languages, UtensilsCrossed, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, uploadFile } from "../services/system-setting.service";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/http";
import { MediaPreviewModal } from "@/components/shared/MediaPreviewModal";
import { DishSelectionModal } from './DishSelectionModal';
import { DishDetailResponse } from '../../view-dish-detail/types/dish-detail.types';
import { ALCard } from "@/components/ui/al-card";
import { ALInput } from "@/components/ui/al-input";
import { useIntroductionSettingsForm } from "../hooks/useIntroductionSettingsForm";
import { mapIntroSettingsToFormValues, mapFormValuesToIntroSettings, LOCALES, SupportedLocale, IntroFormValues } from "../types/schema";
import { useUpdateStoreSettingsMutation, useTranslateSettingsMutation } from "../hooks/useSystemSettingsMutation";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    (props, ref) => (
        <textarea
            ref={ref}
            className="flex min-h-[80px] w-full rounded-xl border border-amber-200/40 bg-white/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1A3A52] focus-visible:border-[#1A3A52] disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        />
    )
);
Textarea.displayName = "Textarea";

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp';
const VIDEO_ACCEPT = 'video/mp4,.mp4';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 15;

const normalizeMediaUrl = (value: string): string => {
    if (!value) return '';
    if (/^(https?:|blob:|data:)/i.test(value)) return value;

    const base = BASE_URL.replace(/\/+$/, '');
    const normalized = value.replace(/\\/g, '/').trim();

    if (normalized.startsWith('/uploads/')) {
        return `${base}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
        return `${base}/${normalized}`;
    }

    const relative = normalized.replace(/^\/+/, '');
    return `${base}/uploads/${relative}`;
};

export const IntroductionSettingsForm = () => {
    const t = useTranslations("settings");
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState<SupportedLocale>("en");

    const form = useIntroductionSettingsForm();
    const { register, handleSubmit, reset, setValue, watch, getValues } = form;

    const translateMutation = useTranslateSettingsMutation();
    const updateMutation = useUpdateStoreSettingsMutation();

    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [selectingDishIndex, setSelectingDishIndex] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<{ url: string; title: string, type: 'image' | 'video' } | null>(null);
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

    const heroImageRef = useRef<HTMLInputElement>(null);
    const virtualTourVideoRef = useRef<HTMLInputElement>(null);
    const dish1ImageRef = useRef<HTMLInputElement>(null);
    const dish2ImageRef = useRef<HTMLInputElement>(null);
    const dish3ImageRef = useRef<HTMLInputElement>(null);

    const heroImageUrl = watch('intro_hero_image') as string;
    const tourVideoUrl = watch('intro_virtualTour_videoUrl') as string;
    const dish1ImageUrl = watch('intro_collection_dish1_image') as string;
    const dish2ImageUrl = watch('intro_collection_dish2_image') as string;
    const dish3ImageUrl = watch('intro_collection_dish3_image') as string;

    const handleDishSelect = (dish: DishDetailResponse, index: number) => {
        const baseKey = `intro_collection_dish${index}` as const;
        const primaryImage = dish.media.find(m => m.isPrimary && m.mediaType === 'IMAGE')?.url || dish.media.find(m => m.mediaType === 'IMAGE')?.url || "";

        // @ts-expect-error: dynamic key access from featured dish selection
        setValue(`${baseKey}_image`, primaryImage, { shouldDirty: true });

        LOCALES.forEach(lang => {
            const l = lang;
            const dishInfo = dish.i18n[l];
            const category = dish.categoryName[l];
            // @ts-expect-error: dynamic key access from featured dish selection i18n
            setValue(`i18n.${l}.${baseKey}_cardTitle`, dishInfo?.dishName || "", { shouldDirty: true });
            // @ts-expect-error: dynamic key access from featured dish selection i18n
            setValue(`i18n.${l}.${baseKey}_cardCategory`, category || "", { shouldDirty: true });
            // @ts-expect-error: dynamic key access from featured dish selection i18n
            setValue(`i18n.${l}.${baseKey}_mainTitle`, dishInfo?.dishName || "", { shouldDirty: true });
        });

        setIsDishModalOpen(false);
        setSelectingDishIndex(null);
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

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const settings = await getGroupSettings("store");
            const kv: Record<string, string> = {};
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                kv[key] = s.value?.toString() || '';
            });
            const formattedData = mapIntroSettingsToFormValues(kv);
            reset(formattedData);
        } catch (error) {
            console.error("Failed to load intro settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const checkVideoDuration = (file: File, maxSeconds: number): Promise<boolean> => {
        return new Promise((resolve) => {
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';

            videoElement.onloadedmetadata = () => {
                window.URL.revokeObjectURL(videoElement.src);
                resolve(videoElement.duration <= maxSeconds);
            };

            videoElement.onerror = () => {
                resolve(false);
            };

            videoElement.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, isVideo = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (isVideo && file.type !== 'video/mp4') {
            toast.error(t('StoreProfile.invalidVideoFormatError'));
            if (e.target) e.target.value = '';
            return;
        }

        if (!isVideo && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error(t('StoreProfile.invalidImageFormatError'));
            if (e.target) e.target.value = '';
            return;
        }

        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            toast.error(isVideo ? t('StoreProfile.videoSizeError') : t('StoreProfile.fileSizeError'));
            if (e.target) e.target.value = '';
            return;
        }

        if (isVideo) {
            const isValidDuration = await checkVideoDuration(file, MAX_VIDEO_DURATION_SECONDS);
            if (!isValidDuration) {
                toast.error(t('StoreProfile.videoDurationError'));
                if (e.target) e.target.value = '';
                return;
            }
        }

        const previousValue = getValues(fieldKey as any);
        const previousLocalPreview = localPreviews[fieldKey];
        if (previousLocalPreview) {
            URL.revokeObjectURL(previousLocalPreview);
        }

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldKey]: localUrl }));
        setIsUploading(fieldKey);

        try {
            const relativePath = await uploadFile(file);
            // @ts-expect-error: dynamic key access for uploaded file fieldKey
            setValue(fieldKey, relativePath, { shouldDirty: true, shouldValidate: true });
            toast.success(t("StoreProfile.uploadSuccess"));
        } catch (error) {
            toast.error(t("StoreProfile.uploadError"));
            if (!previousValue) {
                setLocalPreviews(prev => {
                    const next = { ...prev };
                    delete next[fieldKey];
                    return next;
                });
            } else {
                setLocalPreviews(prev => {
                    if (previousLocalPreview) {
                        return { ...prev, [fieldKey]: previousLocalPreview };
                    }

                    const next = { ...prev };
                    delete next[fieldKey];
                    return next;
                });
            }
        } finally {
            setIsUploading(null);
            if (e.target) e.target.value = '';
        }
    };

    const onSubmit = (values: IntroFormValues) => {
        const mappedSettings = mapFormValuesToIntroSettings(values);
        const items = Object.entries(mappedSettings).map(([key, value]) => ({
            key: `store.${key}`,
            settingName: `Introduction - ${key}`,
            value: value,
            description: `Introduction Page ${key}`,
        }));

        updateMutation.mutate({ items }, {
            onSuccess: () => {
                toast.success(t('StoreProfile.updateSuccess'));
                setLocalPreviews({}); // Clear local blobs after successful save
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

    const getFullUrl = (fieldKey: string, watchedVal: string) => {
        const previewUrl = localPreviews[fieldKey];
        if (previewUrl) return previewUrl;
        if (!watchedVal) return '';
        return normalizeMediaUrl(watchedVal);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6 w-full pb-12">
            {/* --- HEADER ACTIONS --- */}
            <ALCard variant="glass" elevation="sm" padding="md" radius="xl" className="flex flex-wrap items-center justify-between gap-4 border-amber-200/30">
                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        {LOCALES.map((loc) => (
                            <Button
                                key={loc}
                                type="button"
                                variant={activeLocale === loc ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "px-4 py-1.5 h-8 text-xs font-bold uppercase transition-all duration-200 rounded-md",
                                    activeLocale === loc
                                        ? "bg-white shadow-sm text-blue-600 hover:bg-white hover:text-blue-600"
                                        : "text-gray-500 hover:text-blue-600 hover:bg-white/50"
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

            <div className="grid grid-cols-1 gap-8 pb-6">

                {/* HERO SECTION */}
                <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="slide-up">
                    <div className="p-6 md:p-8 border-b border-[#D5BA98]/20 bg-[#FDFBF9]">
                        <h2 className="text-xl font-bold text-[#1A3A52] tracking-tight mb-2">{t('Introduction.heroSection')}</h2>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <ALInput title={t('Introduction.heroTitle')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_hero_title` as const)} />
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-[#1A3A52]">{t('Introduction.heroQuote')}</label>
                            <Textarea {...register(`i18n.${activeLocale}.intro_hero_quote` as const)} />
                        </div>

                        <div className="space-y-4 mt-6">
                            <label className="font-[Inter] text-xs font-bold text-[#1A3A52]/50 uppercase tracking-widest block">{t('Introduction.heroImage')}</label>
                            <div className="space-y-4">
                                <div className="relative group w-fit">
                                    <div
                                        className={cn(
                                            "w-48 h-24 rounded-2xl border-2 border-dashed border-amber-200/60 bg-white/40 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-amber-300",
                                            getFullUrl('intro_hero_image', heroImageUrl) && "border-solid bg-white shadow-sm"
                                        )}
                                        onClick={() => heroImageRef.current?.click()}
                                    >
                                        {getFullUrl('intro_hero_image', heroImageUrl) ? (
                                            <img src={getFullUrl('intro_hero_image', heroImageUrl)} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Upload className="w-7 h-7 text-[#D5BA98]/60" />
                                        )}
                                        {isUploading === 'intro_hero_image' && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#1A3A52]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {getFullUrl('intro_hero_image', heroImageUrl) && (
                                        <Button type="button" variant="outline" size="sm" className="h-9 gap-2 text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => setPreviewData({ url: getFullUrl('intro_hero_image', heroImageUrl), title: "Hero Image", type: 'image' })}>
                                            <Maximize2 className="h-4 w-4" />
                                            Preview
                                        </Button>
                                    )}
                                    <input type="file" ref={heroImageRef} className="hidden" accept={IMAGE_ACCEPT} onChange={(e) => handleFileChange(e, 'intro_hero_image')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ALCard>

                {/* VIRTUAL TOUR SECTION */}
                <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="fade">
                    <div className="p-6 md:p-8 border-b border-[#D5BA98]/20 bg-[#FDFBF9]">
                        <h2 className="text-xl font-bold text-[#1A3A52] tracking-tight mb-2">{t('Introduction.virtualTour')}</h2>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <ALInput title={t('AboutUs.sectionLabel')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_virtualTour_label` as const)} />
                        <ALInput title={t('AboutUs.title')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_virtualTour_title` as const)} />
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-[#1A3A52]">{t('Introduction.description')}</label>
                            <Textarea {...register(`i18n.${activeLocale}.intro_virtualTour_desc` as const)} />
                        </div>

                        <div className="space-y-4 mt-6">
                            <label className="font-[Inter] text-xs font-bold text-[#1A3A52]/50 uppercase tracking-widest block">{t('Introduction.tourVideo')}</label>
                            <div className="space-y-4">
                                <div className="relative group w-fit">
                                    <div
                                        className={cn(
                                            "w-48 h-24 rounded-2xl border-2 border-dashed border-amber-200/60 bg-white/40 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-amber-300",
                                            getFullUrl('intro_virtualTour_videoUrl', tourVideoUrl) && "border-solid bg-white shadow-sm"
                                        )}
                                        onClick={() => virtualTourVideoRef.current?.click()}
                                    >
                                        {getFullUrl('intro_virtualTour_videoUrl', tourVideoUrl) ? (
                                            <video src={getFullUrl('intro_virtualTour_videoUrl', tourVideoUrl)} className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-7 h-7 text-[#D5BA98]/60" />
                                        )}
                                        {isUploading === 'intro_virtualTour_videoUrl' && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#1A3A52]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {getFullUrl('intro_virtualTour_videoUrl', tourVideoUrl) && (
                                        <Button type="button" variant="outline" size="sm" className="h-9 gap-2 text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => setPreviewData({ url: getFullUrl('intro_virtualTour_videoUrl', tourVideoUrl), title: "Tour Video", type: 'video' })}>
                                            <Maximize2 className="h-4 w-4" />
                                            Preview
                                        </Button>
                                    )}
                                    <input type="file" ref={virtualTourVideoRef} className="hidden" accept={VIDEO_ACCEPT} onChange={(e) => handleFileChange(e, 'intro_virtualTour_videoUrl', true)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ALCard>

                {/* COLLECTION SECTION */}
                <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="fade">
                    <div className="p-6 md:p-8 border-b border-[#D5BA98]/20 bg-[#FDFBF9]">
                        <h2 className="text-xl font-bold text-[#1A3A52] tracking-tight mb-2">{t('Introduction.collection')}</h2>
                    </div>
                    <div className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-amber-200/30">
                            <ALInput title={t('AboutUs.sectionLabel')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_collection_label` as const)} />
                            <ALInput title={t('AboutUs.title')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_collection_title` as const)} />
                        </div>

                        {[1, 2, 3].map((num) => {
                            const index = num as 1 | 2 | 3;
                            const dishImageRef = num === 1 ? dish1ImageRef : num === 2 ? dish2ImageRef : dish3ImageRef;
                            const dishImageUrl = num === 1 ? dish1ImageUrl : num === 2 ? dish2ImageUrl : dish3ImageUrl;

                            return (
                                <div key={num} className="space-y-6 p-6 rounded-2xl border border-amber-200/40 bg-white/40">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-[#1A3A52]">{t('Introduction.featuredDish')} {num}</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                                            onClick={() => {
                                                setSelectingDishIndex(index);
                                                setIsDishModalOpen(true);
                                            }}
                                        >
                                            <UtensilsCrossed className="w-4 h-4" />
                                            {t('Introduction.selectFromSystem')}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                                        <div className="space-y-4">
                                            <label className="font-[Inter] text-xs font-bold text-[#1A3A52]/50 uppercase tracking-widest block">{t('Introduction.dishImage')}</label>
                                            <div className="space-y-4">
                                                <div
                                                    className={cn(
                                                        "w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-amber-200/60 bg-white/40 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-amber-300",
                                                        getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) && "border-solid bg-white shadow-sm"
                                                    )}
                                                    onClick={() => dishImageRef.current?.click()}
                                                >
                                                    {getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) ? (
                                                        <img src={getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <Upload className="w-7 h-7 text-[#D5BA98]/60" />
                                                    )}
                                                    {isUploading === `intro_collection_dish${num}_image` && (
                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                            <Loader2 className="w-5 h-5 animate-spin text-[#1A3A52]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    {getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) && (
                                                        <Button type="button" variant="outline" size="sm" className="h-9 gap-2 text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => setPreviewData({ url: getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl), title: `Featured Dish ${num}`, type: 'image' })}>
                                                            <Maximize2 className="h-4 w-4" />
                                                            Preview
                                                        </Button>
                                                    )}
                                                    <input type="file" ref={dishImageRef} className="hidden" accept={IMAGE_ACCEPT} onChange={(e) => handleFileChange(e, `intro_collection_dish${num}_image`)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <ALInput title={t('Introduction.mainTitle')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_mainTitle` as any)} />
                                            <ALInput title={t('Introduction.cardTitle')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_cardTitle` as any)} />
                                            <ALInput title={t('Introduction.cardCategory')} wrapperClassName="bg-white/60" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_cardCategory` as any)} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ALCard>

            </div>

            {/* Bottom Save Button (Mobile) */}
            <div className="pb-6 lg:hidden">
                <Button
                    type="submit"
                    className="w-full bg-[#1A3A52] hover:bg-[#1A3A52]/90 text-white shadow-lg h-12 font-[Inter] gap-2"
                    isLoading={updateMutation.isPending}
                >
                    <Save className="w-4 h-4" />
                    {t("Common.saveChanges") || "Save All Changes"}
                </Button>
            </div>

            {previewData && (
                <MediaPreviewModal
                    isOpen={!!previewData}
                    onClose={() => setPreviewData(null)}
                    url={previewData.url}
                    title={previewData.title}
                    type={previewData.type}
                />
            )}

            <DishSelectionModal
                isOpen={isDishModalOpen}
                onClose={() => {
                    setIsDishModalOpen(false);
                    setSelectingDishIndex(null);
                }}
                onSelect={(dish) => selectingDishIndex && handleDishSelect(dish, selectingDishIndex)}
            />
        </form>
    );
};
