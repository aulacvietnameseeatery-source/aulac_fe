import { Suspense } from "react";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    DishDisplayDto,
    formatMenuData,
} from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";
import MenuListingClient from "./MenuListingClient";
import MenuListingLoading from "./loading";

// Dùng trực tiếp fetch thay vì api.get để:
// 1) Tránh auth logic (localStorage, token refresh) không dùng được trên Server
// 2) Cho phép ISR caching qua next.revalidate
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083";

export default async function MenuListingPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ table?: string }>;
}) {
    // Parallel-await cả hai Promise để không block lẫn nhau
    const [{ locale }, { table }] = await Promise.all([params, searchParams]);
    const loc = locale as 'vi' | 'en' | 'fr';

    let menuData: MenuCategory[] = [];

    try {
        const response = await fetch(
            `${API_BASE}/api/dishes/menu?pageIndex=1&pageSize=500`,
            { next: { revalidate: 300 } } // ISR: revalidate mỗi 5 phút
        );

        if (response.ok) {
            const json: ApiResponse<PagedResult<DishDisplayDto>> = await response.json();
            const rawMenu = formatMenuData(json.data.pageData);

            // Flatten i18n ngay trên Server — client nhận plain string, payload nhỏ hơn ~66%
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
        // Suspense boundary cho phép Next.js stream skeleton (loading.tsx) trong khi fetch
        <Suspense fallback={<MenuListingLoading />}>
            <MenuListingClient
                initialMenuData={menuData}
                tableFromUrl={table}
            />
        </Suspense>
    );
}