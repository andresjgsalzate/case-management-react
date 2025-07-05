-- VERIFICACIÓN RÁPIDA DEL ESTADO DEL SISTEMA
-- Ejecutar antes de las pruebas de registro

-- 1. Verificar RLS
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity = true THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'case_control')
ORDER BY tablename;

-- 2. Verificar roles existentes
SELECT 
  'Roles' as check_type,
  name,
  description
FROM roles 
ORDER BY name;

-- 3. Verificar usuarios admin existentes
SELECT 
  'Admin Users' as check_type,
  up.email,
  up.is_active,
  r.name as role_name
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE r.name = 'admin'
ORDER BY up.created_at;

-- 4. Verificar funciones críticas
SELECT 
  'Functions' as check_type,
  proname as function_name,
  'EXISTS' as status
FROM pg_proc 
WHERE proname IN ('has_system_access', 'has_case_control_permission')
ORDER BY proname;

-- 5. Verificar políticas RLS en user_profiles
SELECT 
  'RLS Policies' as check_type,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 6. Total de usuarios por rol
SELECT 
  'User Count' as check_type,
  r.name as role_name,
  COUNT(*) as total_users,
  COUNT(CASE WHEN up.is_active = true THEN 1 END) as active_users
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
GROUP BY r.name
ORDER BY r.name;
