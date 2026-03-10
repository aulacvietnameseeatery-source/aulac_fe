import { ShiftLive } from "@/features/staff/shift-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function ShiftsLivePage() {
  return (
    <ProtectedRoute permission={Permissions.ViewShift}>
      <ShiftLive />
    </ProtectedRoute>
  );
}
