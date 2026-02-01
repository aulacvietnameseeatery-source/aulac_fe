"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    title?: string;
}

export function NavLink({ href, children, className, onClick, title }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            title={title}
            className={cn(
                "nav-link-base group",
                isActive ? "nav-link-active" : "nav-link-inactive",
                className
            )}
        >
            {children}

            <span className={cn(
                "nav-underline",
                isActive ? "w-full" : "nav-underline-hidden group-hover:w-full"
            )} />
        </Link>
    );
}