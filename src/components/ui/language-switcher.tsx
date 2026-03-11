"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

    const iconColor = variant === "admin" ? "text-gray-600" : "text-[#C5A059]";
    const textColor = variant === "admin" ? "text-gray-700" : "text-[#0f172a]";
    const currentLang = locale.toUpperCase();

    // Nút hiển thị trên màn hình
    const trigger = (
        <button
            disabled={isPending}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 bg-white/80 backdrop-blur-sm",
                variant === "admin"
                    ? "border-gray-200 hover:bg-gray-50"
                    : "border-[#C5A059]/30 hover:border-[#C5A059] shadow-sm",
                isPending && "opacity-50 cursor-wait",
                className
            )}
        >
            <Globe size={16} className={iconColor} />
            <span className={cn("font-medium text-sm tracking-wide font-serif", textColor)}>
                {currentLang}
            </span>
            <ChevronDown size={14} className={iconColor} />
        </button>
    );

    return (
        <Dropdown trigger={trigger} align="end">
            <DropdownContent className="w-40 bg-white/95 backdrop-blur-sm border border-[#C5A059]/20 shadow-xl rounded-xl">
                {LANGUAGES.map((lang) => (
                    <DropdownItem
                        key={lang.code}
                        selected={locale === lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={cn(
                            "font-serif tracking-wide px-4 py-2.5 rounded-lg mx-1 my-1",
                            locale === lang.code
                                ? "text-[#C5A059] bg-[#C5A059]/10"
                                : "text-[#0f172a] hover:bg-slate-50"
                        )}
                    >
                        {lang.label}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </Dropdown>
    );
}