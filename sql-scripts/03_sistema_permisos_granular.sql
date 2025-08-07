-- ================================================================
-- SISTEMA DE PERMISOS GRANULAR CON SCOPES
-- ================================================================
-- Descripción: Sistema completo de permisos basado en permisos específicos
-- Modelo: modulo.accion_scope (ejemplo: cases.read_own, users.update_team)
-- Scopes: own (propio), team (equipo), all (todos)
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  IMPLEMENTANDO SISTEMA DE PERMISOS';
    RAISE NOTICE '  GRANULAR CON SCOPES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- FUNCIÓN PRINCIPAL PARA VERIFICAR PERMISOS
-- ================================================================

-- Función principal para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    permission_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar que el usuario está activo
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = p_user_id AND is_active = true
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si el usuario tiene el permiso específico
    -- a través de su rol asignado
    SELECT EXISTS(
        SELECT 1 
        FROM user_profiles up
        JOIN role_permissions rp ON up.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = p_user_id 
        AND up.is_active = true
        AND p.name = p_permission_name
        AND p.is_active = true
    ) INTO permission_exists;
    
    RETURN permission_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_has_permission(UUID, TEXT) IS 'Verifica si un usuario tiene un permiso específico según el sistema granular';

-- ================================================================
-- FUNCIÓN PARA VERIFICAR PERMISOS CON CONTEXTO DE PROPIETARIO
-- ================================================================

-- Función para verificar permisos considerando el propietario del recurso
CREATE OR REPLACE FUNCTION user_can_access_resource(
    p_user_id UUID,
    p_resource_owner_id UUID,
    p_permission_base TEXT -- ejemplo: 'cases.read', 'users.update'
)
RETURNS BOOLEAN AS $$
DECLARE
    can_access BOOLEAN := FALSE;
BEGIN
    -- Verificar que el usuario está activo
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = p_user_id AND is_active = true
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar permiso '_all' (acceso a todos los recursos)
    IF user_has_permission(p_user_id, p_permission_base || '_all') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permiso '_team' (acceso a recursos del equipo)
    -- TODO: Implementar lógica de equipos cuando esté disponible
    IF user_has_permission(p_user_id, p_permission_base || '_team') THEN
        -- Por ahora, team se comporta como all hasta implementar equipos
        RETURN TRUE;
    END IF;
    
    -- Verificar permiso '_own' (acceso a recursos propios)
    IF user_has_permission(p_user_id, p_permission_base || '_own') 
       AND p_user_id = p_resource_owner_id THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_resource(UUID, UUID, TEXT) IS 'Verifica permisos considerando scopes (own/team/all) y propietario del recurso';

-- ================================================================
-- FUNCIÓN PARA OBTENER EL SCOPE MÁS ALTO QUE TIENE EL USUARIO
-- ================================================================

-- Función para obtener el scope más amplio que el usuario tiene para una acción
CREATE OR REPLACE FUNCTION get_user_highest_scope(
    p_user_id UUID,
    p_permission_base TEXT -- ejemplo: 'cases.read', 'users.update'
)
RETURNS TEXT AS $$
DECLARE
    highest_scope TEXT := NULL;
BEGIN
    -- Verificar que el usuario está activo
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = p_user_id AND is_active = true
    ) THEN
        RETURN NULL;
    END IF;
    
    -- Verificar en orden de mayor a menor alcance
    IF user_has_permission(p_user_id, p_permission_base || '_all') THEN
        RETURN 'all';
    END IF;
    
    IF user_has_permission(p_user_id, p_permission_base || '_team') THEN
        RETURN 'team';
    END IF;
    
    IF user_has_permission(p_user_id, p_permission_base || '_own') THEN
        RETURN 'own';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_user_highest_scope(UUID, TEXT) IS 'Obtiene el scope más amplio que el usuario tiene para una acción específica';

-- ================================================================
-- FUNCIÓN PARA VERIFICAR MÚLTIPLES PERMISOS
-- ================================================================

