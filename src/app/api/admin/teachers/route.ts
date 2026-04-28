import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');

  const query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('name');

  if (schoolId) query.eq('school_id', schoolId);

  const { data: teachers, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teachers });
}
