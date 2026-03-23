import { api } from '@/lib/http';
import { ApiResponse } from '@/types/api-response.types';

export interface TaxDTO {
    taxId: number;
    taxName: string;
    taxRate: number;
    taxType: 'INCLUSIVE' | 'EXCLUSIVE';
    isActive: boolean;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTaxRequestDTO {
    taxName: string;
    taxRate: number;
    taxType: 'INCLUSIVE' | 'EXCLUSIVE';
    isActive: boolean;
    isDefault: boolean;
}

export interface UpdateTaxRequestDTO {
    taxName?: string;
    taxRate?: number;
    taxType?: 'INCLUSIVE' | 'EXCLUSIVE';
    isActive?: boolean;
    isDefault?: boolean;
}

export const getAllTaxes = async (onlyActive = true): Promise<TaxDTO[]> => {
    const response = await api.get<ApiResponse<TaxDTO[]>>(`/api/taxes?onlyActive=${onlyActive}`);
    return response.data;
};

export const createTax = async (request: CreateTaxRequestDTO): Promise<number> => {
    const response = await api.post<ApiResponse<number>>('/api/taxes', request);
    return response.data;
};

export const updateTax = async (id: number, request: UpdateTaxRequestDTO): Promise<void> => {
    await api.patch(`/api/taxes/${id}`, request);
};

export const deleteTax = async (id: number): Promise<void> => {
    await api.delete(`/api/taxes/${id}`);
};
