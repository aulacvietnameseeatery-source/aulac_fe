import { EditSupplier } from '@/features/staff/supplier-management/supplier-edit';

interface EditSupplierPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EditSupplier supplierId={id} />
    </div>
  );
}