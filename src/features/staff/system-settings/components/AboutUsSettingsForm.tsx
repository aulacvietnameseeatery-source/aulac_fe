import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Languages, Save, History, Target, BookOpen, Star, Eye, Upload, Trash2, ImagePlus, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, updateGroupSettings, uploadFile, translateSystemSettings } from "../services/system-setting.service";
import { BulkUpdateSettingItemDto } from "../types/system-setting.types";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BASE_URL } from "@/lib/http";
import { MediaPreviewModal } from "@/components/shared/MediaPreviewModal";

const LOCALES = ["en", "vi", "fr"];

const TEXT_KEYS = [
    "about.founders.label", "about.founders.title", "about.founders.paragraph_1", "about.founders.paragraph_2", "about.founders.quote", "about.founders.quote_author",
    "about.journey.title", "about.journey.paragraph_1", "about.journey.paragraph_2", "about.journey.quote", "about.journey.paragraph_3",
    "about.philosophy.label", "about.philosophy.title", "about.philosophy.value_1_title", "about.philosophy.value_1_desc", "about.philosophy.value_2_title", "about.philosophy.value_2_desc",
    "about.legacy.title", "about.legacy.subtitle", "about.legacy.paragraph_1", "about.legacy.paragraph_2", "about.legacy.paragraph_3", "about.legacy.paragraph_4"
];

const MEDIA_KEYS = [
    "about.founders.image",
    "about.legacy.image"
];

const getInitialData = () => {
    const data: Record<string, string> = {};
    TEXT_KEYS.forEach(k => LOCALES.forEach(l => data[`${k}_${l}`] = ""));
    MEDIA_KEYS.forEach(k => data[k] = "");
    return data;
};

// Textarea replacement for multiline inputs
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

