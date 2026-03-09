import { api } from '@/lib/http';
import { ApiResponse } from '@/types/api-response.types';
import { BulkUpdateGroupDto, GroupedSettingsMap, SystemSettingDetailDto } from '../types/system-setting.types';

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
export const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<{ publicUrl: string }>>(
        '/api/system-settings/upload-logo',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data.publicUrl;
};
