import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, FileText, Download } from "lucide-react";

export const revalidate = 0;

export default async function ApplicationDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const { data: application } = await supabaseServer
    .from("applications")
    .select(`
      *,
      positions (id, title, departments(name)),
      application_files (field_name, file_url)
    `)
    .eq("id", id)
    .single();

  if (!application) {
    notFound();
  }

  const posData = Array.isArray(application.positions) ? application.positions[0] as any : application.positions as any;
  const posTitle = posData?.title;

  // Fetch the dynamic form schema separately from position_forms
  let fieldLabelMap: Record<string, string> = {};
  if (posData?.id) {
    const { data: posForm } = await supabaseServer
      .from("position_forms")
      .select("schema_json")
      .eq("position_id", posData.id)
      .maybeSingle();
    const formSchema: any[] = posForm?.schema_json || [];
    formSchema.forEach((f: any) => { fieldLabelMap[f.id] = f.label; });
  }
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/gvp-admin/applications" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Application details</h2>
          <p className="text-muted-foreground">{application.application_number} • {posTitle}</p>
        </div>
        <div className="ml-auto">
          <Badge variant="default" className="text-sm px-3 py-1 capitalize">{application.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div><span className="text-muted-foreground mr-2">Name:</span><span className="font-medium text-foreground">{application.candidate_name}</span></div>
                 <div><span className="text-muted-foreground mr-2">Email:</span><span className="font-medium text-foreground">{application.candidate_email}</span></div>
                 <div><span className="text-muted-foreground mr-2">Phone:</span><span className="font-medium text-foreground">{application.candidate_phone}</span></div>
                 <div><span className="text-muted-foreground mr-2">Applied:</span><span className="font-medium text-foreground">{new Date(application.applied_at).toLocaleString()}</span></div>
              </div>
           </div>

           <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Application Form Answers</h3>
              <div className="space-y-4 text-sm">
                  {Object.entries(application.dynamic_responses_json || {}).map(([key, val]) => {
                     // Look up human-readable label from the position's form schema
                     const label = fieldLabelMap[key] || key;
                     return (
                        <div key={key} className="bg-muted/10 p-3 rounded-lg border">
                           <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">{label}</p>
                           <p className="font-medium text-foreground">{val as string}</p>
                        </div>
                     );
                  })}
                 {Object.keys(application.dynamic_responses_json || {}).length === 0 && (
                    <p className="text-muted-foreground italic">No dynamic responses found.</p>
                 )}
              </div>
           </div>

           <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Attached Documents</h3>
              <div className="space-y-3">
                 {application.application_files && application.application_files.map((file: any) => (
                    <div key={file.file_url} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                       <div className="flex items-center gap-3">
                          <FileText className="text-primary h-5 w-5" />
                          <div>
                             <p className="font-medium text-sm text-foreground capitalize">{file.field_name}</p>
                             <p className="text-xs text-muted-foreground">Document File</p>
                          </div>
                       </div>
                        <Link 
                           href={`/api/admin/download?path=${encodeURIComponent(file.file_url)}`} 
                           target="_blank" 
                           className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                           <Download className="h-4 w-4 mr-2" /> Download
                        </Link>
                    </div>
                 ))}
                 {(!application.application_files || application.application_files.length === 0) && (
                    <p className="text-muted-foreground italic text-sm">No files uploaded.</p>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Status Actions</h3>
              <p className="text-sm text-muted-foreground">Update the application status here.</p>
              <div className="flex flex-col gap-2 pt-2">
                 <Button>Mark as Shortlisted</Button>
                 <Button variant="outline">Schedule Interview</Button>
                 <Button variant="secondary">On Hold</Button>
                 <Button variant="destructive">Reject</Button>
              </div>
           </div>

           <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Internal Notes</h3>
              <div className="space-y-4">
                 <p className="text-sm text-muted-foreground italic">Internal notes tracking to be implemented.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
