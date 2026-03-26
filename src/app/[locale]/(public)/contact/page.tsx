import {
  ContactHero,
  ContactInfoList,
  ContactMap,
  ContactSocials,
  ContactForm,
} from "@/features/customer/contact";
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

    </main>
  );
}
