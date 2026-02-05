// src/features/staff/dish-management/components/DishTable.tsx
import { Dish } from "../types/dish_types";

interface Props {
    data: Dish[];
    isLoading: boolean;
}

export const DishTable = ({ data, isLoading }: Props) => {
    if (isLoading) return <div>Loading dishes...</div>;

    return (
        <div style={{ alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRadius: 12, flexDirection: 'column', display: 'flex' }}>
            {/* Header Table */}
            <div style={{ alignSelf: 'stretch', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex', borderBottom: '1px #F3F4F6 solid' }}>
                <div style={{ width: 100, padding: 16 }}>NO</div>
                <div style={{ flex: 2, padding: 16 }}>DISH NAME</div>
                <div style={{ flex: 1, padding: 16 }}>CATEGORY</div>
                <div style={{ flex: 1, padding: 16 }}>PRICE</div>
                <div style={{ flex: 1, padding: 16 }}>STATUS</div>
                <div style={{ flex: 1, padding: 16, textAlign: 'right' }}>ACTION</div>
            </div>

            {/* Body Table - Map dữ liệu từ API */}
            {data.map((dish, index) => (
                <div key={dish.dishId} style={{ alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', borderBottom: '1px #F3F4F6 solid' }}>
                    <div style={{ width: 100, padding: 24 }}>{index + 1}</div>
                    <div style={{ flex: 2, padding: 24, fontWeight: '500' }}>{dish.dishName}</div>
                    <div style={{ flex: 1, padding: 24, color: '#6B7280' }}>{dish.category?.categoryName}</div>
                    <div style={{ flex: 1, padding: 24, fontWeight: '600' }}>${dish.price.toFixed(2)}</div>
                    <div style={{ flex: 1, padding: 24 }}>
                        {/* Toggle Status UI */}
                        <div style={{ position: 'relative', width: 44, height: 24, background: dish.dishStatusLv?.valueCode === 'AVAILABLE' ? '#2563EB' : '#E5E7EB', borderRadius: 9999 }}>
                            <div style={{ width: 20, height: 20, left: dish.dishStatusLv?.valueCode === 'AVAILABLE' ? 22 : 2, top: 2, position: 'absolute', background: 'white', borderRadius: 9999 }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        {/* Các icon Action (Edit, Delete, View) */}
                        <span style={{ cursor: 'pointer' }}>👁️</span>
                        <span style={{ cursor: 'pointer' }}>✏️</span>
                        <span style={{ cursor: 'pointer' }}>🗑️</span>
                    </div>
                </div>
            ))}
        </div>
    );
};