import { MyShifts } from "@/features/staff/shift-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function MyShiftsPage() {
  return (
    <ProtectedRoute permission={Permissions.CheckInShift}>
      <MyShifts />
    </ProtectedRoute>
  );
}
