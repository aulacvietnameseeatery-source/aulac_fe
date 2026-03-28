import { api } from '@/lib/http';
import { ApiResponse } from '@/types/api-response.types';
import { BulkUpdateGroupDto, GroupedSettingsMap, SystemSettingDetailDto } from '../types/system-setting.types';

export type UploadFileResult = {
    relativePath: string;
    publicUrl: string;
};

/**
 * Fetch all system settings grouped by their key prefix.
 * е.g. { "password": [...], "restaurant": [...] }
 */
export const getGroupedSettings = async (): Promise<GroupedSettingsMap> => {
    const response = await api.get<ApiResponse<GroupedSettingsMap>>(
        '/api/system-settings/grouped'
    );
    return response.data;
};

/**
 * Fetch settings for a specific group.
 */
export const getGroupSettings = async (
    group: string
): Promise<SystemSettingDetailDto[]> => {
    const response = await api.get<ApiResponse<{ groupName: string; settings: SystemSettingDetailDto[] }>>(
        `/api/system-settings/groups/${group}`
    );
    return response.data.settings;
};

/**
 * Fetch settings for a specific group (Public/Anonymous).
 */
export const getPublicGroupSettings = async (
    group: string
): Promise<SystemSettingDetailDto[]> => {
    const response = await api.get<ApiResponse<{ groupName: string; settings: SystemSettingDetailDto[] }>>(
        `/api/system-settings/public/groups/${group}`
    );
    return response.data.settings;
};

/**
 * Bulk-update all settings for a specific group.
 */
export const updateGroupSettings = async (
    group: string,
    dto: BulkUpdateGroupDto
): Promise<void> => {
    await api.put(`/api/system-settings/groups/${group}`, dto);
};

/**
 * Creates a new system setting via POST endpoint.
 */
export const createSetting = async (
    dto: import('../types/system-setting.types').CreateSystemSettingDto
): Promise<void> => {
    await api.post(`/api/system-settings`, dto);
};
/**
 * Uploads a store logo image.
 */
export const uploadLogo = async (file: File): Promise<UploadFileResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<any>>(
        '/api/system-settings/upload-logo',
        formData
    );
    return {
        relativePath: response.data.relativePath || response.data.RelativePath || '',
        publicUrl: response.data.publicUrl || response.data.PublicUrl || ''
    };
};

/**
 * Uploads a generic file (video/image) for system settings.
 */
export const uploadFile = async (file: File): Promise<UploadFileResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<any>>(
        '/api/system-settings/upload-file',
        formData
    );
    return {
        relativePath: response.data.relativePath || response.data.RelativePath || '',
        publicUrl: response.data.publicUrl || response.data.PublicUrl || ''
    };
};

/**
 * Automatically translates system settings.
 */
export const translateSystemSettings = async (
    payload: import('../types/system-setting.types').TranslateSystemSettingsRequest
): Promise<import('../types/system-setting.types').TranslateSystemSettingsResponse> => {
    const response = await api.post<import('@/types/api-response.types').ApiResponse<import('../types/system-setting.types').TranslateSystemSettingsResponse>>(
        '/api/translate/system-settings',
        payload
    );
    return response.data;
};

/**
 * Updates a boolean system setting.
 */
export const updateBoolSetting = async (
    key: string,
    value: boolean
): Promise<void> => {
    await api.put(`/api/system-settings/${key}/bool`, value);
};
