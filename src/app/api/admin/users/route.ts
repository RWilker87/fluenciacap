import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, cpf, role, schoolId, classroomIds } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    // 1. Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Erro ao criar usuário.' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Criar/atualizar perfil (upsert)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name,
        cpf,
        school_id: schoolId || null,
        role,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 3. Se for coordenador e tiver turmas, vincular na tabela pivot
    if (role === 'coordenador' && classroomIds && classroomIds.length > 0) {
      const pivotData = classroomIds.map((cId: string) => ({
        coordinator_id: userId,
        classroom_id: cId,
      }));
      
      const { error: pivotError } = await supabaseAdmin
        .from('coordinator_classrooms')
        .insert(pivotData);

      if (pivotError) {
        console.error('Erro ao vincular turmas ao coordenador:', pivotError.message);
        // Não fazemos rollback do usuário inteiro aqui, mas logamos
      }
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');
  const role = searchParams.get('role');

  const query = supabaseAdmin
    .from('profiles')
    .select('*')
    .order('name');

  if (schoolId) query.eq('school_id', schoolId);
  if (role) query.eq('role', role);

  const { data: users, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users });
}