export const AboutUsSettingsForm = () => {
    const t = useTranslations("SystemSettings");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState("en");

    const [formData, setFormData] = useState(getInitialData());
    const [previewData, setPreviewData] = useState<{ url: string; title: string, type: 'image' | 'video' } | null>(null);
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
            console.error("Failed to load about us settings:", error);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(t("Common.maxSizeImage") || "File too large (max 5MB)");
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldKey]: localUrl }));

        setIsUploading(fieldKey);
        try {
            const publicUrl = await uploadFile(file);
            handleChange(fieldKey, publicUrl, true);
            toast.success(t("StoreProfile.uploadSuccess") || "Upload successful");
        } catch (error) {
            toast.error(t("StoreProfile.uploadError") || "Upload failed");
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
                .filter(([_, value]) => value !== undefined && value !== "")
                .map(([key, value]) => ({
                    key: `store.${key}`,
                    settingName: `About Us - ${key}`,
                    value: value as string,
                    description: `About Us Page ${key}`,
                }));

            await updateGroupSettings("store", { items });
            toast.success(t("StoreProfile.updateSuccess") || "Saved successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || t("StoreProfile.updateError") || "Save failed");
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

    const MediaUploadUI = ({ fieldKey, title }: { fieldKey: string, title?: string }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const url = getValue(fieldKey, true);
        const previewUrl = localPreviews[fieldKey];
        const fullUrl = previewUrl || (url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : '');

        return (
            <div className="flex flex-col space-y-2">
                {title && <label className="text-sm font-medium leading-none">{title}</label>}
                <div className="flex items-center gap-4 mt-1">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed flex-shrink-0 transition-all cursor-pointer hover:border-primary/50",
                            "w-24 h-24",
                            fullUrl && "border-solid shadow-sm"
                        )}
                        onClick={() => {
                            if (fullUrl) setPreviewData({ url: fullUrl, title: title || "Preview", type: 'image' });
                            else inputRef.current?.click();
                        }}
                    >
                        {fullUrl ? (
                            <>
                                <img src={fullUrl} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                <ImagePlus className="w-6 h-6" />
                            </div>
                        )}
                        {isUploading === fieldKey && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 max-w-[150px]">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="h-8 text-xs px-3">
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                                {fullUrl ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {fullUrl && (
                                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleChange(fieldKey, "", true); }} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                            JPG, PNG &lt; 5MB
                        </p>
                    </div>
                    <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, fieldKey)} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 w-full">
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
                                    activeLocale === loc && "bg-white shadow-sm text-blue-600 hover:text-blue-600"
                                )}
                                onClick={() => setActiveLocale(loc)}
                            >
                                {loc}
                            </Button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Building2 className="w-4 h-4" />
                        About Us Page
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={handleAutoTranslate}
                        disabled={translateMutation.isPending}
                    >
                        {translateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                        <span className="hidden sm:inline">Auto Translate</span>
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
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">{t('AboutUs.title') || "About Us Settings"}</h2>
                                <p className="text-sm text-muted-foreground">{t('AboutUs.description') || "Manage your restaurant history, vision, and team details"}</p>
                            </div>


                        </div>

                        <div className="grid grid-cols-1 gap-8 items-start">
                            {/* Founders Section */}
                            <Card className="overflow-hidden border-none shadow-md">
                                <CardHeader className="border-b bg-slate-50/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2.5 rounded-xl">
                                            <Star className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">{t("AboutUs.sections.founders.title") || "Founders Section"}</CardTitle>
                                            <CardDescription className="text-xs">{t("AboutUs.sections.founders.description") || "Introduction of the restaurant's founders"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        <div className="md:col-span-8 space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Section Label</label>
                                                    <Input value={getValue("about.founders.label")} onChange={(e) => handleChange("about.founders.label", e.target.value)} className="h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Main Header</label>
                                                    <Input value={getValue("about.founders.title")} onChange={(e) => handleChange("about.founders.title", e.target.value)} className="h-10" />
                                                </div>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">First Bio Paragraph</label>
                                                    <Textarea value={getValue("about.founders.paragraph_1")} onChange={(e) => handleChange("about.founders.paragraph_1", e.target.value)} className="min-h-[100px] leading-relaxed" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Second Bio Paragraph</label>
                                                    <Textarea value={getValue("about.founders.paragraph_2")} onChange={(e) => handleChange("about.founders.paragraph_2", e.target.value)} className="min-h-[100px] leading-relaxed" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 flex flex-col items-center justify-start md:border-l md:pl-8 pt-4 md:pt-0">
                                            <MediaUploadUI fieldKey="about.founders.image" title={t("AboutUs.sections.founders.image") || "Founder Image"} />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl border border-amber-100 bg-amber-50/20 space-y-4">
                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            Founders' Inspirational Quote
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-amber-700">Quote Statement</label>
                                                <Textarea value={getValue("about.founders.quote")} onChange={(e) => handleChange("about.founders.quote", e.target.value)} className="min-h-[80px] bg-white italic border-amber-200/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-amber-700">Author Credit</label>
                                                <Input value={getValue("about.founders.quote_author")} onChange={(e) => handleChange("about.founders.quote_author", e.target.value)} className="h-10 bg-white border-amber-200/50" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Journey Section */}
                            <Card className="overflow-hidden border-none shadow-md">
                                <CardHeader className="border-b bg-slate-50/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2.5 rounded-xl">
                                            <History className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">{t("AboutUs.sections.journey.title") || "Our Journey"}</CardTitle>
                                            <CardDescription className="text-xs">{t("AboutUs.sections.journey.description") || "Key milestones and the path we've traveled"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-6">
                                    <div className="space-y-2 pb-4 border-b">
                                        <label className="text-sm font-bold text-gray-700">Section Title</label>
                                        <Input value={getValue("about.journey.title")} onChange={(e) => handleChange("about.journey.title", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">The Beginning</label>
                                            <Textarea value={getValue("about.journey.paragraph_1")} onChange={(e) => handleChange("about.journey.paragraph_1", e.target.value)} className="min-h-[100px] leading-relaxed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Growth & Evolution</label>
                                            <Textarea value={getValue("about.journey.paragraph_2")} onChange={(e) => handleChange("about.journey.paragraph_2", e.target.value)} className="min-h-[100px] leading-relaxed" />
                                        </div>
                                        <div className="p-5 rounded-xl bg-blue-50/20 border border-blue-100 flex flex-col gap-3">
                                            <label className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">Mid-Journey Highlight</label>
                                            <Textarea value={getValue("about.journey.quote")} onChange={(e) => handleChange("about.journey.quote", e.target.value)} className="min-h-[60px] bg-transparent border-none p-0 focus-visible:ring-0 shadow-none resize-none text-sm font-medium italic text-blue-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Present Day</label>
                                            <Textarea value={getValue("about.journey.paragraph_3")} onChange={(e) => handleChange("about.journey.paragraph_3", e.target.value)} className="min-h-[100px] leading-relaxed" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Philosophy Section */}
                            <Card className="overflow-hidden border-none shadow-md">
                                <CardHeader className="border-b bg-slate-50/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2.5 rounded-xl">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">{t("AboutUs.sections.philosophy.title") || "Our Philosophy"}</CardTitle>
                                            <CardDescription className="text-xs">{t("AboutUs.sections.philosophy.description") || "Core values and mission statement"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Section Label</label>
                                            <Input value={getValue("about.philosophy.label")} onChange={(e) => handleChange("about.philosophy.label", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Philosophy Core Header</label>
                                            <Input value={getValue("about.philosophy.title")} onChange={(e) => handleChange("about.philosophy.title", e.target.value)} className="h-10" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4 p-5 rounded-2xl border bg-emerald-50/10 border-emerald-100/50">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Core Value 01
                                            </h4>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600">Value Title</label>
                                                <Input value={getValue("about.philosophy.value_1_title")} onChange={(e) => handleChange("about.philosophy.value_1_title", e.target.value)} className="h-9 text-sm bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600">Value Description</label>
                                                <Textarea value={getValue("about.philosophy.value_1_desc")} onChange={(e) => handleChange("about.philosophy.value_1_desc", e.target.value)} className="min-h-[80px] text-sm bg-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 p-5 rounded-2xl border bg-emerald-50/10 border-emerald-100/50">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Core Value 02
                                            </h4>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600">Value Title</label>
                                                <Input value={getValue("about.philosophy.value_2_title")} onChange={(e) => handleChange("about.philosophy.value_2_title", e.target.value)} className="h-9 text-sm bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600">Value Description</label>
                                                <Textarea value={getValue("about.philosophy.value_2_desc")} onChange={(e) => handleChange("about.philosophy.value_2_desc", e.target.value)} className="min-h-[80px] text-sm bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Legacy Section */}
                            <Card className="overflow-hidden border-none shadow-md">
                                <CardHeader className="border-b bg-slate-50/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2.5 rounded-xl">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">{t("AboutUs.sections.legacy.title") || "Our Legacy"}</CardTitle>
                                            <CardDescription className="text-xs">{t("AboutUs.sections.legacy.description") || "Continuing the tradition and future vision"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        <div className="md:col-span-8 space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Legacy Headline</label>
                                                    <Input value={getValue("about.legacy.title")} onChange={(e) => handleChange("about.legacy.title", e.target.value)} className="h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Section Subtitle</label>
                                                    <Input value={getValue("about.legacy.subtitle")} onChange={(e) => handleChange("about.legacy.subtitle", e.target.value)} className="h-10" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 flex flex-col items-center justify-start md:border-l md:pl-8 pt-4 md:pt-0">
                                            <MediaUploadUI fieldKey="about.legacy.image" title={t("AboutUs.sections.legacy.image") || "Legacy Image"} />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                        {[1, 2, 3, 4].map(idx => (
                                            <div key={idx} className="space-y-3 p-5 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Chapter {idx}</label>
                                                <Textarea value={getValue(`about.legacy.paragraph_${idx}`)} onChange={(e) => handleChange(`about.legacy.paragraph_${idx}`, e.target.value)} className="min-h-[100px] leading-relaxed bg-white text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
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
        </div>
    );
};
