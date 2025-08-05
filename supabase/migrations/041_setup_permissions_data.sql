-- ================================================================
-- SCRIPT TEMPORAL: Configurar roles y permisos básicos
-- ================================================================
-- Descripción: Configura los roles básicos y asigna permisos
-- Fecha: 4 de Agosto, 2025
-- ================================================================

-- ================================================================
-- PASO 1: VERIFICAR ROLES EXISTENTES
-- ================================================================
SELECT 'ROLES ACTUALES:' as info;
SELECT id, name, description, is_active FROM roles ORDER BY name;

-- ================================================================
-- PASO 2: VERIFICAR USUARIOS Y SUS ROLES ACTUALES
-- ================================================================
SELECT 'USUARIOS ACTUALES:' as info;
SELECT 
    up.email,
    up.full_name,
    up.role_name,
    up.role_id,
    r.name as role_from_table,
    up.is_active
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY up.email;

-- ================================================================
-- PASO 3: INSERTAR ROLES BÁSICOS SI NO EXISTEN
-- ================================================================
INSERT INTO roles (name, description, is_active) VALUES 
('admin', 'Administrador del sistema con acceso completo', true),
('supervisor', 'Supervisor con permisos de gestión', true),
('analyst', 'Analista con permisos básicos', true),
('user', 'Usuario básico', true)
ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
is_active = EXCLUDED.is_active;

-- ================================================================
-- PASO 4: OBTENER IDs DE ROLES
-- ================================================================
SELECT 'IDs DE ROLES:' as info;
SELECT id, name FROM roles ORDER BY name;

-- ================================================================
-- PASO 5: ACTUALIZAR USUARIOS PARA USAR ROLES CORRECTOS
-- ================================================================
-- Actualizar usuarios que deberían ser admin
UPDATE user_profiles 
SET 
    role_id = (SELECT id FROM roles WHERE name = 'admin'),
    role_name = 'admin'
WHERE email IN (
    'andresjgsalzate@gmail.com',
    'admin@todosistemas.co'
) OR full_name ILIKE '%admin%';

-- Actualizar usuarios regulares para usar el rol 'user'
UPDATE user_profiles 
SET 
    role_id = (SELECT id FROM roles WHERE name = 'user'),
    role_name = 'user'
WHERE role_name IS NULL OR role_name NOT IN ('admin', 'supervisor', 'analyst');

-- ================================================================
-- PASO 6: VERIFICAR ACTUALIZACIÓN
-- ================================================================
SELECT 'USUARIOS DESPUÉS DE ACTUALIZACIÓN:' as info;
SELECT 
    up.email,
    up.full_name,
    up.role_name,
    up.role_id,
    r.name as role_from_table,
    up.is_active
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY up.email;

-- ================================================================
-- PASO 7: INSERTAR PERMISOS BÁSICOS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, is_active) VALUES 
-- Usuarios
('users.read', 'Ver usuarios', 'users', 'read', true),
('users.create', 'Crear usuarios', 'users', 'create', true),
('users.update', 'Actualizar usuarios', 'users', 'update', true),
('users.delete', 'Eliminar usuarios', 'users', 'delete', true),
('users.admin', 'Administrar usuarios', 'users', 'admin', true),

-- Roles
('roles.read', 'Ver roles', 'roles', 'read', true),
('roles.create', 'Crear roles', 'roles', 'create', true),
('roles.update', 'Actualizar roles', 'roles', 'update', true),
('roles.delete', 'Eliminar roles', 'roles', 'delete', true),
('roles.admin', 'Administrar roles', 'roles', 'admin', true),

-- Permisos
('permissions.read', 'Ver permisos', 'permissions', 'read', true),
('permissions.create', 'Crear permisos', 'permissions', 'create', true),
('permissions.update', 'Actualizar permisos', 'permissions', 'update', true),
('permissions.delete', 'Eliminar permisos', 'permissions', 'delete', true),
('permissions.admin', 'Administrar permisos', 'permissions', 'admin', true),

-- Casos
('cases.read', 'Ver casos', 'cases', 'read', true),
('cases.create', 'Crear casos', 'cases', 'create', true),
('cases.update', 'Actualizar casos', 'cases', 'update', true),
('cases.delete', 'Eliminar casos', 'cases', 'delete', true),
('cases.admin', 'Administrar casos', 'cases', 'admin', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
is_active = EXCLUDED.is_active;

-- ================================================================
-- PASO 8: ASIGNAR TODOS LOS PERMISOS AL ROL ADMIN
-- ================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    p.id
FROM permissions p
WHERE p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- PASO 9: VERIFICAR PERMISOS ASIGNADOS
-- ================================================================
SELECT 'PERMISOS DEL ROL ADMIN:' as info;
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.resource, p.action;

-- ================================================================
-- FINAL: MOSTRAR RESUMEN
-- ================================================================
SELECT 'RESUMEN FINAL:' as info;
SELECT 
    'Roles totales' as tipo,
    COUNT(*) as cantidad
FROM roles
WHERE is_active = true

UNION ALL

SELECT 
    'Permisos totales' as tipo,
    COUNT(*) as cantidad
FROM permissions
WHERE is_active = true

UNION ALL

SELECT 
    'Usuarios activos' as tipo,
    COUNT(*) as cantidad
FROM user_profiles
WHERE is_active = true

UNION ALL

SELECT 
    'Usuarios admin' as tipo,
    COUNT(*) as cantidad
FROM user_profiles
WHERE role_name = 'admin' AND is_active = true;
