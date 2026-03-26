import {
  ContactHero,
  ContactInfoList,
  ContactMap,
  ContactSocials,
} from "@/features/customer/contact";
import { useTranslations } from "next-intl";
import { Metadata } from "next";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <ContactHero />

      <div className="w-full flex flex-col gap-24 py-20">
        <ContactInfoList />
        <ContactMap />
        <ContactSocials />
      </div>
    </main>
  );
}

