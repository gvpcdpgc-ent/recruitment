import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/admin/download?path=<file_url>
 * Generates a short-lived signed URL for a private Supabase storage file
 * and redirects the browser to it so admins can download documents.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // Generate a signed URL valid for 60 seconds
    const { data, error } = await supabaseServer.storage
      .from("documents")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
    }

    // Redirect directly to the signed URL
    return NextResponse.redirect(data.signedUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
