export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  subCode: number;
  userMessage: string;
  systemMessage?: string | null;
  validateInfo?: unknown[];
  data: T;
  serverTime?: string;
}

export interface PagedResult<T> {
  pageData: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
