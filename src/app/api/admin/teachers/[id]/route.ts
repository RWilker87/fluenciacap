import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, schoolId, email } = await request.json();

  // Atualiza perfil
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ name, school_id: schoolId })
    .eq('id', id)
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Atualiza email no auth se foi informado
  if (email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ profile });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Deletar do auth (cascade deleta o profile)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
