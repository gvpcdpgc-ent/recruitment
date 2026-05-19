import { PositionFormBuilder } from "@/components/admin/PositionFormBuilder";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function CreatePositionPage() {
  const { data: departments } = await supabaseServer.from("departments").select("id, name");

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Position</h2>
        <p className="text-muted-foreground mt-2">
          Configure the public position details and the dynamic application form.
        </p>
      </div>

      <PositionFormBuilder departments={departments || []} />
    </div>
  );
}
