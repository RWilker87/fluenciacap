-- ============================================================
-- LEXFLUÊNCIA - Script Completo de Banco de Dados (v2)
-- Execute este script completo no SQL Editor do Supabase
-- Substitui a versão anterior
-- ============================================================

-- 1. Tabela de escolas
CREATE TABLE IF NOT EXISTS public.schools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  school_id  UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de turmas (com teacher_id)
CREATE TABLE IF NOT EXISTS public.classrooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  school_id  UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de alunos
CREATE TABLE IF NOT EXISTS public.students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DESABILITAR RLS (modo desenvolvimento)
-- Reativar com políticas corretas antes da produção
-- ============================================================

ALTER TABLE public.schools    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students   DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- GRANTS de permissão
-- ============================================================

GRANT ALL ON public.profiles   TO authenticated, anon;
GRANT ALL ON public.schools    TO authenticated, anon;
GRANT ALL ON public.classrooms TO authenticated, anon;
GRANT ALL ON public.students   TO authenticated, anon;

-- ============================================================
-- TRIGGER: criar profile automaticamente ao registrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'teacher'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ADICIONAR teacher_id em classrooms se já existir sem a coluna
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classrooms'
      AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE public.classrooms
      ADD COLUMN teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- ============================================================
-- PROMOVER USUÁRIO PARA ADMIN
-- Substitua o UUID abaixo pelo UUID real do seu usuário
-- Encontre em: Authentication > Users no painel do Supabase
-- ============================================================

-- INSERT INTO public.profiles (id, name, role, school_id)
-- VALUES ('SEU-UUID-AQUI', 'Seu Nome', 'admin', NULL)
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', school_id = NULL;
