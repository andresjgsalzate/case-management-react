-- ================================================================
-- REDISEÑO DEL SISTEMA DE PERMISOS PARA ANALISTA
-- ================================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- El permiso "users.read_own" está mal diseñado porque:
-- 1. Permite ver el módulo "Usuarios y Roles" (administrativo)
-- 2. Da acceso a funcionalidades administrativas
-- 3. Debería ser solo para leer el perfil propio
--
-- SOLUCIÓN:
-- 1. Separar permisos de perfil de permisos administrativos
-- 2. Crear permisos específicos para cada funcionalidad
-- 3. Reconfigurar permisos del Analista correctamente
-- ================================================================

BEGIN;

-- ================================================================
-- 1. CREAR NUEVOS PERMISOS ESPECÍFICOS PARA PERFIL PROPIO
-- ================================================================

-- Eliminar el problemático users.read_own y crear permisos más específicos
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions WHERE name = 'users.read_own'
) AND role_id = (SELECT id FROM roles WHERE name = 'Analista');

-- Crear permisos específicos para el perfil propio (NO administrativos)
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de perfil propio (NO dan acceso a módulos administrativos)
('profile.read_own', 'Ver mi perfil personal', 'profile', 'read', 'own', true),
('profile.update_own', 'Actualizar mi perfil personal', 'profile', 'update', 'own', true),
('profile.change_password', 'Cambiar mi contraseña', 'profile', 'change_password', 'own', true),

-- Permisos para autenticación básica
('auth.login', 'Iniciar sesión en el sistema', 'auth', 'login', 'own', true),
('auth.logout', 'Cerrar sesión', 'auth', 'logout', 'own', true),
('auth.refresh_token', 'Renovar token de sesión', 'auth', 'refresh_token', 'own', true),

-- Permisos para sesión y acceso básico
('session.maintain', 'Mantener sesión activa', 'session', 'maintain', 'own', true),
('dashboard.access', 'Acceder al dashboard personal', 'dashboard', 'access', 'own', true)

ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 2. SEPARAR PERMISOS ADMINISTRATIVOS ESPECÍFICOS
-- ================================================================

-- Crear permisos administrativos específicos (SOLO para roles superiores)
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Administración de usuarios (SOLO ADMIN)
('admin.users.view_module', 'Ver módulo de administración de usuarios', 'admin_users', 'view_module', 'all', true),
('admin.users.manage', 'Gestionar usuarios del sistema', 'admin_users', 'manage', 'all', true),

-- Administración de roles (SOLO ADMIN)
('admin.roles.view_module', 'Ver módulo de administración de roles', 'admin_roles', 'view_module', 'all', true),
('admin.roles.manage', 'Gestionar roles del sistema', 'admin_roles', 'manage', 'all', true),

-- Configuración del sistema (SOLO ADMIN)
('admin.config.view_module', 'Ver módulo de configuración', 'admin_config', 'view_module', 'all', true),
('admin.config.manage', 'Gestionar configuración del sistema', 'admin_config', 'manage', 'all', true),

-- Desarrollo y testing (SOLO ADMIN/DEV)
('admin.development.access', 'Acceder a herramientas de desarrollo', 'admin_development', 'access', 'all', true),
('admin.development.test', 'Ejecutar pruebas y testing', 'admin_development', 'test', 'all', true)

ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 3. RECONFIGURAR PERMISOS DEL ANALISTA
-- ================================================================

-- Limpiar permisos problemáticos del Analista
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Analista')
AND permission_id IN (
    SELECT id FROM permissions 
    WHERE name IN (
        'users.read_own',
        'users.create_own', 
        'users.update_own',
        'roles.read_own',
        'config.read_own',
        'config.read_team',
        'config.read_all'
    )
);

-- Asignar permisos correctos al Analista
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'Analista' 
AND p.name IN (
    -- ================================================================
    -- PERMISOS BÁSICOS DE ACCESO Y PERFIL
    -- ================================================================
    'profile.read_own',
    'profile.update_own', 
    'profile.change_password',
    'auth.login',
    'auth.logout',
    'auth.refresh_token',
    'session.maintain',
    'dashboard.access',
    
    -- ================================================================
    -- PERMISOS DE CASOS (scope = own)
    -- ================================================================
    'cases.read_own',
    'cases.create_own',
    'cases.update_own',
    'cases.delete_own',
    
    -- ================================================================
    -- PERMISOS DE DISPOSICIONES (scope = own)
    -- ================================================================
    'disposiciones.read_own',
    'disposiciones.create_own',
    'disposiciones.update_own',
    'disposiciones.delete_own',
    
    -- ================================================================
    -- PERMISOS DE TODOS (scope = own)
    -- ================================================================
    'todos.read_own',
    'todos.create_own',
    'todos.update_own',
    'todos.delete_own',
    
    -- ================================================================
    -- PERMISOS DE ARCHIVO (scope = own)
    -- ================================================================
    'archive.read_own',
    'archive.create_own',
    'archive.update_own',
    'archive.delete_own',
    
    -- ================================================================
    -- PERMISOS DE DOCUMENTACIÓN (scope = own)
    -- ================================================================
    'documentation.read_own',
    'documentation.create_own',
    'documentation.update_own',
    'documentation.delete_own',
    
    -- ================================================================
    -- PERMISOS DE NOTAS (scope = own)
    -- ================================================================
    'notes.read_own',
    'notes.create_own',
    'notes.update_own',
    'notes.delete_own'
)
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- 4. CONFIGURAR PERMISOS ADMINISTRATIVOS SOLO PARA ADMIN
-- ================================================================

