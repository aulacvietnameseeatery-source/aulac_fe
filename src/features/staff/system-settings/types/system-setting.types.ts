export type SettingValueType = 'STRING' | 'INT' | 'DECIMAL' | 'BOOL' | 'JSON';

export interface SystemSettingDetailDto {
  settingKey: string;
  settingName?: string;
  group: string;
  valueType: SettingValueType;
  value: string | number | boolean | null;
  publicUrl?: string | null;
  description: string | null;
  isSensitive: boolean;
  updatedAt: string;
}

export interface SystemSettingGroupDto {
  groupName: string;
  settings: SystemSettingDetailDto[];
}

export interface BulkUpdateSettingItemDto {
  key: string;
  settingName?: string;
  value: string;
  description?: string;
}

export interface BulkUpdateGroupDto {
  items: BulkUpdateSettingItemDto[];
}

export interface CreateSystemSettingDto {
  key: string;
  settingName?: string;
  valueType: string;
  value: string;
  description?: string;
  isSensitive: boolean;
}

/** The grouped response: a dictionary of groupName -> list of settings */
export type GroupedSettingsMap = Record<string, SystemSettingDetailDto[]>;

export interface TranslateSystemSettingsRequest {
  sourceLang: string;
  data: Record<string, string>;
}

export interface TranslateSystemSettingsResponse {
  translations: Record<string, Record<string, string>>;
}
