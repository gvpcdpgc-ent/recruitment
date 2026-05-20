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
      })
      .eq("id", resolvedParams.id);

    if (error) throw error;

    // Update or Insert dynamic fields in position_forms
    await supabaseServer
      .from('position_forms')
      .upsert({
         position_id: resolvedParams.id,
         schema_json: Array.isArray(dynamicFields) ? dynamicFields : []
      }, { onConflict: 'position_id' });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    const { error } = await supabaseServer
      .from("positions")
      .delete()
      .eq("id", resolvedParams.id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
