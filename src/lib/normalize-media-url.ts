import { BASE_URL } from '@/lib/http';

export const normalizeMediaUrl = (value: string): string => {
    if (!value) return '';
    if (/^(https?:|blob:|data:)/i.test(value)) return value;

    const base = BASE_URL.replace(/\/+$/, '');
    const normalized = value.replace(/\\/g, '/').trim();

    if (normalized.startsWith('/uploads/')) {
        return `${base}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
        return `${base}/${normalized}`;
    }

    const relative = normalized.replace(/^\/+/, '');
    return `${base}/uploads/${relative}`;
};
