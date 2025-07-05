-- 🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE REGISTRO
-- Ejecutar este script paso a paso para identificar el problema

-- PASO 1: Verificar estado actual de las políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- PASO 2: Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- PASO 3: Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- PASO 4: Verificar función handle_new_user
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- PASO 5: Verificar estructura de user_profiles
\d user_profiles;

-- PASO 6: Probar inserción manual (esto debería fallar para mostrar el error exacto)
-- NOTA: NO ejecutar este INSERT, solo para ver qué pasaría
/*
INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
VALUES (
    gen_random_uuid(),
    'test@ejemplo.com',
    'Usuario Prueba',
    (SELECT id FROM roles WHERE name = 'user' LIMIT 1),
    true
);
*/

-- PASO 7: Verificar permisos en la tabla user_profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'user_profiles'
AND table_schema = 'public';

-- PASO 8: Verificar si el rol 'user' existe
SELECT id, name, description, is_active 
FROM roles 
WHERE name = 'user';

-- PASO 9: Ver errores recientes en logs (si están disponibles)
-- Esta query puede no funcionar dependiendo de los permisos
SELECT 
    log_time,
    message 
FROM pg_log 
WHERE message LIKE '%user_profiles%' 
ORDER BY log_time DESC 
LIMIT 10;
