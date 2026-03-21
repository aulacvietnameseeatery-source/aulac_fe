import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http";
import { EmailTemplate, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from "../types";
import { toast } from "sonner";

export const useEmailTemplates = () => {
    return useQuery({
        queryKey: ["email-templates"],
        queryFn: async () => {
            const response = await api.get<EmailTemplate[]>("/api/EmailTemplate");
            return response;
        },
    });
};

export const useEmailTemplate = (code: string) => {
    return useQuery({
        queryKey: ["email-template", code],
        queryFn: async () => {
            const response = await api.get<EmailTemplate>(`/api/EmailTemplate/${code}`);
            return response;
        },
        enabled: !!code,
    });
};

export const useUpdateEmailTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateEmailTemplateRequest }) => {
            return await api.put<EmailTemplate, UpdateEmailTemplateRequest>(`/api/EmailTemplate/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-templates"] });
            toast.success("Cập nhật template thành công");
        },
        onError: (error: any) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
        },
    });
};

export const useCreateEmailTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateEmailTemplateRequest) => {
            return await api.post<EmailTemplate, CreateEmailTemplateRequest>("/api/EmailTemplate", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-templates"] });
            toast.success("Tạo template thành công");
        },
        onError: (error: any) => {
            toast.error(error.message || "Có lỗi xảy ra khi tạo template");
        },
    });
};

export const useDeleteEmailTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return await api.delete(`/api/EmailTemplate/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-templates"] });
            toast.success("Xóa template thành công");
        },
        onError: (error: any) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa");
        },
    });
};
