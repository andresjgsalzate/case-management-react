-- ================================================================
-- MÓDULO DE GESTIÓN DE TODOS CON PERMISOS GRANULARES
-- ================================================================
-- Descripción: Funciones para gestión de TODOs usando permisos granulares
-- Actualización del script 06 para usar sistema de permisos
-- Sistema: Basado en user_has_permission(user_id, "todos.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  FUNCIONES DE TODOS CON PERMISOS';
    RAISE NOTICE '  GRANULARES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 1. FUNCIÓN PARA CREAR TODO
-- ================================================================
CREATE OR REPLACE FUNCTION create_todo(
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_priority_id UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_assigned_user_id UUID DEFAULT NULL,
    p_case_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_created_by_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_todo_id UUID;
    creator_user_id UUID;
    v_scope TEXT;
    default_priority_id UUID;
BEGIN
    creator_user_id := COALESCE(p_created_by_user_id, auth.uid());
    
    -- Verificar permisos para crear TODOs
    IF NOT user_has_permission(creator_user_id, 'todos.create_own') 
       AND NOT user_has_permission(creator_user_id, 'todos.create_team')
       AND NOT user_has_permission(creator_user_id, 'todos.create_all') THEN
        RAISE EXCEPTION 'Sin permisos para crear TODOs';
    END IF;
    
    -- Obtener scope más alto para creación
    v_scope := get_user_highest_scope(creator_user_id, 'todos.create');
    
    -- Si solo tiene scope 'own', no puede asignar a otros usuarios
    IF v_scope = 'own' AND p_assigned_user_id IS NOT NULL AND p_assigned_user_id != creator_user_id THEN
        RAISE EXCEPTION 'Sin permisos para asignar TODOs a otros usuarios';
    END IF;
    
    -- Obtener prioridad por defecto si no se especifica
    IF p_priority_id IS NULL THEN
        SELECT id INTO default_priority_id 
        FROM todo_priorities 
        WHERE name = 'Medium' OR name = 'Normal' 
        LIMIT 1;
    END IF;
    
    -- Crear el TODO
    INSERT INTO todos (
        title, description, priority_id, due_date,
        assigned_user_id, case_id, category_id, created_by_user_id,
        is_completed, created_at, updated_at
    ) VALUES (
        p_title, p_description, COALESCE(p_priority_id, default_priority_id), p_due_date,
        p_assigned_user_id, p_case_id, p_category_id, creator_user_id,
        false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id INTO new_todo_id;
    
    -- Crear entrada de control
    INSERT INTO todo_control (
        todo_id, user_id, action, description
    ) VALUES (
        new_todo_id, creator_user_id, 'created',
        format('TODO creado: %s', p_title)
    );
    
    RAISE NOTICE 'TODO creado: % por usuario: %', new_todo_id, creator_user_id;
    RETURN new_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION create_todo(TEXT, TEXT, UUID, DATE, UUID, UUID, UUID, UUID) IS 'Crea un nuevo TODO respetando permisos granulares';

-- ================================================================
-- 2. FUNCIÓN PARA ACTUALIZAR TODO
-- ================================================================
CREATE OR REPLACE FUNCTION update_todo(
    p_todo_id UUID,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_priority_id UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_assigned_user_id UUID DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    todo_creator_id UUID;
    todo_assigned_id UUID;
    v_scope TEXT;
    can_update BOOLEAN := false;
    update_fields TEXT[] := ARRAY[]::TEXT[];
    control_description TEXT := '';
    old_completed BOOLEAN;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del TODO
    SELECT created_by_user_id, assigned_user_id, is_completed 
    INTO todo_creator_id, todo_assigned_id, old_completed
    FROM todos WHERE id = p_todo_id;
    
    IF todo_creator_id IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Verificar permisos de actualización
    v_scope := get_user_highest_scope(current_user_id, 'todos.update');
    
    CASE v_scope
        WHEN 'all' THEN
            can_update := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_update := true;
        WHEN 'own' THEN
            -- Solo puede actualizar si es el creador o asignado
            can_update := (todo_creator_id = current_user_id OR todo_assigned_id = current_user_id);
        ELSE
            can_update := false;
    END CASE;
    
    IF NOT can_update THEN
        RAISE EXCEPTION 'Sin permisos para actualizar este TODO';
    END IF;
    
    -- Verificar permisos específicos para asignación
    IF p_assigned_user_id IS NOT NULL AND p_assigned_user_id != todo_assigned_id THEN
        IF NOT user_has_permission(current_user_id, 'todos.assign_own') 
           AND NOT user_has_permission(current_user_id, 'todos.assign_team')
           AND NOT user_has_permission(current_user_id, 'todos.assign_all') THEN
            RAISE EXCEPTION 'Sin permisos para asignar TODOs';
        END IF;
    END IF;
    
    -- Actualizar TODO
    UPDATE todos SET
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        priority_id = COALESCE(p_priority_id, priority_id),
        due_date = COALESCE(p_due_date, due_date),
        assigned_user_id = COALESCE(p_assigned_user_id, assigned_user_id),
        is_completed = COALESCE(p_is_completed, is_completed),
        category_id = COALESCE(p_category_id, category_id),
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE 
            WHEN p_is_completed = true AND old_completed = false THEN CURRENT_TIMESTAMP
            WHEN p_is_completed = false THEN NULL
            ELSE completed_at
        END
    WHERE id = p_todo_id;
    
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
    IF p_due_date IS NOT NULL THEN
        update_fields := array_append(update_fields, 'fecha límite');
    END IF;
    IF p_assigned_user_id IS NOT NULL THEN
        update_fields := array_append(update_fields, 'asignación');
    END IF;
    IF p_is_completed IS NOT NULL THEN
        update_fields := array_append(update_fields, 
            CASE WHEN p_is_completed THEN 'marcado como completado' ELSE 'marcado como pendiente' END);
    END IF;
    IF p_category_id IS NOT NULL THEN
        update_fields := array_append(update_fields, 'categoría');
    END IF;
    
    control_description := format('TODO actualizado: %s', array_to_string(update_fields, ', '));
    
    -- Crear entrada de control
    INSERT INTO todo_control (
        todo_id, user_id, action, description
    ) VALUES (
        p_todo_id, current_user_id, 'updated', control_description
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION update_todo(UUID, TEXT, TEXT, UUID, DATE, UUID, BOOLEAN, UUID, UUID) IS 'Actualiza un TODO respetando permisos granulares';

-- ================================================================
-- 3. FUNCIÓN PARA COMPLETAR/INCOMPLETAR TODO
-- ================================================================
CREATE OR REPLACE FUNCTION toggle_todo_completion(
    p_todo_id UUID,
    p_is_completed BOOLEAN,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    todo_creator_id UUID;
    todo_assigned_id UUID;
    can_complete BOOLEAN := false;
    v_scope TEXT;
    action_text TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del TODO
    SELECT created_by_user_id, assigned_user_id 
    INTO todo_creator_id, todo_assigned_id
    FROM todos WHERE id = p_todo_id;
    
    IF todo_creator_id IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Verificar permisos de completar
    v_scope := get_user_highest_scope(current_user_id, 'todos.complete');
    
    CASE v_scope
        WHEN 'all' THEN
            can_complete := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_complete := true;
        WHEN 'own' THEN
            can_complete := (todo_creator_id = current_user_id OR todo_assigned_id = current_user_id);
        ELSE
            can_complete := false;
    END CASE;
    
    IF NOT can_complete THEN
        RAISE EXCEPTION 'Sin permisos para cambiar el estado de este TODO';
    END IF;
    
    -- Actualizar estado
    UPDATE todos SET
        is_completed = p_is_completed,
        completed_at = CASE WHEN p_is_completed THEN CURRENT_TIMESTAMP ELSE NULL END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_todo_id;
    
    -- Crear entrada de control
    action_text := CASE WHEN p_is_completed THEN 'completed' ELSE 'reopened' END;
    
    INSERT INTO todo_control (
        todo_id, user_id, action, description
    ) VALUES (
        p_todo_id, current_user_id, action_text,
        CASE WHEN p_is_completed THEN 'TODO marcado como completado' ELSE 'TODO reabierto' END
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION toggle_todo_completion(UUID, BOOLEAN, UUID) IS 'Cambia el estado de completado de un TODO respetando permisos granulares';

-- ================================================================
-- 4. FUNCIÓN PARA ELIMINAR TODO
-- ================================================================
CREATE OR REPLACE FUNCTION delete_todo(
    p_todo_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    todo_creator_id UUID;
    todo_title TEXT;
    v_scope TEXT;
    can_delete BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del TODO
    SELECT created_by_user_id, title INTO todo_creator_id, todo_title
    FROM todos WHERE id = p_todo_id;
    
    IF todo_creator_id IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Verificar permisos de eliminación
    v_scope := get_user_highest_scope(current_user_id, 'todos.delete');
    
    CASE v_scope
        WHEN 'all' THEN
            can_delete := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_delete := true;
        WHEN 'own' THEN
            can_delete := (todo_creator_id = current_user_id);
        ELSE
            can_delete := false;
    END CASE;
    
    IF NOT can_delete THEN
        RAISE EXCEPTION 'Sin permisos para eliminar este TODO';
    END IF;
    
    -- Eliminar entradas relacionadas primero
    DELETE FROM todo_control WHERE todo_id = p_todo_id;
    DELETE FROM todo_time_entries WHERE todo_id = p_todo_id;
    DELETE FROM todo_manual_time_entries WHERE todo_id = p_todo_id;
    
    -- Eliminar el TODO
    DELETE FROM todos WHERE id = p_todo_id;
    
    RAISE NOTICE 'TODO eliminado: % ("%") por usuario: %', p_todo_id, todo_title, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION delete_todo(UUID, UUID) IS 'Elimina un TODO respetando permisos granulares';

-- ================================================================
-- 5. FUNCIÓN PARA OBTENER TODOS ACCESIBLES
-- ================================================================
CREATE OR REPLACE FUNCTION get_accessible_todos(
    p_user_id UUID DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_assigned_user_id UUID DEFAULT NULL,
    p_case_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    is_completed BOOLEAN,
    due_date DATE,
    priority_name TEXT,
    assigned_user_name TEXT,
    creator_user_name TEXT,
    case_title TEXT,
    category_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    can_assign BOOLEAN,
    can_complete BOOLEAN
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
    v_scope := get_user_highest_scope(current_user_id, 'todos.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer TODOs';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            t.id,
            t.title,
            t.description,
            t.is_completed,
            t.due_date,
            tp.name as priority_name,
            au.full_name as assigned_user_name,
            cu.full_name as creator_user_name,
            c.title as case_title,
            tc.name as category_name,
            t.created_at,
            t.updated_at,
            t.completed_at,
            user_can_access_resource($1, ''todos.update'', t.created_by_user_id, t.assigned_user_id) as can_update,
            user_can_access_resource($1, ''todos.delete'', t.created_by_user_id, t.assigned_user_id) as can_delete,
            user_can_access_resource($1, ''todos.assign'', t.created_by_user_id, t.assigned_user_id) as can_assign,
            user_can_access_resource($1, ''todos.complete'', t.created_by_user_id, t.assigned_user_id) as can_complete
        FROM todos t
        LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
        LEFT JOIN user_profiles au ON t.assigned_user_id = au.id
        LEFT JOIN user_profiles cu ON t.created_by_user_id = cu.id
        LEFT JOIN cases c ON t.case_id = c.id
        LEFT JOIN todo_categories tc ON t.category_id = tc.id';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los TODOs, no agregar condiciones de usuario
            NULL;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            -- Por ahora igual que 'all'
            NULL;
        WHEN 'own' THEN
            -- Solo puede ver TODOs creados por él o asignados a él
            where_conditions := array_append(where_conditions, 
                format('(t.created_by_user_id = ''%s'' OR t.assigned_user_id = ''%s'')', current_user_id, current_user_id));
    END CASE;
    
    -- Agregar filtros adicionales
    IF p_is_completed IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('t.is_completed = %s', p_is_completed));
    END IF;
    
    IF p_assigned_user_id IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('t.assigned_user_id = ''%s''', p_assigned_user_id));
    END IF;
    
    IF p_case_id IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('t.case_id = ''%s''', p_case_id));
    END IF;
    
    IF p_category_id IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('t.category_id = ''%s''', p_category_id));
    END IF;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || format(' ORDER BY t.updated_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query USING current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_accessible_todos(UUID, BOOLEAN, UUID, UUID, UUID, INTEGER, INTEGER) IS 'Obtiene TODOs accesibles según permisos granulares';

-- ================================================================
-- 6. FUNCIÓN PARA AGREGAR CONTROL DE TODO
-- ================================================================
CREATE OR REPLACE FUNCTION add_todo_control(
    p_todo_id UUID,
    p_action TEXT,
    p_description TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    todo_creator_id UUID;
    todo_assigned_id UUID;
    new_control_id UUID;
    can_control BOOLEAN := false;
    v_scope TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del TODO
    SELECT created_by_user_id, assigned_user_id INTO todo_creator_id, todo_assigned_id
    FROM todos WHERE id = p_todo_id;
    
    IF todo_creator_id IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Verificar permisos de control
    v_scope := get_user_highest_scope(current_user_id, 'todos.control');
    
    CASE v_scope
        WHEN 'all' THEN
            can_control := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_control := true;
        WHEN 'own' THEN
            can_control := (todo_creator_id = current_user_id OR todo_assigned_id = current_user_id);
        ELSE
            can_control := false;
    END CASE;
    
    IF NOT can_control THEN
        RAISE EXCEPTION 'Sin permisos para agregar control a este TODO';
    END IF;
    
    -- Crear entrada de control
    INSERT INTO todo_control (
        todo_id, user_id, action, description
    ) VALUES (
        p_todo_id, current_user_id, p_action, p_description
    ) RETURNING id INTO new_control_id;
    
    RETURN new_control_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION add_todo_control(UUID, TEXT, TEXT, UUID) IS 'Agrega entrada de control respetando permisos granulares';

-- ================================================================
-- 7. FUNCIÓN PARA OBTENER TODOS VENCIDOS
-- ================================================================
CREATE OR REPLACE FUNCTION get_overdue_todos(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    due_date DATE,
    days_overdue INTEGER,
    priority_name TEXT,
    assigned_user_name TEXT,
    case_title TEXT
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
    v_scope := get_user_highest_scope(current_user_id, 'todos.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer TODOs';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            t.id,
            t.title,
            t.due_date,
            (CURRENT_DATE - t.due_date)::INTEGER as days_overdue,
            tp.name as priority_name,
            au.full_name as assigned_user_name,
            c.title as case_title
        FROM todos t
        LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
        LEFT JOIN user_profiles au ON t.assigned_user_id = au.id
        LEFT JOIN cases c ON t.case_id = c.id
        WHERE t.is_completed = false AND t.due_date < CURRENT_DATE';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los TODOs vencidos
            NULL;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            NULL;
        WHEN 'own' THEN
            -- Solo TODOs vencidos propios o asignados
            where_conditions := array_append(where_conditions, 
                format('(t.created_by_user_id = ''%s'' OR t.assigned_user_id = ''%s'')', current_user_id, current_user_id));
    END CASE;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' AND ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || format(' ORDER BY t.due_date ASC LIMIT %s', p_limit);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_overdue_todos(UUID, INTEGER) IS 'Obtiene TODOs vencidos según permisos granulares';

-- ================================================================
-- 8. OTORGAR PERMISOS
-- ================================================================

-- Funciones principales
GRANT EXECUTE ON FUNCTION create_todo(TEXT, TEXT, UUID, DATE, UUID, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_todo(UUID, TEXT, TEXT, UUID, DATE, UUID, BOOLEAN, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_todo_completion(UUID, BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_todo(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_todos(UUID, BOOLEAN, UUID, UUID, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_todo_control(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_overdue_todos(UUID, INTEGER) TO authenticated;

-- ================================================================
-- 9. VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    function_count INTEGER;
    test_user_id UUID;
BEGIN
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'create_todo', 'update_todo', 'toggle_todo_completion', 'delete_todo', 
        'get_accessible_todos', 'add_todo_control', 'get_overdue_todos'
    );
    
    RAISE NOTICE 'VERIFICACIÓN FINAL - TODOS:';
    RAISE NOTICE '- Funciones creadas: %', function_count;
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '- Usuario de prueba: %', test_user_id;
        
        -- Verificar si puede leer TODOs
        IF user_has_permission(test_user_id, 'todos.read_own') OR 
           user_has_permission(test_user_id, 'todos.read_team') OR 
           user_has_permission(test_user_id, 'todos.read_all') THEN
            RAISE NOTICE '- Permisos de lectura: OK';
        ELSE
            RAISE NOTICE '- Permisos de lectura: NO DISPONIBLE';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE TODOS CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
END $$;
