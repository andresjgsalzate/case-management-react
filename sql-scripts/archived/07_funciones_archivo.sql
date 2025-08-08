-- ================================================================
-- MÓDULO DE GESTIÓN DE ARCHIVO CON PERMISOS GRANULARES
-- ================================================================
-- Descripción: Funciones para gestión de archivo usando permisos granulares
-- Actualización del script 07 para usar sistema de permisos
-- Sistema: Basado en user_has_permission(user_id, "archive.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  FUNCIONES DE ARCHIVO CON PERMISOS';
    RAISE NOTICE '  GRANULARES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 1. FUNCIÓN PARA ARCHIVAR CASO
-- ================================================================
CREATE OR REPLACE FUNCTION archive_case(
    p_case_id UUID,
    p_archive_reason TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    archived_case_id UUID;
    current_user_id UUID;
    case_data RECORD;
    v_scope TEXT;
    can_archive BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para archivar casos
    IF NOT user_has_permission(current_user_id, 'archive.create_own') 
       AND NOT user_has_permission(current_user_id, 'archive.create_team')
       AND NOT user_has_permission(current_user_id, 'archive.create_all') THEN
        RAISE EXCEPTION 'Sin permisos para archivar casos';
    END IF;
    
    -- Obtener información del caso
    SELECT * INTO case_data FROM cases WHERE id = p_case_id;
    
    IF case_data IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Verificar scope de archivado
    v_scope := get_user_highest_scope(current_user_id, 'archive.create');
    
    CASE v_scope
        WHEN 'all' THEN
            can_archive := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_archive := true;
        WHEN 'own' THEN
            can_archive := (case_data.user_id = current_user_id OR case_data.assigned_user_id = current_user_id);
        ELSE
            can_archive := false;
    END CASE;
    
    IF NOT can_archive THEN
        RAISE EXCEPTION 'Sin permisos para archivar este caso';
    END IF;
    
    -- Verificar que el caso no esté ya archivado
    IF EXISTS (SELECT 1 FROM archived_cases WHERE original_case_id = p_case_id) THEN
        RAISE EXCEPTION 'El caso ya está archivado';
    END IF;
    
    -- Crear entrada en archived_cases
    INSERT INTO archived_cases (
        original_case_id, title, description, status, priority_id,
        assigned_user_id, user_id, created_by_user_id,
        original_created_at, original_updated_at,
        archived_by_user_id, archive_reason, archived_at
    ) VALUES (
        case_data.id, case_data.title, case_data.description, case_data.status, case_data.priority_id,
        case_data.assigned_user_id, case_data.user_id, case_data.created_by_user_id,
        case_data.created_at, case_data.updated_at,
        current_user_id, p_archive_reason, CURRENT_TIMESTAMP
    ) RETURNING id INTO archived_case_id;
    
    -- Archivar entradas de control relacionadas
    INSERT INTO archived_case_control (
        archived_case_id, original_control_id, user_id, action, description,
        original_created_at
    )
    SELECT 
        archived_case_id, cc.id, cc.user_id, cc.action, cc.description,
        cc.created_at
    FROM case_control cc
    WHERE cc.case_id = p_case_id;
    
    -- Archivar entradas de tiempo relacionadas
    INSERT INTO archived_time_entries (
        archived_case_id, original_entry_id, user_id, start_time, end_time,
        duration_minutes, description, original_created_at
    )
    SELECT 
        archived_case_id, te.id, te.user_id, te.start_time, te.end_time,
        te.duration_minutes, te.description, te.created_at
    FROM time_entries te
    WHERE te.case_id = p_case_id;
    
    -- Archivar entradas de tiempo manual relacionadas
    INSERT INTO archived_manual_time_entries (
        archived_case_id, original_entry_id, user_id, date, hours,
        description, original_created_at
    )
    SELECT 
        archived_case_id, mte.id, mte.user_id, mte.date, mte.hours,
        mte.description, mte.created_at
    FROM manual_time_entries mte
    WHERE mte.case_id = p_case_id;
    
    -- Eliminar datos originales
    DELETE FROM case_control WHERE case_id = p_case_id;
    DELETE FROM time_entries WHERE case_id = p_case_id;
    DELETE FROM manual_time_entries WHERE case_id = p_case_id;
    DELETE FROM cases WHERE id = p_case_id;
    
    RAISE NOTICE 'Caso archivado: % por usuario: %', p_case_id, current_user_id;
    RETURN archived_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION archive_case(UUID, TEXT, UUID) IS 'Archiva un caso respetando permisos granulares';

-- ================================================================
-- 2. FUNCIÓN PARA ARCHIVAR TODO
-- ================================================================
CREATE OR REPLACE FUNCTION archive_todo(
    p_todo_id UUID,
    p_archive_reason TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    archived_todo_id UUID;
    current_user_id UUID;
    todo_data RECORD;
    v_scope TEXT;
    can_archive BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para archivar TODOs
    IF NOT user_has_permission(current_user_id, 'archive.create_own') 
       AND NOT user_has_permission(current_user_id, 'archive.create_team')
       AND NOT user_has_permission(current_user_id, 'archive.create_all') THEN
        RAISE EXCEPTION 'Sin permisos para archivar TODOs';
    END IF;
    
    -- Obtener información del TODO
    SELECT * INTO todo_data FROM todos WHERE id = p_todo_id;
    
    IF todo_data IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Verificar scope de archivado
    v_scope := get_user_highest_scope(current_user_id, 'archive.create');
    
    CASE v_scope
        WHEN 'all' THEN
            can_archive := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_archive := true;
        WHEN 'own' THEN
            can_archive := (todo_data.created_by_user_id = current_user_id OR todo_data.assigned_user_id = current_user_id);
        ELSE
            can_archive := false;
    END CASE;
    
    IF NOT can_archive THEN
        RAISE EXCEPTION 'Sin permisos para archivar este TODO';
    END IF;
    
    -- Verificar que el TODO no esté ya archivado
    IF EXISTS (SELECT 1 FROM archived_todos WHERE original_todo_id = p_todo_id) THEN
        RAISE EXCEPTION 'El TODO ya está archivado';
    END IF;
    
    -- Crear entrada en archived_todos
    INSERT INTO archived_todos (
        original_todo_id, title, description, is_completed, due_date,
        priority_id, assigned_user_id, case_id, category_id, created_by_user_id,
        original_created_at, original_updated_at, completed_at,
        archived_by_user_id, archive_reason, archived_at
    ) VALUES (
        todo_data.id, todo_data.title, todo_data.description, todo_data.is_completed, todo_data.due_date,
        todo_data.priority_id, todo_data.assigned_user_id, todo_data.case_id, todo_data.category_id, todo_data.created_by_user_id,
        todo_data.created_at, todo_data.updated_at, todo_data.completed_at,
        current_user_id, p_archive_reason, CURRENT_TIMESTAMP
    ) RETURNING id INTO archived_todo_id;
    
    -- Archivar entradas de control relacionadas
    INSERT INTO archived_todo_control (
        archived_todo_id, original_control_id, user_id, action, description,
        original_created_at
    )
    SELECT 
        archived_todo_id, tc.id, tc.user_id, tc.action, tc.description,
        tc.created_at
    FROM todo_control tc
    WHERE tc.todo_id = p_todo_id;
    
    -- Archivar entradas de tiempo relacionadas
    INSERT INTO archived_todo_time_entries (
        archived_todo_id, original_entry_id, user_id, start_time, end_time,
        duration_minutes, description, original_created_at
    )
    SELECT 
        archived_todo_id, tte.id, tte.user_id, tte.start_time, tte.end_time,
        tte.duration_minutes, tte.description, tte.created_at
    FROM todo_time_entries tte
    WHERE tte.todo_id = p_todo_id;
    
    -- Archivar entradas de tiempo manual relacionadas
    INSERT INTO archived_todo_manual_time_entries (
        archived_todo_id, original_entry_id, user_id, date, hours,
        description, original_created_at
    )
    SELECT 
        archived_todo_id, tmte.id, tmte.user_id, tmte.date, tmte.hours,
        tmte.description, tmte.created_at
    FROM todo_manual_time_entries tmte
    WHERE tmte.todo_id = p_todo_id;
    
    -- Eliminar datos originales
    DELETE FROM todo_control WHERE todo_id = p_todo_id;
    DELETE FROM todo_time_entries WHERE todo_id = p_todo_id;
    DELETE FROM todo_manual_time_entries WHERE todo_id = p_todo_id;
    DELETE FROM todos WHERE id = p_todo_id;
    
    RAISE NOTICE 'TODO archivado: % por usuario: %', p_todo_id, current_user_id;
    RETURN archived_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION archive_todo(UUID, TEXT, UUID) IS 'Archiva un TODO respetando permisos granulares';

-- ================================================================
-- 3. FUNCIÓN PARA RESTAURAR CASO ARCHIVADO
-- ================================================================
CREATE OR REPLACE FUNCTION restore_archived_case(
    p_archived_case_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    restored_case_id UUID;
    current_user_id UUID;
    archived_data RECORD;
    v_scope TEXT;
    can_restore BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para restaurar casos
    IF NOT user_has_permission(current_user_id, 'archive.restore_own') 
       AND NOT user_has_permission(current_user_id, 'archive.restore_team')
       AND NOT user_has_permission(current_user_id, 'archive.restore_all') THEN
        RAISE EXCEPTION 'Sin permisos para restaurar casos';
    END IF;
    
    -- Obtener información del caso archivado
    SELECT * INTO archived_data FROM archived_cases WHERE id = p_archived_case_id;
    
    IF archived_data IS NULL THEN
        RAISE EXCEPTION 'Caso archivado no encontrado';
    END IF;
    
    -- Verificar scope de restauración
    v_scope := get_user_highest_scope(current_user_id, 'archive.restore');
    
    CASE v_scope
        WHEN 'all' THEN
            can_restore := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_restore := true;
        WHEN 'own' THEN
            can_restore := (archived_data.user_id = current_user_id 
                           OR archived_data.assigned_user_id = current_user_id
                           OR archived_data.archived_by_user_id = current_user_id);
        ELSE
            can_restore := false;
    END CASE;
    
    IF NOT can_restore THEN
        RAISE EXCEPTION 'Sin permisos para restaurar este caso';
    END IF;
    
    -- Verificar que el caso original no exista ya
    IF EXISTS (SELECT 1 FROM cases WHERE id = archived_data.original_case_id) THEN
        RAISE EXCEPTION 'Ya existe un caso con el ID original';
    END IF;
    
    -- Restaurar el caso
    INSERT INTO cases (
        id, title, description, status, priority_id,
        assigned_user_id, user_id, created_by_user_id,
        created_at, updated_at
    ) VALUES (
        archived_data.original_case_id, archived_data.title, archived_data.description, 
        archived_data.status, archived_data.priority_id,
        archived_data.assigned_user_id, archived_data.user_id, archived_data.created_by_user_id,
        archived_data.original_created_at, CURRENT_TIMESTAMP
    ) RETURNING id INTO restored_case_id;
    
    -- Restaurar entradas de control
    INSERT INTO case_control (
        case_id, user_id, action, description, created_at
    )
    SELECT 
        restored_case_id, acc.user_id, acc.action, acc.description, acc.original_created_at
    FROM archived_case_control acc
    WHERE acc.archived_case_id = p_archived_case_id;
    
    -- Agregar entrada de restauración
    INSERT INTO case_control (
        case_id, user_id, action, description
    ) VALUES (
        restored_case_id, current_user_id, 'restored',
        format('Caso restaurado desde archivo por %s', 
               (SELECT full_name FROM user_profiles WHERE id = current_user_id))
    );
    
    -- Eliminar datos archivados
    DELETE FROM archived_case_control WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_time_entries WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_manual_time_entries WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_cases WHERE id = p_archived_case_id;
    
    RAISE NOTICE 'Caso restaurado: % por usuario: %', restored_case_id, current_user_id;
    RETURN restored_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION restore_archived_case(UUID, UUID) IS 'Restaura un caso archivado respetando permisos granulares';

-- ================================================================
-- 4. FUNCIÓN PARA RESTAURAR TODO ARCHIVADO
-- ================================================================
CREATE OR REPLACE FUNCTION restore_archived_todo(
    p_archived_todo_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    restored_todo_id UUID;
    current_user_id UUID;
    archived_data RECORD;
    v_scope TEXT;
    can_restore BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para restaurar TODOs
    IF NOT user_has_permission(current_user_id, 'archive.restore_own') 
       AND NOT user_has_permission(current_user_id, 'archive.restore_team')
       AND NOT user_has_permission(current_user_id, 'archive.restore_all') THEN
        RAISE EXCEPTION 'Sin permisos para restaurar TODOs';
    END IF;
    
    -- Obtener información del TODO archivado
    SELECT * INTO archived_data FROM archived_todos WHERE id = p_archived_todo_id;
    
    IF archived_data IS NULL THEN
        RAISE EXCEPTION 'TODO archivado no encontrado';
    END IF;
    
    -- Verificar scope de restauración
    v_scope := get_user_highest_scope(current_user_id, 'archive.restore');
    
    CASE v_scope
        WHEN 'all' THEN
            can_restore := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_restore := true;
        WHEN 'own' THEN
            can_restore := (archived_data.created_by_user_id = current_user_id 
                           OR archived_data.assigned_user_id = current_user_id
                           OR archived_data.archived_by_user_id = current_user_id);
        ELSE
            can_restore := false;
    END CASE;
    
    IF NOT can_restore THEN
        RAISE EXCEPTION 'Sin permisos para restaurar este TODO';
    END IF;
    
    -- Verificar que el TODO original no exista ya
    IF EXISTS (SELECT 1 FROM todos WHERE id = archived_data.original_todo_id) THEN
        RAISE EXCEPTION 'Ya existe un TODO con el ID original';
    END IF;
    
    -- Restaurar el TODO
    INSERT INTO todos (
        id, title, description, is_completed, due_date,
        priority_id, assigned_user_id, case_id, category_id, created_by_user_id,
        created_at, updated_at, completed_at
    ) VALUES (
        archived_data.original_todo_id, archived_data.title, archived_data.description, 
        archived_data.is_completed, archived_data.due_date,
        archived_data.priority_id, archived_data.assigned_user_id, archived_data.case_id, 
        archived_data.category_id, archived_data.created_by_user_id,
        archived_data.original_created_at, CURRENT_TIMESTAMP, archived_data.completed_at
    ) RETURNING id INTO restored_todo_id;
    
    -- Restaurar entradas de control
    INSERT INTO todo_control (
        todo_id, user_id, action, description, created_at
    )
    SELECT 
        restored_todo_id, atc.user_id, atc.action, atc.description, atc.original_created_at
    FROM archived_todo_control atc
    WHERE atc.archived_todo_id = p_archived_todo_id;
    
    -- Agregar entrada de restauración
    INSERT INTO todo_control (
        todo_id, user_id, action, description
    ) VALUES (
        restored_todo_id, current_user_id, 'restored',
        format('TODO restaurado desde archivo por %s', 
               (SELECT full_name FROM user_profiles WHERE id = current_user_id))
    );
    
    -- Eliminar datos archivados
    DELETE FROM archived_todo_control WHERE archived_todo_id = p_archived_todo_id;
    DELETE FROM archived_todo_time_entries WHERE archived_todo_id = p_archived_todo_id;
    DELETE FROM archived_todo_manual_time_entries WHERE archived_todo_id = p_archived_todo_id;
    DELETE FROM archived_todos WHERE id = p_archived_todo_id;
    
    RAISE NOTICE 'TODO restaurado: % por usuario: %', restored_todo_id, current_user_id;
    RETURN restored_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION restore_archived_todo(UUID, UUID) IS 'Restaura un TODO archivado respetando permisos granulares';

-- ================================================================
-- 5. FUNCIÓN PARA OBTENER CASOS ARCHIVADOS ACCESIBLES
-- ================================================================
CREATE OR REPLACE FUNCTION get_accessible_archived_cases(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    original_case_id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority_name TEXT,
    assigned_user_name TEXT,
    owner_user_name TEXT,
    archived_by_user_name TEXT,
    archive_reason TEXT,
    original_created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    can_restore BOOLEAN,
    can_delete BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    v_scope TEXT;
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos de lectura de archivo
    v_scope := get_user_highest_scope(current_user_id, 'archive.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer casos archivados';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            ac.id,
            ac.original_case_id,
            ac.title,
            ac.description,
            ac.status,
            cp.name as priority_name,
            au.full_name as assigned_user_name,
            ou.full_name as owner_user_name,
            abu.full_name as archived_by_user_name,
            ac.archive_reason,
            ac.original_created_at,
            ac.archived_at,
            user_can_access_resource($1, ''archive.restore'', ac.user_id, ac.assigned_user_id) as can_restore,
            user_can_access_resource($1, ''archive.delete'', ac.user_id, ac.assigned_user_id) as can_delete
        FROM archived_cases ac
        LEFT JOIN case_priorities cp ON ac.priority_id = cp.id
        LEFT JOIN user_profiles au ON ac.assigned_user_id = au.id
        LEFT JOIN user_profiles ou ON ac.user_id = ou.id
        LEFT JOIN user_profiles abu ON ac.archived_by_user_id = abu.id';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los casos archivados
            NULL;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            NULL;
        WHEN 'own' THEN
            -- Solo puede ver casos archivados relacionados con él
            where_conditions := array_append(where_conditions, 
                format('(ac.user_id = ''%s'' OR ac.assigned_user_id = ''%s'' OR ac.archived_by_user_id = ''%s'')', 
                       current_user_id, current_user_id, current_user_id));
    END CASE;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || format(' ORDER BY ac.archived_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query USING current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_accessible_archived_cases(UUID, INTEGER, INTEGER) IS 'Obtiene casos archivados accesibles según permisos granulares';

-- ================================================================
-- 6. FUNCIÓN PARA OBTENER TODOS ARCHIVADOS ACCESIBLES
-- ================================================================
CREATE OR REPLACE FUNCTION get_accessible_archived_todos(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    original_todo_id UUID,
    title TEXT,
    description TEXT,
    is_completed BOOLEAN,
    due_date DATE,
    priority_name TEXT,
    assigned_user_name TEXT,
    creator_user_name TEXT,
    archived_by_user_name TEXT,
    archive_reason TEXT,
    original_created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    can_restore BOOLEAN,
    can_delete BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    v_scope TEXT;
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos de lectura de archivo
    v_scope := get_user_highest_scope(current_user_id, 'archive.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer TODOs archivados';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            at.id,
            at.original_todo_id,
            at.title,
            at.description,
            at.is_completed,
            at.due_date,
            tp.name as priority_name,
            au.full_name as assigned_user_name,
            cu.full_name as creator_user_name,
            abu.full_name as archived_by_user_name,
            at.archive_reason,
            at.original_created_at,
            at.archived_at,
            user_can_access_resource($1, ''archive.restore'', at.created_by_user_id, at.assigned_user_id) as can_restore,
            user_can_access_resource($1, ''archive.delete'', at.created_by_user_id, at.assigned_user_id) as can_delete
        FROM archived_todos at
        LEFT JOIN todo_priorities tp ON at.priority_id = tp.id
        LEFT JOIN user_profiles au ON at.assigned_user_id = au.id
        LEFT JOIN user_profiles cu ON at.created_by_user_id = cu.id
        LEFT JOIN user_profiles abu ON at.archived_by_user_id = abu.id';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los TODOs archivados
            NULL;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            NULL;
        WHEN 'own' THEN
            -- Solo puede ver TODOs archivados relacionados con él
            where_conditions := array_append(where_conditions, 
                format('(at.created_by_user_id = ''%s'' OR at.assigned_user_id = ''%s'' OR at.archived_by_user_id = ''%s'')', 
                       current_user_id, current_user_id, current_user_id));
    END CASE;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || format(' ORDER BY at.archived_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query USING current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_accessible_archived_todos(UUID, INTEGER, INTEGER) IS 'Obtiene TODOs archivados accesibles según permisos granulares';

-- ================================================================
-- 7. FUNCIÓN PARA ELIMINAR PERMANENTEMENTE CASO ARCHIVADO
-- ================================================================
CREATE OR REPLACE FUNCTION delete_archived_case_permanently(
    p_archived_case_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    archived_data RECORD;
    v_scope TEXT;
    can_delete BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para eliminar permanentemente
    IF NOT user_has_permission(current_user_id, 'archive.delete_own') 
       AND NOT user_has_permission(current_user_id, 'archive.delete_team')
       AND NOT user_has_permission(current_user_id, 'archive.delete_all') THEN
        RAISE EXCEPTION 'Sin permisos para eliminar casos archivados permanentemente';
    END IF;
    
    -- Obtener información del caso archivado
    SELECT * INTO archived_data FROM archived_cases WHERE id = p_archived_case_id;
    
    IF archived_data IS NULL THEN
        RAISE EXCEPTION 'Caso archivado no encontrado';
    END IF;
    
    -- Verificar scope de eliminación
    v_scope := get_user_highest_scope(current_user_id, 'archive.delete');
    
    CASE v_scope
        WHEN 'all' THEN
            can_delete := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_delete := true;
        WHEN 'own' THEN
            can_delete := (archived_data.user_id = current_user_id 
                          OR archived_data.archived_by_user_id = current_user_id);
        ELSE
            can_delete := false;
    END CASE;
    
    IF NOT can_delete THEN
        RAISE EXCEPTION 'Sin permisos para eliminar este caso archivado';
    END IF;
    
    -- Eliminar todos los datos relacionados
    DELETE FROM archived_case_control WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_time_entries WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_manual_time_entries WHERE archived_case_id = p_archived_case_id;
    DELETE FROM archived_cases WHERE id = p_archived_case_id;
    
    RAISE NOTICE 'Caso archivado eliminado permanentemente: % por usuario: %', p_archived_case_id, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION delete_archived_case_permanently(UUID, UUID) IS 'Elimina permanentemente un caso archivado respetando permisos granulares';

-- ================================================================
-- 8. OTORGAR PERMISOS
-- ================================================================

-- Funciones principales
GRANT EXECUTE ON FUNCTION archive_case(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_todo(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_archived_case(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_archived_todo(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_archived_cases(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_archived_todos(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_archived_case_permanently(UUID, UUID) TO authenticated;

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
        'archive_case', 'archive_todo', 'restore_archived_case', 'restore_archived_todo',
        'get_accessible_archived_cases', 'get_accessible_archived_todos', 'delete_archived_case_permanently'
    );
    
    RAISE NOTICE 'VERIFICACIÓN FINAL - ARCHIVO:';
    RAISE NOTICE '- Funciones creadas: %', function_count;
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '- Usuario de prueba: %', test_user_id;
        
        -- Verificar si puede leer archivo
        IF user_has_permission(test_user_id, 'archive.read_own') OR 
           user_has_permission(test_user_id, 'archive.read_team') OR 
           user_has_permission(test_user_id, 'archive.read_all') THEN
            RAISE NOTICE '- Permisos de lectura archivo: OK';
        ELSE
            RAISE NOTICE '- Permisos de lectura archivo: NO DISPONIBLE';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE ARCHIVO CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
END $$;
