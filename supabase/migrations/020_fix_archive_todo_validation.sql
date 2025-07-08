-- =====================================================
-- Corrección de Función archive_todo
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Permite archivar TODOs independientemente de su estado de completado

CREATE OR REPLACE FUNCTION archive_todo(
    p_todo_id uuid,
    p_archived_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_archived_id uuid;
    v_todo_data JSONB;
    v_control_data JSONB;
    v_title character varying;
    v_description TEXT;
    v_priority character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
BEGIN
    -- Obtener datos del TODO
    SELECT 
        t.title,
        t.description,
        tp.name,
        COALESCE(tc.total_time_minutes, 0),
        tc.completed_at,
        row_to_json(t.*),
        row_to_json(tc.*)
    INTO 
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        v_todo_data,
        v_control_data
    FROM todos t
    LEFT JOIN todo_control tc ON t.id = tc.todo_id
    LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
    WHERE t.id = p_todo_id;
    
    -- Verificar que el TODO existe (removida validación de completado)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TODO not found';
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_todos (
        original_todo_id,
        title,
        description,
        priority,
        total_time_minutes,
        completed_at,
        archived_by,
        original_data,
        control_data,
        archive_reason
    ) VALUES (
        p_todo_id,
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        p_archived_by,
        v_todo_data,
        v_control_data,
        p_reason
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el TODO original y sus datos relacionados
    DELETE FROM todos WHERE id = p_todo_id;
    
    RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar comentario de la función
COMMENT ON FUNCTION archive_todo(uuid, uuid, TEXT) IS 'Archiva un TODO con todos sus datos - Ya no requiere que esté completado';
