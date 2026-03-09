"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    DishDisplayDto,
    formatMenuData,
} from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";
import MenuListingClient from "./MenuListingClient";
import MenuListingLoading from "./loading";

type SupportedLocale = "vi" | "en" | "fr";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7083";

function isSupportedLocale(locale: string | undefined): locale is SupportedLocale {
    return locale === "vi" || locale === "en" || locale === "fr";
}

export default function MenuListingPage() {
    const params = useParams<{ locale?: string | string[] }>();
    const searchParams = useSearchParams();
    const table = searchParams.get("table") ?? undefined;
    const localeParam = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
    const locale: SupportedLocale = isSupportedLocale(localeParam) ? localeParam : "en";

    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const fetchMenu = async () => {
            setIsLoading(true);
            setFetchError(null);

            try {
                const response = await fetch(`${API_BASE}/api/dishes/menu?pageIndex=1&pageSize=500`);

                if (!response.ok) {
                    if (isActive) {
                        setMenuData([]);
                        setFetchError("Unable to load the menu right now. Please refresh and try again.");
                    }
                    return;
                }

                const json: ApiResponse<PagedResult<DishDisplayDto>> = await response.json();
                const rawMenu = formatMenuData(json.data?.pageData ?? []);

                if (isActive) {
                    setMenuData(
                        rawMenu.map((category) => ({
                            id: category.id,
                            name: category.name[locale] || category.name.en,
                            items: category.items.map((item) => ({
                                id: item.id,
                                name: item.name[locale] || item.name.en,
                                price: item.price,
                                desc: item.desc[locale] || item.desc.en,
                                image: item.image,
                            })),
                        }))
                    );
                    setFetchError(null);
                }
            } catch (error) {
                console.error("Lỗi fetch menu trên Client:", error);
                if (isActive) {
                    setMenuData([]);
                    setFetchError("Unable to load the menu right now. Please check your connection and try again.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchMenu();

        return () => {
            isActive = false;
        };
    }, [locale]);

    if (isLoading) {
        return <MenuListingLoading />;
    }

    return (
        <MenuListingClient
            initialMenuData={menuData}
            tableFromUrl={table}
            fetchError={fetchError}
        />
    );
}

// _OLD: Server-side page implementation kept for reference during the SSR removal.
/*
import { Suspense } from "react";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    DishDisplayDto,
    formatMenuData,
} from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";
import MenuListingClient from "./MenuListingClient";
import MenuListingLoading from "./loading";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7083";

export default async function MenuListingPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ table?: string }>;
}) {
    const [{ locale }, { table }] = await Promise.all([params, searchParams]);
    const loc = locale as 'vi' | 'en' | 'fr';

    let menuData: MenuCategory[] = [];

    try {
        const response = await fetch(
            `${API_BASE}/api/dishes/menu?pageIndex=1&pageSize=500`,
            { next: { revalidate: 300 } }
        );

        if (response.ok) {
            const json: ApiResponse<PagedResult<DishDisplayDto>> = await response.json();
            const rawMenu = formatMenuData(json.data.pageData);

            menuData = rawMenu.map(cat => ({
                id: cat.id,
                name: cat.name[loc] || cat.name.en,
                items: cat.items.map(item => ({
                    id: item.id,
                    name: item.name[loc] || item.name.en,
                    price: item.price,
                    desc: item.desc[loc] || item.desc.en,
                    image: item.image,
                })),
            }));
        }
    } catch (error) {
        console.error("Lỗi fetch menu trên Server:", error);
    }

    return (
        <Suspense fallback={<MenuListingLoading />}>
            <MenuListingClient
                initialMenuData={menuData}
                tableFromUrl={table}
            />
        </Suspense>
    );
}
*/