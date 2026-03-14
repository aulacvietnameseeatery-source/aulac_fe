import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Save, Loader2, Upload, Facebook, Instagram, Music2 as Tiktok } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getGroupSettings, updateGroupSettings, uploadLogo } from '../services/system-setting.service';
import { BulkUpdateSettingItemDto } from '../types/system-setting.types';

export const StoreProfileForm = () => {
    const t = useTranslations('SystemSettings.StoreProfile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state updated per user request
    const [formData, setFormData] = useState({
        logoUrl: '',
        name: '',
        streetAddress: '',
        postalCode: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        openingHours: '',
        facebookLink: '',
        instagramLink: '',
        tiktokLink: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const settings = await getGroupSettings('store');
            const data = { ...formData };
            settings.forEach(s => {
                const key = s.settingKey.replace('store.', '');
                if (key in data) {
                    (data as any)[key] = s.value?.toString() || '';
                }
            });
            setFormData(data);
        } catch (error) {
            console.error('Failed to load store settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('fileSizeError'));
            return;
        }

        setIsUploading(true);
        try {
            const publicUrl = await uploadLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
            toast.success(t('uploadSuccess'));
        } catch (error) {
            toast.error(t('uploadError'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const fieldNames: Record<string, string> = {
                logoUrl: 'Store Logo',
                name: 'Store Name',
                streetAddress: 'Street Address',
                postalCode: 'Postal Code',
                city: 'City',
                country: 'Country / Region',
                email: 'Email',
                phone: 'Phone',
                openingHours: 'Opening Hours',
                facebookLink: 'Facebook Link',
                instagramLink: 'Instagram Link',
                tiktokLink: 'TikTok Link'
            };

            const items: BulkUpdateSettingItemDto[] = Object.entries(formData).map(([key, value]) => ({
                key: `store.${key}`,
                settingName: fieldNames[key] || `Store ${key}`,
                value: value,
                description: `Store ${key}`
            }));

            await updateGroupSettings('store', { items });
            toast.success(t('updateSuccess'));
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || t('updateError'));
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Identity Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-navy-DEFAULT">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{t('identity')}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{t('identityDesc')}</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group transition-all hover:border-primary/50 shadow-sm mx-auto md:mx-0">
                                {formData.logoUrl ? (
                                    <>
                                        <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-3" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border-none shadow-sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 text-gray-700" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="danger"
                                                className="h-8 w-8 rounded-full shadow-sm"
                                                onClick={() => handleChange('logoUrl', '')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="text-center flex flex-col items-center cursor-pointer px-4 w-full h-full justify-center"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                                            <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="text-xs uppercase font-bold text-gray-500 group-hover:text-primary transition-colors tracking-wider">Logo</span>
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    {t('storeName')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder={t('storeNamePlaceholder')}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    className="h-10 px-6 font-semibold shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {formData.logoUrl ? t('changeLogo') : t('uploadLogo')}
                                </Button>
                                {formData.logoUrl && (
                                    <Button
                                        variant="danger"
                                        className="h-10 px-6 font-semibold shadow-sm"
                                        onClick={() => handleChange('logoUrl', '')}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t('remove')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Location Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{t('contactLocation')}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{t('contactLocationDesc')}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {t('streetAddress')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder={t('streetAddressPlaceholder')}
                                value={formData.streetAddress}
                                onChange={(e) => handleChange('streetAddress', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('postalCode')}</label>
                            <Input
                                placeholder={t('postalCodePlaceholder')}
                                value={formData.postalCode}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {t('city')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder={t('cityPlaceholder')}
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {t('country')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder={t('countryPlaceholder')}
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {t('email')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {t('phone')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder={t('phonePlaceholder')}
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Operating Details Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{t('operating')}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{t('operatingDesc')}</p>
                </div>
                <div className="p-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            {t('openingHours')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder={t('openingHoursPlaceholder')}
                            value={formData.openingHours}
                            onChange={(e) => handleChange('openingHours', e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Social Media Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{t('socialMedia')}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{t('socialMediaDesc')}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                                {t('facebookLink')}
                            </label>
                            <Input
                                placeholder={t('facebookPlaceholder')}
                                value={formData.facebookLink}
                                onChange={(e) => handleChange('facebookLink', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                                {t('instagramLink')}
                            </label>
                            <Input
                                placeholder={t('instagramPlaceholder')}
                                value={formData.instagramLink}
                                onChange={(e) => handleChange('instagramLink', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                <Tiktok className="w-4 h-4 mr-2 text-black" />
                                {t('tiktokLink')}
                            </label>
                            <Input
                                placeholder={t('tiktokPlaceholder')}
                                value={formData.tiktokLink}
                                onChange={(e) => handleChange('tiktokLink', e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Bar - Align with DishForm style */}
            <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-200 mt-10 pb-10">
                <Button
                    variant="outline"
                    onClick={loadSettings}
                    disabled={isSaving}
                    className="px-6 h-11 text-sm font-semibold text-gray-500 hover:text-gray-900 border-gray-300 transition-all"
                >
                    {t('reset')}
                </Button>

                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="default"
                    className="min-w-[160px] h-11 text-sm font-bold bg-navy-DEFAULT text-white hover:bg-navy-header shadow-lg shadow-navy-DEFAULT/10 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('saving')}
                        </>
                    ) : (
                        t('saveChanges')
                    )}
                </Button>
            </div>
        </div>
    );
};
