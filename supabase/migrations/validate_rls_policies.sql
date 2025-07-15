-- =====================================================
-- SCRIPT DE VALIDACIÓN DE POLÍTICAS RLS
-- =====================================================
-- Este script valida que las políticas RLS dinámicas estén funcionando correctamente
-- Ejecutar sección por sección y verificar los resultados esperados

-- =====================================================
-- 1. VERIFICAR ESTADO DE LAS POLÍTICAS
-- =====================================================

-- Listar todas las políticas activas (solo deben quedar las dinámicas + service_role bypass)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar que RLS esté habilitado en todas las tablas críticas
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    relforcerowsecurity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
    AND tablename IN ('cases', 'todos', 'archived_cases', 'archived_todos', 'user_permissions')
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR FUNCIONES HELPER
-- =====================================================

-- Verificar que las funciones helper existan y sean accesibles
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('has_permission', 'get_user_role', 'is_case_accessible', 'is_todo_accessible')
ORDER BY routine_name;

-- =====================================================
-- 3. VALIDAR DATOS DE CONFIGURACIÓN
-- =====================================================

-- Verificar estructura de permisos (usando la estructura real)
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.resource,
    p.action,
    p.is_active as permission_active,
    r.is_active as role_active
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- Verificar usuarios y sus roles
SELECT 
    u.id,
    u.email,
    up.full_name,
    r.name as user_role,
    COALESCE(up.is_active, false) as is_active
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY u.email;

-- =====================================================
-- 4. PRUEBAS DE ACCESO POR ROL
-- =====================================================

-- IMPORTANTE: Las siguientes consultas deben ejecutarse conectado como diferentes usuarios
-- Para simular, puedes usar: SET LOCAL "request.jwt.claims" = '{"sub": "USER_ID", "role": "authenticated"}';

-- =====================================================
-- 4.1 PRUEBA CON USUARIO ANALISTA
-- =====================================================
-- Ejecutar estas consultas conectado como un usuario con rol 'analista'

-- Verificar acceso a casos (debería ver solo los propios)
SELECT 
    id,
    numero_caso,
    descripcion,
    user_id,
    clasificacion,
    created_at
FROM cases 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar acceso a TODOs (debería ver solo los asignados/creados por él)
SELECT 
    id,
    title,
    assigned_user_id,
    created_by_user_id,
    is_completed,
    created_at
FROM todos 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar acceso a casos archivados (solo los que él creó/fue asignado originalmente)
SELECT 
    id,
    case_number,
    original_data->>'descripcion' as original_descripcion,
    original_data->>'user_id' as original_user_id,
    archived_at,
    archived_by
FROM archived_cases 
ORDER BY archived_at DESC 
LIMIT 5;

-- Verificar acceso a TODOs archivados (solo los que él creó/fue asignado originalmente)
SELECT 
    id,
    title,
    original_data->>'assigned_user_id' as original_assigned_user_id,
    original_data->>'created_by_user_id' as original_created_by_user_id,
    archived_at,
    archived_by
FROM archived_todos 
ORDER BY archived_at DESC 
LIMIT 5;

-- =====================================================
-- 4.2 PRUEBA CON USUARIO SUPERVISOR
-- =====================================================
-- Ejecutar estas consultas conectado como un usuario con rol 'supervisor'

-- Verificar acceso amplio a casos (debería ver todos)
SELECT 
    COUNT(*) as total_cases,
    COUNT(CASE WHEN clasificacion = 'Baja Complejidad' THEN 1 END) as low_complexity,
    COUNT(CASE WHEN clasificacion = 'Media Complejidad' THEN 1 END) as medium_complexity,
    COUNT(CASE WHEN clasificacion = 'Alta Complejidad' THEN 1 END) as high_complexity
FROM cases;

-- Verificar acceso amplio a TODOs (debería ver todos)
SELECT 
    COUNT(*) as total_todos,
    COUNT(CASE WHEN is_completed = false THEN 1 END) as pending_todos,
    COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_todos
FROM todos;

-- Verificar acceso a archivos (debería ver todos)
SELECT 
    COUNT(*) as total_archived_cases
FROM archived_cases;

SELECT 
    COUNT(*) as total_archived_todos
FROM archived_todos;

-- =====================================================
-- 4.3 PRUEBA CON USUARIO ADMIN
-- =====================================================
-- Ejecutar estas consultas conectado como un usuario con rol 'admin'

-- Verificar acceso completo (debería ver todo y poder modificar permisos)
SELECT 
    COUNT(*) as total_permissions
FROM permissions;

-- Verificar acceso a roles
SELECT 
    COUNT(*) as total_roles
FROM roles;

-- Verificar acceso a relaciones rol-permiso
SELECT 
    COUNT(*) as total_role_permissions
