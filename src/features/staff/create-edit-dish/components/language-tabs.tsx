import React from "react";
import { UseFormReturn } from "react-hook-form";
import { DishFormValues, LANGUAGES, Language } from "../types/schema";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { translateDishContent } from "../services/dish.service";
import { DishI18nDto } from "../types/dish-detail.types";

interface LanguageTabsProps {
  form: UseFormReturn<DishFormValues>;
  activeTab: Language;
  setActiveTab: (lang: Language) => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English (EN)",
  vi: "Tiếng Việt (VI)",
  fr: "Français (FR)",
};

export const LanguageTabs: React.FC<LanguageTabsProps> = ({
  form,
  activeTab,
  setActiveTab,
}) => {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  // --- API Mutation ---
  const translateMutation = useMutation({
    mutationFn: translateDishContent,
    onSuccess: (data) => {
      // Data trả về: { translations: { "fr": { dishName: "..." }, "vi": { ... } } }
      let count = 0;

      Object.entries(data.translations).forEach(([langKey, content]) => {
        const targetLang = langKey as Language;
        
        // Bỏ qua nếu response trả về ngôn ngữ trùng với tab hiện tại (đề phòng)
        if (targetLang === activeTab) return;

        // Helper để set value nhanh
        const setField = (field: keyof DishI18nDto, value?: string | null) => {
          if (value) {
            // Cấu trúc form: i18n.vi.dishName
            setValue(`i18n.${targetLang}.${field}` as any, value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        };

        setField("dishName", content.dishName);
        setField("description", content.description);
        setField("shortDescription", content.shortDescription);
        setField("slogan", content.slogan);
        setField("note", content.note);
        
        count++;
      });

      //toast.success(`Translated content to ${count} other languages!`);
    },
    onError: (err: any) => {
      //toast.error(err?.message || "Translation failed. Please try again.");
    },
  });

  // --- Handler ---
  const handleAutoTranslate = () => {
    // 1. Lấy dữ liệu từ tab hiện tại
    const currentData = getValues(`i18n.${activeTab}`);

    // 2. Validate cơ bản
    if (!currentData?.dishName) {
      //toast.warning(`Please enter a Dish Name for ${LANGUAGE_LABELS[activeTab]} first.`);
      return;
    }

    // 3. Gọi API
    translateMutation.mutate({
      sourceLang: activeTab,
      data: {
        dishName: currentData.dishName,
        description: currentData.description,
        shortDescription: currentData.shortDescription,
        slogan: currentData.slogan,
        note: currentData.note,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between border-b border-gray-100 pr-4 bg-gray-50/30">
      {/* --- Minimal Tab Header --- */}
      <div className="flex items-center border-b border-gray-100">
        {LANGUAGES.map((lang) => {
          const hasError = !!errors.i18n?.[lang];
          const isActive = activeTab === lang;
          
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2",
                isActive
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <span>{LANGUAGE_LABELS[lang]}</span>
              {hasError && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
            </button>
          );
        })}
      </div>
        {/* Right: Translate Button */}
        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={translateMutation.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          title={`Translate content from ${activeTab.toUpperCase()} to other languages`}
        >
          {translateMutation.isPending ? (
            <Loader2 size={14} className="animate-spin text-purple-600" />
          ) : (
            <Sparkles size={14} className="text-purple-600 group-hover:text-purple-800 transition-colors" />
          )}
          <span className="hidden sm:inline">Auto Translate</span>
        </button>
      </div>

      {/* --- Tab Content --- */}
      <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Dish Name */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              Dish Name ({activeTab.toUpperCase()}) <span className="text-red-500">*</span>
            </label>
            <input
              key={`dishName-${activeTab}`}
              {...register(`i18n.${activeTab}.dishName`)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base",
                errors.i18n?.[activeTab]?.dishName ? "border-red-300 bg-red-50" : "border-gray-200"
              )}
              placeholder={`e.g. Traditional Beef Noodle Soup`}
            />
            {errors.i18n?.[activeTab]?.dishName && (
              <p className="text-sm text-red-500 font-medium">{errors.i18n[activeTab]?.dishName?.message}</p>
            )}
        </div>

        {/* Description */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              Description ({activeTab.toUpperCase()})
            </label>
            <textarea
              key={`description-${activeTab}`}
              {...register(`i18n.${activeTab}.description`)}
              rows={5}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-base",
                errors.i18n?.[activeTab]?.description ? "border-red-300 bg-red-50" : "border-gray-200"
              )}
              placeholder={`Describe the taste, ingredients, and story of the dish in ${activeTab.toUpperCase()}...`}
            />
             {errors.i18n?.[activeTab]?.description && (
              <p className="text-sm text-red-500 font-medium">{errors.i18n[activeTab]?.description?.message}</p>
            )}
        </div>

        {/* Optional Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Short Description</label>
              <input
                key={`shortDescription-${activeTab}`}
                {...register(`i18n.${activeTab}.shortDescription`)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Max 100 chars for mobile view"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Slogan</label>
              <input
                key={`slogan-${activeTab}`}
                {...register(`i18n.${activeTab}.slogan`)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Best seller!"
              />
            </div>
        </div>
          
        <div className="space-y-2 pt-2 border-t border-dashed border-gray-200">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Note ({activeTab})</label>
              <input
                key={`note-${activeTab}`}
                {...register(`i18n.${activeTab}.note`)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-yellow-50/50 text-sm"
                placeholder="Note for chefs or waiters regarding this language version..."
              />
        </div>
      </div>
    </div>
  );
};