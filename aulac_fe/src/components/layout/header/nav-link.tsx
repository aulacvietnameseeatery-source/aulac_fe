"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
    const pathname = usePathname();
    // kiểm tra xem có đang ở trang hiện tại không
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "relative text-sm font-medium transition-colors hover:text-gold-classic",
                isActive ? "text-gold-classic" : "text-cream/80", // Active thì hiện lên màu vàng, default là màu kem
                className
            )}
        >
            {children}
            {/* Gạch chân màu vàng khi Active */}
            <span
                className={cn(
                    "absolute -bottom-1 left-0 h-0.5 w-0 bg-gold-classic transition-all duration-300",
                    isActive ? "w-full" : "group-hover:w-full"
                )}
            />
        </Link>
    );
}