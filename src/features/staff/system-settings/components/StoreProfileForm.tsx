import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Save, Loader2, Upload, Facebook, Instagram, Music2 as Tiktok, Eye, Phone, Mail, Languages, Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getGroupSettings, uploadLogo } from '../services/system-setting.service';
import { cn } from '@/lib/utils';
import { MediaPreviewModal } from '@/components/shared/MediaPreviewModal';
import { ALCard } from '@/components/ui/al-card';
import { ALInput } from '@/components/ui/al-input';
import { useStoreProfileForm } from '../hooks/useStoreProfileForm';
import { mapStoreSettingsToFormValues, mapFormValuesToStoreSettings, LOCALES, SupportedLocale, StoreProfileFormValues } from '../types/schema';
import { useUpdateStoreSettingsMutation, useTranslateSettingsMutation } from '../hooks/useSystemSettingsMutation';


const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp';



export const StoreProfileForm = () => {
    const t = useTranslations('settings');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en');

    const form = useStoreProfileForm();
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = form;

    const translateMutation = useTranslateSettingsMutation();
    const updateMutation = useUpdateStoreSettingsMutation();

    const [previewData, setPreviewData] = useState<{ url: string; title: string, type: 'image' | 'video' } | null>(null);
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
    const [remotePublicUrls, setRemotePublicUrls] = useState<Record<string, string>>({});
    const logoInputRef = useRef<HTMLInputElement>(null);

    const logoUrlValue = watch('logoUrl');

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

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const settings = await getGroupSettings('store');
            const kv: Record<string, string> = {};
            const publicUrlMap: Record<string, string> = {};
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                kv[key] = s.value?.toString() || '';
                if (key === 'logoUrl' && s.publicUrl) {
                    publicUrlMap[key] = s.publicUrl;
                }
            });
            const formattedData = mapStoreSettingsToFormValues(kv);
            reset(formattedData);
            setRemotePublicUrls(publicUrlMap);
        } catch (error) {
            console.error('Failed to load store settings:', error);
        } finally {
            setIsLoading(false);
        }
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error(t('StoreProfile.invalidImageFormatError'));
            if (e.target) e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('StoreProfile.fileSizeError'));
            if (e.target) e.target.value = '';
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, logoUrl: localUrl }));
        setIsUploading('logoUrl');

        try {
            const { relativePath, publicUrl } = await uploadLogo(file);
            const serverRelative = toServerRelativeFromUpload(relativePath, publicUrl);
            setValue('logoUrl', serverRelative, { shouldDirty: true, shouldValidate: true });
            if (publicUrl) {
                setRemotePublicUrls(prev => ({ ...prev, logoUrl: publicUrl }));
            } else if (serverRelative) {
                setRemotePublicUrls(prev => ({ ...prev, logoUrl: serverRelative }));
            }
            toast.success(t('StoreProfile.uploadSuccess'));
        } catch (error) {
            toast.error(t('StoreProfile.uploadError'));
            if (!logoUrlValue) {
                setLocalPreviews(prev => { delete prev['logoUrl']; return { ...prev }; });
            }
        } finally {
            setIsUploading(null);
            if (e.target) e.target.value = '';
        }
    };

    const onSubmit = (values: StoreProfileFormValues) => {
        const mappedSettings = mapFormValuesToStoreSettings(values);
        const items = Object.entries(mappedSettings).map(([key, value]) => ({
            key: `store.${key}`,
            settingName: `Store ${key}`,
            value: value,
            description: `Store ${key}`
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

    const getFullUrl = () => {
        const previewUrl = localPreviews['logoUrl'];
        if (previewUrl) return previewUrl;
        const remoteUrl = remotePublicUrls['logoUrl'];
        if (remoteUrl) return remoteUrl.startsWith("uploads/") ? `/${remoteUrl}` : remoteUrl;
        if (!logoUrlValue) return '';
        if (logoUrlValue.startsWith("/uploads/")) return logoUrlValue;
        return logoUrlValue.startsWith("uploads/") ? `/${logoUrlValue}` : logoUrlValue;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6 w-full pb-12 relative">
            {/* --- HEADER ACTIONS --- */}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-6">
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-8">
                    {/* --- IDENTITY SECTION --- */}
                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="slide-up">
                        <div className="p-6 md:p-8 ">
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-3">
                                    {logoUrlValue && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 border-red-100 text-red-500 hover:bg-red-50 font-[Inter] gap-2"
                                            onClick={() => setValue('logoUrl', '', { shouldDirty: true })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t("Common.remove")}
                                        </Button>
                                    )}
                                    {getFullUrl() && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 border-blue-100 text-blue-600 hover:bg-blue-50 font-[Inter] gap-2"
                                            onClick={() => setPreviewData({ url: getFullUrl(), title: "Store Logo", type: 'image' })}
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                            {t("Common.preview")}
                                        </Button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    className="hidden"
                                    accept={IMAGE_ACCEPT}
                                    onChange={handleFileChange}
                                />
                            </div>


                            <div className="space-y-6">
                                <ALInput
                                    title={t("StoreProfile.storeName")}
                                    placeholder={t("StoreProfile.placeholders.storeName")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.i18n?.[activeLocale]?.name?.message}
                                    {...register(`i18n.${activeLocale}.name` as const)}
                                />
                                <ALInput
                                    title={t("StoreProfile.openingHours")}
                                    placeholder={t("StoreProfile.placeholders.openingHours")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.i18n?.[activeLocale]?.openingHours?.message}
                                    {...register(`i18n.${activeLocale}.openingHours` as const)}
                                />
                            </div>
                        </div>
                    </ALCard>

                    {/* --- SOCIAL FOOTPRINT SECTION --- */}
                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm overflow-hidden" animation="fade">
                        <div className="p-6 md:p-8 space-y-6">
                            <ALInput
                                title={t("Common.facebook") || "Facebook Profile"}
                                iconStart={<Facebook className="w-4 h-4 text-[#1A3A52]/70" />}
                                placeholder={t("StoreProfile.placeholders.facebook")}
                                wrapperClassName="bg-white/60"
                                error={errors.facebookLink?.message}
                                {...register('facebookLink')}
                            />
                            <ALInput
                                title={t("Common.instagram") || "Instagram Page"}
                                iconStart={<Instagram className="w-4 h-4 text-[#1A3A52]/70" />}
                                placeholder={t("StoreProfile.placeholders.instagram")}
                                wrapperClassName="bg-white/60"
                                error={errors.instagramLink?.message}
                                {...register('instagramLink')}
                            />
                            <ALInput
                                title={t("Common.tiktok") || "TikTok Page"}
                                iconStart={<Tiktok className="w-4 h-4 text-[#1A3A52]/70" />}
                                placeholder={t("StoreProfile.placeholders.tiktok")}
                                wrapperClassName="bg-white/60"
                                error={errors.tiktokLink?.message}
                                {...register('tiktokLink')}
                            />
                        </div>
                    </ALCard>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-8 h-full">
                    <ALCard variant="soft" padding="none" radius="2xl" elevation="sm" className="border-amber-200/50 shadow-sm flex flex-col h-full" animation="slide-up">
                        <div className="p-6 md:p-8 space-y-8 flex-1">
                            <ALInput
                                title={t("StoreProfile.street")}
                                placeholder={t("StoreProfile.placeholders.street")}
                                wrapperClassName="bg-white/60"
                                error={errors.i18n?.[activeLocale]?.streetAddress?.message}
                                {...register(`i18n.${activeLocale}.streetAddress` as const)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ALInput
                                    title={t("StoreProfile.city")}
                                    placeholder={t("StoreProfile.placeholders.city")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.i18n?.[activeLocale]?.city?.message}
                                    {...register(`i18n.${activeLocale}.city` as const)}
                                />
                                <ALInput
                                    title={t("StoreProfile.country")}
                                    placeholder={t("StoreProfile.placeholders.country")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.i18n?.[activeLocale]?.country?.message}
                                    {...register(`i18n.${activeLocale}.country` as const)}
                                />
                            </div>



                            <div className="grid grid-cols-1 gap-8">
                                <ALInput
                                    title={t("StoreProfile.phone")}
                                    iconStart={<Phone className="w-4 h-4 text-[#1A3A52]/70" />}
                                    placeholder={t("StoreProfile.placeholders.phone")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.phone?.message}
                                    {...register('phone')}
                                />
                                <ALInput
                                    title={t("StoreProfile.email")}
                                    iconStart={<Mail className="w-4 h-4 text-[#1A3A52]/70" />}
                                    placeholder={t("StoreProfile.placeholders.email")}
                                    wrapperClassName="bg-white/60"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                        </div>
                    </ALCard>
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
        </form>
    );
};
