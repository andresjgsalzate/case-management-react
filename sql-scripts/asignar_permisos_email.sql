-- ========================================
-- ASIGNAR PERMISOS DE EMAIL AL ROL ADMIN
-- ========================================

-- Ver los roles existentes
SELECT id, name, description FROM roles WHERE is_active = true;

-- Ver los permisos de email que creamos
SELECT id, name, description FROM permissions 
WHERE resource IN ('system_configurations', 'email_templates', 'email_logs', 'email_sending');

-- Asignar todos los permisos de email al rol admin
-- (Asumiendo que el rol admin existe)
DO $$
DECLARE
    admin_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Buscar el rol admin
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' OR name = 'administrator' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE NOTICE 'No se encontró rol admin. Creando...';
        INSERT INTO roles (name, description) VALUES ('admin', 'Administrador del sistema') 
        RETURNING id INTO admin_role_id;
    END IF;
    
    RAISE NOTICE 'Rol admin ID: %', admin_role_id;
    
    -- Asignar todos los permisos de email
    FOR permission_record IN 
        SELECT id, name FROM permissions 
        WHERE resource IN ('system_configurations', 'email_templates', 'email_logs', 'email_sending')
    LOOP
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (admin_role_id, permission_record.id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Permiso asignado: %', permission_record.name;
    END LOOP;
END $$;

-- Verificar permisos asignados
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description as permission_description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource IN ('system_configurations', 'email_templates', 'email_logs', 'email_sending')
ORDER BY r.name, p.name;
