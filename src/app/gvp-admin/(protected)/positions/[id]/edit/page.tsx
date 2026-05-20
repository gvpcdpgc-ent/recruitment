import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PositionFormBuilder } from "@/components/admin/PositionFormBuilder";

export default async function EditPositionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: position } = await supabaseServer
    .from("positions")
    .select("*, position_forms(schema_json)")
    .eq("id", resolvedParams.id)
    .single();

  if (!position) {
    notFound();
  }

  // Handle both array (one-to-many) and object (one-to-one) formats from Supabase
  const pf = (position as any).position_forms;
  const positionFormsData = Array.isArray(pf) ? (pf.length > 0 ? pf[0] : null) : pf;
  
  const initialData = {
    ...position,
    dynamic_form_schema: positionFormsData?.schema_json || []
  };

  const { data: departments } = await supabaseServer.from("departments").select("id, name");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Position</h2>
        <p className="text-muted-foreground">
          Update the settings and dynamics fields for {position.title}.
        </p>
      </div>

      <PositionFormBuilder departments={departments || []} initialData={initialData} />
    </div>
  );
}
