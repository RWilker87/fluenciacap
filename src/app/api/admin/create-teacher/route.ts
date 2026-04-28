import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, schoolId } = await request.json();

    if (!email || !password || !name || !schoolId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, password, name, schoolId.' },
        { status: 400 }
      );
    }

    // 1. Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // já confirma o e-mail automaticamente
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Erro ao criar usuário.' },
        { status: 400 }
      );
    }

    // 2. Criar/atualizar perfil (upsert garante que funciona com ou sem trigger)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name,
        school_id: schoolId,
        role: 'teacher',
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: deletar usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro interno.' },
      { status: 500 }
    );
  }
}
