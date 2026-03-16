import { Suspense } from "react";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    DishDisplayDto,
    formatMenuData,
} from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";
import MenuListingClient from "./MenuListingClient";
import MenuListingLoading from "./loading";

// Bỏ qua lỗi SSL khi gọi API nội bộ trên Localhost (SSR Fetch)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083";

export default async function MenuListingPage({
                                                  params,
                                                  searchParams,
                                              }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ table?: string; token?: string }>;
}) {
    const [{ locale }, { table, token }] = await Promise.all([params, searchParams]);
    const loc = locale as 'vi' | 'en' | 'fr';

    let menuData: MenuCategory[] = [];

    console.log("=========================================");
    console.log("[DEBUG SSR] API_BASE đang dùng:", API_BASE);

    const menuFetchUrl = `${API_BASE}/api/dishes/menu?pageIndex=1&pageSize=500`;
    const categoryFetchUrl = `${API_BASE}/api/dishes/all-categories`;

    try {
        const [menuRes, catRes] = await Promise.all([
            fetch(menuFetchUrl, { cache: 'no-store' }),
            fetch(categoryFetchUrl, { cache: 'no-store' })
        ]);

        if (!menuRes.ok) {
            console.error("[DEBUG SSR] Lỗi API Menu:", await menuRes.text());
        } else {
            try {
                const menuJson = await menuRes.json();

                // 1. ÉP KIỂU MẢNG CATEGORY (Chống lỗi TypeError & Bao trọn Object)
                let orderedCategories: string[] = [];
                if (catRes.ok) {
                    const catJson = await catRes.json();
                    const rawCatList = Array.isArray(catJson) ? catJson : (catJson.data || []);

                    orderedCategories = rawCatList.map((c: any) =>
                        // Ép mọi thứ thành chuỗi JSON viết thường để không trượt phát nào
                        typeof c === 'object' ? JSON.stringify(c).toLowerCase() : String(c).toLowerCase()
                    );
                    console.log("[DEBUG SSR] Khung API Category (Đã làm phẳng):", orderedCategories);
                }

                const rawMenu = formatMenuData(menuJson.data?.pageData || []);

                // 2. THUẬT TOÁN SORT QUÉT ĐA NGÔN NGỮ
                if (orderedCategories.length > 0) {
                    rawMenu.sort((a, b) => {
                        // Lấy mọi ngôn ngữ có trong a.name (vd: ["khai vị", "starters"])
                        const namesA = Object.values(a.name || {}).map(n => String(n).toLowerCase().trim());
                        const namesB = Object.values(b.name || {}).map(n => String(n).toLowerCase().trim());

                        // Tìm xem có tên nào khớp với chuỗi của API /all-categories không
                        let indexA = orderedCategories.findIndex(catStr => namesA.some(n => n !== "" && catStr.includes(n)));
                        let indexB = orderedCategories.findIndex(catStr => namesB.some(n => n !== "" && catStr.includes(n)));

                        if (indexA === -1) indexA = 999;
                        if (indexB === -1) indexB = 999;

                        return indexA - indexB;
                    });
                }

                console.log(`[DEBUG SSR] Đã gom và sắp xếp thành công ${rawMenu.length} danh mục món ăn.`);

                // 3. Map xuống Client
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
                console.error("[DEBUG SSR] Lỗi khi Parse JSON:", parseError);
            }
        }
    } catch (error: any) {
        console.error("=========================================");
        console.error("[DEBUG SSR] LỖI MẠNG TRÊN SERVER:", error.message);
        console.error("=========================================");
    }

    return (
        <Suspense fallback={<MenuListingLoading />}>
            <MenuListingClient
                initialMenuData={menuData}
                tableFromUrl={table}
                tokenFromUrl={token}
            />
        </Suspense>
    );
}