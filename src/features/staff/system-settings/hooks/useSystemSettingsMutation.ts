import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroupSettings, translateSystemSettings } from "../services/system-setting.service";
import { BulkUpdateGroupDto, TranslateSystemSettingsRequest, TranslateSystemSettingsResponse } from "../types/system-setting.types";

export function useUpdateStoreSettingsMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, BulkUpdateGroupDto>({
    mutationFn: (data) => updateGroupSettings("store", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    }
  });
}

export function useTranslateSettingsMutation() {
  return useMutation<TranslateSystemSettingsResponse, Error, TranslateSystemSettingsRequest>({
    mutationFn: (data) => translateSystemSettings(data),
  });
}