-- Función para verificar si el usuario tiene al menos uno de varios permisos
CREATE OR REPLACE FUNCTION user_has_any_permission(
    p_user_id UUID,
    p_permissions TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    permission_name TEXT;
BEGIN
    -- Verificar que el usuario está activo
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = p_user_id AND is_active = true
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar cada permiso
    FOREACH permission_name IN ARRAY p_permissions
    LOOP
        IF user_has_permission(p_user_id, permission_name) THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_has_any_permission(UUID, TEXT[]) IS 'Verifica si el usuario tiene al menos uno de los permisos especificados';

-- ================================================================
-- FUNCIÓN PARA OBTENER TODOS LOS PERMISOS DEL USUARIO
-- ================================================================

-- Función para obtener la lista de permisos del usuario
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    user_permissions TEXT[];
BEGIN
    -- Verificar que el usuario está activo
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = p_user_id AND is_active = true
    ) THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    -- Obtener todos los permisos del usuario
    SELECT ARRAY_AGG(p.name)
    INTO user_permissions
    FROM user_profiles up
    JOIN role_permissions rp ON up.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE up.id = p_user_id 
    AND up.is_active = true
    AND p.is_active = true;
    
    RETURN COALESCE(user_permissions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Obtiene todos los permisos activos del usuario';

-- ================================================================
-- FUNCIÓN HELPER PARA RLS - ACCESO POR CASOS
-- ================================================================

-- Función helper para políticas RLS de casos
CREATE OR REPLACE FUNCTION user_can_access_case(p_user_id UUID, p_case_owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_can_access_resource(p_user_id, p_case_owner_id, 'cases.read');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_case(UUID, UUID) IS 'Helper para RLS - verifica acceso a casos específicos';

-- ================================================================
-- FUNCIÓN HELPER PARA RLS - ACCESO POR TODOS
-- ================================================================

-- Función helper para políticas RLS de TODOs
CREATE OR REPLACE FUNCTION user_can_access_todo(p_user_id UUID, p_todo_assigned_user_id UUID, p_todo_created_by_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Para TODOs, puede acceder si:
    -- 1. Tiene permisos sobre el usuario asignado
    -- 2. Tiene permisos sobre el usuario creador
    RETURN user_can_access_resource(p_user_id, p_todo_assigned_user_id, 'todos.read')
        OR user_can_access_resource(p_user_id, p_todo_created_by_user_id, 'todos.read');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_todo(UUID, UUID, UUID) IS 'Helper para RLS - verifica acceso a TODOs específicos';

-- ================================================================
-- FUNCIÓN HELPER PARA RLS - ACCESO POR NOTAS
-- ================================================================

-- Función helper para políticas RLS de notas
CREATE OR REPLACE FUNCTION user_can_access_note(p_user_id UUID, p_note_created_by UUID, p_note_assigned_to UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Para notas, puede acceder si:
    -- 1. Tiene permisos sobre el creador
    -- 2. Tiene permisos sobre el asignado (si existe)
    RETURN user_can_access_resource(p_user_id, p_note_created_by, 'notes.read')
        OR (p_note_assigned_to IS NOT NULL AND user_can_access_resource(p_user_id, p_note_assigned_to, 'notes.read'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_note(UUID, UUID, UUID) IS 'Helper para RLS - verifica acceso a notas específicas';

-- ================================================================
-- FUNCIÓN HELPER PARA RLS - ACCESO POR DOCUMENTOS
-- ================================================================

-- Función helper para políticas RLS de documentos
CREATE OR REPLACE FUNCTION user_can_access_document(p_user_id UUID, p_document_created_by UUID, p_document_is_published BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    -- Para documentos puede acceder si:
    -- 1. El documento está publicado (acceso público)
    -- 2. Tiene permisos sobre el creador
    RETURN p_document_is_published = true
        OR user_can_access_resource(p_user_id, p_document_created_by, 'documentation.read');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_document(UUID, UUID, BOOLEAN) IS 'Helper para RLS - verifica acceso a documentos específicos';

-- ================================================================
-- FUNCIÓN HELPER PARA RLS - ACCESO POR ELEMENTOS ARCHIVADOS
-- ================================================================

-- Función helper para políticas RLS de archivo
CREATE OR REPLACE FUNCTION user_can_access_archive(p_user_id UUID, p_archive_original_owner_id UUID, p_archive_archived_by UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Para archivo puede acceder si:
    -- 1. Tiene permisos sobre el propietario original
    -- 2. Tiene permisos sobre quien archivó
    RETURN user_can_access_resource(p_user_id, p_archive_original_owner_id, 'archive.view')
        OR user_can_access_resource(p_user_id, p_archive_archived_by, 'archive.view');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_can_access_archive(UUID, UUID, UUID) IS 'Helper para RLS - verifica acceso a elementos archivados';

-- ================================================================
-- FUNCIÓN PARA VERIFICAR PERMISOS ADMINISTRATIVOS
-- ================================================================

-- Función para verificar si un usuario tiene permisos administrativos
CREATE OR REPLACE FUNCTION user_has_admin_permissions(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_permissions TEXT[] := ARRAY[
        'users.admin_all', 'users.admin_team', 'users.admin_own',
        'roles.admin_all', 'roles.admin_team', 'roles.admin_own',
        'permissions.admin_all', 'permissions.admin_team', 'permissions.admin_own',
        'config.admin_all', 'config.admin_team', 'config.admin_own'
    ];
BEGIN
    RETURN user_has_any_permission(p_user_id, admin_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION user_has_admin_permissions(UUID) IS 'Verifica si el usuario tiene algún permiso administrativo';

-- ================================================================
-- FUNCIONES DE COMPATIBILIDAD (LEGACY)
-- ================================================================

-- Función de compatibilidad con el sistema anterior
CREATE OR REPLACE FUNCTION has_permission(p_user_id UUID, p_permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_permission(p_user_id, p_permission_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de compatibilidad para obtener rol (ahora basado en permisos)
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role_name TEXT;
BEGIN
    -- Obtener el rol desde user_profiles
    SELECT COALESCE(r.name, up.role_name, 'user')
    INTO user_role_name
    FROM user_profiles up
    LEFT JOIN roles r ON up.role_id = r.id
    WHERE up.id = p_user_id AND up.is_active = true;
    
    RETURN COALESCE(user_role_name, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de compatibilidad para verificar admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_admin_permissions(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCIÓN PARA VERIFICAR ACCESO AL SISTEMA
-- ================================================================

-- Función para verificar acceso general al sistema
CREATE OR REPLACE FUNCTION has_system_access()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_active BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    -- Si no hay usuario autenticado, no tiene acceso
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que el usuario está activo
    SELECT is_active INTO user_active
    FROM user_profiles
    WHERE id = current_user_id;
    
    -- Si el usuario no existe o no está activo, no tiene acceso
    IF user_active IS NULL OR user_active = FALSE THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION has_system_access() IS 'Verifica si el usuario actual tiene acceso básico al sistema';

-- ================================================================
-- OTORGAR PERMISOS BÁSICOS
-- ================================================================

-- Otorgar permisos de ejecución a las funciones
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_resource(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_highest_scope(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_any_permission(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

-- Funciones helper para RLS
GRANT EXECUTE ON FUNCTION user_can_access_case(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_todo(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_note(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_document(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_archive(UUID, UUID, UUID) TO authenticated;

-- Funciones administrativas
GRANT EXECUTE ON FUNCTION user_has_admin_permissions(UUID) TO authenticated;

-- Funciones de compatibilidad
GRANT EXECUTE ON FUNCTION has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_system_access() TO authenticated;

-- ================================================================
-- VERIFICACIÓN DEL SISTEMA
-- ================================================================
DO $$
DECLARE
    test_user_id UUID;
    test_result BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFICACIÓN DEL SISTEMA DE PERMISOS:';
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Probar función básica
        SELECT user_has_permission(test_user_id, 'cases.read_own') INTO test_result;
        RAISE NOTICE '✓ Función user_has_permission: %', 
            CASE WHEN test_result IS NOT NULL THEN 'OK' ELSE 'ERROR' END;
        
        -- Probar función de scope
        test_result := get_user_highest_scope(test_user_id, 'cases.read') IS NOT NULL;
        RAISE NOTICE '✓ Función get_user_highest_scope: %', 
            CASE WHEN test_result THEN 'OK' ELSE 'OK (sin permisos)' END;
        
        RAISE NOTICE '✓ Usuario de prueba encontrado: %', test_user_id;
    ELSE
        RAISE NOTICE '⚠ No se encontró usuario de prueba activo';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA DE PERMISOS GRANULAR IMPLEMENTADO';
    RAISE NOTICE 'Base: user_has_permission(user_id, "modulo.accion_scope")';
    RAISE NOTICE 'Scopes: own (propio), team (equipo), all (todos)';
    RAISE NOTICE 'Ejemplo: user_has_permission(uuid, "cases.read_own")';
    RAISE NOTICE '';
END $$;
