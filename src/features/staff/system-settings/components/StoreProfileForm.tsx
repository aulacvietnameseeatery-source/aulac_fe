import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Save, Loader2, Upload, Facebook, Instagram, Music2 as Tiktok, X, Eye, MapPin, Phone, Mail, Clock, Building2, Globe, UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getGroupSettings, updateGroupSettings, uploadLogo } from '../services/system-setting.service';
import { BulkUpdateSettingItemDto } from '../types/system-setting.types';
import { BASE_URL } from '@/lib/http';
import { cn } from '@/lib/utils';
import { MediaPreviewModal } from '@/components/shared/MediaPreviewModal';

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
                <label className="text-sm font-medium leading-none">{title}</label>
                <div className="flex items-center gap-4 mt-1">
                    <div
                        className={cn(
                            "relative rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden group border-dashed flex-shrink-0",
                            isVideo ? "w-28 h-16" : "w-16 h-16",
                            url && "border-solid shadow-sm cursor-pointer"
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
                                    <UploadCloud className="w-4 h-4 text-white z-10" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                        <Eye className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img src={url} className="w-full h-full object-contain p-1" alt="" />
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
                                {url ? t('Common.change') : t('Common.upload')}
                            </Button>
                            {url && (
                                <Button type="button" variant="outline" size="sm" onClick={() => handleChange(fieldKey, "", true)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {isVideo ? t('Common.maxSizeVideo') : t('Common.maxSizeImage')}
                        </p>
                    </div>
                    <input type="file" ref={inputRef} className="hidden" accept={isVideo ? "video/*" : "image/*"} onChange={(e) => handleFileChange(e, fieldKey)} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header & Language Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">{t('StoreProfile.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('StoreProfile.description')}</p>
                </div>

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

                    {/* Identity Section */}
                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                {t('StoreProfile.sections.identity.title')}
                            </h3>
                            <p className="text-[13px] text-muted-foreground">{t('StoreProfile.sections.identity.description')}</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('StoreProfile.storeName')} * ({activeLocale})</label>
                                <Input
                                    placeholder={t('StoreProfile.storeNamePlaceholder')}
                                    value={getValue('name')}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location Section */}
                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {t('StoreProfile.sections.contact.title')}
                            </h3>
                            <p className="text-[13px] text-muted-foreground">{t('StoreProfile.sections.contact.description')}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('StoreProfile.streetAddress')} * ({activeLocale})</label>
                                <Input value={getValue('streetAddress')} onChange={(e) => handleChange('streetAddress', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground text-[13px] uppercase tracking-wider">{t('StoreProfile.postalCode')} (Global)</label>
                                    <Input value={getValue('postalCode', true)} onChange={(e) => handleChange('postalCode', e.target.value, true)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('StoreProfile.city')} * ({activeLocale})</label>
                                    <Input value={getValue('city')} onChange={(e) => handleChange('city', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('StoreProfile.country')} * ({activeLocale})</label>
                                    <Input value={getValue('country')} onChange={(e) => handleChange('country', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-muted-foreground text-[13px] uppercase tracking-wider">{t('StoreProfile.email')} * (Global)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input type="email" value={getValue('email', true)} onChange={(e) => handleChange('email', e.target.value, true)} className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-muted-foreground text-[13px] uppercase tracking-wider">{t('StoreProfile.phone')} * (Global)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input value={getValue('phone', true)} onChange={(e) => handleChange('phone', e.target.value, true)} className="pl-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operating Details */}
                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                {t('StoreProfile.sections.hours.title')}
                            </h3>
                            <p className="text-[13px] text-muted-foreground">{t('StoreProfile.sections.hours.description')}</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('StoreProfile.openingHours')} * ({activeLocale})</label>
                                <Input value={getValue('openingHours')} onChange={(e) => handleChange('openingHours', e.target.value)} placeholder="Mon - Sun: 09:00 - 22:00" />
                            </div>
                        </div>
                    </div>

                    {/* Social Footprint */}
                    <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                            <h3 className="font-semibold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                {t('StoreProfile.sections.social.title')}
                            </h3>
                            <p className="text-[13px] text-muted-foreground">{t('StoreProfile.sections.social.description')}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
                                    <Input value={getValue('facebookLink', true)} onChange={(e) => handleChange('facebookLink', e.target.value, true)} className="pl-10" placeholder="Facebook Link" />
                                </div>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 w-4 h-4 text-pink-600" />
                                    <Input value={getValue('instagramLink', true)} onChange={(e) => handleChange('instagramLink', e.target.value, true)} className="pl-10" placeholder="Instagram Link" />
                                </div>
                                <div className="relative">
                                    <Tiktok className="absolute left-3 top-3 w-4 h-4 text-black" />
                                    <Input value={getValue('tiktokLink', true)} onChange={(e) => handleChange('tiktokLink', e.target.value, true)} className="pl-10" placeholder="TikTok Link" />
                                </div>
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
                                {t('StoreProfile.actions.sync')}
                            </Button>
                            <Button variant="outline" onClick={loadSettings} disabled={isSaving} className="w-full text-gray-500">
                                {t('StoreProfile.actions.discard')}
                            </Button>
                        </div>

                        <div className="rounded-xl border bg-white text-card-foreground shadow-sm overflow-hidden order-1 md:order-2">
                            <div className="flex flex-col space-y-1.5 p-6 border-b bg-gray-50/50">
                                <h3 className="font-semibold leading-none tracking-tight text-gray-900">{t('StoreProfile.sidebar.brandTitle')}</h3>
                                <p className="text-[13px] text-muted-foreground">{t('StoreProfile.sidebar.brandDescription')}</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <MediaUploadUI fieldKey="logoUrl" title={t('StoreProfile.sidebar.logo')} />
                                <div className="border-t border-dashed"></div>
                                <MediaUploadUI fieldKey="promoVideoUrl" title={t('StoreProfile.sidebar.promoVideo')} isVideo />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MediaPreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} url={previewData?.url || ""} title={previewData?.title} type={previewData?.type} />
        </div>
    );
};
