import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Trash2, ImagePlus, Globe, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, updateGroupSettings, uploadFile } from "../services/system-setting.service";
import { BulkUpdateSettingItemDto } from "../types/system-setting.types";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/http";

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
    const t = useTranslations("SystemSettings.StoreProfile");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState("en");

    const [formData, setFormData] = useState(getInitialData());

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

    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, isVideo = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Custom limits
        const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(t("fileSizeError") || `File too large (max ${isVideo ? '100MB' : '5MB'})`);
            return;
        }

        // --- LOCAL PREVIEW ---
        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldKey]: localUrl }));

        setIsUploading(fieldKey);
        try {
            const publicUrl = await uploadFile(file);
            handleChange(fieldKey, publicUrl, true);
            toast.success(t("uploadSuccess"));
        } catch (error) {
            toast.error(t("uploadError"));
            // Clear local preview on failure if no original exists
            if (!getValue(fieldKey, true)) {
                setLocalPreviews(prev => {
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const items: BulkUpdateSettingItemDto[] = Object.entries(formData)
                .filter(([_, value]) => value !== undefined) // Don't filter out empty strings to allow clearing
                .map(([key, value]) => ({
                    key: `store.${key}`,
                    settingName: `Introduction - ${key}`,
                    value: value as string,
                    description: `Introduction Page ${key}`,
                }));

            await updateGroupSettings("store", { items });
            toast.success(t("updateSuccess"));
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || t("updateError"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const FileUploadUI = ({ fieldKey, title, isVideo = false }: { fieldKey: string, title: string, isVideo?: boolean }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const url = getValue(fieldKey, true);
        const Icon = isVideo ? UploadCloud : ImagePlus;
        const uploadT = useTranslations("Dish.Form.media");

        return (
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {title}
                </label>

                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all overflow-hidden",
                        "hover:border-primary/50 hover:bg-primary/5 group bg-gray-50/50",
                        isVideo ? "h-[240px] w-full" : "aspect-square w-full",
                        url ? "border-solid border-gray-200 shadow-sm" : "border-gray-300"
                    )}
                >
                    {url || localPreviews[fieldKey] ? (
                        <div className="relative w-full h-full group">
                            {(() => {
                                const previewUrl = localPreviews[fieldKey];
                                const fullUrl = previewUrl || (
                                    (url?.startsWith('http://') || url?.startsWith('https://'))
                                        ? url
                                        : `${BASE_URL}${url}`
                                );

                                return isVideo ? (
                                    <video
                                        src={fullUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={fullUrl}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                );
                            })()}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="bg-white/90 hover:bg-white rounded-full h-9 w-9 shadow-lg"
                                    onClick={() => inputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 text-gray-700" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="icon"
                                    className="rounded-full h-9 w-9 shadow-lg bg-red-500 hover:bg-red-600 border-none"
                                    onClick={() => handleChange(fieldKey, "", true)}
                                >
                                    <X className="h-4 w-4 text-white" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center cursor-pointer p-6 text-center w-full h-full"
                            onClick={() => inputRef.current?.click()}
                        >
                            <div className="mb-3 p-3 rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
                                <Icon className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-700">
                                    {isVideo ? uploadT("uploadVideo") : uploadT("uploadImage")}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                    {isVideo ? "MP4 (Max 20MB)" : "JPG, PNG, WEBP (Max 5MB)"}
                                </p>
                            </div>
                        </div>
                    )}

                    {isUploading === fieldKey && (
                        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-widest mt-1">
                                Processing...
                            </span>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept={isVideo ? "video/mp4,video/webm" : "image/*"}
                        onChange={(e) => handleFileChange(e, fieldKey, isVideo)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Premium Language Switcher (Segmented Control) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sticky top-4 z-30 backdrop-blur-md bg-white/90">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy-DEFAULT/5 rounded-lg text-navy-DEFAULT">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">Content Language</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Currently editing: <span className="text-navy-DEFAULT font-bold">{activeLocale === 'vi' ? 'Tiếng Việt' : activeLocale === 'en' ? 'English' : 'Français'}</span></p>
                        </div>
                    </div>

                    <div className="relative bg-gray-100 p-1 rounded-xl flex items-center w-full sm:w-auto min-w-[280px]">
                        {/* Sliding Background */}
                        <div
                            className="absolute h-[calc(100%-8px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                            style={{
                                width: `calc(${100 / LOCALES.length}% - 4px)`,
                                left: `calc(${LOCALES.indexOf(activeLocale) * (100 / LOCALES.length)}% + 4px)`,
                            }}
                        />

                        {LOCALES.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setActiveLocale(loc)}
                                className={cn(
                                    "relative flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 z-10 flex items-center justify-center gap-2",
                                    activeLocale === loc ? "text-navy-DEFAULT" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <span className="hidden xs:inline">
                                    {loc === 'vi' ? '🇻🇳' : loc === 'en' ? '🇺🇸' : '🇫🇷'}
                                </span>
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Hero Section</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div key={activeLocale} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Main Title ({activeLocale})</label>
                                <Input value={getValue("intro.hero.title")} onChange={(e) => handleChange("intro.hero.title", e.target.value)} className="h-12" />
                            </div>
                            <div key={`quote-${activeLocale}`} className="animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quote ({activeLocale})</label>
                                <Input value={getValue("intro.hero.quote")} onChange={(e) => handleChange("intro.hero.quote", e.target.value)} className="h-12" />
                            </div>
                        </div>
                        <FileUploadUI fieldKey="intro.hero.image" title="Hero Background" />
                    </div>
                </div>
            </div>

            {/* Chef Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Chef Section</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Label ({activeLocale})</label>
                            <Input value={getValue("intro.chef.label")} onChange={(e) => handleChange("intro.chef.label", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">CTA Button ({activeLocale})</label>
                            <Input value={getValue("intro.chef.cta")} onChange={(e) => handleChange("intro.chef.cta", e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                        <Input value={getValue("intro.chef.title")} onChange={(e) => handleChange("intro.chef.title", e.target.value)} className="h-12" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/30">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Chef 1 Name ({activeLocale})</label>
                            <Input value={getValue("intro.chef.1.name")} onChange={(e) => handleChange("intro.chef.1.name", e.target.value)} className="h-12" />
                            <label className="block text-sm font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide">Chef 1 Quote ({activeLocale})</label>
                            <Input value={getValue("intro.chef.1.quote")} onChange={(e) => handleChange("intro.chef.1.quote", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Chef 2 Name ({activeLocale})</label>
                            <Input value={getValue("intro.chef.2.name")} onChange={(e) => handleChange("intro.chef.2.name", e.target.value)} className="h-12" />
                            <label className="block text-sm font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide">Chef 2 Quote ({activeLocale})</label>
                            <Input value={getValue("intro.chef.2.quote")} onChange={(e) => handleChange("intro.chef.2.quote", e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <FileUploadUI fieldKey="intro.chef.videoUrl" title="Chef Video" isVideo={true} />
                </div>
            </div>

            {/* Virtual Tour Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Virtual Tour</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Label ({activeLocale})</label>
                                <Input value={getValue("intro.virtualTour.label")} onChange={(e) => handleChange("intro.virtualTour.label", e.target.value)} className="h-12" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                                <Input value={getValue("intro.virtualTour.title")} onChange={(e) => handleChange("intro.virtualTour.title", e.target.value)} className="h-12" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description ({activeLocale})</label>
                                <Input value={getValue("intro.virtualTour.desc")} onChange={(e) => handleChange("intro.virtualTour.desc", e.target.value)} className="h-12" />
                            </div>
                        </div>
                        <FileUploadUI fieldKey="intro.virtualTour.videoUrl" title="Tour Video" isVideo={true} />
                    </div>
                </div>
            </div>

            {/* Collection (Signature Dishes) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Signature Dishes</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Section Label ({activeLocale})</label>
                            <Input value={getValue("intro.collection.label")} onChange={(e) => handleChange("intro.collection.label", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Section Title ({activeLocale})</label>
                            <Input value={getValue("intro.collection.title")} onChange={(e) => handleChange("intro.collection.title", e.target.value)} className="h-12" />
                        </div>
                    </div>

                    {[1, 2, 3].map((dishNum) => {
                        const prefix = `intro.collection.dish${dishNum}`;
                        return (
                            <div key={dishNum} className="border border-gray-100 rounded-xl p-6 bg-gray-50/30">
                                <h4 className="font-bold text-md mb-4 text-navy-DEFAULT">Dish {dishNum}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    <div className="md:col-span-1">
                                        <FileUploadUI fieldKey={`${prefix}.image`} title="Dish Image" />
                                    </div>
                                    <div className="md:col-span-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Main Title ({activeLocale})</label>
                                                <Input value={getValue(`${prefix}.mainTitle`)} onChange={(e) => handleChange(`${prefix}.mainTitle`, e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Sub Title ({activeLocale})</label>
                                                <Input value={getValue(`${prefix}.subTitle`)} onChange={(e) => handleChange(`${prefix}.subTitle`, e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Hover Cat ({activeLocale})</label>
                                                <Input value={getValue(`${prefix}.hoverCategory`)} onChange={(e) => handleChange(`${prefix}.hoverCategory`, e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Hover Title ({activeLocale})</label>
                                                <Input value={getValue(`${prefix}.hoverTitle`)} onChange={(e) => handleChange(`${prefix}.hoverTitle`, e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Hover Desc ({activeLocale})</label>
                                            <Input value={getValue(`${prefix}.hoverDesc`)} onChange={(e) => handleChange(`${prefix}.hoverDesc`, e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-200 mt-10 pb-10">
                <Button variant="outline" onClick={loadSettings} disabled={isSaving} className="px-6 h-11 text-sm font-semibold transition-all">
                    Reset
                </Button>
                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                <Button onClick={handleSave} disabled={isSaving} className="min-w-[160px] h-11 text-sm font-bold bg-navy-DEFAULT text-white flex items-center justify-center gap-2">
                    {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};
