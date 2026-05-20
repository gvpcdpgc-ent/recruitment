import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PositionsList } from '@/components/admin/PositionsList';

export const revalidate = 0;

export default async function AdminPositionsPage() {
  const { data: positions } = await supabaseServer
    .from('positions')
    .select('*, departments(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Positions</h2>
        <Link href="/gvp-admin/positions/create" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Position
        </Link>
      </div>

      <PositionsList positions={positions || []} />
    </div>
  );
}
