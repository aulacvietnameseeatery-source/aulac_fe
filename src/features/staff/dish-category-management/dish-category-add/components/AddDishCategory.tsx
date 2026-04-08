"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { useCreateDishCategory } from '../hooks/useCreateDishCategory';
import { createCategoryService } from '../services/createCategoryService';
import { Button } from '@/components/ui/button';
import FormHeader from './FormHeader';
import FormCard from './FormCard';

const LANGUAGES = ['en', 'vi', 'fr'] as const;
type Language = typeof LANGUAGES[number];
const LANG_LABELS: Record<Language, string> = { en: 'EN', vi: 'VI', fr: 'FR' };

interface LangContent { name: string; description: string; }
type I18nForm = Record<Language, LangContent>;
type I18nErrors = Partial<Record<Language, { name?: string; description?: string }>>;

export default function AddDishCategory() {
  const router = useRouter();
  const t = useTranslations('DishCategory.Add');
  const { createCategory, isLoading, error } = useCreateDishCategory();

  const [activeTab, setActiveTab] = useState<Language>('en');
  const [i18n, setI18n] = useState<I18nForm>({
    en: { name: '', description: '' },
    vi: { name: '', description: '' },
    fr: { name: '', description: '' },
  });
  const [errors, setErrors] = useState<I18nErrors>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    const currentContent = i18n[activeTab];
    if (!currentContent.name.trim()) return;

    setIsTranslating(true);
    try {
      const result = await createCategoryService.translateContent({
        sourceLang: activeTab,
        data: { valueName: currentContent.name, description: currentContent.description },
      });
      setI18n(prev => {
        const next = { ...prev };
        Object.entries(result.translations).forEach(([lang, content]) => {
          if (lang !== activeTab && LANGUAGES.includes(lang as Language)) {
            next[lang as Language] = { name: content.valueName, description: content.description };
          }
        });
        return next;
      });
    } catch {
      toast.error(t('autoTranslateError'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleChange = (lang: Language, field: keyof LangContent, value: string) => {
    setI18n(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
    if (errors[lang]?.[field]) {
      setErrors(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: undefined } }));
    }
  };

  const validateForm = () => {
    const newErrors: I18nErrors = {};
    for (const lang of LANGUAGES) {
      if (!i18n[lang].name.trim()) {
        newErrors[lang] = { ...newErrors[lang], name: t('validation.nameRequired') };
      } else if (i18n[lang].name.length > 100) {
        newErrors[lang] = { ...newErrors[lang], name: t('validation.nameMaxLength') };
      }
      if (i18n[lang].description.length > 100) {
        newErrors[lang] = { ...newErrors[lang], description: t('validation.descriptionMaxLength') };
      }
    }
    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstErrorLang = LANGUAGES.find(l => newErrors[l]);
      if (firstErrorLang) setActiveTab(firstErrorLang);
    }
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t('validation.fixErrors'));
      return;
    }
    try {
      await createCategory({
        i18n: {
          en: { name: i18n.en.name.trim(), description: i18n.en.description.trim() || undefined },
          vi: { name: i18n.vi.name.trim(), description: i18n.vi.description.trim() || undefined },
          fr: { name: i18n.fr.name.trim(), description: i18n.fr.description.trim() || undefined },
        },
        isDisabled: false,
      });
      router.push('/dashboard/dish-category');
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title={t('title')}
          subtitle={t('subtitle')}
          onCancel={() => router.back()}
          onSave={handleSave}
          isLoading={isLoading}
          saveButtonText={t('saveButton')}
        />
        <FormCard error={error}>
          {/* Language tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-4">
            <div className="flex">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === lang ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } ${errors[lang] ? 'text-red-500' : ''}`}
                >
                  {LANG_LABELS[lang]}
                  {errors[lang] && <span className="ml-1 text-red-500">•</span>}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="translate"
              size="sm"
              onClick={handleAutoTranslate}
              disabled={isTranslating}
              className="group h-auto px-3 py-1.5 text-xs font-semibold mb-1"
            >
              {isTranslating ? (
                <Loader2 size={14} className="animate-spin text-purple-600" />
              ) : (
                <Sparkles size={14} className="text-purple-600 group-hover:text-purple-800 transition-colors" />
              )}
              <span className="hidden sm:inline ml-1">{t('autoTranslate')}</span>
            </Button>
          </div>
          {LANGUAGES.map(lang => (
            <div key={lang} className={lang === activeTab ? 'space-y-4' : 'hidden'}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t('categoryName')}<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[lang]?.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={t('categoryNamePlaceholder')}
                  value={i18n[lang].name}
                  onChange={e => handleChange(lang, 'name', e.target.value)}
                />
                {errors[lang]?.name && <p className="text-xs text-red-500">{errors[lang]?.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('description')}</label>
                <textarea
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[lang]?.description ? 'border-red-500' : 'border-gray-300'}`}
                  rows={3}
                  placeholder={t('descriptionPlaceholder')}
                  value={i18n[lang].description}
                  onChange={e => handleChange(lang, 'description', e.target.value)}
                />
                {errors[lang]?.description && <p className="text-xs text-red-500">{errors[lang]?.description}</p>}
              </div>
            </div>
          ))}
        </FormCard>
      </div>
    </div>
  );
}

