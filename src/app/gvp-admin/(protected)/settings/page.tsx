import { supabaseServer } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export const revalidate = 0;

export default async function SettingsPage() {
  const { data: departments } = await supabaseServer.from("departments").select("*").order("name");
  
  // Basic query for branding
  const { data: brandings } = await supabaseServer.from("branding_settings").select("*").limit(1);
  const branding = brandings && brandings.length > 0 ? brandings[0] : { institute_name: "", contact_email: "", footer_text: "" };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage departments and application branding.
        </p>
      </div>

      <SettingsClient initialDepartments={departments || []} initialBranding={branding} />
    </div>
  );
}
