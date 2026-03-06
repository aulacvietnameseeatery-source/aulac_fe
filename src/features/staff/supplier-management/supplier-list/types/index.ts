export interface Supplier {
  supplierId: number;
  supplierName: string;
  phone?: string;
  email?: string;
}

export interface SupplierFilters {
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export interface PagedResult<T> {
  pageData: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPage?: number;
}
