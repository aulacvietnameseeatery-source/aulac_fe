import { EditDishCategory } from '@/features/staff/dish-category-management/dish-category-edit';

interface EditDishCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditDishCategoryPage({ params }: EditDishCategoryPageProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <EditDishCategory categoryId={params.id} />
    </div>
  );
}
