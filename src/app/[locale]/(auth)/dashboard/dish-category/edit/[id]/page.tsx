import { EditDishCategory } from '@/features/staff/dish-category-management/dish-category-edit';

interface EditDishCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditDishCategoryPage({ params }: EditDishCategoryPageProps) {
  return <EditDishCategory categoryId={params.id} />;
}
