import { supabaseServer } from '@/lib/supabase/server';
import { ApplicationsList } from '@/components/admin/ApplicationsList';
import { ExportExcelButton } from '@/components/admin/ExportExcelButton';

export const revalidate = 0;

export default async function AdminApplicationsPage() {
  const { data: applications } = await supabaseServer
    .from('applications')
    .select(`
       *,
       positions(
          title,
          departments(name),
          position_forms(schema_json)
       ),
       application_files(
          field_name,
          file_url
       )
    `)
    .order('applied_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Applications Tracker</h2>
        <ExportExcelButton applications={applications || []} />
      </div>

      <ApplicationsList applications={(applications as any) || []} />
    </div>
  );
}
