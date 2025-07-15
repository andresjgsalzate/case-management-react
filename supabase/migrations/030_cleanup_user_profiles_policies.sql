-- =====================================================
-- MIGRACIÓN 030: Limpiar políticas huérfanas de user_profiles
-- =====================================================
-- Esta migración elimina todas las políticas RLS de la tabla
-- user_profiles ya que RLS está deshabilitado en esta tabla
-- para evitar recursión infinita.
-- =====================================================

-- Eliminar todas las políticas RLS de user_profiles
-- Estas políticas están causando advertencias del linter ya que
-- RLS está deshabilitado en esta tabla

DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_manage_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_user_profile_access" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_user_profile_creation" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_user_profile_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profile_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profile_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profile_update_policy" ON public.user_profiles;

-- Eliminar cualquier otra política que pueda existir en user_profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END $$;

-- Verificar que no queden políticas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles';
    
    IF policy_count = 0 THEN
        RAISE NOTICE 'Éxito: No quedan políticas RLS en user_profiles';
    ELSE
        RAISE NOTICE 'Advertencia: Aún quedan % políticas en user_profiles', policy_count;
    END IF;
END $$;

-- Comentario explicativo
COMMENT ON TABLE public.user_profiles IS 'Tabla de perfiles de usuario. RLS deshabilitado para evitar recursión infinita en validaciones de permisos. Acceso controlado por funciones has_system_access() y has_permission().';

-- Log final
DO $$
BEGIN
    RAISE NOTICE 'Migración 030 completada: Políticas RLS huérfanas eliminadas de user_profiles';
    RAISE NOTICE 'La tabla user_profiles usa control de acceso mediante funciones en lugar de RLS';
END $$;
