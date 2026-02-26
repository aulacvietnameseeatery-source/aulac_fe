

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerInfoFormData } from "../types";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CustomerInfoFormProps {
  tableNumber?: string;
}

export function CustomerInfoForm({ tableNumber = "05" }: CustomerInfoFormProps) {
  const t = useTranslations("FillInforCustomer");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create validation schema with translations
  const customerInfoSchema = z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().min(1, t("form.errors.phoneRequired")),
    emailAddress: z.string().email(t("form.errors.emailInvalid")).optional().or(z.literal("")),
    tableNumber: z.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      tableNumber: `Table ${tableNumber}`,
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: CustomerInfoFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Integrate with API when ready
      console.log("Customer Info:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to QR menu with table number
      router.push(`/menu-qr?table=${encodeURIComponent(data.tableNumber || `Table ${tableNumber}`)}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-96 min-h-[780px] p-6 bg-stone-50 inline-flex flex-col justify-center items-center">
      <div className="w-full max-w-96 flex flex-col justify-start items-center">
        {/* Welcome Section */}
        <div className="pb-10 flex flex-col justify-start items-start">
          <div className="min-w-80 flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-center">
              <div className="text-center justify-center text-blue-950 text-2xl font-bold font-display leading-8">
                {t("title")}
              </div>
            </div>
            <div className="w-full max-w-80 pb-[0.63px] flex flex-col justify-start items-center">
              <div className="text-center justify-center text-black text-sm font-bold font-sans leading-6">
                {t("subtitle")}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="self-stretch pb-4 flex flex-col justify-start items-start">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            
            {/* Full Name Field */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-950 text-xs font-bold font-sans uppercase leading-4 tracking-wide">
                  {t("form.fullName")}
                </div>
              </label>
              <Input
                {...register("fullName")}
                className="self-stretch h-12 bg-white rounded-lg border border-blue-950/10"
                placeholder={t("form.fullNamePlaceholder")}
              />
            </div>

            {/* Phone Number Field */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-950 text-xs font-bold font-sans uppercase leading-4 tracking-wide">
                  {t("form.phoneNumber")} <span className="text-red-500">*</span>
                </div>
              </label>
              <Input
                {...register("phoneNumber")}
                className={`self-stretch h-12 bg-white rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-blue-950/10'}`}
                placeholder={t("form.phoneNumberPlaceholder")}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Email Address Field */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-950 text-xs font-bold font-sans uppercase leading-4 tracking-wide">
                  {t("form.emailAddress")}
                </div>
              </label>
              <Input
                {...register("emailAddress")}
                type="email"
                className={`self-stretch h-12 bg-white rounded-lg border ${errors.emailAddress ? 'border-red-500' : 'border-blue-950/10'}`}
                placeholder={t("form.emailAddressPlaceholder")}
              />
              {errors.emailAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.emailAddress.message}</p>
              )}
            </div>

            {/* Table Number Field (Read-only) */}
            <div className="self-stretch pb-4 flex flex-col justify-start items-start gap-1.5">
              <label className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-neutral-950 text-xs font-bold font-sans uppercase leading-4 tracking-wide">
                  {t("form.tableNumber")}
                </div>
              </label>
              <div className="self-stretch relative flex flex-col justify-start items-start">
                <div className="self-stretch h-12 relative bg-white rounded-lg border border-blue-950/10 overflow-hidden flex items-center px-4">
                  <input
                    {...register("tableNumber")}
                    readOnly
                    className="w-full bg-transparent text-neutral-950 text-sm font-bold font-sans leading-6 outline-none"
                  />
                  <div className="py-0.5 flex flex-col justify-start items-start">
                    <Lock className="w-5 h-5 text-neutral-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-stretch py-4 bg-amber-400 rounded-xl shadow-[0px_4px_6px_-4px_rgba(212,165,116,0.20)] shadow-[0px_10px_15px_-3px_rgba(212,165,116,0.20)] inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-center justify-center text-stone-100 text-xs font-bold font-sans uppercase leading-4 tracking-wider">
                {isSubmitting ? t("form.submitting") : t("form.startDining")}
              </span>
              <div className="py-0.5 inline-flex flex-col justify-start items-start">
                <ArrowRight className="w-3.5 h-4 text-blue-950" />
              </div>
            </button>
          </div>
        </form>

        {/* Footer Section */}
        <div className="pt-12 flex flex-col justify-start items-start">
          <div className="opacity-30 inline-flex justify-start items-center gap-2">
            <div className="w-8 h-px bg-blue-950" />
            <div className="inline-flex flex-col justify-start items-start">
              <div className="justify-center text-blue-950 text-[10px] font-bold font-sans uppercase leading-4 tracking-widest">
                {t("footer")}
              </div>
            </div>
            <div className="w-8 h-px bg-blue-950" />
          </div>
        </div>
      </div>
    </div>
  );
}
