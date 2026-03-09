export interface Ingredient {
  ingredientId: number;
  ingredientName: string;
  unit: string;
}

export interface SupplierDetail {
  supplierId: number;
  supplierName: string;
  phone?: string;
  email?: string;
  ingredients: Ingredient[];
}
