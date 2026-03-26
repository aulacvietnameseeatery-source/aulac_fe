import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Languages, UtensilsCrossed, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, uploadFile } from "../services/system-setting.service";
import { cn } from "@/lib/utils";
import { MediaPreviewModal } from "@/components/shared/MediaPreviewModal";
import { DishSelectionModal } from './DishSelectionModal';
import { DishDetailResponse } from '../../view-dish-detail/types/dish-detail.types';
import { ALCard } from "@/components/ui/al-card";
import { ALInput } from "@/components/ui/al-input";
import { useIntroductionSettingsForm } from "../hooks/useIntroductionSettingsForm";
import { mapIntroSettingsToFormValues, mapFormValuesToIntroSettings, LOCALES, SupportedLocale, IntroFormValues } from "../types/schema";
import { useUpdateStoreSettingsMutation, useTranslateSettingsMutation } from "../hooks/useSystemSettingsMutation";



const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp';
const VIDEO_ACCEPT = 'video/mp4,.mp4';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 30;
const INTRO_MEDIA_KEYS = [
    "intro_hero_image",
    "intro_virtualTour_videoUrl",
    "intro_virtualTour_videoUrlLeft",
    "intro_virtualTour_videoUrlRight",
    "intro_collection_dish1_image",
    "intro_collection_dish2_image",
    "intro_collection_dish3_image"
] as const;



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
    const [remotePublicUrls, setRemotePublicUrls] = useState<Record<string, string>>({});

    const heroImageRef = useRef<HTMLInputElement>(null);
    const virtualTourVideoLeftRef = useRef<HTMLInputElement>(null);
    const virtualTourVideoRightRef = useRef<HTMLInputElement>(null);
    const dish1ImageRef = useRef<HTMLInputElement>(null);
    const dish2ImageRef = useRef<HTMLInputElement>(null);
    const dish3ImageRef = useRef<HTMLInputElement>(null);

    const heroImageUrl = watch('intro_hero_image') as string;
    watch('intro_virtualTour_videoUrl');
    const tourVideoUrlLeft = watch('intro_virtualTour_videoUrlLeft') as string;
    const tourVideoUrlRight = watch('intro_virtualTour_videoUrlRight') as string;
    const dish1ImageUrl = watch('intro_collection_dish1_image') as string;
    const dish2ImageUrl = watch('intro_collection_dish2_image') as string;
    const dish3ImageUrl = watch('intro_collection_dish3_image') as string;

    const toServerRelativePath = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return "";

        try {
            const parsed = new URL(trimmed);
            const path = parsed.pathname;
            if (path.startsWith("/uploads/")) return path.substring(1);
            return path.startsWith("/") ? `uploads${path}` : `uploads/${path}`;
        } catch {
            // not an absolute URL
        }

        if (trimmed.startsWith("/uploads/")) return trimmed.substring(1);
        if (trimmed.startsWith("uploads/")) return trimmed;
        return `uploads/${trimmed.replace(/^\/+/, "")}`;
    };

    const toServerRelativeFromUpload = (relativePath: string, publicUrl?: string) => {
        if (relativePath) {
            return toServerRelativePath(relativePath);
        }
        if (publicUrl) {
            return toServerRelativePath(publicUrl);
        }
        return "";
    };

    const handleDishSelect = (dish: DishDetailResponse, index: number) => {
        const baseKey = `intro_collection_dish${index}` as const;
        const primaryImage = dish.media.find(m => m.isPrimary && m.mediaType === 'IMAGE')?.url || dish.media.find(m => m.mediaType === 'IMAGE')?.url || "";
        const serverRelativeImage = primaryImage ? toServerRelativePath(primaryImage) : "";

        // @ts-expect-error: dynamic key access from featured dish selection
        setValue(`${baseKey}_image`, serverRelativeImage, { shouldDirty: true });

        if (primaryImage) {
            setRemotePublicUrls(prev => ({
                ...prev,
                [`${baseKey}_image`]: primaryImage
            }));
        }

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
            const publicUrlMap: Record<string, string> = {};
            const mediaKeySet = new Set<string>(INTRO_MEDIA_KEYS);
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                kv[key] = s.value?.toString() || '';
                const formKey = key.replace(/\./g, '_');
                if (mediaKeySet.has(formKey) && s.publicUrl) {
                    publicUrlMap[formKey] = s.publicUrl;
                }
            });
            const formattedData = mapIntroSettingsToFormValues(kv);
            reset(formattedData);
            setRemotePublicUrls(publicUrlMap);
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
            const { relativePath, publicUrl } = await uploadFile(file);
            const serverRelative = toServerRelativeFromUpload(relativePath, publicUrl);
            // @ts-expect-error: dynamic key access for uploaded file fieldKey
            setValue(fieldKey, serverRelative, { shouldDirty: true, shouldValidate: true });
            if (publicUrl) {
                setRemotePublicUrls(prev => ({ ...prev, [fieldKey]: publicUrl }));
            } else if (serverRelative) {
                setRemotePublicUrls(prev => ({ ...prev, [fieldKey]: serverRelative }));
            }
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
        const remoteUrl = remotePublicUrls[fieldKey];
        if (remoteUrl) return remoteUrl.startsWith("uploads/") ? `/${remoteUrl}` : remoteUrl;
        if (!watchedVal) return '';
        if (watchedVal.startsWith("/uploads/")) return watchedVal;
        return watchedVal.startsWith("uploads/") ? `/${watchedVal}` : watchedVal;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-8 w-full pb-12 relative">
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
                            className="h-10 gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold px-5 rounded-xl transition-all shadow-sm"
                            onClick={handleAutoTranslate}
                            isLoading={translateMutation.isPending}
                        >
                            <Languages className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('Common.autoTranslate')}</span>
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 gap-2 bg-[#1A3A52] hover:bg-[#0D2131] text-white shadow-lg shadow-blue-900/10 font-semibold px-6 rounded-xl transition-all"
                            isLoading={updateMutation.isPending}
                        >
                            <Save className="w-4 h-4" />
                            {t("Common.saveChanges")}
                        </Button>
                    </div>
                </ALCard>
            </div>

            <div key={activeLocale} className="grid grid-cols-1 gap-12">
                {/* HERO SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-extrabold text-[#1A3A52] tracking-tight">{t('Introduction.heroSection')}</h2>
                    </div>

                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/40 shadow-sm overflow-hidden" animation="slide-up">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Left: Text Content */}
                            <div className="p-8 lg:p-10 space-y-8 bg-white/40 border-r border-amber-200/20">
                                <div className="space-y-6">
                                    <ALInput
                                        title={t('Introduction.heroTitle')}
                                        placeholder="Enter a catchy hero title..."
                                        wrapperClassName="bg-white/80 border-amber-100/50 focus-within:border-amber-300"
                                        {...register(`i18n.${activeLocale}.intro_hero_title` as const)}
                                    />
                                    <ALInput
                                        title={t('Introduction.heroQuote')}
                                        fieldVariant="textarea"
                                        textareaRows={4}
                                        placeholder="Write a welcoming quote or short description..."
                                        wrapperClassName="bg-white/80 border-amber-100/50 focus-within:border-amber-300"
                                        textareaClassName="resize-none leading-relaxed"
                                        {...register(`i18n.${activeLocale}.intro_hero_quote` as const)}
                                    />
                                </div>
                            </div>

                            {/* Right: Image Upload Area */}
                            <div className="p-8 lg:p-10 bg-[#FDFBF9]/60 flex flex-col justify-center items-center">
                                <div className="relative group w-full max-w-md aspect-[16/10] perspective-1000">
                                    <div
                                        className={cn(
                                            "w-full h-full rounded-[2rem] border-2 border-dashed border-amber-200/80 bg-white/50 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 cursor-pointer group-hover:border-amber-400 group-hover:bg-white/80 group-hover:shadow-2xl group-hover:shadow-amber-900/5",
                                            getFullUrl('intro_hero_image', heroImageUrl) && "border-solid border-white bg-white shadow-xl"
                                        )}
                                        onClick={() => heroImageRef.current?.click()}
                                    >
                                        {getFullUrl('intro_hero_image', heroImageUrl) ? (
                                            <div className="relative w-full h-full">
                                                <img src={getFullUrl('intro_hero_image', heroImageUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                                                <div className="absolute inset-0 bg-black/20 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="bg-white/90 p-3 rounded-full shadow-lg lg:transform lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300">
                                                        <Upload className="w-6 h-6 text-[#1A3A52]" />
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-[#D5BA98]">
                                                <div className="p-5 bg-amber-50 rounded-full border border-amber-100 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-10 h-10" />
                                                </div>
                                                <span className="text-sm font-semibold tracking-wide">Click to upload high-res image</span>
                                            </div>
                                        )}

                                        {isUploading === 'intro_hero_image' && (
                                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#1A3A52]" />
                                                <span className="text-xs font-bold text-[#1A3A52] animate-pulse">Processing...</span>
                                            </div>
                                        )}
                                    </div>

                                    {getFullUrl('intro_hero_image', heroImageUrl) && (
                                        <button
                                            type="button"
                                            className="absolute -top-3 -right-3 p-2 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all z-10 lg:scale-0 lg:group-hover:scale-100 scale-100"

                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewData({ url: getFullUrl('intro_hero_image', heroImageUrl), title: "Hero Image", type: 'image' });
                                            }}
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={heroImageRef} className="hidden" accept={IMAGE_ACCEPT} onChange={(e) => handleFileChange(e, 'intro_hero_image')} />
                                <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recommended size: 1920x1080 (PNG/JPG)</p>
                            </div>
                        </div>
                    </ALCard>
                </section>

                {/* VIRTUAL TOUR SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-extrabold text-[#1A3A52] tracking-tight">{t('Introduction.virtualTour')}</h2>
                    </div>

                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-blue-100/40 shadow-sm overflow-hidden" animation="fade">
                        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr]">
                            {/* Left: Branding & Info */}
                            <div className="p-8 lg:p-10 space-y-8 bg-white/40 border-r border-blue-50">
                                <div className="space-y-6">
                                    <ALInput title={t('AboutUs.sectionLabel')} placeholder="Section Tag" wrapperClassName="bg-white/80 border-blue-50 focus-within:border-blue-200" {...register(`i18n.${activeLocale}.intro_virtualTour_label` as const)} />
                                    <ALInput title={t('AboutUs.title')} placeholder="Main Heading" wrapperClassName="bg-white/80 border-blue-50 focus-within:border-blue-200" {...register(`i18n.${activeLocale}.intro_virtualTour_title` as const)} />
                                    <ALInput
                                        title={t('Introduction.description')}
                                        fieldVariant="textarea"
                                        textareaRows={5}
                                        placeholder="Tell a story about your space..."
                                        wrapperClassName="bg-white/80 border-blue-50 focus-within:border-blue-200"
                                        textareaClassName="resize-none"
                                        {...register(`i18n.${activeLocale}.intro_virtualTour_desc` as const)}
                                    />
                                </div>
                            </div>

                            {/* Right: Video Grid */}
                            <div className="p-8 lg:p-10 bg-[#F8FAFC]/60 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Video Left */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-[#1A3A52]/50 uppercase tracking-[0.2em]">{t('Introduction.tourVideoLeft')}</p>
                                        <div className="relative group w-full aspect-video">
                                            <div
                                                className={cn(
                                                    "w-full h-full rounded-2xl border-2 border-dashed border-blue-200/60 bg-white/50 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-blue-400 hover:shadow-lg",
                                                    getFullUrl('intro_virtualTour_videoUrlLeft', tourVideoUrlLeft) && "border-solid bg-black shadow-md"
                                                )}
                                                onClick={() => virtualTourVideoLeftRef.current?.click()}
                                            >
                                                {getFullUrl('intro_virtualTour_videoUrlLeft', tourVideoUrlLeft) ? (
                                                    <video src={getFullUrl('intro_virtualTour_videoUrlLeft', tourVideoUrlLeft)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-blue-200" />
                                                )}

                                                <div className="absolute inset-0 bg-[#1A3A52]/40 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                                        <Upload className="w-5 h-5 text-[#1A3A52]" />
                                                    </div>
                                                </div>


                                                {isUploading === 'intro_virtualTour_videoUrlLeft' && (
                                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 animate-spin text-[#1A3A52]" />
                                                    </div>
                                                )}
                                            </div>
                                            {getFullUrl('intro_virtualTour_videoUrlLeft', tourVideoUrlLeft) && (
                                                <button type="button" className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setPreviewData({ url: getFullUrl('intro_virtualTour_videoUrlLeft', tourVideoUrlLeft), title: "Video Left", type: 'video' }); }}>
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <input type="file" ref={virtualTourVideoLeftRef} className="hidden" accept={VIDEO_ACCEPT} onChange={(e) => handleFileChange(e, 'intro_virtualTour_videoUrlLeft', true)} />
                                    </div>

                                    {/* Video Right */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-[#1A3A52]/50 uppercase tracking-[0.2em]">{t('Introduction.tourVideoRight')}</p>
                                        <div className="relative group w-full aspect-video">
                                            <div
                                                className={cn(
                                                    "w-full h-full rounded-2xl border-2 border-dashed border-blue-200/60 bg-white/50 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-blue-400 hover:shadow-lg",
                                                    getFullUrl('intro_virtualTour_videoUrlRight', tourVideoUrlRight) && "border-solid bg-black shadow-md"
                                                )}
                                                onClick={() => virtualTourVideoRightRef.current?.click()}
                                            >
                                                {getFullUrl('intro_virtualTour_videoUrlRight', tourVideoUrlRight) ? (
                                                    <video src={getFullUrl('intro_virtualTour_videoUrlRight', tourVideoUrlRight)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-blue-200" />
                                                )}

                                                <div className="absolute inset-0 bg-[#1A3A52]/40 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                                        <Upload className="w-5 h-5 text-[#1A3A52]" />
                                                    </div>
                                                </div>


                                                {isUploading === 'intro_virtualTour_videoUrlRight' && (
                                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 animate-spin text-[#1A3A52]" />
                                                    </div>
                                                )}
                                            </div>
                                            {getFullUrl('intro_virtualTour_videoUrlRight', tourVideoUrlRight) && (
                                                <button type="button" className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setPreviewData({ url: getFullUrl('intro_virtualTour_videoUrlRight', tourVideoUrlRight), title: "Video Right", type: 'video' }); }}>
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <input type="file" ref={virtualTourVideoRightRef} className="hidden" accept={VIDEO_ACCEPT} onChange={(e) => handleFileChange(e, 'intro_virtualTour_videoUrlRight', true)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ALCard>
                </section>

                {/* COLLECTION SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-extrabold text-[#1A3A52] tracking-tight">{t('Introduction.collection')}</h2>
                    </div>

                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="fade">
                        <div className="p-8 lg:p-10 space-y-10 bg-[#FFFCF8]/40">
                            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-amber-100/50 pb-8">
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <ALInput
                                        title={t('AboutUs.sectionLabel')}
                                        wrapperClassName="bg-white/80 border-amber-50 focus-within:border-amber-200 h-10 w-full sm:w-40"
                                        {...register(`i18n.${activeLocale}.intro_collection_label` as const)}
                                    />
                                    <ALInput
                                        title={t('AboutUs.title')}
                                        wrapperClassName="bg-white/80 border-amber-50 focus-within:border-amber-200 h-10 flex-grow"
                                        {...register(`i18n.${activeLocale}.intro_collection_title` as const)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((num) => {
                                    const index = num as 1 | 2 | 3;
                                    const dishImageRef = num === 1 ? dish1ImageRef : num === 2 ? dish2ImageRef : dish3ImageRef;
                                    const dishImageUrl = num === 1 ? dish1ImageUrl : num === 2 ? dish2ImageUrl : dish3ImageUrl;

                                    return (
                                        <ALCard
                                            key={num}
                                            variant="glass"
                                            padding="none"
                                            radius="2xl"
                                            className="border-amber-100/60 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 group flex flex-col"
                                        >
                                            {/* Dish Card Header */}
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "w-full h-full bg-amber-50/20 flex items-center justify-center cursor-pointer overflow-hidden",
                                                        getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) && "bg-white"
                                                    )}
                                                    onClick={() => dishImageRef.current?.click()}
                                                >
                                                    {getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) ? (
                                                        <img src={getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 text-amber-100" />
                                                    )}

                                                    <div className="absolute inset-0 bg-black/40 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="flex gap-2 lg:transform lg:translate-y-2 lg:group-hover:translate-y-0 transition-transform duration-300">

                                                            <button type="button" className="p-2 bg-white text-[#1A3A52] rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); dishImageRef.current?.click(); }}>
                                                                <Upload className="w-4 h-4" />
                                                            </button>
                                                            {getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl) && (
                                                                <button type="button" className="p-2 bg-white text-blue-600 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); setPreviewData({ url: getFullUrl(`intro_collection_dish${num}_image`, dishImageUrl), title: `Featured Dish ${num}`, type: 'image' }); }}>
                                                                    <Maximize2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isUploading === `intro_collection_dish${num}_image` && (
                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-[#1A3A52]" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="absolute top-3 left-3 z-10">
                                                    <span className="bg-[#1A3A52]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                        {t('DishModal.dishLabel')} 0{num}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="absolute top-3 right-3 z-10 h-7 w-7 flex items-center justify-center bg-white/90 text-amber-700 rounded-lg shadow-lg border border-amber-100 hover:bg-amber-600 hover:text-white transition-all lg:scale-0 lg:group-hover:scale-100 scale-100"

                                                    onClick={() => {
                                                        setSelectingDishIndex(index);
                                                        setIsDishModalOpen(true);
                                                    }}
                                                >
                                                    <UtensilsCrossed className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Dish Card Body */}
                                            <div className="p-4 space-y-4 flex-grow bg-white/40">
                                                <ALInput title={t('Introduction.mainTitle')} wrapperClassName="bg-white/70 border-amber-50 focus-within:border-amber-200" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_mainTitle` as any)} />
                                                <div className="grid grid-cols-1 gap-3">
                                                    <ALInput title={t('Introduction.cardTitle')} wrapperClassName="bg-white/50 border-amber-50 focus-within:border-amber-200" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_cardTitle` as any)} />
                                                    <ALInput title={t('Introduction.cardCategory')} wrapperClassName="bg-white/50 border-amber-50 focus-within:border-amber-200" {...register(`i18n.${activeLocale}.intro_collection_dish${num}_cardCategory` as any)} />
                                                </div>
                                            </div>
                                            <input type="file" ref={dishImageRef} className="hidden" accept={IMAGE_ACCEPT} onChange={(e) => handleFileChange(e, `intro_collection_dish${num}_image`)} />
                                        </ALCard>
                                    );
                                })}
                            </div>
                        </div>
                    </ALCard>
                </section>
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
