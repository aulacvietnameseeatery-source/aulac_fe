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
