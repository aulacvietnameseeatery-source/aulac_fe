import * as XLSX from 'xlsx';
import {IngredientDto, SaveIngredientRequest} from "@/features/staff/ingredient-management/types/ingredient-types";

export const excelUtils = {
    // --- EXPORT EXCEL ---
    exportToExcel: (ingredients: IngredientDto[], fileName: string = "Ingredients_Export.xlsx") => {
        const excelData = ingredients.map((item, index) => ({
            "No.": index + 1,
            "Ingredient ID": item.ingredientId,
            "Ingredient Name": item.ingredientName,
            "Category": item.typeName || "Uncategorized",
            "Unit": item.unit,
            "Min Alert Level": item.minStockLevel,
            "Current Stock": item.quantityOnHand,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ingredients");

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
            unit: row["Unit"] || "kg",
            typeLvId: undefined,
            imageId: null,
            minStockLevel: parseFloat(row["Min Alert Level"] || row["Min Stock"] || 0),
            supplierIds: [],
        };
    }
};