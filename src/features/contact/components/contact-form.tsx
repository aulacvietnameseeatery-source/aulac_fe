import { InputGroup } from "./input-group";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("Contact.Form");

  return (
    <div className="relative">
        <div className="sticky top-20 bg-white p-8 md:p-12 border rounded-sm shadow-lg flex flex-col gap-8">
            <div className="flex flex-col gap-2 shrink-0">
                 <h3 className="font-serif text-2xl text-[#1A3951] sticky top-0 bg-white z-20">{t("title")}</h3>
            </div>

            <form className="flex flex-col gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label={t("fullName")} placeholder={t("fullNamePlaceholder")} />
                    <InputGroup label={t("email")} type="email" />
                </div>

                <div className="flex flex-col gap-2">
                   <label className="tracking-[1px] uppercase text-[10px] font-bold text-slate-400">{t("subject")}</label>
                   <select className="w-full h-12 border border-slate-300 rounded-sm px-4 bg-white text-[#1A3951] focus:outline-none focus:border-[#1A3951] transition">
                     <option>{t("subjects.general")}</option>
                     <option>{t("subjects.events")}</option>
                     <option>{t("subjects.reservation")}</option>
                   </select>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="tracking-[1px] uppercase text-[10px] font-bold text-slate-400">{t("message")}</label>
                   <textarea 
                     className="w-full h-32 border border-slate-300 rounded-sm p-4 text-[#1A3951] focus:outline-none focus:border-[#1A3951] transition resize-none"
                     placeholder="How can we help you?"
                   />
                 </div>

                 <button className="w-full h-14 bg-[#1A3951] text-white rounded-sm mt-4 hover:bg-[#152e42] transition shadow-lg flex items-center justify-center gap-2 group shrink-0">
                   <span className="tracking-[3px] uppercase text-xs font-bold">{t("submit")}</span>
                 </button>
            </form>
        </div>
    </div>
  );
}