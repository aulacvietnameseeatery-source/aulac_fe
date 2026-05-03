"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "info" | "warning";
    isLoading?: boolean;
    confirmDisabled?: boolean;
    children?: React.ReactNode;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
    confirmDisabled = false,
    children,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                    button: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
                    iconBg: "bg-red-500/10",
                };
            case "warning":
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
                    button: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20",
                    iconBg: "bg-orange-500/10",
                };
            case "info":
            default:
                return {
                    icon: <Info className="w-6 h-6 text-blue-500" />,
                    button: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20",
                    iconBg: "bg-blue-500/10",
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                {/* Icon Circle */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                                    {styles.icon}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 font-display">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                {children && (
                                    <div className="w-full">
                                        {children}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 w-full mt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading || confirmDisabled}
                                        className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-all shadow-lg ${styles.button} disabled:opacity-50 flex items-center justify-center gap-2`}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            confirmText
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
