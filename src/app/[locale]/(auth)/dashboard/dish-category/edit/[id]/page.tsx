import EditDishCategory from '@/features/staff/dish-category-management/components/EditDishCategory';

interface EditDishCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditDishCategoryPage({ params }: EditDishCategoryPageProps) {
  return <EditDishCategory categoryId={params.id} />;
}
