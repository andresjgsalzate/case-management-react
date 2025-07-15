-- =====================================================
-- SOLUCIÓN SIMPLE: Deshabilitar RLS en user_profiles
-- =====================================================

-- Deshabilitar Row Level Security en user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar que no hay políticas activas
SELECT 
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'user_profiles' 
  AND schemaname = 'public';

-- Probar acceso directo
SELECT 'Test' as resultado, count(*) as total_users FROM public.user_profiles;
