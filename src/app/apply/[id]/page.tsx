import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ApplicationWizard } from "@/components/application/ApplicationWizard";

export const revalidate = 0;

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: position } = await supabaseServer
    .from("positions")
    .select(`
      *,
      departments(name)
    `)
    .eq("id", id)
    .single();

  if (!position || position.status === 'hidden') {
    notFound();
  }

  const { data: positionForm } = await supabaseServer
    .from("position_forms")
    .select("schema_json")
    .eq("position_id", id)
    .maybeSingle();

  const formSchemaJson = positionForm?.schema_json || [];

  const deptName = Array.isArray(position.departments) ? (position.departments[0] as any)?.name : (position.departments as any)?.name;
  const isClosed = position.status === 'closed';
  const dl = position.deadline ? new Date(position.deadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST' : "Until Filled";

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex-1">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-10 items-start">
        
        {/* LEFT: Job details */}
        <div className="space-y-8">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
              {deptName || "General"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {position.title}
            </h1>
            {isClosed && (
              <span className="mt-4 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold bg-secondary text-secondary-foreground">
                Applications Closed
              </span>
            )}
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground border-b pb-6">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground mb-1">Status</span>
              {position.status === 'open' ? 'Open' : 'Closed'}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground mb-1">Deadline</span>
              {dl}
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground space-y-8">
            {position.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div dangerouslySetInnerHTML={{ __html: position.description }} />
              </div>
            )}
            {position.qualifications && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
                <div dangerouslySetInnerHTML={{ __html: position.qualifications }} />
              </div>
            )}
            {position.instructions && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div dangerouslySetInnerHTML={{ __html: position.instructions }} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sticky application form */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
            {isClosed ? (
              <div className="text-center py-6">
                <h4 className="font-semibold text-xl">Applications are closed.</h4>
                <p className="text-muted-foreground mt-2">We are no longer accepting applications for this position.</p>
              </div>
            ) : (
              <ApplicationWizard positionId={position.id} positionTitle={position.title} formSchemaJson={formSchemaJson} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