-- Asignar permisos administrativos SOLO al rol Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'Admin' 
AND p.name IN (
    'admin.users.view_module',
    'admin.users.manage',
    'admin.roles.view_module', 
    'admin.roles.manage',
    'admin.config.view_module',
    'admin.config.manage',
    'admin.development.access',
    'admin.development.test',
    
    -- Mantener permisos existentes de admin
    'users.read_all',
    'users.create_all',
    'users.update_all',
    'users.delete_all',
    'users.admin_all',
    'roles.read_all',
    'roles.create_all', 
    'roles.update_all',
    'roles.delete_all',
    'roles.admin_all',
    'config.read_all',
    'config.create_all',
    'config.update_all',
    'config.delete_all',
    'config.admin_all'
)
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- 5. ACTUALIZAR POLÍTICAS RLS PARA NUEVOS PERMISOS
-- ================================================================

-- Actualizar política de user_profiles para usar permisos específicos
DROP POLICY IF EXISTS user_profiles_insert_granular ON user_profiles;

CREATE POLICY user_profiles_insert_granular ON user_profiles
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id OR 
        has_permission(auth.uid(), 'admin.users.manage') OR
        has_permission(auth.uid(), 'profile.read_own')  -- Permitir crear perfil propio
    );

-- Política de lectura de perfiles
DROP POLICY IF EXISTS user_profiles_select_granular ON user_profiles;

CREATE POLICY user_profiles_select_granular ON user_profiles
    FOR SELECT 
    USING (
        auth.uid() = id OR  -- Puede ver su propio perfil
        has_permission(auth.uid(), 'admin.users.view_module') OR
        has_permission(auth.uid(), 'admin.users.manage')
    );

-- Política de actualización de perfiles  
DROP POLICY IF EXISTS user_profiles_update_granular ON user_profiles;

CREATE POLICY user_profiles_update_granular ON user_profiles
    FOR UPDATE 
    USING (
        (auth.uid() = id AND has_permission(auth.uid(), 'profile.update_own')) OR
        has_permission(auth.uid(), 'admin.users.manage')
    );

-- ================================================================
-- 6. VERIFICACIONES DE SEGURIDAD
-- ================================================================

-- Verificar que Analista NO tiene permisos administrativos
DO $$
DECLARE
    analista_admin_perms INTEGER;
BEGIN
    SELECT COUNT(*) INTO analista_admin_perms
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Analista'
    AND (
        p.name LIKE 'admin.%' OR
        p.resource IN ('admin_users', 'admin_roles', 'admin_config', 'admin_development') OR
        p.scope = 'all'
    );
    
    IF analista_admin_perms > 0 THEN
        RAISE EXCEPTION 'ERROR: Analista tiene % permisos administrativos. Debe ser 0.', analista_admin_perms;
    END IF;
    
    RAISE NOTICE '✅ VERIFICACIÓN EXITOSA: Analista NO tiene permisos administrativos';
END $$;

-- Verificar que Analista tiene permisos básicos necesarios
DO $$
DECLARE
    basic_perms INTEGER;
BEGIN
    SELECT COUNT(*) INTO basic_perms
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Analista'
    AND p.name IN ('profile.read_own', 'auth.login', 'session.maintain');
    
    IF basic_perms < 3 THEN
        RAISE EXCEPTION 'ERROR: Analista no tiene permisos básicos suficientes. Tiene % de 3.', basic_perms;
    END IF;
    
    RAISE NOTICE '✅ VERIFICACIÓN EXITOSA: Analista tiene permisos básicos necesarios';
END $$;

-- ================================================================
-- 7. RESUMEN DE CAMBIOS
-- ================================================================

-- Mostrar resumen de permisos del Analista
RAISE NOTICE '📊 RESUMEN DE PERMISOS DEL ANALISTA:';
RAISE NOTICE '================================================';

DO $$
DECLARE
    perm_record RECORD;
BEGIN
    FOR perm_record IN 
        SELECT p.name, p.description, p.resource, p.action, p.scope
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id  
        JOIN roles r ON rp.role_id = r.id
        WHERE r.name = 'Analista'
        ORDER BY p.resource, p.action
    LOOP
        RAISE NOTICE '✓ % (% - % - %)', perm_record.name, perm_record.resource, perm_record.action, perm_record.scope;
    END LOOP;
END $$;

RAISE NOTICE '================================================';
RAISE NOTICE '🎯 SOLUCIÓN APLICADA:';
RAISE NOTICE '✅ Eliminados permisos problemáticos de users.read_own';
RAISE NOTICE '✅ Creados permisos específicos para perfil propio';
RAISE NOTICE '✅ Separados permisos administrativos';
RAISE NOTICE '✅ Reconfigurado acceso del Analista correctamente';
RAISE NOTICE '✅ Analista NO puede ver módulos administrativos';
RAISE NOTICE '✅ Políticas RLS actualizadas';

COMMIT;
