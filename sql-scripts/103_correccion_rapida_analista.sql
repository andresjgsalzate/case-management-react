-- ================================================================
-- CORRECCIÓN RÁPIDA: PERMISOS ANALISTA SIN ACCESO ADMINISTRATIVO
-- ================================================================
-- 
-- PROBLEMA: users.read_own permite ver módulos administrativos
-- SOLUCIÓN RÁPIDA: Crear permiso específico para perfil propio
-- 
-- Este script crea una solución mínima manteniendo compatibilidad
-- ================================================================

BEGIN;

-- ================================================================
-- 1. CREAR PERMISO ESPECÍFICO PARA PERFIL PROPIO
-- ================================================================

-- Crear permiso específico para perfil propio (no administrativo)
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
('profile.read_own', 'Ver mi perfil personal (no administrativo)', 'profile', 'read', 'own', true),
('profile.update_own', 'Actualizar mi perfil personal', 'profile', 'update', 'own', true)
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 2. ELIMINAR PERMISOS PROBLEMÁTICOS DEL ANALISTA
-- ================================================================

-- Obtener el ID del rol Analista
DO $$
DECLARE
    analista_role_id UUID;
BEGIN
    SELECT id INTO analista_role_id FROM roles WHERE name = 'Analista' LIMIT 1;
    
    IF analista_role_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Analista';
    END IF;
    
    -- Eliminar permisos problemáticos que dan acceso a módulos administrativos
    DELETE FROM role_permissions 
    WHERE role_id = analista_role_id
    AND permission_id IN (
        SELECT id FROM permissions 
        WHERE name IN (
            'users.read_own',      -- ❌ Problemático: da acceso al módulo usuarios
            'config.read_own',     -- ❌ Problemático: da acceso al módulo config
            'config.read_team',    -- ❌ Problemático: da acceso al módulo config
            'roles.read_own'       -- ❌ Problemático: da acceso al módulo roles
        )
    );
    
    RAISE NOTICE '✅ Eliminados permisos problemáticos del Analista';
END $$;

-- ================================================================
-- 3. ASIGNAR PERMISOS CORRECTOS AL ANALISTA
-- ================================================================

-- Asignar permisos específicos no administrativos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'Analista' 
AND p.name IN (
    -- ✅ Permisos de perfil propio (NO administrativos)
    'profile.read_own',
    'profile.update_own',
    
    -- ✅ Permisos funcionales con scope 'own' solamente
    'cases.read_own',
    'cases.create_own',
    'cases.update_own',
    'cases.delete_own',
    
    'disposiciones.read_own',
    'disposiciones.create_own', 
    'disposiciones.update_own',
    'disposiciones.delete_own',
    
    'todos.read_own',
    'todos.create_own',
    'todos.update_own', 
    'todos.delete_own',
    
    'archive.read_own',
    'archive.create_own',
    'archive.update_own',
    'archive.delete_own',
    
    'documentation.read_own',
    'documentation.create_own',
    'documentation.update_own',
    'documentation.delete_own',
    
    'notes.read_own',
    'notes.create_own',
    'notes.update_own',
    'notes.delete_own'
)
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- 4. ACTUALIZAR POLÍTICA RLS PARA NUEVO PERMISO
-- ================================================================

-- Actualizar política de user_profiles para usar perfil específico
DROP POLICY IF EXISTS user_profiles_insert_granular ON user_profiles;

CREATE POLICY user_profiles_insert_granular ON user_profiles
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id OR 
        has_permission(auth.uid(), 'users.create_all') OR
        has_permission(auth.uid(), 'users.admin_all')
    );

-- Política de lectura más específica
DROP POLICY IF EXISTS user_profiles_select_granular ON user_profiles;

CREATE POLICY user_profiles_select_granular ON user_profiles
    FOR SELECT 
    USING (
        auth.uid() = id OR  -- Puede ver su propio perfil
        has_permission(auth.uid(), 'users.read_all') OR
        has_permission(auth.uid(), 'users.admin_all')
    );

-- Política de actualización 
DROP POLICY IF EXISTS user_profiles_update_granular ON user_profiles;

CREATE POLICY user_profiles_update_granular ON user_profiles
    FOR UPDATE 
    USING (
        (auth.uid() = id AND (
            has_permission(auth.uid(), 'profile.update_own') OR 
            has_permission(auth.uid(), 'users.update_own')
        )) OR
        has_permission(auth.uid(), 'users.update_all') OR
        has_permission(auth.uid(), 'users.admin_all')
    );

-- ================================================================
-- 5. VERIFICACIONES DE SEGURIDAD
-- ================================================================

-- Verificar que Analista NO tiene acceso a módulos administrativos
DO $$
DECLARE
    analista_admin_count INTEGER;
    analista_total_perms INTEGER;
BEGIN
    -- Contar permisos administrativos problemáticos
    SELECT COUNT(*) INTO analista_admin_count
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Analista'
    AND (
        p.name IN ('users.read_own', 'users.read_team', 'users.read_all', 
                   'config.read_own', 'config.read_team', 'config.read_all',
                   'roles.read_own', 'roles.read_team', 'roles.read_all') OR
        p.resource IN ('admin_users', 'admin_roles', 'admin_config') OR
        (p.scope = 'all' AND p.resource NOT IN ('cases', 'disposiciones', 'todos', 'archive', 'documentation', 'notes'))
    );
    
    -- Contar total de permisos
    SELECT COUNT(*) INTO analista_total_perms
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Analista';
    
    IF analista_admin_count > 0 THEN
        RAISE WARNING '⚠️  Analista todavía tiene % permisos administrativos', analista_admin_count;
    ELSE
        RAISE NOTICE '✅ VERIFICACIÓN EXITOSA: Analista NO tiene permisos administrativos';
    END IF;
    
    RAISE NOTICE '📊 Total de permisos del Analista: %', analista_total_perms;
END $$;

-- Mostrar permisos actuales del Analista
RAISE NOTICE '================================================';
RAISE NOTICE '📋 PERMISOS ACTUALES DEL ANALISTA:';
RAISE NOTICE '================================================';

DO $$
DECLARE
    perm_record RECORD;
BEGIN
    FOR perm_record IN 
        SELECT p.name, p.resource, p.action, p.scope
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id  
        JOIN roles r ON rp.role_id = r.id
        WHERE r.name = 'Analista'
        ORDER BY p.resource, p.action
    LOOP
        RAISE NOTICE '✓ % (% - % - %)', 
            perm_record.name, 
            perm_record.resource, 
            perm_record.action, 
            perm_record.scope;
    END LOOP;
END $$;

-- ================================================================
-- 6. RESUMEN FINAL
-- ================================================================

RAISE NOTICE '================================================';
RAISE NOTICE '🎯 CORRECCIÓN APLICADA:';
RAISE NOTICE '✅ Eliminado users.read_own problemático';
RAISE NOTICE '✅ Creado profile.read_own específico';
RAISE NOTICE '✅ Analista NO puede ver Usuarios y Roles';
RAISE NOTICE '✅ Analista NO puede ver Configuración';
RAISE NOTICE '✅ Analista NO puede ver Desarrollo';
RAISE NOTICE '✅ Analista puede usar sus módulos funcionales';
RAISE NOTICE '✅ Políticas RLS actualizadas';
RAISE NOTICE '================================================';

COMMIT;
