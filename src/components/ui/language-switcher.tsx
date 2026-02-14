"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    className?: string;
    isMobile?: boolean;
    variant?: "default" | "admin";
}

export function LanguageSwitcher({
    className,
    isMobile = false,
    variant = "default"
}: LanguageSwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        startTransition(() => {
            router.replace(newPath);
            router.refresh();
        });
    };

    const isActive = (lang: string) => locale === lang;

    // Styles based on variant
    const activeColor = variant === "admin" ? "text-blue-600 font-bold" : "text-[#D5A673]";
    const inactiveColor = variant === "admin" ? "text-gray-500 hover:text-blue-600" : "text-white/70 hover:text-[#D5A673]";
    const separatorColor = variant === "admin" ? "text-gray-300" : "text-white opacity-40";
    const iconColor = variant === "admin" ? "text-gray-600" : "text-[#D5A673]";

    return (
        <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
            {!isMobile && <Globe size={16} className={iconColor} />}
            <div className={cn("flex items-center gap-2 tracking-wide font-medium", isMobile ? "text-[16px]" : "text-[13px]")}>
                <button
                    onClick={() => switchLocale('en')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer transition-colors p-1",
                        isActive('en') ? activeColor : inactiveColor,
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    EN
                </button>
                <span className={separatorColor}>|</span>
                <button
                    onClick={() => switchLocale('fr')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer transition-colors p-1",
                        isActive('fr') ? activeColor : inactiveColor,
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    FR
                </button>
                <span className={separatorColor}>|</span>
                <button
                    onClick={() => switchLocale('vi')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer transition-colors p-1",
                        isActive('vi') ? activeColor : inactiveColor,
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    VI
                </button>
            </div>
        </div>
    );
}
