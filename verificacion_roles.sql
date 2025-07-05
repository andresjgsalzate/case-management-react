-- 🔍 QUERIES DE VERIFICACIÓN PARA EL SISTEMA DE ROLES

-- =====================================
-- 1. VERIFICAR ROLES CREADOS
-- =====================================
SELECT 
    name,
    description,
    is_active,
    created_at
FROM roles 
ORDER BY 
    CASE name 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'analista' THEN 3
        WHEN 'user' THEN 4
        ELSE 5
    END;

-- =====================================
-- 2. VERIFICAR PERMISOS POR ROL
-- =====================================
SELECT 
    r.name as rol,
    COUNT(rp.permission_id) as total_permisos,
    STRING_AGG(p.name, ', ' ORDER BY p.name) as permisos
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.is_active = true
GROUP BY r.id, r.name
ORDER BY 
    CASE r.name 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'analista' THEN 3
        WHEN 'user' THEN 4
        ELSE 5
    END;

-- =====================================
-- 3. VERIFICAR PERMISO system.access
-- =====================================
SELECT 
    r.name as rol,
    CASE 
        WHEN p.name = 'system.access' THEN '✅ SÍ'
        ELSE '❌ NO'
    END as tiene_acceso_sistema
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.name = 'system.access'
WHERE r.is_active = true
ORDER BY r.name;

-- =====================================
-- 4. VERIFICAR USUARIOS Y SUS ROLES
-- =====================================
SELECT 
    up.email,
    r.name as rol,
    up.is_active as usuario_activo,
    up.created_at as fecha_registro,
    CASE 
        WHEN r.name = 'user' THEN '🕒 PENDIENTE'
        WHEN r.name = 'analista' THEN '📝 ANALISTA'
        WHEN r.name = 'supervisor' THEN '👁️ SUPERVISOR'
        WHEN r.name = 'admin' THEN '👑 ADMIN'
        ELSE '❓ DESCONOCIDO'
    END as estado
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY up.created_at DESC;

-- =====================================
-- 5. VERIFICAR FUNCIÓN has_system_access
-- =====================================
SELECT 
    proname as nombre_funcion,
    prosrc as codigo_funcion
FROM pg_proc 
WHERE proname = 'has_system_access';

-- =====================================
-- 6. VERIFICAR POLÍTICAS RLS
-- =====================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE policyname LIKE '%System access%' OR policyname LIKE '%system%'
ORDER BY tablename, policyname;

-- =====================================
-- 7. CONTAR PERMISOS CRÍTICOS
-- =====================================
WITH permission_count AS (
    SELECT 
        r.name as rol,
        SUM(CASE WHEN p.name LIKE 'cases.delete%' THEN 1 ELSE 0 END) as puede_eliminar_casos,
        SUM(CASE WHEN p.name = 'cases.read.all' THEN 1 ELSE 0 END) as puede_ver_todos_casos,
        SUM(CASE WHEN p.name = 'cases.read.own' THEN 1 ELSE 0 END) as puede_ver_propios_casos,
        SUM(CASE WHEN p.name = 'system.access' THEN 1 ELSE 0 END) as tiene_acceso_sistema,
        SUM(CASE WHEN p.name LIKE 'admin.%' THEN 1 ELSE 0 END) as permisos_admin
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.is_active = true
    GROUP BY r.id, r.name
)
SELECT 
    rol,
    CASE WHEN puede_eliminar_casos > 0 THEN '✅ SÍ' ELSE '❌ NO' END as "Puede Eliminar",
    CASE WHEN puede_ver_todos_casos > 0 THEN '✅ TODOS' 
         WHEN puede_ver_propios_casos > 0 THEN '🔒 PROPIOS' 
         ELSE '❌ NINGUNO' END as "Ve Casos",
    CASE WHEN tiene_acceso_sistema > 0 THEN '✅ SÍ' ELSE '❌ NO' END as "Acceso Sistema",
    CASE WHEN permisos_admin > 0 THEN '✅ SÍ' ELSE '❌ NO' END as "Es Admin"
FROM permission_count
ORDER BY 
    CASE rol 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'analista' THEN 3
        WHEN 'user' THEN 4
        ELSE 5
    END;

-- =====================================
-- 8. VERIFICAR RESULTADO ESPERADO
-- =====================================
-- Ejecuta esta query para ver el resumen final:
SELECT 
    '🎯 RESUMEN VERIFICACIÓN' as titulo,
    (SELECT COUNT(*) FROM roles WHERE name IN ('admin', 'supervisor', 'analista', 'user') AND is_active = true) as roles_activos,
    (SELECT COUNT(*) FROM permissions WHERE name = 'system.access') as permiso_sistema_existe,
    (SELECT COUNT(*) FROM pg_proc WHERE proname = 'has_system_access') as funcion_existe,
    (SELECT COUNT(*) FROM role_permissions rp 
     JOIN roles r ON rp.role_id = r.id 
     JOIN permissions p ON rp.permission_id = p.id 
     WHERE r.name = 'user' AND p.name = 'system.access') as user_tiene_acceso_sistema;
