// src/features/staff/dish-management/admin-sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { staffDishService } from './services/dish_service';
import { Dish, GetDishesParams } from './types/dish_types';
import { PagedResult } from '@/types/api-response.types';
import { DishTable } from './components/DishTable';

export default function DishManagementPage() {
    // 1. State quản lý dữ liệu và phân trang
    const [pagedData, setPagedData] = useState<PagedResult<Dish> | null>(null);
    const [loading, setLoading] = useState(true);

    // 2. State quản lý bộ lọc (Filter)
    const [params, setParams] = useState<GetDishesParams>({
        pageIndex: 1,
        pageSize: 10,
        search: '',
        category: 'All',
        status: 'All'
    });

    // 3. Hàm gọi API
    const fetchDishes = async () => {
        setLoading(true);
        try {
            const data = await staffDishService.getDishes(params);
            setPagedData(data);
        } catch (error) {
            console.error("Failed to load dishes", error);
        } finally {
            setLoading(false);
        }
    };

    // 4. Tự động gọi lại API khi params thay đổi
    useEffect(() => {
        fetchDishes();
    }, [params.pageIndex, params.search, params.category, params.status]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header & Filter (Bạn đưa code UI Search/Add Dish vào Component DishHeader) */}
            <div style={{ padding: 32 }}>
                {/* Mock Search Input */}
                <input
                    placeholder="Search dish..."
                    onChange={(e) => setParams({...params, search: e.target.value, pageIndex: 1})}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0' }}
                />

                <button style={{ marginLeft: 16, background: '#1B3A50', color: 'white', padding: '10px 20px', borderRadius: 8 }}>
                    Add New Dish
                </button>
            </div>

            {/* Table Section */}
            <div style={{ flex: 1, padding: '0 32px' }}>
                <DishTable data={pagedData?.pageData || []} isLoading={loading} />
            </div>

            {/* Pagination Section */}
            <div style={{ padding: 32, display: 'flex', justifyContent: 'space-between' }}>
                <span>Total: {pagedData?.totalCount || 0} dishes</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        disabled={params.pageIndex === 1}
                        onClick={() => setParams({...params, pageIndex: params.pageIndex! - 1})}
                    >
                        Previous
                    </button>
                    <span>Page {params.pageIndex} / {pagedData?.totalPage || 1}</span>
                    <button
                        disabled={params.pageIndex === pagedData?.totalPage}
                        onClick={() => setParams({...params, pageIndex: params.pageIndex! + 1})}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}