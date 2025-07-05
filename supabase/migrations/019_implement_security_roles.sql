-- Migración 019: Implementar nuevos roles de seguridad
-- Supervisor, Analista y redefinir Usuario como rol sin acceso

-- PASO 1: Crear los nuevos roles
INSERT INTO roles (name, description, is_active) VALUES
('supervisor', 'Supervisor con acceso de solo lectura a todo el sistema', true),
('analista', 'Analista con acceso limitado a sus propios casos sin permisos de eliminación', true)
ON CONFLICT (name) DO NOTHING;

-- PASO 2: Actualizar la descripción del rol user para reflejar su nuevo propósito
UPDATE roles 
SET description = 'Usuario sin acceso - requiere activación por administrador'
WHERE name = 'user';

-- PASO 3: Limpiar permisos del rol 'user' (ahora será un rol sin acceso)
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'user');

-- PASO 4: Asignar permisos al rol SUPERVISOR
-- El supervisor puede ver todo pero NO puede eliminar nada
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'supervisor' 
AND p.name IN (
    -- Casos: puede ver y actualizar todos, crear nuevos, pero NO eliminar
    'cases.create',
    'cases.read.all',
    'cases.update.all',
    
    -- Usuarios: puede ver pero NO crear/actualizar/eliminar
    'users.read',
    
    -- Orígenes: puede ver y actualizar pero NO eliminar
    'origenes.read',
    'origenes.update',
    'origenes.create',
    
    -- Aplicaciones: puede ver y actualizar pero NO eliminar
    'aplicaciones.read',
    'aplicaciones.update',
    'aplicaciones.create',
    
    -- Roles: puede ver pero NO modificar
    'roles.read',
    
    -- Permisos: puede ver pero NO modificar
    'permissions.read',
    
    -- Control de casos: acceso completo excepto eliminación de tiempo
    'case_control.view',
    'case_control.view_all',
    'case_control.manage_status',
    'case_control.update_status',
    'case_control.start_timer',
    'case_control.add_manual_time',
    'case_control.edit_time',
    'case_control.assign_cases',
    'case_control.reassign_cases',
    'case_control.view_reports',
    'case_control.export_reports',
    'case_control.view_team_reports',
    'case_control.view_dashboard',
    'case_control.view_team_stats'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PASO 5: Asignar permisos al rol ANALISTA
-- El analista puede trabajar solo en sus casos pero NO puede eliminar nada
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'analista' 
AND p.name IN (
    -- Casos: puede crear, ver y actualizar solo los suyos, pero NO eliminar
    'cases.create',
    'cases.read.own',
    'cases.update.own',
    
    -- Orígenes y aplicaciones: solo lectura
    'origenes.read',
    'aplicaciones.read',
    
    -- Control de casos: acceso limitado a sus propios casos, sin eliminación
    'case_control.view',
    'case_control.view_own',
    'case_control.update_status',
    'case_control.start_timer',
    'case_control.add_manual_time',
    'case_control.edit_time',
    'case_control.view_reports',
    'case_control.export_reports',
    'case_control.view_dashboard'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PASO 6: Crear permiso especial para verificar acceso al sistema
INSERT INTO permissions (name, description, resource, action) VALUES
('system.access', 'Acceso básico al sistema', 'system', 'access')
ON CONFLICT (name) DO NOTHING;

-- PASO 7: Asignar permiso de acceso al sistema a roles activos (todos excepto 'user')
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('admin', 'supervisor', 'analista')
AND p.name = 'system.access'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PASO 8: Función para verificar acceso al sistema
CREATE OR REPLACE FUNCTION has_system_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid() 
        AND p.name = 'system.access'
        AND up.is_active = true
        AND r.is_active = true
        AND p.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 9: Política RLS para verificar acceso básico al sistema en todas las tablas principales
-- Esta política se aplicará como primera verificación en todas las tablas sensibles

-- Casos: verificar acceso al sistema primero
DROP POLICY IF EXISTS "System access required for cases" ON cases;
CREATE POLICY "System access required for cases" ON cases
    FOR ALL USING (has_system_access());

-- User profiles: verificar acceso al sistema
DROP POLICY IF EXISTS "System access required for user_profiles" ON user_profiles;
CREATE POLICY "System access required for user_profiles" ON user_profiles
    FOR SELECT USING (has_system_access() OR id = auth.uid());

-- Case control: verificar acceso al sistema
DROP POLICY IF EXISTS "System access required for case_control" ON case_control;
CREATE POLICY "System access required for case_control" ON case_control
    FOR ALL USING (has_system_access());

-- PASO 10: Actualizar políticas existentes para incluir el nuevo rol supervisor
-- Los supervisores deben poder ver todos los casos
DROP POLICY IF EXISTS "Supervisor cases access" ON cases;
CREATE POLICY "Supervisor cases access" ON cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r 
            JOIN user_profiles up ON up.role_id = r.id 
            WHERE up.id = auth.uid() AND r.name = 'supervisor'
        )
    );

-- PASO 11: Logging y verificación
DO $$
DECLARE
    admin_count INTEGER;
    supervisor_count INTEGER;
    analista_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM role_permissions rp 
    JOIN roles r ON rp.role_id = r.id WHERE r.name = 'admin';
    
    SELECT COUNT(*) INTO supervisor_count FROM role_permissions rp 
    JOIN roles r ON rp.role_id = r.id WHERE r.name = 'supervisor';
    
    SELECT COUNT(*) INTO analista_count FROM role_permissions rp 
    JOIN roles r ON rp.role_id = r.id WHERE r.name = 'analista';
    
    SELECT COUNT(*) INTO user_count FROM role_permissions rp 
    JOIN roles r ON rp.role_id = r.id WHERE r.name = 'user';
    
    RAISE NOTICE 'Migración 019 completada:';
    RAISE NOTICE 'Admin permisos: %', admin_count;
    RAISE NOTICE 'Supervisor permisos: %', supervisor_count;
    RAISE NOTICE 'Analista permisos: %', analista_count;
    RAISE NOTICE 'User permisos: % (debe ser 0)', user_count;
END $$;
