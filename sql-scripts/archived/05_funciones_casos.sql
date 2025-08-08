-- ================================================================
-- MÓDULO DE GESTIÓN DE CASOS CON PERMISOS GRANULARES
-- ================================================================
-- Descripción: Funciones para gestión de casos usando permisos granulares
-- Actualización del script 05 para usar sistema de permisos
-- Sistema: Basado en user_has_permission(user_id, "cases.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  FUNCIONES DE CASOS CON PERMISOS';
    RAISE NOTICE '  GRANULARES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 1. FUNCIÓN PARA CREAR CASO
-- ================================================================
CREATE OR REPLACE FUNCTION create_case(
    p_title TEXT,
    p_description TEXT,
    p_priority_id UUID,
    p_status TEXT DEFAULT 'pending',
    p_assigned_user_id UUID DEFAULT NULL,
    p_created_by_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_case_id UUID;
    creator_user_id UUID;
    v_scope TEXT;
BEGIN
    creator_user_id := COALESCE(p_created_by_user_id, auth.uid());
    
    -- Verificar permisos para crear casos
    IF NOT user_has_permission(creator_user_id, 'cases.create_own') 
       AND NOT user_has_permission(creator_user_id, 'cases.create_team')
       AND NOT user_has_permission(creator_user_id, 'cases.create_all') THEN
        RAISE EXCEPTION 'Sin permisos para crear casos';
    END IF;
    
    -- Obtener scope más alto para creación
    v_scope := get_user_highest_scope(creator_user_id, 'cases.create');
    
    -- Si solo tiene scope 'own', no puede asignar a otros usuarios
    IF v_scope = 'own' AND p_assigned_user_id IS NOT NULL AND p_assigned_user_id != creator_user_id THEN
        RAISE EXCEPTION 'Sin permisos para asignar casos a otros usuarios';
    END IF;
    
    -- Crear el caso
    INSERT INTO cases (
        title, description, priority_id, status, 
        assigned_user_id, user_id, created_by_user_id
    ) VALUES (
        p_title, p_description, p_priority_id, p_status,
        p_assigned_user_id, creator_user_id, creator_user_id
    ) RETURNING id INTO new_case_id;
    
    -- Crear entrada de control
    INSERT INTO case_control (
        case_id, user_id, action, description
    ) VALUES (
        new_case_id, creator_user_id, 'created',
        format('Caso creado: %s', p_title)
    );
    
    RAISE NOTICE 'Caso creado: % por usuario: %', new_case_id, creator_user_id;
    RETURN new_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION create_case(TEXT, TEXT, UUID, TEXT, UUID, UUID) IS 'Crea un nuevo caso respetando permisos granulares';

-- ================================================================
-- 2. FUNCIÓN PARA ACTUALIZAR CASO
-- ================================================================
CREATE OR REPLACE FUNCTION update_case(
    p_case_id UUID,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_priority_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_assigned_user_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    case_owner_id UUID;
    case_assigned_id UUID;
    v_scope TEXT;
    can_update BOOLEAN := false;
    update_fields TEXT[] := ARRAY[]::TEXT[];
    control_description TEXT := '';
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del caso
    SELECT user_id, assigned_user_id INTO case_owner_id, case_assigned_id
    FROM cases WHERE id = p_case_id;
    
    IF case_owner_id IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Verificar permisos de actualización
    v_scope := get_user_highest_scope(current_user_id, 'cases.update');
    
    CASE v_scope
        WHEN 'all' THEN
            can_update := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_update := true;
        WHEN 'own' THEN
            -- Solo puede actualizar si es el propietario o asignado
            can_update := (case_owner_id = current_user_id OR case_assigned_id = current_user_id);
        ELSE
            can_update := false;
    END CASE;
    
    IF NOT can_update THEN
        RAISE EXCEPTION 'Sin permisos para actualizar este caso';
    END IF;
    
    -- Verificar permisos específicos para asignación
    IF p_assigned_user_id IS NOT NULL AND p_assigned_user_id != case_assigned_id THEN
        IF NOT user_has_permission(current_user_id, 'cases.assign_own') 
           AND NOT user_has_permission(current_user_id, 'cases.assign_team')
           AND NOT user_has_permission(current_user_id, 'cases.assign_all') THEN
            RAISE EXCEPTION 'Sin permisos para asignar casos';
        END IF;
    END IF;
    
    -- Construir query de actualización dinámicamente
    UPDATE cases SET
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        priority_id = COALESCE(p_priority_id, priority_id),
        status = COALESCE(p_status, status),
        assigned_user_id = COALESCE(p_assigned_user_id, assigned_user_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_case_id;
    
    -- Preparar descripción para control
    IF p_title IS NOT NULL THEN
        update_fields := array_append(update_fields, 'título');
    END IF;
    IF p_description IS NOT NULL THEN
        update_fields := array_append(update_fields, 'descripción');
    END IF;
    IF p_priority_id IS NOT NULL THEN
        update_fields := array_append(update_fields, 'prioridad');
    END IF;
    IF p_status IS NOT NULL THEN
        update_fields := array_append(update_fields, format('estado a "%s"', p_status));
    END IF;
    IF p_assigned_user_id IS NOT NULL THEN
        update_fields := array_append(update_fields, 'asignación');
    END IF;
    
    control_description := format('Caso actualizado: %s', array_to_string(update_fields, ', '));
    
    -- Crear entrada de control
    INSERT INTO case_control (
        case_id, user_id, action, description
    ) VALUES (
        p_case_id, current_user_id, 'updated', control_description
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION update_case(UUID, TEXT, TEXT, UUID, TEXT, UUID, UUID) IS 'Actualiza un caso respetando permisos granulares';

-- ================================================================
-- 3. FUNCIÓN PARA ELIMINAR CASO
-- ================================================================
CREATE OR REPLACE FUNCTION delete_case(
    p_case_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    case_owner_id UUID;
    case_title TEXT;
    v_scope TEXT;
    can_delete BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del caso
    SELECT user_id, title INTO case_owner_id, case_title
    FROM cases WHERE id = p_case_id;
    
    IF case_owner_id IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Verificar permisos de eliminación
    v_scope := get_user_highest_scope(current_user_id, 'cases.delete');
    
    CASE v_scope
        WHEN 'all' THEN
            can_delete := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_delete := true;
        WHEN 'own' THEN
            can_delete := (case_owner_id = current_user_id);
        ELSE
            can_delete := false;
    END CASE;
    
    IF NOT can_delete THEN
        RAISE EXCEPTION 'Sin permisos para eliminar este caso';
    END IF;
    
    -- Eliminar entradas relacionadas primero
    DELETE FROM case_control WHERE case_id = p_case_id;
    DELETE FROM time_entries WHERE case_id = p_case_id;
    DELETE FROM manual_time_entries WHERE case_id = p_case_id;
    
    -- Eliminar el caso
    DELETE FROM cases WHERE id = p_case_id;
    
    RAISE NOTICE 'Caso eliminado: % ("%") por usuario: %', p_case_id, case_title, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION delete_case(UUID, UUID) IS 'Elimina un caso respetando permisos granulares';

-- ================================================================
-- 4. FUNCIÓN PARA OBTENER CASOS ACCESIBLES
-- ================================================================
CREATE OR REPLACE FUNCTION get_accessible_cases(
    p_user_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_assigned_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority_name TEXT,
    assigned_user_name TEXT,
    owner_user_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    can_assign BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    v_scope TEXT;
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos de lectura
    v_scope := get_user_highest_scope(current_user_id, 'cases.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer casos';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            c.id,
            c.title,
            c.description,
            c.status,
            cp.name as priority_name,
            au.full_name as assigned_user_name,
            ou.full_name as owner_user_name,
            c.created_at,
            c.updated_at,
            user_can_access_resource($1, ''cases.update'', c.user_id, c.assigned_user_id) as can_update,
            user_can_access_resource($1, ''cases.delete'', c.user_id, c.assigned_user_id) as can_delete,
            user_can_access_resource($1, ''cases.assign'', c.user_id, c.assigned_user_id) as can_assign
        FROM cases c
        LEFT JOIN case_priorities cp ON c.priority_id = cp.id
        LEFT JOIN user_profiles au ON c.assigned_user_id = au.id
        LEFT JOIN user_profiles ou ON c.user_id = ou.id';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los casos, no agregar condiciones de usuario
            NULL;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            -- Por ahora igual que 'all'
            NULL;
        WHEN 'own' THEN
            -- Solo puede ver casos propios o asignados
            where_conditions := array_append(where_conditions, 
                format('(c.user_id = ''%s'' OR c.assigned_user_id = ''%s'')', current_user_id, current_user_id));
    END CASE;
    
    -- Agregar filtros adicionales
    IF p_status IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('c.status = ''%s''', p_status));
    END IF;
    
    IF p_assigned_user_id IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('c.assigned_user_id = ''%s''', p_assigned_user_id));
    END IF;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || format(' ORDER BY c.updated_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query USING current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_accessible_cases(UUID, TEXT, UUID, INTEGER, INTEGER) IS 'Obtiene casos accesibles según permisos granulares';

-- ================================================================
-- 5. FUNCIÓN PARA AGREGAR CONTROL DE CASO
-- ================================================================
CREATE OR REPLACE FUNCTION add_case_control(
    p_case_id UUID,
    p_action TEXT,
    p_description TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    case_owner_id UUID;
    case_assigned_id UUID;
    new_control_id UUID;
    can_control BOOLEAN := false;
    v_scope TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del caso
    SELECT user_id, assigned_user_id INTO case_owner_id, case_assigned_id
    FROM cases WHERE id = p_case_id;
    
    IF case_owner_id IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Verificar permisos de control
    v_scope := get_user_highest_scope(current_user_id, 'cases.control');
    
    CASE v_scope
        WHEN 'all' THEN
            can_control := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_control := true;
        WHEN 'own' THEN
            can_control := (case_owner_id = current_user_id OR case_assigned_id = current_user_id);
        ELSE
            can_control := false;
    END CASE;
    
    IF NOT can_control THEN
        RAISE EXCEPTION 'Sin permisos para agregar control a este caso';
    END IF;
    
    -- Crear entrada de control
    INSERT INTO case_control (
        case_id, user_id, action, description
    ) VALUES (
        p_case_id, current_user_id, p_action, p_description
    ) RETURNING id INTO new_control_id;
    
    RETURN new_control_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION add_case_control(UUID, TEXT, TEXT, UUID) IS 'Agrega entrada de control respetando permisos granulares';

-- ================================================================
-- 6. OTORGAR PERMISOS
-- ================================================================

-- Funciones principales
GRANT EXECUTE ON FUNCTION create_case(TEXT, TEXT, UUID, TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_case(UUID, TEXT, TEXT, UUID, TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_case(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_cases(UUID, TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_case_control(UUID, TEXT, TEXT, UUID) TO authenticated;

-- ================================================================
-- 7. VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    function_count INTEGER;
    test_user_id UUID;
    test_case_id UUID;
BEGIN
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'create_case', 'update_case', 'delete_case', 
        'get_accessible_cases', 'add_case_control'
    );
    
    RAISE NOTICE 'VERIFICACIÓN FINAL - CASOS:';
    RAISE NOTICE '- Funciones creadas: %', function_count;
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '- Usuario de prueba: %', test_user_id;
        
        -- Verificar si puede leer casos
        IF user_has_permission(test_user_id, 'cases.read_own') OR 
           user_has_permission(test_user_id, 'cases.read_team') OR 
           user_has_permission(test_user_id, 'cases.read_all') THEN
            RAISE NOTICE '- Permisos de lectura: OK';
        ELSE
            RAISE NOTICE '- Permisos de lectura: NO DISPONIBLE';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE CASOS CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
END $$;
