-- Script de verificación después de aplicar la migración 007

-- 1. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'cases')
ORDER BY tablename, policyname;

-- 2. Verificar que la función is_admin funciona
SELECT 'Testing is_admin function...' as test;
SELECT is_admin() as current_user_is_admin;

-- 3. Probar consulta de user_profiles sin recursión
SELECT 'Testing user_profiles query...' as test;
SELECT 
    up.id,
    up.email,
    up.full_name,
    r.name as role_name
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';

-- 4. Verificar permisos del admin
SELECT 'Testing admin permissions...' as test;
SELECT 
    p.name as permission_name,
    p.resource,
    p.action
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE up.email = 'andresjgsalzate@gmail.com'
AND p.is_active = true
ORDER BY p.resource, p.action
LIMIT 10;

-- 5. Test simple de casos (debería funcionar ahora)
SELECT 'Testing cases access...' as test;
SELECT COUNT(*) as total_cases FROM cases;
