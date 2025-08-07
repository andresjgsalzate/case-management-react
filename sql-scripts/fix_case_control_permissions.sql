-- Script para verificar y crear permisos de control de casos faltantes
-- ================================================================

-- Primero verificar qué permisos existen actualmente
SELECT 'Permisos existentes de control de casos:' as info;
SELECT name, resource, action, scope, description 
FROM permissions 
WHERE name LIKE 'cases.control%' 
ORDER BY name;

-- Insertar permisos de control de casos si no existen
INSERT INTO permissions (name, description, resource, action, scope, is_active)
VALUES 
  ('cases.control_own', 'Puede controlar sus propios casos', 'cases', 'control', 'own', true),
  ('cases.control_team', 'Puede controlar casos de su equipo', 'cases', 'control', 'team', true),
  ('cases.control_all', 'Puede controlar todos los casos', 'cases', 'control', 'all', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  scope = EXCLUDED.scope,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verificar que se crearon correctamente
SELECT 'Permisos de control de casos después de la inserción:' as info;
SELECT name, resource, action, scope, description 
FROM permissions 
WHERE name LIKE 'cases.control%' 
ORDER BY name;

-- Verificar qué roles existen
SELECT 'Roles existentes:' as info;
SELECT id, name, description, is_active FROM roles ORDER BY name;

-- Asignar permisos básicos al rol 'admin' si existe
DO $$
DECLARE
    admin_role_id UUID;
    perm_record RECORD;
BEGIN
    -- Obtener el ID del rol admin
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Asignar todos los permisos de control de casos al admin
        FOR perm_record IN 
            SELECT id FROM permissions WHERE name LIKE 'cases.control%'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_record.id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Permisos de control de casos asignados al rol admin';
    ELSE
        RAISE NOTICE 'No se encontró el rol admin';
    END IF;
END $$;

-- Asignar permisos básicos al rol 'user' si existe (solo control_own)
DO $$
DECLARE
    user_role_id UUID;
    perm_own_id UUID;
BEGIN
    -- Obtener el ID del rol user
    SELECT id INTO user_role_id FROM roles WHERE name = 'user' LIMIT 1;
    
    -- Obtener el ID del permiso cases.control_own
    SELECT id INTO perm_own_id FROM permissions WHERE name = 'cases.control_own' LIMIT 1;
    
    IF user_role_id IS NOT NULL AND perm_own_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (user_role_id, perm_own_id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permiso cases.control_own asignado al rol user';
    ELSE
        RAISE NOTICE 'No se encontró el rol user o el permiso cases.control_own';
    END IF;
END $$;

-- Verificar las asignaciones finales
SELECT 'Asignaciones de permisos de control de casos:' as info;
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.scope as permission_scope
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.name LIKE 'cases.control%'
ORDER BY r.name, p.name;

SELECT 'Script completado exitosamente' as status;
