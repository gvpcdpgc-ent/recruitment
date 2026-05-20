import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('positions')
      .select(`
        id,
        title,
        position_forms (
          schema_json
        )
      `)
      .order('title', { ascending: true });

    if (error) throw error;

    // Flatten the response
    const positions = data.map(p => ({
      id: p.id,
      title: p.title,
      schema: (p.position_forms as any)?.[0]?.schema_json || []
    }));

    return NextResponse.json({ success: true, positions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
