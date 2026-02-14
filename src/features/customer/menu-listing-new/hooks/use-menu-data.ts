import { useState, useEffect } from "react";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { MenuCategory, MenuItemData } from "../data/mock-menu";
import {api} from "@/lib/http";

// Định nghĩa kiểu dữ liệu trả về từ API Customer Menu (đã viết ở Backend)
export interface DishDisplayDto {
    dishId: number;
    dishName: string;
    price: number;
    categoryName: string | null;
    tagline: string | null;
    isChefRecommended: boolean;
    imageUrl: string | null;
}

export const useMenuData = () => {
    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            setIsLoading(true);
            try {
                // Gọi API lấy menu với pageSize lớn để lấy trọn bộ thực đơn
                const response = await api.get<ApiResponse<PagedResult<DishDisplayDto>>>("/api/dishes/menu?pageIndex=1&pageSize=500");
                const dishes = response.data.pageData;

                // Thuật toán: Nhóm danh sách phẳng thành cấu trúc [ { category, items: [] } ]
                const groupedData: Record<string, MenuItemData[]> = {};

                dishes.forEach(dish => {
                    const catName = dish.categoryName || "Uncategorized"; // Fallback nếu không có category

                    if (!groupedData[catName]) {
                        groupedData[catName] = [];
                    }

                    groupedData[catName].push({
                        id: dish.dishId.toString(),
                        name: dish.dishName,
                        price: dish.price,
                        desc: dish.tagline || "", // Dùng tagline làm mô tả
                        image: dish.imageUrl || "/images/logo.png" // Fallback ảnh nếu thiếu
                    });
                });

                // Chuyển đổi Object thành Array khớp với cấu trúc MenuCategory[]
                const formattedMenu: MenuCategory[] = Object.keys(groupedData).map(catName => ({
                    id: catName.toLowerCase().replace(/\s+/g, '-'), // Tạo ID từ tên
                    name: catName,
                    items: groupedData[catName]
                }));

                // Ưu tiên đưa Chef's Selection hoặc món nổi bật lên đầu (Tùy chọn)
                const sortedMenu = formattedMenu.sort((a, b) => a.name.localeCompare(b.name));

                setMenuData(sortedMenu);
            } catch (error) {
                console.error("Failed to fetch menu data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenu();
    }, []);

    return { menuData, isLoading };
};