import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Initial admin check from env
    const initialEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (initialEmail && initialPassword && email === initialEmail && password === initialPassword) {
      await createSession('00000000-0000-0000-0000-000000000000', email);
      return NextResponse.json({ success: true });
    }

    // Database admins check
    const { data: admin } = await supabaseServer
      .from('admins')
      .select('id, email, password_hash, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(admin.id, admin.email);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
