import { useState, useMemo } from 'react';
import { Table } from '../types/reservation.types';

export const useTableSelection = (tables: Table[]) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable = useMemo(
    () => tables.find(t => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  const toggleTable = (id: string) => {
    setSelectedTableId(prev => (prev === id ? null : id));
  };

  return {
    selectedTable,
    selectedTableId,
    toggleTable,
    clearSelection: () => setSelectedTableId(null),
  };
};
