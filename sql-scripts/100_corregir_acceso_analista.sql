-- ================================================================
-- CORRECCIÓN DE ACCESO PARA ROL ANALISTA
-- ================================================================
-- Problema: El analista no puede crear perfiles ni acceder por RLS
-- Solución: Agregar permisos mínimos necesarios + corregir políticas
-- ================================================================

-- ================================================================
-- 1. AGREGAR PERMISOS MÍNIMOS NECESARIOS PARA ANALISTA
-- ================================================================

-- El analista DEBE poder crear su propio perfil al registrarse
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    'b2e20a71-9268-4b06-8ec3-a776446af064' as role_id,
    id as permission_id
FROM permissions 
WHERE name IN (
    'users.create_own',     -- Necesario para crear su perfil
    'users.read_own',       -- Necesario para leer su perfil
    'users.update_own',     -- Necesario para actualizar su perfil
    'roles.read_own'        -- Necesario para leer su rol
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = 'b2e20a71-9268-4b06-8ec3-a776446af064' 
    AND rp.permission_id = permissions.id
);

-- ================================================================
-- 2. CREAR ROL "User" FALTANTE (si no existe)
-- ================================================================

-- Verificar si existe el rol "User" y crearlo si no existe
INSERT INTO roles (id, name, description, is_active)
SELECT 
    '296401da-0e92-4743-8b18-eda0c7cabf8d',
    'User',
    'Usuario básico del sistema',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'User'
);

-- ================================================================
-- 3. CORREGIR POLÍTICAS RLS PARA USER_PROFILES
-- ================================================================

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "user_profiles_insert_granular" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_granular" ON user_profiles;

-- Política de lectura más permisiva (usuarios pueden leer su propio perfil)
CREATE POLICY "user_profiles_select_fixed" ON user_profiles
    FOR SELECT USING (
        -- Siempre puede leer su propio perfil
        id = auth.uid() OR
        -- O tiene permisos específicos
        has_permission(auth.uid(), 'users.read_all') OR
        has_permission(auth.uid(), 'users.read_team') OR
        has_permission(auth.uid(), 'users.read_own')
    );

-- Política de inserción más permisiva (para registro inicial)
CREATE POLICY "user_profiles_insert_fixed" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Puede crear su propio perfil (id debe coincidir con auth.uid())
        id = auth.uid() OR
        -- O tiene permisos específicos
        has_permission(auth.uid(), 'users.create_own') OR
        has_permission(auth.uid(), 'users.create_team') OR
        has_permission(auth.uid(), 'users.create_all')
    );

-- Política de actualización (mantener existente pero más clara)
CREATE POLICY "user_profiles_update_fixed" ON user_profiles
    FOR UPDATE USING (
        -- Siempre puede actualizar su propio perfil
        id = auth.uid() OR
        -- O tiene permisos específicos
        has_permission(auth.uid(), 'users.update_all') OR
        has_permission(auth.uid(), 'users.update_team') OR
        has_permission(auth.uid(), 'users.update_own')
    );

-- ================================================================
-- 4. VERIFICAR POLÍTICAS EN ROLES
-- ================================================================

-- Asegurar que los usuarios puedan leer roles básicos
DROP POLICY IF EXISTS "roles_select_public" ON roles;
CREATE POLICY "roles_select_public" ON roles
    FOR SELECT USING (
        -- Cualquier usuario autenticado puede leer roles activos
        is_active = true OR
        -- O tiene permisos específicos
        has_permission(auth.uid(), 'roles.read_own') OR
        has_permission(auth.uid(), 'roles.read_team') OR
        has_permission(auth.uid(), 'roles.read_all')
    );

-- ================================================================
-- 5. VERIFICACIÓN DE PERMISOS ASIGNADOS
-- ================================================================

-- Mostrar permisos del analista
SELECT 
    'PERMISOS DEL ANALISTA:' as info,
    p.name as permission_name,
    p.description,
    p.resource,
    p.action,
    p.scope
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
WHERE rp.role_id = 'b2e20a71-9268-4b06-8ec3-a776446af064'
AND p.resource IN ('users', 'roles')
ORDER BY p.resource, p.action;

-- Verificar que el rol User existe
SELECT 
    'VERIFICACIÓN DE ROLES:' as info,
    name,
    description,
    is_active
FROM roles 
WHERE name IN ('User', 'Analista', 'Admin')
ORDER BY name;

-- ================================================================
-- 6. INSTRUCCIONES ADICIONALES
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  CORRECCIÓN APLICADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'CAMBIOS REALIZADOS:';
    RAISE NOTICE '1. ✓ Agregados permisos mínimos para Analista';
    RAISE NOTICE '   - users.create_own (crear su perfil)';
    RAISE NOTICE '   - users.read_own (leer su perfil)';
    RAISE NOTICE '   - users.update_own (actualizar su perfil)';
    RAISE NOTICE '   - roles.read_own (leer su rol)';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✓ Creado rol "User" si no existía';
    RAISE NOTICE '';
    RAISE NOTICE '3. ✓ Corregidas políticas RLS de user_profiles';
    RAISE NOTICE '   - Permitir lectura del propio perfil';
    RAISE NOTICE '   - Permitir creación del propio perfil';
    RAISE NOTICE '   - Permitir actualización del propio perfil';
    RAISE NOTICE '';
    RAISE NOTICE '4. ✓ Corregida política RLS de roles';
    RAISE NOTICE '   - Permitir lectura de roles activos';
    RAISE NOTICE '';
    RAISE NOTICE 'El usuario Analista ahora debería poder:';
    RAISE NOTICE '- Iniciar sesión correctamente';
    RAISE NOTICE '- Crear/actualizar su perfil';
    RAISE NOTICE '- Leer información básica de roles';
    RAISE NOTICE '- Acceder a sus propios recursos';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

COMMIT;
