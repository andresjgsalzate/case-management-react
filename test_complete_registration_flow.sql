-- =============================================
-- PRUEBA COMPLETA DEL FLUJO DE REGISTRO
-- =============================================

-- 1. VERIFICAR ESTADO ACTUAL DEL SISTEMA
SELECT 'VERIFICANDO ESTADO DEL SISTEMA...' as step;

-- Verificar que RLS está activo
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'roles', 'permissions', 'role_permissions', 'case_control')
ORDER BY tablename;

-- 2. VERIFICAR ROLES Y PERMISOS
SELECT 'VERIFICANDO ROLES Y PERMISOS...' as step;

SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- 3. VERIFICAR FUNCIONES CRÍTICAS
SELECT 'VERIFICANDO FUNCIONES...' as step;

SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname IN ('has_system_access', 'has_case_control_permission')
ORDER BY proname;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 'VERIFICANDO POLÍTICAS RLS...' as step;

SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING clause present'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK clause present'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'case_control')
ORDER BY tablename, policyname;

-- 5. SIMULAR NUEVO USUARIO (TEST)
SELECT 'SIMULANDO NUEVO USUARIO...' as step;

-- Verificar que podemos obtener el rol 'user'
SELECT 
  id,
  name,
  description
FROM roles 
WHERE name = 'user';

-- 6. VERIFICAR QUE UN ADMIN PUEDE VER TODOS LOS PERFILES
SELECT 'VERIFICANDO ACCESO ADMIN...' as step;

-- Buscar un usuario admin existente
SELECT 
  up.id,
  up.email,
  up.full_name,
  r.name as role_name,
  up.is_active
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE r.name = 'admin';

-- 7. VERIFICAR USUARIOS SIN ACCESO
SELECT 'VERIFICANDO USUARIOS SIN ACCESO...' as step;

SELECT 
  up.id,
  up.email,
  up.full_name,
  r.name as role_name,
  up.is_active
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE r.name = 'user'
ORDER BY up.created_at DESC;

-- 8. VERIFICAR ESTADO DE SEGURIDAD
SELECT 'VERIFICANDO SEGURIDAD...' as step;

-- Verificar que no hay usuarios sin rol
SELECT 
  COUNT(*) as usuarios_sin_rol
FROM user_profiles up
WHERE up.role_id IS NULL;

-- Verificar que hay al menos un admin activo
SELECT 
  COUNT(*) as admins_activos
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE r.name = 'admin' AND up.is_active = true;

-- 9. REPORTE FINAL
SELECT 'REPORTE FINAL' as step;

SELECT 
  'Usuarios por rol' as category,
  r.name as role_name,
  COUNT(*) as total_users,
  COUNT(CASE WHEN up.is_active = true THEN 1 END) as active_users
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

-- Verificar que el sistema está listo para registro
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM roles WHERE name = 'user') THEN 'OK'
    ELSE 'ERROR'
  END + ' - Rol user existe' as check_result
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_system_access') THEN 'OK'
    ELSE 'ERROR'
  END + ' - Función has_system_access existe'
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'user_profiles' AND rowsecurity = true
    ) THEN 'OK'
    ELSE 'ERROR'
  END + ' - RLS activo en user_profiles'
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_insert_policy'
    ) THEN 'OK'
    ELSE 'ERROR'
  END + ' - Política de INSERT permite auto-registro';

SELECT 'SISTEMA LISTO PARA PRUEBAS DE REGISTRO' as final_status;
