"use client";

import React from "react";
import { Loader2, Save, ArrowLeft, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventoryCheck } from "../hooks/use-inventory-check";

export function InventoryCheckContent() {
    const {
        filteredIngredients,
        isLoading,
        isSubmitting,
        searchQuery,
        setSearchQuery,
        auditData,
        handleQtyChange,
        handleReasonChange,
        handleSubmit,
        router
    } = useInventoryCheck();

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kiểm kê kho</h1>
                        <p className="text-sm text-gray-500 mt-1">Đối soát và điều chỉnh tồn kho thực tế.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nguyên liệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant={"outline"}
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Chốt kiểm kê
                    </Button>
                </div>
            </div>

            {/* Bảng đếm kho */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="px-5 py-4 w-auto">Nguyên liệu</th>
                            <th className="px-5 py-4 w-[140px] text-right">Tồn hệ thống</th>
                            <th className="px-5 py-4 w-[160px] text-center bg-indigo-50/30">Tồn thực tế</th>
                            <th className="px-5 py-4 w-[120px] text-right">Độ lệch</th>
                            <th className="px-5 py-4 min-w-[280px]">Lý do chênh lệch</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredIngredients.map((item) => {
                            const state = auditData[item.ingredientId];

                            // Parse số an toàn để chống NaN
                            const sysQty = item.quantityOnHand ?? 0;
                            const actualStr = state?.actualQty ?? "";
                            const actualNum = actualStr === "" ? 0 : Number(actualStr);

                            const variance = actualStr === "" ? 0 : actualNum - sysQty;
                            const isChanged = variance !== 0;

                            return (
                                <tr key={item.ingredientId} className={`hover:bg-gray-50 transition-colors ${isChanged ? 'bg-amber-50/20' : ''}`}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{item.ingredientName}</span>
                                            <span className="text-xs text-gray-400 mt-0.5">{item.typeName || 'Chưa phân loại'}</span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3.5 text-right">
                                            <span className="font-medium text-gray-500">
                                                {sysQty} <span className="text-[11px] text-gray-400 ml-0.5">{item.unitLvId}</span>
                                            </span>
                                    </td>

                                    <td className="px-5 py-3.5 bg-indigo-50/10">
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={actualStr}
                                                onChange={(e) => handleQtyChange(item.ingredientId, e.target.value)}
                                                className="w-20 text-center py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 font-bold shadow-sm transition-all"
                                            />
                                            <span className="text-xs text-gray-500 w-6 font-medium">{item.unitLvId}</span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3.5 text-right font-bold text-[15px]">
                                        {isChanged ? (
                                            <span className={variance > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                    {variance > 0 ? '+' : ''}{variance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                                </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-3.5">
                                        <input
                                            type="text"
                                            placeholder={isChanged ? "Vui lòng nhập lý do..." : "Ghi chú thêm (không bắt buộc)"}
                                            value={state?.reason ?? ""}
                                            onChange={(e) => handleReasonChange(item.ingredientId, e.target.value)}
                                            className={`w-full px-3.5 py-2 border rounded-lg outline-none text-sm transition-all ${
                                                isChanged && !state?.reason.trim()
                                                    ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-500 placeholder-rose-400'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400'
                                            }`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredIngredients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Search className="w-8 h-8 mb-2 opacity-20" />
                                        <p>Không tìm thấy nguyên liệu nào phù hợp.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note Panel */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="text-sm text-sky-800 leading-relaxed">
                    <p className="font-semibold mb-1">Hướng dẫn kiểm kê nhanh:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sky-700/80">
                        <li>Hệ thống mặc định tồn thực tế bằng tồn hệ thống (Độ lệch = 0).</li>
                        <li>Chỉ cần sửa số ở cột <b>Tồn thực tế</b> đối với những món bị lệch.</li>
                        <li>Nếu có độ lệch, bắt buộc phải nhập <b>Lý do</b> để hệ thống lưu lại lịch sử rõ ràng.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}