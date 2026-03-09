import { Suspense } from "react";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    DishDisplayDto,
    formatMenuData,
} from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";
import MenuListingClient from "./MenuListingClient";
import MenuListingLoading from "./loading";

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

    console.log("=========================================");
    console.log("[DEBUG SSR] API_BASE đang dùng:", API_BASE);
    const fetchUrl = `${API_BASE}/api/dishes/menu?pageIndex=1&pageSize=500`;
    console.log("[DEBUG SSR] URL Gọi API:", fetchUrl);

    try {
        const response = await fetch(
            fetchUrl,
            { next: { revalidate: 300 } } // ISR: revalidate mỗi 5 phút
        );

        console.log(`[DEBUG SSR] HTTP Status Code: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[DEBUG SSR] API trả về lỗi! Nội dung:", errorText);
        } else {
            try {
                const json: ApiResponse<PagedResult<DishDisplayDto>> = await response.json();

                if (!json.success) {
                    console.warn("[DEBUG SSR]  Backend trả mã 200 nhưng Success = false. Message:", json.userMessage);
                }

                const rawMenu = formatMenuData(json.data?.pageData || []);
                console.log(`[DEBUG SSR] Lấy thành công ${rawMenu.length} danh mục món ăn.`);

                menuData = rawMenu.map(cat => ({
                    id: cat.id,
                    name: cat.name[loc] || cat.name.en,
                    items: cat.items.map(item => ({
                        id: item.id,
                        name: item.name[loc] || item.name.en,
                        price: item.price,
                        desc: item.desc[loc] || item.desc.en,
                        image: item.image || "",
                    })),
                }));
            } catch (parseError) {
                console.error("[DEBUG SSR] Lỗi khi Parse JSON từ Backend:", parseError);
            }
        }
    } catch (error: any) {
        console.error("=========================================");
        console.error("[DEBUG SSR] LỖI MẠNG (FETCH FAILED) TRÊN SERVER:");
        console.error("- Message:", error.message);
        console.error("- Cause (Nguyên nhân gốc):", error.cause?.message || "Không rõ");
        console.error("- Mã lỗi (Code):", error.cause?.code || error.code || "Không rõ");
        console.error("=========================================");
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