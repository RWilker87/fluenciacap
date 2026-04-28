-- ============================================================
-- LEXFLUÊNCIA - Script Completo de Banco de Dados (v3)
-- Atualizado para modelo de 4 roles: admin, gestor, coordenador, professor
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
  cpf        TEXT UNIQUE,
  role       TEXT NOT NULL DEFAULT 'professor' CHECK (role IN ('admin', 'gestor', 'coordenador', 'professor')),
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

-- 5. Tabela pivô para Coordenadores x Turmas
CREATE TABLE IF NOT EXISTS public.coordinator_classrooms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  classroom_id   UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coordinator_id, classroom_id)
);

-- ============================================================
-- DESABILITAR RLS (modo desenvolvimento)
-- ============================================================
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_classrooms DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- GRANTS de permissão
-- ============================================================
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT ALL ON public.schools TO authenticated, anon;
GRANT ALL ON public.classrooms TO authenticated, anon;
GRANT ALL ON public.students TO authenticated, anon;
GRANT ALL ON public.coordinator_classrooms TO authenticated, anon;

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
    'professor'
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
-- SCRIPTS DE MIGRAÇÃO (CASO AS TABELAS JÁ EXISTAM)
-- ============================================================
DO $$
BEGIN
  -- Adicionar coluna cpf se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cpf') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf TEXT UNIQUE;
  END IF;
  
  -- Atualizar a constraint de role
  -- Removemos e recriamos a constraint
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'gestor', 'coordenador', 'professor'));
END;
$$;
