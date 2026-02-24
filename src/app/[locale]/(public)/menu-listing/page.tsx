import { api } from "@/lib/http";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { DishDisplayDto, formatMenuData } from "@/features/customer/menu-listing-new/hooks/use-menu-data";
import MenuListingClient from "./MenuListingClient";
import { MenuCategory } from "@/features/customer/menu-listing-new/data/mock-menu";

// 1. Định nghĩa params là một Promise
export default async function MenuListingPage({params}: { params: Promise<{ locale: string }> }) {

    // 2. Thêm chữ "await" để giải quyết Promise trước khi lấy locale
    const {locale} = await params;

    let menuData: MenuCategory[] = [];

    try {
        const response = await api.get<ApiResponse<PagedResult<DishDisplayDto>>>("/api/dishes/menu?pageIndex=1&pageSize=500");
        menuData = formatMenuData(response.data.pageData);
    } catch (error) {
        console.error("Lỗi fetch menu trên Server:", error);
    }

    return (
        <MenuListingClient
            initialMenuData={menuData}
            // 3. Truyền locale đã được await xuống
            locale={locale as 'vi' | 'en' | 'fr'}
        />
    );
}