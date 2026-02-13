// Backend DTO mapping
export interface StaffAccount {
  accountId: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  roleId: number;
  roleName: string;
  accountStatus: number; // 1 = ACTIVE, 2 = INACTIVE, 3 = LOCKED
  accountStatusName: string;
}

export interface StaffAccountFilters {
  search?: string;      // search by FullName/Email/Phone/Username
  roleId?: number;
  accountStatus?: number; // 1/2/3
  pageIndex: number;
  pageSize: number;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface AccountStatus {
  valueId: number;
  valueName: string;
}
