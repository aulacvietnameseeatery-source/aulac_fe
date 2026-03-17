import { ShiftTemplates } from "@/features/staff/shift-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function ShiftsTemplatesPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewShift}>
      <ShiftTemplates />
    </ProtectedRoute>
  );
}
