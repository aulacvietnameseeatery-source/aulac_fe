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

    // =========================================================================
    //  MOCK DATA: Dùng tạm trong lúc chờ Backend deploy API
    // =========================================================================

    // Dữ liệu thô (có i18n) để Server xử lý
    const RAW_MOCK_MENU = [
        {
            id: "cat_beverages",
            name: { vi: "Đồ Uống", en: "Beverages", fr: "Boissons" },
            items: [
                {
                    id: "101",
                    name: { vi: "Cánh Đồng Bình Yên", en: "Peaceful Field", fr: "Champ Paisible" },
                    price: 10.00,
                    desc: { vi: "Thanh mát, giải nhiệt cơ thể", en: "Light, fresh and cooling", fr: "Léger, frais et rafraîchissant" },
                    image: "" // Trả về chuỗi rỗng thay vì null để khớp interface
                },
                {
                    id: "102",
                    name: { vi: "Gió Nhiệt Đới", en: "Tropical Breeze", fr: "Brise Tropicale" },
                    price: 12.00,
                    desc: { vi: "Hương vị trái cây bùng nổ", en: "Explosive tropical fruit flavors", fr: "Saveurs explosives de fruits tropicaux" },
                    image: ""
                },
                {
                    id: "103",
                    name: { vi: "Cà Phê Sữa Đá", en: "Vietnamese Iced Coffee", fr: "Café Glacé Vietnamien" },
                    price: 8.50,
                    desc: { vi: "Cà phê pha phin truyền thống với sữa đặc", en: "Traditional drip coffee with condensed milk", fr: "Café filtre traditionnel au lait concentré" },
                    image: ""
                }
            ]
        },
        {
            id: "cat_starters",
            name: { vi: "Khai Vị", en: "Starters", fr: "Entrées" },
            items: [
                {
                    id: "201",
                    name: { vi: "Gỏi Cuốn Tôm Thịt", en: "Fresh Spring Rolls", fr: "Rouleaux de Printemps Frais" },
                    price: 15.00,
                    desc: { vi: "Tôm tươi, thịt luộc, rau thơm cuộn bánh tráng", en: "Fresh shrimp, pork, and herbs in rice paper", fr: "Crevettes fraîches, porc et herbes dans une feuille de riz" },
                    image: ""
                },
                {
                    id: "202",
                    name: { vi: "Nem Rán Hà Nội", en: "Hanoi Fried Spring Rolls", fr: "Nems Frits de Hanoï" },
                    price: 16.50,
                    desc: { vi: "Nem rán giòn rụm nhân thịt và mộc nhĩ", en: "Crispy fried rolls with pork and wood ear mushrooms", fr: "Rouleaux frits croustillants au porc et champignons" },
                    image: ""
                }
            ]
        },
        {
            id: "cat_mains",
            name: { vi: "Món Chính", en: "Signature Dishes", fr: "Plats Principaux" },
            items: [
                {
                    id: "301",
                    name: { vi: "Phở Bò Wagyu", en: "Wagyu Beef Pho", fr: "Pho au Bœuf Wagyu" },
                    price: 28.00,
                    desc: { vi: "Nước dùng hầm 24h, thịt bò Wagyu thượng hạng", en: "24h bone broth with premium Wagyu beef", fr: "Bouillon d'os de 24h avec bœuf Wagyu premium" },
                    image: ""
                },
                {
                    id: "302",
                    name: { vi: "Bún Chả Hương Xưa", en: "Traditional Bun Cha", fr: "Bun Cha Traditionnel" },
                    price: 25.00,
                    desc: { vi: "Thịt nướng than hoa ăn kèm bún và nước mắm chua ngọt", en: "Charcoal-grilled pork with noodles and dipping sauce", fr: "Porc grillé au charbon avec nouilles et sauce" },
                    image: ""
                }
            ]
        },
        {
            id: "cat_desserts",
            name: { vi: "Tráng Miệng", en: "Desserts", fr: "Desserts" },
            items: [
                {
                    id: "401",
                    name: { vi: "Chè Sen Long Nhãn", en: "Lotus Seed & Longan Sweet Soup", fr: "Soupe Douce aux Graines de Lotus" },
                    price: 9.00,
                    desc: { vi: "Vị ngọt thanh tao, an thần dễ ngủ", en: "Elegant sweet taste, soothing and relaxing", fr: "Goût doux élégant, apaisant et relaxant" },
                    image: ""
                }
            ]
        }
    ];

    // Map dữ liệu để chuyển từ RAW (I18nText) thành MenuCategory[] chuẩn chỉnh cho Client
    menuData = RAW_MOCK_MENU.map(cat => ({
        id: cat.id,
        name: cat.name[loc as keyof typeof cat.name] || cat.name.en,
        items: cat.items.map(item => ({
            id: item.id,
            name: item.name[loc as keyof typeof item.name] || item.name.en,
            price: item.price,
            desc: item.desc[loc as keyof typeof item.desc] || item.desc.en,
            image: item.image,
        }))
    }));

    // =========================================================================
    //  CODE DÙNG API (bao giờ Backend xong thì mở ra)
    // =========================================================================
    /*
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
            console.error("[DEBUG SSR]  API trả về lỗi! Nội dung:", errorText);
        } else {
            try {
                const json: ApiResponse<PagedResult<DishDisplayDto>> = await response.json();

                if (!json.success) {
                    console.warn("[DEBUG SSR] ️ Backend trả mã 200 nhưng Success = false. Message:", json.userMessage);
                }

                const rawMenu = formatMenuData(json.data?.pageData || []);
                console.log(`[DEBUG SSR]  Lấy thành công ${rawMenu.length} danh mục món ăn.`);

                menuData = rawMenu.map(cat => ({
                    id: cat.id,
                    name: cat.name[loc] || cat.name.en,
                    items: cat.items.map(item => ({
                        id: item.id,
                        name: item.name[loc] || item.name.en,
                        price: item.price,
                        desc: item.desc[loc] || item.desc.en,
                        image: item.image || "", // Chỗ này cũng fallback về chuỗi rỗng để đề phòng API trả null
                    })),
                }));
            } catch (parseError) {
                console.error("[DEBUG SSR] Lỗi khi Parse JSON từ Backend:", parseError);
            }
        }
    } catch (error: any) {
        console.error("=========================================");
        console.error("[DEBUG SSR]  LỖI MẠNG (FETCH FAILED) TRÊN SERVER:");
        console.error("- Message:", error.message);
        console.error("- Cause (Nguyên nhân gốc):", error.cause?.message || "Không rõ");
        console.error("- Mã lỗi (Code):", error.cause?.code || error.code || "Không rõ");
        console.error("=========================================");
    }
    */

    return (
        <Suspense fallback={<MenuListingLoading />}>
            <MenuListingClient
                initialMenuData={menuData}
                tableFromUrl={table}
            />
        </Suspense>
    );
}