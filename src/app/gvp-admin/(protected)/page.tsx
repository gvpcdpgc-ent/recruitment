import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDashboard() {
  const { count: totalPositions } = await supabaseServer.from("positions").select("*", { count: 'exact', head: true });
  const { count: openPositions } = await supabaseServer.from("positions").select("*", { count: 'exact', head: true }).eq('status', 'open');
  const { count: totalApplications } = await supabaseServer.from("applications").select("*", { count: 'exact', head: true });
  
  const { data: recentApps } = await supabaseServer
    .from("applications")
    .select(`
       id,
       candidate_name,
       candidate_email,
       application_number,
       applied_at,
       positions(title)
    `)
    .order("applied_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
           <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Positions</h3>
           <p className="text-2xl font-bold">{totalPositions || 0}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
           <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Open Positions</h3>
           <p className="text-2xl font-bold">{openPositions || 0}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
           <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Closed Positions</h3>
           <p className="text-2xl font-bold">{(totalPositions || 0) - (openPositions || 0)}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
           <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Applications</h3>
           <p className="text-2xl font-bold">{totalApplications || 0}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-card shadow">
         <div className="p-6">
            <h3 className="text-lg font-semibold">Recent Applications</h3>
         </div>
         <div className="border-t">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                     <tr>
                        <th className="px-6 py-4 font-medium">Applicant</th>
                        <th className="px-6 py-4 font-medium">Position</th>
                        <th className="px-6 py-4 font-medium">App Number</th>
                        <th className="px-6 py-4 font-medium">Applied At</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                     {recentApps && recentApps.map(app => (
                        <tr key={app.id} className="hover:bg-muted/30">
                           <td className="px-6 py-4 whitespace-nowrap">
                             <div className="font-semibold text-foreground">{app.candidate_name}</div>
                             <div className="text-muted-foreground text-xs">{app.candidate_email}</div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             {Array.isArray(app.positions) ? (app.positions[0] as any)?.title : (app.positions as any)?.title || 'Unknown'}
                           </td>
                           <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{app.application_number}</td>
                           <td className="px-6 py-4 whitespace-nowrap">{new Date(app.applied_at).toLocaleDateString()}</td>
                        </tr>
                     ))}
                     {(!recentApps || recentApps.length === 0) && (
                        <tr>
                           <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                              No recent applications found.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
