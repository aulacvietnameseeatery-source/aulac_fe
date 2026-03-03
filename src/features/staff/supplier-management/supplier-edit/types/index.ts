export interface UpdateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
}

export interface Supplier {
  supplierId: number;
  supplierName: string;
  phone?: string;
  email?: string;
}

export interface FormErrors {
  [key: string]: string;
}
