import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { 
       title, 
       department_id, 
       description, 
       qualifications, 
       instructions, 
       deadline, 
       status, 
       dynamicFields,
       app_prefix,
       next_counter
    } = body;

    const { error } = await supabaseServer
      .from("positions")
      .update({
         title,
         department_id,
         description,
         qualifications,
         instructions,
         deadline,
         status,
         app_prefix,
         next_counter,
         dynamic_form_schema: dynamicFields,
      })
      .eq("id", resolvedParams.id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
