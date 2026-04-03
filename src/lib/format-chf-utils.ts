export const formatCHF = (val: number) => {
    return new Intl.NumberFormat('en-CH', {
        style: 'currency',
        currency: 'CHF',
        minimumFractionDigits: 2
    }).format(val);
};
