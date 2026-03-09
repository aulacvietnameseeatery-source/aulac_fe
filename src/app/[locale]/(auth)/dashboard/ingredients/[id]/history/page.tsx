"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, TrendingDown, TrendingUp, Calendar, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ingredientService } from "@/features/staff/ingredient-management/services/ingredient-service";
import { IngredientDto, StockHistoryDto } from "@/features/staff/ingredient-management/types/ingredient-types";

export default function StockHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const ingredientId = Number(params.id);

    const [ingredient, setIngredient] = useState<IngredientDto | null>(null);
    const [history, setHistory] = useState<StockHistoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!ingredientId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch song song cả thông tin nguyên liệu và lịch sử
                const [ingredientData, historyData] = await Promise.all([
                    ingredientService.getIngredientById(ingredientId),
                    ingredientService.getStockHistory(ingredientId)
                ]);

                setIngredient(ingredientData);
                setHistory(historyData);
            } catch (error: any) {
                console.error(error);
                toast.error("Failed to load stock history.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [ingredientId]);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!ingredient) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <p className="text-gray-500">Ingredient not found.</p>
                <Button variant="outline" onClick={() => router.push("/admin/ingredients")}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/dashboard/ingredients")}
                    className="bg-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Stock History
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Tracking inventory movements for <strong className="text-gray-700">{ingredient.ingredientName}</strong>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- LEFT COLUMN: INFO CARD --- */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{ingredient.ingredientName}</h3>
                        <p className="text-sm text-gray-500 mb-4 bg-gray-100 w-fit px-2 py-0.5 rounded">
                            {ingredient.typeName || "Uncategorized"}
                        </p>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Current Stock</span>
                                <span className="font-bold text-blue-600 text-base">
                                    {ingredient.quantityOnHand} <span className="text-xs font-normal text-gray-500">{ingredient.unit}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Min Alert Level</span>
                                <span className="font-medium text-gray-700 text-sm">
                                    {ingredient.minStockLevel} {ingredient.unit}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Records</span>
                                <span className="font-medium text-gray-700 text-sm">
                                    {history.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: TIMELINE/TABLE --- */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-3 flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> Date & Time</div>
                            <div className="col-span-2 text-right">Quantity</div>
                            <div className="col-span-7 flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Note / Reason</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No transaction history found for this ingredient.
                                </div>
                            ) : (
                                history.map((record) => {
                                    const isImport = record.quantityChanged > 0;

                                    return (
                                        <div key={record.transactionItemId} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">

                                            {/* Date */}
                                            <div className="col-span-3 text-sm text-gray-700">
                                                <div className="font-medium">{format(new Date(record.createdAt), "MMM dd, yyyy")}</div>
                                                <div className="text-xs text-gray-400">{format(new Date(record.createdAt), "HH:mm a")}</div>
                                            </div>

                                            {/* Quantity Badge */}
                                            <div className="col-span-2 flex justify-end">
                                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    isImport
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {isImport ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {isImport ? '+' : ''}{record.quantityChanged}
                                                </div>
                                            </div>

                                            {/* Note */}
                                            <div className="col-span-7 text-sm text-gray-600">
                                                {record.note || <span className="italic text-gray-400">No additional notes</span>}
                                            </div>

                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}