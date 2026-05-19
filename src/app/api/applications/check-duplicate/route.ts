import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, position_id } = await request.json();
    
    if (!email || !position_id) {
      return NextResponse.json({ error: 'Missing email or position_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('applications')
      .select('application_number')
      .eq('candidate_email', email)
      .eq('position_id', position_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = zero rows
      throw error;
    }

    if (data) {
      return NextResponse.json({ 
        exists: true, 
        application_number: data.application_number 
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
