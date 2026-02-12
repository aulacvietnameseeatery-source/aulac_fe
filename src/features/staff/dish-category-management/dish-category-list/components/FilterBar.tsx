import React from 'react';
import SearchBar from './SearchBar';
import StatusFilter from './StatusFilter';
import { StatusFilter as StatusFilterType } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (value: StatusFilterType) => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex gap-4 items-center">
      <SearchBar value={searchQuery} onChange={onSearchChange} />
      <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
    </div>
  );
}
