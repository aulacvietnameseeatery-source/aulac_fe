// src/features/auth/role-list/RoleListPage.tsx
"use client";

import { RoleHeader, RolePagination, RoleTable, RoleToolbar, useRoleList } from "@/features/auth/role-list";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

// Separate the main logic into child components.
const RoleListContent = () => {
  const { roles, isLoading, pagination, searchTerm, actions } = useRoleList();

  const handleView = (id: number) => console.log("View detail", id);
  const handleEdit = (id: number) => console.log("Edit", id);
  const handleDelete = (id: number) => console.log("Delete", id);
  const handleAdd = () => console.log("Navigate to Create Role");

  return (
    <>
      <RoleHeader />

      <RoleToolbar
        initialSearchTerm={searchTerm}
        onSearchChange={actions.onSearchChange}
        onAddClick={handleAdd}
      />

      <RoleTable
        roles={roles}
        isLoading={isLoading}
        startIndex={(pagination.pageIndex - 1) * pagination.pageSize}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RolePagination
        pageIndex={pagination.pageIndex}
        totalPage={pagination.totalPage}
        pageSize={pagination.pageSize}
        onPageChange={actions.onPageChange}
        onPageSizeChange={actions.onPageSizeChange}
      />
    </>
  );
};

// Component Default wraps Suspense
export default function RoleListPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-gray-900">
      <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>}>
        <RoleListContent />
      </Suspense>
    </div>
  );
}