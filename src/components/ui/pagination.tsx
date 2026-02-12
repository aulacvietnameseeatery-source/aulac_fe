'use client';

import React from 'react';
import '@/styles/components/pagination.css';

interface PaginationProps {
    current: number;       // Trang hiện tại
    pageSize: number;      // Số lượng dòng trên 1 trang
    total: number;         // Tổng số lượng bản ghi
    onChange: (page: number, pageSize: number) => void;
    pageSizeOptions?: number[]; // Các lựa chọn số dòng (VD: [10, 20, 50])
}

export const Pagination = ({
                               current,
                               pageSize,
                               total,
                               onChange,
                               pageSizeOptions = [10, 20, 50]
                           }: PaginationProps) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    // Logic tạo danh sách số trang hiển thị
    const getPages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (current <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (current >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== current) {
            onChange(page, pageSize);
        }
    };

    return (
        <div className="admin-pagination-container">
            {/* Bên trái: Page size & Info */}
            <div className="admin-pagination-left">
                <span className="pg-label">Page size:</span>
                <div className="pg-select-wrapper">
                    <select
                        value={pageSize}
                        onChange={(e) => onChange(1, Number(e.target.value))}
                        className="pg-select"
                    >
                        {pageSizeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <span className="pg-info">
          Showing {startItem}-{endItem} of {total} suppliers
        </span>
            </div>

            {/* Bên phải: Page Numbers */}
            <div className="admin-pagination-right">
                <button
                    className="pg-nav-btn"
                    onClick={() => handlePageChange(current - 1)}
                    disabled={current === 1}
                >
                    Previous
                </button>

                <div className="pg-numbers">
                    {getPages().map((p, idx) => (
                        <button
                            key={idx}
                            className={`pg-num-btn ${p === current ? 'active' : ''} ${p === '...' ? 'dots' : ''}`}
                            onClick={() => typeof p === 'number' && handlePageChange(p)}
                            disabled={p === '...'}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <button
                    className="pg-nav-btn"
                    onClick={() => handlePageChange(current + 1)}
                    disabled={current === totalPages || totalPages === 0}
                >
                    Next
                </button>
            </div>
        </div>
    );
};