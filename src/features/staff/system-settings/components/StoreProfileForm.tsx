import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Save, Loader2, Upload, Facebook, Instagram, Music2 as Tiktok, X, Eye, MapPin, Phone, Mail, Clock, Building2, Globe, UploadCloud, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getGroupSettings, updateGroupSettings, uploadLogo, translateSystemSettings } from '../services/system-setting.service';
import { BulkUpdateSettingItemDto } from '../types/system-setting.types';
import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/http';
import { cn } from '@/lib/utils';
import { MediaPreviewModal } from '@/components/shared/MediaPreviewModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const LOCALES = ["en", "vi", "fr"];

const TRANSLATABLE_KEYS = [
    'name', 'streetAddress', 'city', 'country', 'openingHours'
];

const GLOBAL_KEYS = [
    'logoUrl', 'postalCode', 'email', 'phone', 'facebookLink', 'instagramLink', 'tiktokLink', 'promoVideoUrl'
];

const getInitialData = () => {
    const data: Record<string, string> = {};
    TRANSLATABLE_KEYS.forEach(k => LOCALES.forEach(l => data[`${k}_${l}`] = ""));
    GLOBAL_KEYS.forEach(k => data[k] = "");
    return data;
};

export const StoreProfileForm = () => {
    const t = useTranslations('SystemSettings');
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
            toast.success(t('StoreProfile.updateSuccess') || "Translated successfully!");
        },
        onError: () => {
            toast.error("Translation failed.");
        }
    });

    const handleAutoTranslate = () => {
        const dataToTranslate: Record<string, string> = {};
        TRANSLATABLE_KEYS.forEach(key => {
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
            const settings = await getGroupSettings('store');
            const data = getInitialData();
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                if (key in data || TRANSLATABLE_KEYS.some(tk => key.startsWith(tk))) {
                    data[key] = s.value?.toString() || '';
                }
            });
            setFormData(data);
        } catch (error) {
            console.error('Failed to load store settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string, isGlobal = false) => {
        const key = isGlobal ? field : `${field}_${activeLocale}`;
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const getValue = (field: string, isGlobal = false) => {
        const key = isGlobal ? field : `${field}_${activeLocale}`;
        return formData[key] || "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: 'logoUrl' | 'promoVideoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = fieldKey === 'promoVideoUrl';
        const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error(isVideo ? t('Common.maxSizeVideo') : t('StoreProfile.fileSizeError'));
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldKey]: localUrl }));

        setIsUploading(fieldKey);
        try {
            const publicUrl = await uploadLogo(file);
            handleChange(fieldKey, publicUrl, true);
            toast.success(t('StoreProfile.uploadSuccess'));
        } catch (error) {
            toast.error(t('StoreProfile.uploadError'));
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
            const items: BulkUpdateSettingItemDto[] = Object.entries(formData).map(([key, value]) => ({
                key: `store.${key}`,
                settingName: `Store ${key}`,
                value: value,
                description: `Store ${key}`
            }));
            await updateGroupSettings('store', { items });
            toast.success(t('StoreProfile.updateSuccess'));
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || t('StoreProfile.updateError'));
        } finally {
            setIsSaving(false);
        }
    };

    const getFullUrl = (field: 'logoUrl' | 'promoVideoUrl') => {
        const url = getValue(field, true);
        const previewUrl = localPreviews[field];
        if (previewUrl) return previewUrl;
        if (!url) return '';
        return (url.startsWith('http')) ? url : `${BASE_URL}${url}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const MediaUploadUI = ({ fieldKey, title, isVideo = false }: { fieldKey: 'logoUrl' | 'promoVideoUrl', title: string, isVideo?: boolean }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const url = getFullUrl(fieldKey);

        return (
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">{title}</label>
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed flex-shrink-0 cursor-pointer hover:border-primary/50",
                            isVideo ? "w-32 h-20" : "w-20 h-20",
                            url && "border-solid shadow-sm"
                        )}
                        onClick={() => {
                            if (url) setPreviewData({ url, title, type: isVideo ? 'video' : 'image' });
                            else inputRef.current?.click();
                        }}
                    >
                        {url ? (
                            isVideo ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                    <video src={url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <Eye className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img src={url} className="w-full h-full object-contain p-2" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-white" />
                                    </div>
                                </>
                            )
                        ) : (
                            <div className="text-gray-400 group-hover:text-primary">
                                {isVideo ? <UploadCloud className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
                            </div>
                        )}
                        {isUploading === fieldKey && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="h-8">
                                <Upload className="w-3.5 h-3.5 mr-2" />
                                {url ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {url && (
                                <Button type="button" variant="outline" size="sm" onClick={() => handleChange(fieldKey, "", true)} className="h-8 text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 italic">
                            {isVideo ? t('Common.maxSizeVideo') : t('Common.maxSizeImage')}
                        </p>
                    </div>
                    <input type="file" ref={inputRef} className="hidden" accept={isVideo ? "video/*" : "image/*"} onChange={(e) => handleFileChange(e, fieldKey)} />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 w-full">
            {/* --- HEADER ACTIONS --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm sticky top-0 z-50 transition-all duration-300">
                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        {LOCALES.map((loc) => (
                            <Button
                                key={loc}
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

                    <div className="h-6 w-px bg-gray-200 hidden md:block" />

                    <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <Building2 className="w-4 h-4" />
                        <span>{t('StoreProfile.title') || "Store Profile"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold px-4 transition-all"
                        onClick={handleAutoTranslate}
                        disabled={translateMutation.isPending}
                    >
                        {translateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                        <span className="hidden sm:inline">Auto Translate</span>
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-9 gap-2 bg-[#1E3C52] hover:bg-[#12283A] text-white shadow-lg shadow-blue-900/20 font-semibold px-4 transition-all"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t("Common.saveChanges") || "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* --- FORM COLUMN --- */}
                <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header Intro */}
                    <div className="flex flex-col gap-1 px-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            {t('StoreProfile.title') || "Store Profile Settings"}
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {t('StoreProfile.description') || "Manage your restaurant's identity, contact info and presence across all languages."}
                        </p>
                    </div>

                    {/* Identity Card */}
                    <Card className="border-none shadow-sm shadow-blue-950/5 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg font-bold">{t("StoreProfile.sections.identity.title")}</CardTitle>
                            </div>
                            <CardDescription>{t("StoreProfile.sections.identity.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    {t("StoreProfile.storeName")} ({activeLocale})
                                </label>
                                <Input
                                    value={getValue('name')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                                    placeholder="e.g. Au Lac Restaurant"
                                    className="h-12 border-slate-200 focus:border-blue-400 focus:ring-blue-100 transition-all text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Location Card */}
                    <Card className="border-none shadow-sm shadow-blue-950/5 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg font-bold">{t("StoreProfile.sections.contact.title")}</CardTitle>
                            </div>
                            <CardDescription>{t("StoreProfile.sections.contact.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.streetAddress")} ({activeLocale})</label>
                                    <Input
                                        value={getValue('streetAddress')}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('streetAddress', e.target.value)}
                                        placeholder="123 Gastronomy St"
                                        className="h-12 border-slate-200 focus:border-blue-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.city")} ({activeLocale})</label>
                                    <Input
                                        value={getValue('city')}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('city', e.target.value)}
                                        placeholder="Geneva"
                                        className="h-12 border-slate-200 focus:border-blue-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.country")} ({activeLocale})</label>
                                    <Input
                                        value={getValue('country')}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('country', e.target.value)}
                                        placeholder="Switzerland"
                                        className="h-12 border-slate-200 focus:border-blue-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.postalCode")}</label>
                                    <Input
                                        value={getValue('postalCode', true)}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('postalCode', e.target.value, true)}
                                        placeholder="1201"
                                        className="h-12 border-slate-200 focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.email")}</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                                        <Input
                                            type="email"
                                            value={getValue('email', true)}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value, true)}
                                            placeholder="contact@aulac.ch"
                                            className="h-12 pl-12 border-slate-200 focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.phone")}</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                                        <Input
                                            value={getValue('phone', true)}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value, true)}
                                            placeholder="+41 22 123 4567"
                                            className="h-12 pl-12 border-slate-200 focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operations Card */}
                    <Card className="border-none shadow-sm shadow-blue-950/5 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg font-bold">{t("StoreProfile.sections.hours.title")}</CardTitle>
                            </div>
                            <CardDescription>{t("StoreProfile.sections.hours.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("StoreProfile.openingHours")} ({activeLocale})</label>
                                <Input
                                    value={getValue('openingHours')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('openingHours', e.target.value)}
                                    placeholder="Mon - Sun: 09:00 - 22:00"
                                    className="h-12 border-slate-200 focus:border-blue-400"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SIDEBAR COLUMN --- */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700">
                    {/* Media Card */}
                    <Card className="border-none shadow-sm shadow-blue-950/5 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <CardTitle className="text-lg font-bold">Visual Branding</CardTitle>
                            <CardDescription>Logo and promotional media</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 py-6">
                            <MediaUploadUI fieldKey="logoUrl" title="Official Logo" />
                            <div className="h-px bg-slate-100" />
                            <MediaUploadUI fieldKey="promoVideoUrl" title="Store Video" isVideo />
                        </CardContent>
                    </Card>

                    {/* Socials Card */}
                    <Card className="border-none shadow-sm shadow-blue-950/5 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <CardTitle className="text-lg font-bold">{t("StoreProfile.sections.social.title")}</CardTitle>
                            <CardDescription>{t("StoreProfile.sections.social.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 py-6">
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 group transition-all focus-within:border-blue-200 focus-within:bg-white">
                                <div className="h-9 w-9 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100">
                                    <Facebook className="w-5 h-5 text-[#1877F2]" />
                                </div>
                                <Input
                                    value={getValue('facebookLink', true)}
                                    onChange={(e) => handleChange('facebookLink', e.target.value, true)}
                                    placeholder="Facebook URL"
                                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-9"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 group transition-all focus-within:border-pink-200 focus-within:bg-white">
                                <div className="h-9 w-9 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100">
                                    <Instagram className="w-5 h-5 text-[#E4405F]" />
                                </div>
                                <Input
                                    value={getValue('instagramLink', true)}
                                    onChange={(e) => handleChange('instagramLink', e.target.value, true)}
                                    placeholder="Instagram URL"
                                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-9"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 group transition-all focus-within:border-gray-300 focus-within:bg-white">
                                <div className="h-9 w-9 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100">
                                    <Tiktok className="w-5 h-5 text-gray-900" />
                                </div>
                                <Input
                                    value={getValue('tiktokLink', true)}
                                    onChange={(e) => handleChange('tiktokLink', e.target.value, true)}
                                    placeholder="TikTok URL"
                                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-9"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sync Info */}
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Sync Notice</p>
                            <p className="text-[11px] font-medium text-blue-700/70 leading-normal">
                                Saving will update global fields across all languages instantly.
                            </p>
                        </div>
                    </div>
                </div>
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
        </div>
    );
};
