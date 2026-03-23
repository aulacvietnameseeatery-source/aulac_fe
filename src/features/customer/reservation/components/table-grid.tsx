import TableCard from './table-card';
import TableCardSkeleton from './table-card-skeleton';
import { Table } from '../types/reservation.types';
import { useTranslations } from 'next-intl';
import "../styles/index.css";

interface TableGridProps {
  tables?: Table[];
  selectedTableId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export default function TableGrid({
  tables = [],
  selectedTableId,
  onSelect,
  isLoading = false,
}: TableGridProps) {
  const t = useTranslations('reservations.public.tableGrid');

  if (isLoading) {
    return (
      <div className="table-grid-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="table-grid-empty">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="table-grid-wrapper">
      {tables.map((table) => {
        const status =
          table.status === "reserved"
            ? "reserved"
            : selectedTableId === table.id
              ? "selected"
              : "available";

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
