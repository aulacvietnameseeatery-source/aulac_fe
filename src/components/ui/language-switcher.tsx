"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FR, GB, VN } from "country-flag-icons/react/3x2";
// Nhớ sửa đường dẫn import này trỏ đúng vào file Dropdown của bạn nhé
import { Dropdown, DropdownContent, DropdownItem } from "./dropdown";

interface LanguageSwitcherProps {
    className?: string;
    isMobile?: boolean;
    variant?: "default" | "admin";
}

const LANGUAGES = [
    { code: 'en', label: 'English (EN)' },
    { code: 'fr', label: 'Français (FR)' },
    { code: 'vi', label: 'Tiếng Việt (VI)' },
];

const FLAG_MAP: Record<string, React.ElementType> = {
    fr: FR,
    en: GB,
    vi: VN,
};

export function LanguageSwitcher({
                                     className,
                                     isMobile = false,
                                     variant = "default"
                                 }: LanguageSwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        const query = searchParams.toString();
        const fullPath = query ? `${newPath}?${query}` : newPath;
        startTransition(() => {
            router.replace(fullPath);
            router.refresh();
        });
    };

    const iconColor = variant === "admin" ? "text-[#1A3A52]" : "text-[#C5A059]";
    const textColor = variant === "admin" ? "text-[#1A3A52]" : "text-[#0f172a]";
    const currentLang = locale.toUpperCase();
    const CurrentFlag = FLAG_MAP[locale] ?? GB;

    // Nút hiển thị trên màn hình
    const trigger = (
        <button
            disabled={isPending}
            className={cn(
                "flex items-center gap-2 transition-all duration-300 backdrop-blur-sm",
                variant === "admin"
                    ? "h-9 px-3 rounded-lg bg-white hover:bg-[#F5F8FA] shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                    : "border-[#C5A059]/30 hover:border-[#C5A059] shadow-sm",
                isPending && "opacity-50 cursor-wait",
                className
            )}
        >
            <CurrentFlag className={cn("rounded-[2px] shadow-sm", variant === "admin" ? "w-5 h-4" : "w-5 h-3.5")} />
            <span className={cn("font-semibold text-xs tracking-[0.08em]", textColor)}>
                {currentLang}
            </span>
            <ChevronDown size={13} className={cn(iconColor, "opacity-80")} />
        </button>
    );

    return (
        <Dropdown trigger={trigger} align="end">
            <DropdownContent className={cn(
                "backdrop-blur-sm shadow-xl rounded-xl",
                variant === "admin"
                    ? "w-44 bg-white border border-gray-200/90"
                    : "w-40 bg-white/95 border border-[#C5A059]/20"
            )}>
                {LANGUAGES.map((lang) => (
                    <DropdownItem
                        key={lang.code}
                        selected={locale === lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={cn(
                            "tracking-wide px-3 py-2 rounded-lg mx-1 my-1 text-sm flex items-center gap-2",
                            locale === lang.code
                                ? (variant === "admin" ? "text-[#1A3A52] bg-[#1A3A52]/8 font-semibold" : "text-[#C5A059] bg-[#C5A059]/10")
                                : "text-[#0f172a] hover:bg-slate-50"
                        )}
                    >
                        {(() => {
                            const LangFlag = FLAG_MAP[lang.code] ?? GB;
                            return <LangFlag className="w-5 h-3.5 rounded-[2px] shadow-sm" />;
                        })()}
                        {lang.label}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </Dropdown>
    );
}