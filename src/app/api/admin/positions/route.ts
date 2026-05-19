import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    } = await request.json();

    if (!title || !status) {
      return NextResponse.json({ error: 'Title and Status are required' }, { status: 400 });
    }

    // Insert Position
    const { data: posData, error: posError } = await supabaseServer
      .from('positions')
      .insert({
         title,
         department_id: department_id || null,
         description,
         qualifications,
         instructions,
         deadline: deadline || null,
         status,
         app_prefix,
         next_counter: next_counter || 1
      })
      .select()
      .single();

    if (posError) throw posError;

    // Insert Position Form config
    const formSchemaJson = Array.isArray(dynamicFields) ? dynamicFields : [];
    
    const { error: formError } = await supabaseServer
      .from('position_forms')
      .insert({
         position_id: posData.id,
         schema_json: formSchemaJson
      });

    if (formError) throw formError;

    // Log Action
    await supabaseServer.from('admin_audit_logs').insert({
       admin_id: session.adminId,
       action: 'CREATED_POSITION',
       target_table: 'positions',
       target_id: posData.id,
       details: { title }
    });

    return NextResponse.json({ success: true, position: posData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
