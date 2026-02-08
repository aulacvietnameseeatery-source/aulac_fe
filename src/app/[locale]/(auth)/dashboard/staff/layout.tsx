import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Account Management | Aulac',
  description: 'Manage staff accounts for Aulac restaurant',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
