export interface UpdateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  ingredientIds: number[];
}

export interface Ingredient {
  ingredientId: number;
  ingredientName: string;
  unit: string;
}

export interface Supplier {
  supplierId: number;
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  ingredients: Ingredient[];
}

export interface FormErrors {
  [key: string]: string;
}
