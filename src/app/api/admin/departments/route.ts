import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Department name is required" }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('departments')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, department: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
