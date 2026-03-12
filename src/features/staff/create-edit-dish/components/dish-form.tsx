"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from "lucide-react";

import { DishFormValues, Language, mapDishToFormValues } from "../types/schema";

import { useDishForm } from "../hooks/useDishForm";
import { LanguageTabs } from "./language-tabs";
import { SectionWrapper } from "./section-wrapper";
import { ThreeSixtySection } from "./three-sixty-section";
import { CoreInfoSection } from "./core-info-section";
import { StaticImageSection } from "./static-image-section";
import { AdditionalSection } from "./additional-section";
import { useRouter } from "next/navigation";
import { DishImagesState, useDishImages } from "../hooks/useDishImages";
import { useCreateDish } from "../hooks/useCreateDish";
import { useEditDish } from "../hooks/useEditDish";
import { getAllActiveStatus, getAllCategories, getAllDiets, getAllTag, getDishById } from "../services/dish.service";
import { useDishEditMedia } from "../hooks/useDishEditMedia";
import { useTranslations } from "next-intl";

type DishMutationVariables  = {
  form: DishFormValues;
  images: DishImagesState;
};

type DishFormProps = {
  mode: "create" | "edit";
  dishId?: number;
  onSuccess?: () => void;
};

export function DishForm({ mode, dishId, onSuccess }: DishFormProps) {
  const t = useTranslations("Dish.Form");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Language>("en");
  const isEdit = mode === "edit";

  const {
      staticImages,
      images360,
      setStaticImages,
      setImages360
    } = useDishImages();

  const {
      existingImages,
      setExistingImages,
      removedMediaIds,
      removeExistingImage
    } = useDishEditMedia();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories()
  })

  const { data: statuses } = useQuery({
    queryKey: ["status"],
    queryFn: () => getAllActiveStatus(),
  })

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getAllTag(),
  })

  const { data: diets } = useQuery({ queryKey: ["diets"], queryFn: () => getAllDiets() });

  /* ---------------------- Form ---------------------- */
  const form = useDishForm();

  const { trigger, getValues } = form;
  const { onCreate, loading } = useCreateDish();
  const { onEdit } = useEditDish();

  /* ---------------------- Load dish (edit) ---------------------- */
  const { data, isLoading } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => getDishById(dishId!),
    enabled: isEdit && !!dishId,
  });

  useEffect(() => {
    if (data && categories?.length && statuses?.length) {
      form.reset(mapDishToFormValues(data));

      setExistingImages(
        data.media
            .filter(m => m.mediaType === "IMAGE")
            .map(m => ({
            mediaId: m.mediaId,
            url: m.url,
            isPrimary: m.isPrimary,
            }))
        );
    }
  }, [data, form]);

  /* ---------------------- Mutation ---------------------- */
  const mutation = useMutation({
    mutationFn: ({ form, images }: DishMutationVariables) =>
      isEdit ? onEdit(dishId!, form, images, removedMediaIds) : onCreate(form, images),
    onSuccess: () => {
      toast.success(isEdit ? t("toast.updated") : t("toast.created"));
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? t("toast.error"));
    },
  });

  /* ---------------------- Submit ---------------------- */
  const onSubmit = async () => {
    console.log(form.getValues())
    const valid = await form.trigger();
    if (!valid) return;
    const imagesState: DishImagesState = {
        staticImages,
        images360,
    };
    mutation.mutate({form: form.getValues(), images: imagesState});
  };

  if (isEdit && isLoading) {
    return <div className="p-6 text-sm text-muted">Loading dish…</div>;
  }

  /* ---------------------- UI ---------------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex-1 w-full max-w-7xl mx-auto space-y-6 mt-6">
          <div className="flex items-center justify-between">
            {/* <button onClick={() => router.back()} className="mt-1 p-2 hover:bg-gray-200 rounded-full text-gray-600"><ArrowLeft size={24} /></button> */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{isEdit ? t("header.editTitle") : t("header.createTitle")}</h1>
              <p className="text-gray-500 mt-1">{isEdit ? t("header.editDescription") : t("header.createDescription")}</p>
            </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-16 space-y-6 mt-6">
        
        {/* ROW 1: CORE INFORMATION */}
        <SectionWrapper title={t("core.title")} subtitle={t("core.subtitle")}>
          <CoreInfoSection
            form={form}
            statuses={statuses}
            categories={categories}
            tags={tags} 
            diets={diets}
          />
        </SectionWrapper>

        {/* ROW 2: MULTILINGUAL CONTENT */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900">{t("multilingual.title")}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t("multilingual.subtitle")}</p>
            </div>
            <div className="p-2">
                <LanguageTabs form={form} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>

        {/* ROW 3: MEDIA (360 + Static) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* 3.1: 360 View */}
            <SectionWrapper title={t("media.media360.title")} subtitle={t("media.media360.subtitle")}>
                <ThreeSixtySection frames={images360} onChange={setImages360} />
            </SectionWrapper>

            {/* 3.2: Static Images */}
            <SectionWrapper title={t("media.gallery.title")} subtitle={t("media.gallery.subtitle")}>
                <StaticImageSection
                    images={staticImages}
                    existingImages={existingImages}
                    onChange={setStaticImages}
                    onRemoveExisting={removeExistingImage}
                />
            </SectionWrapper>
        </div>

        {/* ROW 4: ADDITIONAL INFO */}
        <div>
            <AdditionalSection form={form} />
        </div>

      </main>

      {/* Form Actions (Non-sticky) */}
        <div className="w-full max-w-7xl mx-auto pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Trash2 size={18} /> {t("actions.discard")}
            </button>
            
            <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
            
            {isEdit ? (
                <button 
                    type="button" 
                    onClick={onSubmit} 
                    disabled={mutation.isPending}
                    className="px-8 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save size={18} /> {mutation.isPending ? t("actions.saving") : t("actions.saveChanges")}
                </button>
            ) : (
                <button 
                    type="button" 
                    onClick={onSubmit} 
                    disabled={mutation.isPending}
                    className="px-8 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save size={18} /> {mutation.isPending ? t("actions.creating") : t("actions.createDish")}
                </button>
            )}
        </div>
    </div>
  );
}
