-- Crear permisos para el módulo de disposiciones de scripts
-- Fecha: 2024-07-31

INSERT INTO permissions (id, name, description, resource, action, is_active, created_at, updated_at) VALUES
-- Permisos básicos de CRUD
('550e8400-e29b-41d4-a716-446655440001', 'disposiciones_scripts.create', 'Crear nuevas disposiciones de scripts', 'disposiciones_scripts', 'create', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'disposiciones_scripts.read', 'Ver disposiciones de scripts propias', 'disposiciones_scripts', 'read', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'disposiciones_scripts.read_all', 'Ver todas las disposiciones de scripts', 'disposiciones_scripts', 'read_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'disposiciones_scripts.update', 'Editar disposiciones de scripts propias', 'disposiciones_scripts', 'update', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'disposiciones_scripts.update_all', 'Editar todas las disposiciones de scripts', 'disposiciones_scripts', 'update_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'disposiciones_scripts.delete', 'Eliminar disposiciones de scripts propias', 'disposiciones_scripts', 'delete', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'disposiciones_scripts.delete_all', 'Eliminar todas las disposiciones de scripts', 'disposiciones_scripts', 'delete_all', true, NOW(), NOW()),

-- Permisos adicionales específicos del módulo
('550e8400-e29b-41d4-a716-446655440008', 'disposiciones_scripts.export', 'Exportar disposiciones de scripts', 'disposiciones_scripts', 'export', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'disposiciones_scripts.view_all', 'Ver todas las disposiciones de scripts (acceso completo)', 'disposiciones_scripts', 'view_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-44665544000a', 'disposiciones_scripts.manage', 'Gestión completa de disposiciones de scripts', 'disposiciones_scripts', 'manage', true, NOW(), NOW()),

-- Permisos específicos por tiempo
('550e8400-e29b-41d4-a716-44665544000b', 'disposiciones_scripts.view_monthly', 'Ver reportes mensuales de disposiciones', 'disposiciones_scripts', 'view_monthly', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-44665544000c', 'disposiciones_scripts.view_yearly', 'Ver reportes anuales de disposiciones', 'disposiciones_scripts', 'view_yearly', true, NOW(), NOW());

-- Asignar permisos básicos al rol ADMIN (suponiendo que existe)
-- Verificar primero si existe el rol admin
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Buscar el rol admin
    SELECT id INTO admin_role_id FROM roles WHERE UPPER(name) = 'ADMIN' OR UPPER(name) = 'ADMINISTRATOR' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Asignar todos los permisos de disposiciones_scripts al admin
        INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            admin_role_id,
            p.id,
            NOW(),
            NOW()
        FROM permissions p 
        WHERE p.resource = 'disposiciones_scripts'
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.role_id = admin_role_id AND rp.permission_id = p.id
        );
        
        RAISE NOTICE 'Permisos de disposiciones_scripts asignados al rol ADMIN';
    ELSE
        RAISE NOTICE 'No se encontró el rol ADMIN para asignar permisos';
    END IF;
END $$;

-- Asignar permisos básicos a un rol USER si existe
DO $$
DECLARE
    user_role_id UUID;
BEGIN
    -- Buscar el rol user
    SELECT id INTO user_role_id FROM roles WHERE UPPER(name) = 'USER' OR UPPER(name) = 'USUARIO' LIMIT 1;
    
    IF user_role_id IS NOT NULL THEN
        -- Asignar permisos básicos al rol user (solo sus propias disposiciones)
        INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            user_role_id,
            p.id,
            NOW(),
            NOW()
        FROM permissions p 
        WHERE p.resource = 'disposiciones_scripts'
        AND p.action IN ('create', 'read', 'update', 'delete', 'view_monthly', 'view_yearly')
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.role_id = user_role_id AND rp.permission_id = p.id
        );
        
        RAISE NOTICE 'Permisos básicos de disposiciones_scripts asignados al rol USER';
    ELSE
        RAISE NOTICE 'No se encontró el rol USER para asignar permisos';
    END IF;
END $$;
