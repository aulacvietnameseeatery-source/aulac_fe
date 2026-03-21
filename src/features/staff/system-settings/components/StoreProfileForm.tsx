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
    'logoUrl', 'postalCode', 'email', 'phone', 'facebookLink', 'instagramLink', 'tiktokLink'
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
    const logoInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: 'logoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error(t('StoreProfile.fileSizeError'));
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

    const getFullUrl = (field: 'logoUrl') => {
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
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FDFBF9]/80 backdrop-blur-md p-4 rounded-xl border border-amber-200/30 shadow-sm transition-all duration-300">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-6">
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-8">
                    {/* --- IDENTITY SECTION --- */}
                    <div className="bg-[#FDFBF9]/40 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="p-6 md:p-8 border-b border-[#D5BA98]/20">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {t("StoreProfile.sections.identity.title")}
                                </h2>
                            </div>
                            <p className="font-[Inter] text-sm text-[#1A3A52]/60 ml-13">
                                {t("StoreProfile.sections.identity.description")}
                            </p>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-3">
                                <label className="font-[Inter] text-xs font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                    {t("StoreProfile.logo")}
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div
                                            className={cn(
                                                "w-24 h-24 rounded-2xl border-2 border-dashed border-amber-200/60 bg-white/40 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-amber-300 hover:bg-white/60",
                                                getValue('logoUrl', true) && "border-solid bg-white shadow-sm"
                                            )}
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            {getValue('logoUrl', true) ? (
                                                <img
                                                    src={getValue('logoUrl', true).startsWith('http') ? getValue('logoUrl', true) : `${BASE_URL}${getValue('logoUrl', true)}`}
                                                    className="w-full h-full object-cover"
                                                    alt="Logo"
                                                />
                                            ) : (
                                                <Upload className="w-7 h-7 text-[#D5BA98]/60" />
                                            )}
                                            {isUploading === 'logoUrl' && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 animate-spin text-[#1A3A52]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-3 mb-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 border-[#D5BA98]/40 text-[#1A3A52] hover:bg-[#D5BA98]/10 font-[Inter] gap-2"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                <Upload className="w-4 h-4" />
                                                {t("StoreProfile.upload")}
                                            </Button>
                                            {getValue('logoUrl', true) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 border-red-100 text-red-500 hover:bg-red-50 font-[Inter] gap-2"
                                                    onClick={() => handleChange('logoUrl', '', true)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {t("StoreProfile.remove")}
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#1A3A52]/40 font-[Inter]">
                                            JPG, PNG &lt; 5MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'logoUrl')}
                                    />
                                </div>
                            </div>

                            <div className="h-[1px] w-full bg-[#D5BA98]/20" />

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                        {t("StoreProfile.storeName")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('name')}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder={t("StoreProfile.placeholders.storeName")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                        {t("StoreProfile.openingHours")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('openingHours')}
                                        onChange={(e) => handleChange('openingHours', e.target.value)}
                                        placeholder={t("StoreProfile.placeholders.openingHours")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SOCIAL FOOTPRINT SECTION --- */}
                    <div className="bg-[#FDFBF9]/40 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="p-6 md:p-8 border-b border-[#D5BA98]/20">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {t("StoreProfile.sections.social.title")}
                                </h2>
                            </div>
                            <p className="font-[Inter] text-sm text-[#1A3A52]/60 ml-13">
                                {t("StoreProfile.sections.social.description")}
                            </p>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest flex items-center gap-2">
                                    <Facebook className="w-4 h-4 text-[#1A3A52]/70" />
                                    {t("Common.facebook") || "Facebook Profile"}
                                </label>
                                <Input
                                    value={getValue('facebookLink', true)}
                                    onChange={(e) => handleChange('facebookLink', e.target.value, true)}
                                    placeholder={t("StoreProfile.placeholders.facebook")}
                                    className="h-11 border-amber-200/40 focus:border-[#1A3A52] font-[Inter] bg-white/60"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest flex items-center gap-2">
                                    <Instagram className="w-4 h-4 text-[#1A3A52]/70" />
                                    {t("Common.instagram") || "Instagram Page"}
                                </label>
                                <Input
                                    value={getValue('instagramLink', true)}
                                    onChange={(e) => handleChange('instagramLink', e.target.value, true)}
                                    placeholder={t("StoreProfile.placeholders.instagram")}
                                    className="h-11 border-amber-200/40 focus:border-[#1A3A52] font-[Inter] bg-white/60"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest flex items-center gap-2">
                                    <Tiktok className="w-4 h-4 text-[#1A3A52]/70" />
                                    {t("Common.tiktok") || "TikTok Page"}
                                </label>
                                <Input
                                    value={getValue('tiktokLink', true)}
                                    onChange={(e) => handleChange('tiktokLink', e.target.value, true)}
                                    placeholder={t("StoreProfile.placeholders.tiktok")}
                                    className="h-11 border-amber-200/40 focus:border-[#1A3A52] font-[Inter] bg-white/60"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-8 h-full">
                    {/* --- CONTACT & LOCATION SECTION --- */}
                    <div className="bg-[#FDFBF9]/40 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 h-full">
                        <div className="p-6 md:p-8 border-b border-[#D5BA98]/20">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {t("StoreProfile.sections.contact.title")}
                                </h2>
                            </div>
                            <p className="font-[Inter] text-sm text-[#1A3A52]/60 ml-13">
                                {t("StoreProfile.sections.contact.description")}
                            </p>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                    {t("StoreProfile.street")}
                                </label>
                                <Input
                                    className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                    value={getValue('streetAddress')}
                                    onChange={(e) => handleChange('streetAddress', e.target.value)}
                                    placeholder={t("StoreProfile.placeholders.street")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                        {t("StoreProfile.city")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('city')}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder={t("StoreProfile.placeholders.city")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest">
                                        {t("StoreProfile.country")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('country')}
                                        onChange={(e) => handleChange('country', e.target.value)}
                                        placeholder={t("StoreProfile.placeholders.country")}
                                    />
                                </div>
                            </div>

                            <div className="h-[1px] w-full bg-[#D5BA98]/20" />

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {t("StoreProfile.phone")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('phone', true)}
                                        onChange={(e) => handleChange('phone', e.target.value, true)}
                                        placeholder={t("StoreProfile.placeholders.phone")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#1A3A52]/50 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {t("StoreProfile.email")}
                                    </label>
                                    <Input
                                        className="h-11 border-amber-200/40 bg-white/60 focus:border-[#1A3A52] font-[Inter]"
                                        value={getValue('email', true)}
                                        onChange={(e) => handleChange('email', e.target.value, true)}
                                        placeholder={t("StoreProfile.placeholders.email")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Save Button (Mobile) */}
            <div className="pb-6 lg:hidden">
                <Button
                    className="w-full bg-[#1A3A52] hover:bg-[#1A3A52]/90 text-white shadow-lg h-12 font-[Inter] gap-2"
                    onClick={handleSave}
                    disabled={isSaving}
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
        </div>
    );
};
