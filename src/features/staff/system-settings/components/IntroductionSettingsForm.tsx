import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Trash2, ImagePlus, UploadCloud, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, updateGroupSettings, uploadFile } from "../services/system-setting.service";
import { BulkUpdateSettingItemDto } from "../types/system-setting.types";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/http";
import { MediaPreviewModal } from "@/components/shared/MediaPreviewModal";

const LOCALES = ["en", "vi", "fr"];

const TEXT_KEYS = [
    "intro.hero.title", "intro.hero.quote",
    "intro.virtualTour.label", "intro.virtualTour.title", "intro.virtualTour.desc",
    "intro.chef.label", "intro.chef.title", "intro.chef.cta",
    "intro.chef.1.name", "intro.chef.1.quote", "intro.chef.2.name", "intro.chef.2.quote",
    "intro.collection.label", "intro.collection.title",
    ...[1, 2, 3].flatMap(i => [
        `intro.collection.dish${i}.mainTitle`,
        `intro.collection.dish${i}.subTitle`,
        `intro.collection.dish${i}.hoverCategory`,
        `intro.collection.dish${i}.hoverTitle`,
        `intro.collection.dish${i}.hoverDesc`,
    ])
];

const MEDIA_KEYS = [
    "intro.hero.image",
    "intro.virtualTour.videoUrl",
    "intro.chef.videoUrl",
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
    const [previewData, setPreviewData] = useState<{ url: string; title: string, type: 'image' | 'video' } | null>(null);
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

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

    const MediaUploadUI = ({ fieldKey, title, isVideo = false }: { fieldKey: string, title: string, isVideo?: boolean }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const url = getValue(fieldKey, true);
        const previewUrl = localPreviews[fieldKey];
        const fullUrl = previewUrl || (url ? ((url.startsWith('http')) ? url : `${BASE_URL}${url}`) : '');

        return (
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium leading-none">{title}</label>
                <div className="flex items-center gap-4 mt-1">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed flex-shrink-0",
                            isVideo ? "w-28 h-16" : "w-16 h-16",
                            fullUrl && "border-solid shadow-sm cursor-pointer"
                        )}
                        onClick={() => {
                            if (fullUrl) setPreviewData({ url: fullUrl, title, type: isVideo ? 'video' : 'image' });
                            else inputRef.current?.click();
                        }}
                    >
                        {fullUrl ? (
                            isVideo ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                    <video src={fullUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    <UploadCloud className="w-4 h-4 text-white z-10" />
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

                    <div className="flex flex-col gap-1.5 flex-1 p-1">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="h-7 text-xs px-2.5">
                                <Upload className="w-3 h-3 mr-1.5" />
                                {fullUrl ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {fullUrl && (
                                <Button type="button" variant="outline" size="sm" onClick={() => handleChange(fieldKey, "", true)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground hidden lg:block">
                            {isVideo ? t('Common.maxSizeVideo') : t('Common.maxSizeImage')}
                        </p>
                    </div>
                    <input type="file" ref={inputRef} className="hidden" accept={isVideo ? "video/mp4,video/webm" : "image/*"} onChange={(e) => handleFileChange(e, fieldKey, isVideo)} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">{t('Introduction.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('Introduction.description')}</p>
                </div>

                {/* Standard Shadcn Multi-language Tabs */}
                <div className="flex bg-gray-100/50 p-1 rounded-lg border">
                    {LOCALES.map(loc => (
                        <button
                            key={loc}
                            onClick={() => setActiveLocale(loc)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                activeLocale === loc ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {loc === 'vi' ? '🇻🇳' : loc === 'en' ? '🇺🇸' : '🇫🇷'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
                <div className="md:col-span-8 flex flex-col gap-6">

                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('Introduction.sections.hero.title')}</h3>
                            <p className="text-[13px] text-muted-foreground">{t('Introduction.sections.hero.description')}</p>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.hero.mainTitle')}</label>
                                    <Input value={getValue("intro.hero.title")} onChange={(e) => handleChange("intro.hero.title", e.target.value)} placeholder="Authentic Vietnamese Dining" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.hero.brandQuote')}</label>
                                    <Input value={getValue("intro.hero.quote")} onChange={(e) => handleChange("intro.hero.quote", e.target.value)} placeholder="Where Tradition Meets Taste" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('Introduction.sections.chef.title')}</h3>
                            <p className="text-[13px] text-muted-foreground">{t('Introduction.sections.chef.description')}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.chef.sectionLabel')}</label>
                                    <Input value={getValue("intro.chef.label")} onChange={(e) => handleChange("intro.chef.label", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.chef.ctaAction')}</label>
                                    <Input value={getValue("intro.chef.cta")} onChange={(e) => handleChange("intro.chef.cta", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Introduction.sections.chef.discoveryHeader')}</label>
                                <Input value={getValue("intro.chef.title")} onChange={(e) => handleChange("intro.chef.title", e.target.value)} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        {t('Introduction.sections.chef.leadChef')}
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.chef.name')}</label>
                                        <Input value={getValue("intro.chef.1.name")} onChange={(e) => handleChange("intro.chef.1.name", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.chef.quote')}</label>
                                        <Input value={getValue("intro.chef.1.quote")} onChange={(e) => handleChange("intro.chef.1.quote", e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        {t('Introduction.sections.chef.executiveChef')}
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.chef.name')}</label>
                                        <Input value={getValue("intro.chef.2.name")} onChange={(e) => handleChange("intro.chef.2.name", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.chef.quote')}</label>
                                        <Input value={getValue("intro.chef.2.quote")} onChange={(e) => handleChange("intro.chef.2.quote", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('Introduction.sections.ambiance.title')}</h3>
                            <p className="text-[13px] text-muted-foreground">{t('Introduction.sections.ambiance.description')}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Introduction.sections.ambiance.navLabel')}</label>
                                <Input value={getValue("intro.virtualTour.label")} onChange={(e) => handleChange("intro.virtualTour.label", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Introduction.sections.ambiance.sectionTitle')}</label>
                                <Input value={getValue("intro.virtualTour.title")} onChange={(e) => handleChange("intro.virtualTour.title", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('Introduction.sections.ambiance.summary')}</label>
                                <Input value={getValue("intro.virtualTour.desc")} onChange={(e) => handleChange("intro.virtualTour.desc", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('Introduction.sections.collection.title')}</h3>
                            <p className="text-[13px] text-muted-foreground">{t('Introduction.sections.collection.description')}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.collection.galleryLabel')}</label>
                                    <Input value={getValue("intro.collection.label")} onChange={(e) => handleChange("intro.collection.label", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('Introduction.sections.collection.mainTitle')}</label>
                                    <Input value={getValue("intro.collection.title")} onChange={(e) => handleChange("intro.collection.title", e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[1, 2, 3].map(i => {
                                    const p = `intro.collection.dish${i}`;
                                    return (
                                        <div key={p} className="p-5 rounded-lg border bg-gray-50/50 space-y-4 group">
                                            <h4 className="text-sm font-semibold text-gray-900">{t('Introduction.sections.collection.dishTitle', { index: i })}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.collection.dishMainTitle')}</label>
                                                    <Input value={getValue(`${p}.mainTitle`)} onChange={(e) => handleChange(`${p}.mainTitle`, e.target.value)} placeholder="e.g. Pho Bo" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.collection.dishSubTitle')}</label>
                                                    <Input value={getValue(`${p}.subTitle`)} onChange={(e) => handleChange(`${p}.subTitle`, e.target.value)} placeholder="e.g. Traditional Beef Soup" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.collection.hoverCategory')}</label>
                                                    <Input value={getValue(`${p}.hoverCategory`)} onChange={(e) => handleChange(`${p}.hoverCategory`, e.target.value)} placeholder="Soup" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.collection.hoverTitle')}</label>
                                                    <Input value={getValue(`${p}.hoverTitle`)} onChange={(e) => handleChange(`${p}.hoverTitle`, e.target.value)} placeholder="Discover Pho Bo" />
                                                </div>
                                                <div className="sm:col-span-2 space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600">{t('Introduction.sections.collection.hoverDescription')}</label>
                                                    <Input value={getValue(`${p}.hoverDesc`)} onChange={(e) => handleChange(`${p}.hoverDesc`, e.target.value)} placeholder="A long simmered broth with tender beef..." />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 flex flex-col gap-6">
                    {/* Sticky Sidebar for Media & Actions */}
                    <div className="sticky top-6 flex flex-col gap-6">

                        <div className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-3 order-2 md:order-1">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full">
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {t('Common.saveChanges')}
                            </Button>
                            <Button variant="outline" onClick={loadSettings} disabled={isSaving} className="w-full text-gray-500">
                                {t('Common.discardChanges')}
                            </Button>
                        </div>

                        <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden order-1 md:order-2">
                            <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                                <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('Introduction.sidebar.mediaTitle')}</h3>
                                <p className="text-[13px] text-muted-foreground">{t('Introduction.sidebar.mediaDescription')}</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <MediaUploadUI fieldKey="intro.hero.image" title={t('Introduction.sidebar.heroBackground')} />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="intro.chef.videoUrl" title={t('Introduction.sidebar.chefVideo')} isVideo />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="intro.virtualTour.videoUrl" title={t('Introduction.sidebar.ambianceVideo')} isVideo />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="intro.collection.dish1.image" title={t('Introduction.sidebar.dishImage', { index: 1 })} />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="intro.collection.dish2.image" title={t('Introduction.sidebar.dishImage', { index: 2 })} />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="intro.collection.dish3.image" title={t('Introduction.sidebar.dishImage', { index: 3 })} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <MediaPreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} url={previewData?.url || ""} title={previewData?.title} type={previewData?.type} />
        </div>
    );
};
