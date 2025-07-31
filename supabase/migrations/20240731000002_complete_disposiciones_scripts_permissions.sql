-- Completar permisos para el módulo de disposiciones de scripts
-- Fecha: 2024-07-31 - Parte 2

-- Agregar permisos faltantes para disposiciones_scripts
INSERT INTO permissions (id, name, description, resource, action, is_active, created_at, updated_at) VALUES
-- Permisos específicos para diferenciación propia vs todas
('550e8400-e29b-41d4-a716-446655440011', 'disposiciones_scripts.read_all', 'Ver todas las disposiciones de scripts del sistema', 'disposiciones_scripts', 'read_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'disposiciones_scripts.update_all', 'Editar todas las disposiciones de scripts', 'disposiciones_scripts', 'update_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'disposiciones_scripts.delete_all', 'Eliminar todas las disposiciones de scripts', 'disposiciones_scripts', 'delete_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'disposiciones_scripts.view_all', 'Acceso completo a todas las disposiciones', 'disposiciones_scripts', 'view_all', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'disposiciones_scripts.manage', 'Gestión completa de disposiciones de scripts', 'disposiciones_scripts', 'manage', true, NOW(), NOW());

-- Asignar permisos completos al rol ADMIN
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Buscar el rol admin (puede tener diferentes nombres)
    SELECT id INTO admin_role_id FROM roles 
    WHERE UPPER(name) IN ('ADMIN', 'ADMINISTRATOR', 'ADMINISTRADOR') 
    ORDER BY name 
    LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Asignar TODOS los permisos de disposiciones_scripts al admin
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
        
        RAISE NOTICE 'Permisos completos de disposiciones_scripts asignados al rol ADMIN (ID: %)', admin_role_id;
    ELSE
        RAISE NOTICE 'No se encontró el rol ADMIN para asignar permisos';
    END IF;
END $$;

-- Asignar permisos básicos (solo propios) a roles USER/USUARIO
DO $$
DECLARE
    user_role_id UUID;
BEGIN
    -- Buscar el rol user
    SELECT id INTO user_role_id FROM roles 
    WHERE UPPER(name) IN ('USER', 'USUARIO', 'USERS', 'USUARIOS') 
    ORDER BY name 
    LIMIT 1;
    
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
        AND p.action IN ('create', 'read', 'update', 'delete', 'export')
        AND p.action NOT IN ('read_all', 'update_all', 'delete_all', 'view_all', 'manage')
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.role_id = user_role_id AND rp.permission_id = p.id
        );
        
        RAISE NOTICE 'Permisos básicos de disposiciones_scripts asignados al rol USER (ID: %)', user_role_id;
    ELSE
        RAISE NOTICE 'No se encontró el rol USER para asignar permisos';
    END IF;
END $$;

-- Mostrar resumen de permisos creados
DO $$
BEGIN
    RAISE NOTICE 'Resumen de permisos de disposiciones_scripts:';
    RAISE NOTICE '- Total permisos: %', (SELECT COUNT(*) FROM permissions WHERE resource = 'disposiciones_scripts');
    RAISE NOTICE '- Permisos básicos (propios): create, read, update, delete, export';
    RAISE NOTICE '- Permisos administrativos: read_all, update_all, delete_all, view_all, manage';
END $$;
