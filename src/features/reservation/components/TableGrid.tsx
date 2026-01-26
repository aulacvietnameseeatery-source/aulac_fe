import TableCard from './TableCard';
import TableCardSkeleton from './TableCardSkeleton';
import { Table } from '../types/reservation.types';

interface TableGridProps {
  tables?: Table[];
  selectedTableId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const TableGrid: React.FC<TableGridProps> = ({
  tables = [],
  selectedTableId,
  onSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="py-20 text-center text-stone-400 italic">
        No tables available in this zone.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map(table => {
        const status =
          table.status === 'reserved'
            ? 'reserved'
            : selectedTableId === table.id
            ? 'selected'
            : 'available';

        return (
          <TableCard
            key={table.id}
            {...table}
            status={status}
            onClick={() => onSelect(table.id)}
          />
        );
      })}
    </div>
  );
};

export default TableGrid;
