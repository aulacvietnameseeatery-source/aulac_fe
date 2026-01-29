import {
  ContactHero,
  ContactInfoList,
  ContactMap,
  ContactSocials,
  ContactForm,
} from "@/features/contact";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("Contact.Footer");

  return (
    <main className="min-h-screen bg-[#FBFAF7] py-16 px-4 flex flex-col items-center gap-16 pt-[120px]">
      <ContactHero />

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20">
        <div className="flex flex-col gap-12">
          <ContactInfoList />
          <ContactMap />
          <ContactSocials />
        </div>

        <ContactForm />
      </div>

      <footer className="w-full border-t border-slate-200 bg-[#FBFAF7] py-12 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center">
            <b className="text-[10px] text-slate-400 font-sans uppercase tracking-[1px] leading-3.75">
             {t("copyright")}
            </b>
        </div>
      </footer>
    </main>
  );
}
