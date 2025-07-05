-- Seed data para sistema de roles y permisos
-- Fecha: 2025-07-05

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador del sistema con acceso completo'),
('user', 'Usuario regular con acceso limitado a sus propios casos')
ON CONFLICT (name) DO NOTHING;

-- Insertar permisos básicos
INSERT INTO permissions (name, description, resource, action) VALUES
-- Permisos para casos
('cases.create', 'Crear nuevos casos', 'cases', 'create'),
('cases.read.own', 'Ver propios casos', 'cases', 'read'),
('cases.read.all', 'Ver todos los casos', 'cases', 'read'),
('cases.update.own', 'Actualizar propios casos', 'cases', 'update'),
('cases.update.all', 'Actualizar todos los casos', 'cases', 'update'),
('cases.delete.own', 'Eliminar propios casos', 'cases', 'delete'),
('cases.delete.all', 'Eliminar todos los casos', 'cases', 'delete'),

-- Permisos para usuarios
('users.create', 'Crear nuevos usuarios', 'users', 'create'),
('users.read', 'Ver usuarios', 'users', 'read'),
('users.update', 'Actualizar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),
('users.manage', 'Gestión completa de usuarios', 'users', 'manage'),

-- Permisos para orígenes
('origenes.create', 'Crear nuevos orígenes', 'origenes', 'create'),
('origenes.read', 'Ver orígenes', 'origenes', 'read'),
('origenes.update', 'Actualizar orígenes', 'origenes', 'update'),
('origenes.delete', 'Eliminar orígenes', 'origenes', 'delete'),
('origenes.manage', 'Gestión completa de orígenes', 'origenes', 'manage'),

-- Permisos para aplicaciones
('aplicaciones.create', 'Crear nuevas aplicaciones', 'aplicaciones', 'create'),
('aplicaciones.read', 'Ver aplicaciones', 'aplicaciones', 'read'),
('aplicaciones.update', 'Actualizar aplicaciones', 'aplicaciones', 'update'),
('aplicaciones.delete', 'Eliminar aplicaciones', 'aplicaciones', 'delete'),
('aplicaciones.manage', 'Gestión completa de aplicaciones', 'aplicaciones', 'manage'),

-- Permisos para roles
('roles.create', 'Crear nuevos roles', 'roles', 'create'),
('roles.read', 'Ver roles', 'roles', 'read'),
('roles.update', 'Actualizar roles', 'roles', 'update'),
('roles.delete', 'Eliminar roles', 'roles', 'delete'),
('roles.manage', 'Gestión completa de roles', 'roles', 'manage'),

-- Permisos para permisos
('permissions.create', 'Crear nuevos permisos', 'permissions', 'create'),
('permissions.read', 'Ver permisos', 'permissions', 'read'),
('permissions.update', 'Actualizar permisos', 'permissions', 'update'),
('permissions.delete', 'Eliminar permisos', 'permissions', 'delete'),
('permissions.manage', 'Gestión completa de permisos', 'permissions', 'manage'),

-- Permisos administrativos
('admin.access', 'Acceso al panel de administración', 'admin', 'access'),
('admin.dashboard', 'Ver dashboard administrativo', 'admin', 'read'),
('admin.tests', 'Acceso a herramientas de testing', 'admin', 'access')

ON CONFLICT (name) DO NOTHING;

-- Asignar permisos al rol de admin (todos los permisos)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Asignar permisos básicos al rol de user
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'user'),
    p.id
FROM permissions p
WHERE p.name IN (
    'cases.create',
    'cases.read.own',
    'cases.update.own',
    'cases.delete.own',
    'origenes.read',
    'aplicaciones.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Crear función para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid() 
        AND p.name = permission_name
        AND up.is_active = true
        AND r.is_active = true
        AND p.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() 
        AND r.name = 'admin'
        AND up.is_active = true
        AND r.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para obtener rol del usuario
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT r.name INTO user_role
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND up.is_active = true;
    
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