FROM role_permissions;

-- Intentar una operación de configuración (solo admin debería poder)
-- NOTA: Esta es una consulta de prueba, NO la ejecutes si no quieres cambios reales
-- INSERT INTO permissions (name, description, resource, action) 
-- VALUES ('test.permission', 'Test permission', 'test', 'read');

-- =====================================================
-- 5. PRUEBAS DE RESTRICCIONES ESPECÍFICAS
-- =====================================================

-- Probar que un analista NO puede ver casos de otros usuarios
-- (Esta consulta debería devolver 0 o solo casos del usuario actual)
SELECT 
    COUNT(*) as cases_from_others,
    COUNT(CASE WHEN user_id = auth.uid() THEN 1 END) as own_cases
FROM cases
WHERE user_id != auth.uid();

-- Probar que un analista NO puede ver TODOs de otros usuarios
SELECT 
    COUNT(*) as todos_from_others,
    COUNT(CASE WHEN assigned_user_id = auth.uid() OR created_by_user_id = auth.uid() THEN 1 END) as own_todos
FROM todos
WHERE assigned_user_id != auth.uid() AND created_by_user_id != auth.uid();

-- =====================================================
-- 6. VALIDACIÓN DE FUNCIONES HELPER
-- =====================================================

-- Probar función has_permission directamente
-- NOTA: La función has_permission en tu sistema toma (user_id, permission_name)
SELECT 
    auth.uid() as current_user,
    has_permission(auth.uid(), 'cases.read.own') as can_read_own_cases,
    has_permission(auth.uid(), 'cases.read.all') as can_read_all_cases,
    has_permission(auth.uid(), 'view_todos') as can_read_todos,
    has_permission(auth.uid(), 'admin.access') as is_admin;

-- Verificar el rol del usuario actual
SELECT 
    up.id,
    up.full_name,
    r.name as role_name,
    up.is_active
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE up.id = auth.uid();

-- Probar funciones de accesibilidad (usando IDs reales de tu BD)
-- NOTA: Reemplaza con IDs válidos de tu base de datos antes de ejecutar
-- SELECT 
--     is_case_accessible('CASE_ID_REAL') as case_accessible,
--     is_todo_accessible('TODO_ID_REAL') as todo_accessible;

-- =====================================================
-- 7. VERIFICACIÓN DE VISTAS DE SEGURIDAD
-- =====================================================

-- Verificar que las vistas funcionen correctamente (si existen)
-- Estas consultas fallarán si las vistas no existen, lo cual es normal
-- SELECT COUNT(*) as accessible_cases FROM accessible_cases;
-- SELECT COUNT(*) as accessible_todos FROM accessible_todos;

-- En su lugar, verificar que podemos acceder a las tablas principales
SELECT 'Cases accessible' as test_name, COUNT(*) as count FROM cases;
SELECT 'TODOs accessible' as test_name, COUNT(*) as count FROM todos;
SELECT 'Archived cases accessible' as test_name, COUNT(*) as count FROM archived_cases;
SELECT 'Archived todos accessible' as test_name, COUNT(*) as count FROM archived_todos;

-- =====================================================
-- 8. CONSULTAS DE AUDITORÍA
-- =====================================================

-- Verificar logs de cambios recientes (si existe tabla de auditoría)
-- SELECT * FROM audit_log WHERE created_at > NOW() - INTERVAL '1 day' ORDER BY created_at DESC LIMIT 10;

-- =====================================================
-- RESULTADOS ESPERADOS POR ROL:
-- =====================================================
/*
ANALISTA:
- Solo ve casos donde user_id = su_id
- Solo ve TODOs donde assigned_user_id = su_id OR created_by_user_id = su_id
- Solo ve archivos donde original_data contiene su ID como creador/asignado
- has_permission('view_todos') = true pero con restricciones
- cases_from_others debería ser 0

SUPERVISOR:
- Ve todos los casos y TODOs
- Ve todos los archivos
- has_permission devuelve true para operaciones de lectura amplia
- Puede ver métricas y estadísticas completas

ADMIN:
- Ve todo sin restricciones
- Puede modificar permisos y roles
- Acceso completo a configuración del sistema
- has_permission('admin.access') = true
*/

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
/*
1. Ejecuta las secciones 1-3 primero para verificar configuración
2. Para las secciones 4.1-4.3, conéctate como usuarios diferentes o usa:
   SET LOCAL "request.jwt.claims" = '{"sub": "USER_ID", "role": "authenticated"}';
3. Compara los resultados con los esperados según el rol
4. Si alguna consulta falla o devuelve resultados inesperados, documenta el error
5. Las consultas comentadas (INSERT, etc.) son solo para referencia
*/
