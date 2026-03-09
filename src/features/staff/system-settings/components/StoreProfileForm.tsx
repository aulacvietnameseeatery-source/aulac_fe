import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Save, Loader2, Upload } from 'lucide-react';
import { getGroupSettings, updateGroupSettings, uploadLogo } from '../services/system-setting.service';
import { BulkUpdateSettingItemDto } from '../types/system-setting.types';

export const StoreProfileForm = () => {
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
            toast.error('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const publicUrl = await uploadLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
            toast.success('Logo uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload logo');
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
                openingHours: 'Opening Hours'
            };

            const items: BulkUpdateSettingItemDto[] = Object.entries(formData).map(([key, value]) => ({
                key: `store.${key}`,
                settingName: fieldNames[key] || `Store ${key}`,
                value: value,
                description: `Store ${key}`
            }));

            await updateGroupSettings('store', { items });
            toast.success('Store profile updated successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.userMessage || 'Failed to save store profile');
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
        <div className="p-8 max-w-5xl">
            {/* Header / Logo Section */}
            <div className="flex items-start gap-8 mb-10">
                <div className="flex-shrink-0">
                    <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group transition-all hover:border-primary/50">
                        {formData.logoUrl ? (
                            <>
                                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-4" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 rounded-full bg-white hover:bg-gray-100 border-none shadow-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 text-gray-700" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="danger"
                                        className="h-9 w-9 rounded-full shadow-sm"
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
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                    <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">Click to upload logo</span>
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
                <div className="flex flex-col justify-center pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Store Identity</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm">This logo will be displayed on receipts, invoices, and the public website. Recommended size: 512x512px.</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            {formData.logoUrl ? 'Change Image' : 'Upload Image'}
                        </Button>
                        {formData.logoUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleChange('logoUrl', '')}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* General Information */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Enter store name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="h-11"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. Avenue Jacques Dalcroze 9"
                                value={formData.streetAddress}
                                onChange={(e) => handleChange('streetAddress', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. 1007"
                                value={formData.postalCode}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. Lausanne"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Country / Region <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. Switzerland"
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                            <Input
                                type="email"
                                placeholder="contact@restaurant.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="+84 123 456 789"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Hours <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="E.g. Mon - Sun: 08:00 AM - 10:00 PM"
                            value={formData.openingHours}
                            onChange={(e) => handleChange('openingHours', e.target.value)}
                            className="h-11"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-start pt-10 mt-10 border-t border-gray-100">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="min-w-[160px] h-12 text-base font-medium shadow-md shadow-primary/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="ml-4 h-12 text-base font-medium text-gray-500"
                    onClick={loadSettings}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};
