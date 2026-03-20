import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Save, Loader2, Upload, Facebook, Instagram, Music2 as Tiktok, X, Eye, MapPin, Phone, Mail, Clock, Building2, Globe, UploadCloud, Languages, Sparkles, Camera, PlayCircle } from 'lucide-react';
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
            toast.success(t('StoreProfile.translatedSuccessfully'));
        },
        onError: () => {
            toast.error(t('StoreProfile.translationFailed'));
        }
    });

    const handleAutoTranslate = () => {
        const dataToTranslate: Record<string, string> = {};
        TRANSLATABLE_KEYS.forEach(key => {
            const val = formData[`${key}_${activeLocale}`];
            if (val) dataToTranslate[key] = val;
        });

        if (Object.keys(dataToTranslate).length === 0) {
            toast.warning(t('StoreProfile.nothingToTranslate'));
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
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-semibold text-gray-700">{title}</label>
                <div className="flex flex-col gap-4">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed cursor-pointer hover:border-primary/50 transition-all",
                            isVideo ? "w-80 aspect-video" : "w-32 aspect-square",
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="h-9 px-4">
                                <Upload className="w-4 h-4 mr-2" />
                                {url ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {url && (
                                <Button type="button" variant="outline" size="sm" onClick={() => handleChange(fieldKey, "", true)} className="h-9 w-9 p-0 text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 italic">
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
        <div className="flex flex-col gap-6 w-full pb-12">
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
                        <span className="hidden sm:inline">{t('Common.autoTranslate')}</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-2 bg-[#1E3C52] hover:bg-[#12283A] text-white shadow-lg shadow-blue-900/20 font-semibold px-4 transition-all"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t("Common.saveChanges")}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-12 w-full pb-24 max-w-5xl mx-auto">
                {/* --- IDENTITY SECTION --- */}
                <div className="p-8 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-8">
                        <div className="pb-4 border-b border-slate-100">
                            <div className="mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{t("StoreProfile.sections.identity.title")}</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("StoreProfile.sections.identity.description")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {t("StoreProfile.storeName")} ({activeLocale})
                                </label>
                                <Input
                                    value={getValue('name')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                                    placeholder="e.g. Au Lac Restaurant"
                                    className="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-100 transition-all text-base bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.openingHours")} ({activeLocale})</label>
                                <Input
                                    value={getValue('openingHours')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('openingHours', e.target.value)}
                                    placeholder="Mon-Sun: 10:00 - 22:00"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- VISUAL BRANDING SECTION --- */}
                <div className="p-8 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="space-y-8">
                        <div className="pb-4 border-b border-slate-100">
                            <div className="mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{t("StoreProfile.visualBranding")}</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("StoreProfile.visualBrandingDesc")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {t("StoreProfile.officialLogo")}
                                </label>
                                <MediaUploadUI
                                    fieldKey="logoUrl"
                                    title={t("StoreProfile.officialLogo")}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {t("StoreProfile.storeVideo")}
                                </label>
                                <MediaUploadUI
                                    fieldKey="promoVideoUrl"
                                    title={t("StoreProfile.storeVideo")}
                                    isVideo
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTACT & LOCATION SECTION --- */}
                <div className="p-8 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="space-y-8">
                        <div className="pb-4 border-b border-slate-100">
                            <div className="mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{t("StoreProfile.sections.contact.title")}</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("StoreProfile.sections.contact.description")}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.streetAddress")} ({activeLocale})</label>
                                <Input
                                    value={getValue('streetAddress')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('streetAddress', e.target.value)}
                                    placeholder="123 Gastronomy St"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.city")} ({activeLocale})</label>
                                <Input
                                    value={getValue('city')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('city', e.target.value)}
                                    placeholder="Geneva"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.country")} ({activeLocale})</label>
                                <Input
                                    value={getValue('country')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('country', e.target.value)}
                                    placeholder="Switzerland"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.phone")}</label>
                                <Input
                                    value={getValue('phone', true)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value, true)}
                                    placeholder="+41 22 123 4567"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("StoreProfile.email")}</label>
                                <Input
                                    value={getValue('email', true)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value, true)}
                                    placeholder="contact@aulac.com"
                                    className="h-11 border-slate-200 focus:border-blue-400 bg-white/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SOCIAL MEDIA SECTION --- */}
                <div className="p-8 border border-slate-200 rounded-3xl bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="space-y-8">
                        <div className="pb-4 border-b border-slate-100">
                            <div className="mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{t("StoreProfile.sections.social.title")}</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("StoreProfile.sections.social.description")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <div className="pl-2 pr-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Common.facebook') || 'FB'}</div>
                            <Input
                                value={getValue('facebookLink', true)}
                                onChange={(e) => handleChange('facebookLink', e.target.value, true)}
                                placeholder="Facebook URL"
                                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-8 p-0"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-pink-50 focus-within:border-pink-400 transition-all">
                            <div className="pl-2 pr-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Common.instagram') || 'IG'}</div>
                            <Input
                                value={getValue('instagramLink', true)}
                                onChange={(e) => handleChange('instagramLink', e.target.value, true)}
                                placeholder="Instagram URL"
                                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-8 p-0"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-400 transition-all">
                            <div className="pl-2 pr-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Common.tiktok') || 'TK'}</div>
                            <Input
                                value={getValue('tiktokLink', true)}
                                onChange={(e) => handleChange('tiktokLink', e.target.value, true)}
                                placeholder="TikTok URL"
                                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-8 p-0"
                            />
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
