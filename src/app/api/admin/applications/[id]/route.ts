import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;

    // Delete associated files from storage
    const { data: files } = await supabaseServer
      .from("application_files")
      .select("file_url")
      .eq("application_id", id);

    if (files && files.length > 0) {
      const paths = files.map((f) => f.file_url);
      await supabaseServer.storage.from("documents").remove(paths);
    }

    // Delete photo if exists
    const { data: appData } = await supabaseServer
      .from("applications")
      .select("photo_url")
      .eq("id", id)
      .single();

    if ((appData as any)?.photo_url) {
      const url = (appData as any).photo_url as string;
      const path = url.split("/photos/")[1];
      if (path) await supabaseServer.storage.from("photos").remove([path]);
    }

    // Delete the application row (cascades to files, logs, notes)
    const { error } = await supabaseServer
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
