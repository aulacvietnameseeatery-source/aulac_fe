import { EditDishCategory } from '@/features/staff/dish-category-management/dish-category-edit';
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

interface EditDishCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditDishCategoryPage({ params }: EditDishCategoryPageProps) {
  return (
    <ProtectedRoute permission={Permissions.EditDishCategory}>
      <div className="min-h-screen bg-gray-50/50">
        <EditDishCategory categoryId={params.id} />
      </div>
    </ProtectedRoute>
  );
}
