import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGroupSettings, updateGroupSettings } from "../services/system-setting.service";
import { BulkUpdateSettingItemDto } from "../types/system-setting.types";

const LOCALES = ["en", "vi", "fr"];

const TEXT_KEYS = [
    "about.founders.label", "about.founders.title", "about.founders.paragraph_1", "about.founders.paragraph_2", "about.founders.quote", "about.founders.quote_author",
    "about.journey.title", "about.journey.paragraph_1", "about.journey.paragraph_2", "about.journey.quote", "about.journey.paragraph_3",
    "about.philosophy.label", "about.philosophy.title", "about.philosophy.value_1_title", "about.philosophy.value_1_desc", "about.philosophy.value_2_title", "about.philosophy.value_2_desc",
    "about.legacy.title", "about.legacy.subtitle", "about.legacy.paragraph_1", "about.legacy.paragraph_2", "about.legacy.paragraph_3", "about.legacy.paragraph_4"
];

const getInitialData = () => {
    const data: Record<string, string> = {};
    TEXT_KEYS.forEach(k => LOCALES.forEach(l => data[`${k}_${l}`] = ""));
    return data;
};

// Textarea replacement for multiline inputs
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

export const AboutUsSettingsForm = () => {
    const t = useTranslations("SystemSettings.StoreProfile");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
            console.error("Failed to load about us settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        const key = `${field}_${activeLocale}`;
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const getValue = (field: string) => {
        const key = `${field}_${activeLocale}`;
        return formData[key] || "";
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Language Selector */}
            <div className="bg-white border flex items-center justify-between border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span>Language specific content:</span>
                </div>
                <div className="flex gap-2">
                    {LOCALES.map(loc => (
                        <Button
                            key={loc}
                            variant={activeLocale === loc ? "default" : "outline"}
                            size="sm"
                            className="uppercase w-16"
                            onClick={() => setActiveLocale(loc)}
                        >
                            {loc}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Founders Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Founders Area</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Label ({activeLocale})</label>
                            <Input value={getValue("about.founders.label")} onChange={(e) => handleChange("about.founders.label", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                            <Input value={getValue("about.founders.title")} onChange={(e) => handleChange("about.founders.title", e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 1 ({activeLocale})</label>
                        <Textarea value={getValue("about.founders.paragraph_1")} onChange={(e) => handleChange("about.founders.paragraph_1", e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 2 ({activeLocale})</label>
                        <Textarea value={getValue("about.founders.paragraph_2")} onChange={(e) => handleChange("about.founders.paragraph_2", e.target.value)} rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/30">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quote ({activeLocale})</label>
                            <Textarea value={getValue("about.founders.quote")} onChange={(e) => handleChange("about.founders.quote", e.target.value)} rows={2} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quote Author ({activeLocale})</label>
                            <Input value={getValue("about.founders.quote_author")} onChange={(e) => handleChange("about.founders.quote_author", e.target.value)} className="h-12" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Journey Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Journey Area</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                        <Input value={getValue("about.journey.title")} onChange={(e) => handleChange("about.journey.title", e.target.value)} className="h-12" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 1 (HTML supported) ({activeLocale})</label>
                        <Textarea value={getValue("about.journey.paragraph_1")} onChange={(e) => handleChange("about.journey.paragraph_1", e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 2 ({activeLocale})</label>
                        <Textarea value={getValue("about.journey.paragraph_2")} onChange={(e) => handleChange("about.journey.paragraph_2", e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quote ({activeLocale})</label>
                        <Textarea value={getValue("about.journey.quote")} onChange={(e) => handleChange("about.journey.quote", e.target.value)} rows={2} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 3 ({activeLocale})</label>
                        <Textarea value={getValue("about.journey.paragraph_3")} onChange={(e) => handleChange("about.journey.paragraph_3", e.target.value)} rows={3} />
                    </div>
                </div>
            </div>

            {/* Philosophy Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Philosophy Area</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Label ({activeLocale})</label>
                            <Input value={getValue("about.philosophy.label")} onChange={(e) => handleChange("about.philosophy.label", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                            <Input value={getValue("about.philosophy.title")} onChange={(e) => handleChange("about.philosophy.title", e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/30">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Value 1 Title ({activeLocale})</label>
                            <Input value={getValue("about.philosophy.value_1_title")} onChange={(e) => handleChange("about.philosophy.value_1_title", e.target.value)} className="h-12" />
                            <label className="block text-sm font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide">Value 1 Description ({activeLocale})</label>
                            <Textarea value={getValue("about.philosophy.value_1_desc")} onChange={(e) => handleChange("about.philosophy.value_1_desc", e.target.value)} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Value 2 Title ({activeLocale})</label>
                            <Input value={getValue("about.philosophy.value_2_title")} onChange={(e) => handleChange("about.philosophy.value_2_title", e.target.value)} className="h-12" />
                            <label className="block text-sm font-bold text-gray-700 mb-2 mt-4 uppercase tracking-wide">Value 2 Description ({activeLocale})</label>
                            <Textarea value={getValue("about.philosophy.value_2_desc")} onChange={(e) => handleChange("about.philosophy.value_2_desc", e.target.value)} rows={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legacy Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Legacy Area</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title ({activeLocale})</label>
                            <Input value={getValue("about.legacy.title")} onChange={(e) => handleChange("about.legacy.title", e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Subtitle ({activeLocale})</label>
                            <Input value={getValue("about.legacy.subtitle")} onChange={(e) => handleChange("about.legacy.subtitle", e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 1 ({activeLocale})</label>
                            <Textarea value={getValue("about.legacy.paragraph_1")} onChange={(e) => handleChange("about.legacy.paragraph_1", e.target.value)} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 2 ({activeLocale})</label>
                            <Textarea value={getValue("about.legacy.paragraph_2")} onChange={(e) => handleChange("about.legacy.paragraph_2", e.target.value)} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 3 ({activeLocale})</label>
                            <Textarea value={getValue("about.legacy.paragraph_3")} onChange={(e) => handleChange("about.legacy.paragraph_3", e.target.value)} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Paragraph 4 ({activeLocale})</label>
                            <Textarea value={getValue("about.legacy.paragraph_4")} onChange={(e) => handleChange("about.legacy.paragraph_4", e.target.value)} rows={3} />
                        </div>
                    </div>
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
