import * as XLSX from 'xlsx';
import {IngredientDto, SaveIngredientRequest} from "@/features/staff/ingredient-management/types/ingredient-types";
import { PaymentListDto } from '@/features/staff/payment-management/types/payment-types';
import dayjs from 'dayjs';

export const excelUtils = {
    // --- EXPORT EXCEL ---
    exportToExcel: (ingredients: IngredientDto[], fileName: string = "Ingredients_Export.xlsx") => {
        const excelData = ingredients.map((item, index) => ({
            "No.": index + 1,
            "Ingredient ID": item.ingredientId,
            "Ingredient Name": item.ingredientName,
            "Category": item.typeName || "Uncategorized",
            "Unit": item.unitName,
            "Min Alert Level": item.minStockLevel,
            "Current Stock": item.quantityOnHand,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ingredients");

        XLSX.writeFile(workbook, fileName);
    },

    // ==========================================
    // --- EXPORT PAYMENT EXCEL ---
    // ==========================================
    exportPaymentsToExcel: (payments: PaymentListDto[], fileName: string = "Payments_Export.xlsx") => {
        const excelData = payments.map((item, index) => {
            // Xác định khách vãng lai
            const isGuest = !item.customerName || item.customerName.toLowerCase() === "guest" || item.customerPhone === "0000000000";

            return {
                "No.": index + 1,
                "Payment ID": item.paymentId,
                "Order ID": item.orderId,
                "Customer Name": isGuest ? "Guest" : item.customerName,
                "Phone Number": isGuest ? "-" : (item.customerPhone || "-"),
                "Payment Method": item.method,
                "Received Amount (CHF)": item.receivedAmount,
                "Change Amount (CHF)": item.changeAmount,
                "Final Amount (CHF)": item.finalAmount,
                "Paid At": item.paidAt ? dayjs(item.paidAt).format("DD/MM/YYYY HH:mm") : "-",
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

        XLSX.writeFile(workbook, fileName);
    },

    // --- IMPORT EXCEL ---
    importFromExcel: (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });

                    // Lấy sheet đầu tiên
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // Convert sheet sang array JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    },

    mapExcelRowToRequest: (row: any): SaveIngredientRequest => {
        return {
            ingredientName: row["Ingredient Name"] || row["Name"] || "",
            unitLvId: row["Unit"] || "kg",
            typeLvId: undefined,
            imageId: null,
            minStockLevel: parseFloat(row["Min Alert Level"] || row["Min Stock"] || 0),
            supplierIds: [],
        };
    }
};