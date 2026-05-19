import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, institute_name, footer_text, contact_email } = body;

    let res;
    if (id) {
       res = await supabaseServer
        .from('branding_settings')
        .update({ institute_name, footer_text, contact_email })
        .eq('id', id);
    } else {
       res = await supabaseServer
        .from('branding_settings')
        .insert([{ institute_name, footer_text, contact_email }]);
    }

    if (res.error) throw res.error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
