'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/components/dialog.css';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: string; // Tùy chỉnh độ rộng (VD: '600px', '80%')
}

export const Dialog = ({
                           open,
                           onClose,
                           title,
                           children,
                           footer,
                           width = '500px'
                       }: DialogProps) => {

    // Khóa cuộn trang khi Dialog mở
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className="admin-dialog-overlay"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div
                className="admin-dialog-content"
                style={{ maxWidth: width }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="admin-dialog-header">
                    {title && <h3 className="admin-dialog-title">{title}</h3>}
                    <button
                        className="admin-dialog-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="admin-dialog-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="admin-dialog-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};