import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

      <div className="rounded-xl border bg-card shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
               <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y relative">
               {positions && positions.map(pos => {
                  const dept = Array.isArray(pos.departments) ? (pos.departments[0] as any)?.name : (pos.departments as any)?.name;
                  const dl = pos.deadline ? new Date(pos.deadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST' : 'N/A';
                  return (
                     <tr key={pos.id} className="hover:bg-muted/30">
                       <td className="px-6 py-4 font-semibold text-foreground">{pos.title}</td>
                       <td className="px-6 py-4">{dept || 'General'}</td>
                       <td className="px-6 py-4">
                         <Badge variant={pos.status === 'open' ? 'default' : pos.status === 'hidden' ? 'outline' : 'secondary'}>
                           {pos.status}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">{dl}</td>
                       <td className="px-6 py-4 text-right">
                         <Link href={`/gvp-admin/positions/${pos.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                           <Edit className="h-4 w-4 mr-2" /> Edit
                         </Link>
                       </td>
                     </tr>
                  )
               })}
               {(!positions || positions.length === 0) && (
                  <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No positions found. Create one to get started.
                     </td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
