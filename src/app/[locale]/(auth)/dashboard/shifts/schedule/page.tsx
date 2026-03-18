import { ShiftManagement } from "@/features/staff/shift-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function ShiftsPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewShift}>
      <ShiftManagement />
    </ProtectedRoute>
  );
}
