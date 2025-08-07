-- ================================================================
-- SOLUCIÓN RÁPIDA: ACCESO ANALISTA
-- ================================================================
-- Problema: Usuario Analista no puede acceder debido a RLS
-- Causa: Falta de permisos básicos de usuario
-- ================================================================

-- PASO 1: Agregar permisos básicos mínimos al Analista
INSERT INTO role_permissions (role_id, permission_id)
VALUES 
    -- Permiso para crear su propio perfil
    ('b2e20a71-9268-4b06-8ec3-a776446af064', (SELECT id FROM permissions WHERE name = 'users.create_own')),
    -- Permiso para leer su propio perfil  
    ('b2e20a71-9268-4b06-8ec3-a776446af064', (SELECT id FROM permissions WHERE name = 'users.read_own')),
    -- Permiso para actualizar su propio perfil
    ('b2e20a71-9268-4b06-8ec3-a776446af064', (SELECT id FROM permissions WHERE name = 'users.update_own')),
    -- Permiso para leer su propio rol
    ('b2e20a71-9268-4b06-8ec3-a776446af064', (SELECT id FROM permissions WHERE name = 'roles.read_own'))
ON CONFLICT DO NOTHING;

-- PASO 2: Verificar que el rol "User" existe (para el sistema)
INSERT INTO roles (id, name, description, is_active, created_at, updated_at)
VALUES (
    '296401da-0e92-4743-8b18-eda0c7cabf8d',
    'User', 
    'Usuario básico del sistema',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- PASO 3: Verificar permisos asignados
SELECT 
    r.name as rol,
    p.name as permiso,
    p.description as descripcion
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id  
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'Analista' 
AND p.resource IN ('users', 'roles')
ORDER BY p.name;

-- Mensaje de confirmación
SELECT 'Permisos básicos agregados al rol Analista. Intenta acceder nuevamente.' as mensaje;
