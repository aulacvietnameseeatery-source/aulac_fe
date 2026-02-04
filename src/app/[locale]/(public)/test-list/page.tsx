'use client';

import React, { useState } from 'react';
import { BaseTable } from '../../../../components/ui/table/base-table';
import type { TableColumn, BatchAction } from '@/types/table.types';
import { QueriesObserver } from '@tanstack/react-query';

// Example data type
interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    salary: number;
    joinDate: string;
    inactive?: boolean;
}

// Sample data
const sampleData: Employee[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 75000, joinDate: '2023-01-15', inactive: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 65000, joinDate: '2023-02-20', inactive: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', salary: 70000, joinDate: '2023-03-10', inactive: false },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', department: 'Engineering', salary: 80000, joinDate: '2023-04-05', inactive: false },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'HR', salary: 60000, joinDate: '2023-05-12', inactive: true },
];

export default function TableExample() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Employee[]>(sampleData);
    const [selectedItems, setSelectedItems] = useState<Employee[]>([]);

    // Define batch actions based on selected items
    const batchActions: BatchAction[] = [];
    
    const hasInactive = selectedItems.some(s => s.inactive);
    const hasActive = selectedItems.some(s => !s.inactive);

    if (hasInactive) {
        batchActions.push({
            label: 'Sử dụng',
            icon: 'active',
            variant: 'success',
            action: (items: Employee[]) => {
                console.log('Activate items:', items);
                // Update items to active
                setData(prev => prev.map(item => 
                    items.some(i => i.id === item.id) ? { ...item, inactive: false } : item
                ));
            }
        });
    }

    if (hasActive) {
        batchActions.push({
            label: 'Ngừng sử dụng',
            icon: 'inactive',
            variant: 'danger',
            action: (items: Employee[]) => {
                console.log('Deactivate items:', items);
                // Update items to inactive
                setData(prev => prev.map(item => 
                    items.some(i => i.id === item.id) ? { ...item, inactive: true } : item
                ));
            }
        });
    }

    batchActions.push({
        label: 'Xóa',
        icon: 'trash',
        variant: 'danger',
        action: (items: Employee[]) => {
            console.log('Delete items:', items);
            // Remove items from data
            setData(prev => prev.filter(item => !items.some(i => i.id === item.id)));
        }
    });

    // Define columns
    const columns: TableColumn[] = [
        {
            field: 'name',
            header: 'Tên nhân viên',
            sortable: true,
            width: '200px',
            filterType: 'text',
            pinnable: true,
        },
        {
            field: 'email',
            header: 'Email',
            sortable: true,
            width: '250px',
            filterType: 'text',
        },
        {
            field: 'department',
            header: 'Phòng ban',
            sortable: true,
            width: '180px',
            filterType: 'select',
            filterOptions: [
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Marketing', value: 'Marketing' },
                { label: 'Sales', value: 'Sales' },
                { label: 'HR', value: 'HR' },
            ],
        },
        {
            field: 'salary',
            header: 'Lương',
            sortable: true,
            width: '150px',
            align: 'right',
            filterType: 'number',
            formatter: (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
        },
        {
            field: 'joinDate',
            header: 'Ngày vào',
            sortable: true,
            width: '150px',
            filterType: 'date',
            pinnable: true,
            formatter: (value) => new Date(value).toLocaleDateString('vi-VN'),
        },
    ];

    // TODO: Create query type
    const handleDataChange = (params: any) => {
        console.log('Data change:', params);
        // Here you would typically fetch data from your API
        // based on the params (search, filters, sort, page, pageSize)
    };

    const handleSelectionChange = (items: Employee[]) => {
        setSelectedItems(items);
        console.log('Selected items:', items);
    };

    const handleEdit = (item: Employee, rowIndex: number) => {
        console.log('Edit:', item, rowIndex);
        // Handle edit logic
    };

    const handleRefresh = () => {
        console.log('Refresh data');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="p-8 h-screen">
            <BaseTable<Employee>
                data={data}
                columns={columns}
                loading={loading}
                searchPlaceholder="Tìm kiếm nhân viên..."
                total={sampleData.length}
                selectionMode="multiple"
                rowKey="id"
                batchActions={batchActions}
                onDataChange={handleDataChange}
                onSelectionChange={handleSelectionChange}
                onEdit={handleEdit}
                onRefresh={handleRefresh}
                renderTitle={() => (
                    <h1 className="text-2xl font-bold text-navy-DEFAULT">Danh sách nhân viên</h1>
                )}
                renderActionColumn={(item, rowIndex) => (
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Action 1:', item);
                            }}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Sửa
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete:', item);
                            }}
                            className="text-red-600 hover:underline text-sm"
                        >
                            Xóa
                        </button>
                    </div>
                )}
            />
        </div>
    );
}
