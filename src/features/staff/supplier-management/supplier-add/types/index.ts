export interface CreateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
}

export interface UpdateSupplierRequest {
  supplierName: string;
  phone?: string;
  email?: string;
}

export interface FormErrors {
  [key: string]: string;
}
