import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';
import { PhotoPreview } from '@/components/admin/PhotoPreview';
import { DeleteApplicationButton } from '@/components/admin/DeleteApplicationButton';

import { ExportExcelButton } from '@/components/admin/ExportExcelButton';

export const revalidate = 0;

export default async function AdminApplicationsPage() {
  const { data: applications } = await supabaseServer
    .from('applications')
    .select(`
       *,
       positions(title)
    `)
    .order('applied_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Applications Tracker</h2>
        <ExportExcelButton applications={applications || []} />
      </div>

      <div className="rounded-xl border bg-card shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
               <tr>
                  <th className="px-4 py-4 font-medium">Photo</th>
                  <th className="px-6 py-4 font-medium">App Number</th>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applied At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y relative">
               {applications && applications.map(app => {
                  const posTitle = Array.isArray(app.positions) ? (app.positions[0] as any)?.title : (app.positions as any)?.title;
                  const applied = new Date(app.applied_at).toLocaleDateString();
                  const photoUrl = (app as any).photo_url as string | null;
                  return (
                     <tr key={app.id} className="hover:bg-muted/30">
                       <td className="px-4 py-3">
                         {photoUrl ? (
                           <PhotoPreview src={photoUrl} name={app.candidate_name} />
                         ) : (
                           <div className="w-10 h-12 rounded border bg-muted flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                         )}
                       </td>
                       <td className="px-6 py-4 font-mono font-medium text-xs">{app.application_number}</td>
                       <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{app.candidate_name}</div>
                          <div className="text-muted-foreground text-xs">{app.candidate_email}</div>
                          <div className="text-muted-foreground text-xs">{app.candidate_phone}</div>
                       </td>
                       <td className="px-6 py-4">{posTitle || 'Unknown'}</td>
                       <td className="px-6 py-4">
                         <Badge variant="secondary">
                           {app.status}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">{applied}</td>
                       <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                         <Link href={`/gvp-admin/applications/${app.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                           <Eye className="h-4 w-4 mr-2" /> View
                         </Link>
                         <DeleteApplicationButton id={app.id} name={app.candidate_name} />
                       </td>
                     </tr>
                  )
               })}
               {(!applications || applications.length === 0) && (
                  <tr>
                     <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No applications found.
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
