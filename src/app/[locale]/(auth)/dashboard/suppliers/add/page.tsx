import { AddSupplier } from '@/features/staff/supplier-management/supplier-add';
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function AddSupplierPage() {
  return (
    <ProtectedRoute permission={Permissions.CreateSupplier}>
      <div className="min-h-screen bg-gray-50/50">
        <AddSupplier />
      </div>
    </ProtectedRoute>
  );
}
