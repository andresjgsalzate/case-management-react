-- Migración para agregar permisos faltantes de disposiciones_scripts
-- Basado en los permisos existentes mostrados por el usuario

-- Insertar permisos administrativos que faltan para disposiciones_scripts
-- Solo insertar si no existen previamente
INSERT INTO permissions (name, resource, action, description) 
SELECT 'Disposiciones Scripts: Ver Todas', 'disposiciones_scripts', 'read_all', 'Ver todas las disposiciones/scripts del sistema'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'read_all');

INSERT INTO permissions (name, resource, action, description) 
SELECT 'Disposiciones Scripts: Actualizar Todas', 'disposiciones_scripts', 'update_all', 'Actualizar cualquier disposición/script del sistema'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'update_all');

INSERT INTO permissions (name, resource, action, description) 
SELECT 'Disposiciones Scripts: Eliminar Todas', 'disposiciones_scripts', 'delete_all', 'Eliminar cualquier disposición/script del sistema'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'delete_all');

INSERT INTO permissions (name, resource, action, description) 
SELECT 'Disposiciones Scripts: Visualizar Todas', 'disposiciones_scripts', 'view_all', 'Visualizar todas las disposiciones/scripts sin restricciones'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'view_all');

INSERT INTO permissions (name, resource, action, description) 
SELECT 'Disposiciones Scripts: Gestionar', 'disposiciones_scripts', 'manage', 'Gestión completa del módulo de disposiciones/scripts'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'manage');

-- Obtener IDs de los roles
DO $$
DECLARE
    admin_role_id UUID;
    user_role_id UUID;
    perm_read_all_id UUID;
    perm_update_all_id UUID;
    perm_delete_all_id UUID;
    perm_view_all_id UUID;
    perm_manage_id UUID;
BEGIN
    -- Obtener ID del rol ADMIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
    
    -- Obtener ID del rol USER
    SELECT id INTO user_role_id FROM roles WHERE name = 'USER';
    
    -- Obtener IDs de los nuevos permisos
    SELECT id INTO perm_read_all_id FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'read_all';
    SELECT id INTO perm_update_all_id FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'update_all';
    SELECT id INTO perm_delete_all_id FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'delete_all';
    SELECT id INTO perm_view_all_id FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'view_all';
    SELECT id INTO perm_manage_id FROM permissions WHERE resource = 'disposiciones_scripts' AND action = 'manage';
    
    -- Asignar TODOS los permisos administrativos al rol ADMIN
    IF admin_role_id IS NOT NULL THEN
        -- Insertar solo si no existen previamente
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT admin_role_id, perm_read_all_id
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_read_all_id);
        
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT admin_role_id, perm_update_all_id
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_update_all_id);
        
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT admin_role_id, perm_delete_all_id
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_delete_all_id);
        
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT admin_role_id, perm_view_all_id
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_view_all_id);
        
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT admin_role_id, perm_manage_id
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_manage_id);
    END IF;
    
    -- El rol USER mantiene solo los permisos básicos que ya tiene
    -- (create, read, update, delete, export)
    -- NO se le asignan los permisos administrativos (_all)
    
END $$;

-- Comentario explicativo
COMMENT ON TABLE permissions IS 'Sistema de permisos actualizado con permisos administrativos para disposiciones_scripts';
