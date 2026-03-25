export interface CreateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  ingredientIds: number[];
}

export interface UpdateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  ingredientIds: number[];
}

export interface FormErrors {
  [key: string]: string;
}
