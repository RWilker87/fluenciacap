import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, cpf, schoolId, email, role, classroomIds } = await request.json();

  // Atualiza perfil
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ name, cpf, school_id: schoolId || null, role })
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

  // Se for coordenador, atualiza as turmas vinculadas (delete all then insert)
  if (role === 'coordenador') {
    await supabaseAdmin.from('coordinator_classrooms').delete().eq('coordinator_id', id);
    if (classroomIds && classroomIds.length > 0) {
      const pivotData = classroomIds.map((cId: string) => ({
        coordinator_id: id,
        classroom_id: cId,
      }));
      await supabaseAdmin.from('coordinator_classrooms').insert(pivotData);
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
