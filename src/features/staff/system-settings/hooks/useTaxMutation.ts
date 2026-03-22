import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllTaxes, createTax, updateTax, deleteTax, CreateTaxRequestDTO, UpdateTaxRequestDTO } from "../services/tax.service";

export const useTaxesQuery = (onlyActive = true) => {
    return useQuery({
        queryKey: ['taxes', onlyActive],
        queryFn: () => getAllTaxes(onlyActive)
    });
};

export const useCreateTaxMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTaxRequestDTO) => createTax(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        }
    });
};

export const useUpdateTaxMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTaxRequestDTO }) => updateTax(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        }
    });
};

export const useDeleteTaxMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTax(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        }
    });
};
