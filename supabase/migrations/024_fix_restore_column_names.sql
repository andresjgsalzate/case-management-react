-- =====================================================
-- Corrección de Funciones de Restauración
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Corrige las funciones de restauración para usar los nombres
--              de columnas correctos según la estructura actual de la DB

-- =====================================================
-- FUNCIÓN CORREGIDA PARA RESTAURAR CASOS
-- =====================================================

CREATE OR REPLACE FUNCTION restore_case(
    p_archived_id uuid,
    p_restored_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_case_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
    v_existing_case_id uuid;
BEGIN
    -- Obtener datos del caso archivado
    SELECT 
        original_data,
        control_data,
        original_case_id
    INTO 
        v_original_data,
        v_control_data,
        v_existing_case_id
    FROM archived_cases 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found or already restored';
    END IF;
    
    -- Verificar si el caso original ya existe (por si fue restaurado antes)
    IF EXISTS (SELECT 1 FROM cases WHERE id = v_existing_case_id) THEN
        RAISE EXCEPTION 'Case already exists in the main table';
    END IF;
    
    -- Recrear el caso original usando la estructura REAL de la tabla cases
    INSERT INTO cases (
        id,
        numero_caso,
        descripcion,
        fecha,
        origen_id,
        aplicacion_id,
        historial_caso,
        conocimiento_modulo,
        manipulacion_datos,
        claridad_descripcion,
        causa_fallo,
        puntuacion,
        clasificacion,
        created_at,
        updated_at,
        user_id
    ) 
    VALUES (
        v_existing_case_id,
        COALESCE(v_original_data->>'numero_caso', 'RESTORED-' || extract(epoch from now())::text),
        COALESCE(v_original_data->>'descripcion', 'Caso restaurado'),
        COALESCE((v_original_data->>'fecha')::date, CURRENT_DATE),
        (v_original_data->>'origen_id')::uuid,
        (v_original_data->>'aplicacion_id')::uuid,
        COALESCE((v_original_data->>'historial_caso')::integer, 1),
        COALESCE((v_original_data->>'conocimiento_modulo')::integer, 1),
        COALESCE((v_original_data->>'manipulacion_datos')::integer, 1),
        COALESCE((v_original_data->>'claridad_descripcion')::integer, 1),
        COALESCE((v_original_data->>'causa_fallo')::integer, 1),
        COALESCE((v_original_data->>'puntuacion')::integer, 5),
        COALESCE(v_original_data->>'clasificacion', 'Baja Complejidad'),
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now(),
        (v_original_data->>'user_id')::uuid
    )
    RETURNING id INTO v_case_id;
    
    -- Recrear el control de caso en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        -- Obtener un status_id para "pendiente" (asumiendo que existe)
        INSERT INTO case_control (
            case_id,
            user_id,
            status_id,
            total_time_minutes,
            assigned_at,
            created_at,
            updated_at
        ) VALUES (
            v_case_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name ILIKE 'pendiente' LIMIT 1),
            0, -- Reiniciar tiempo
            now(),
            now(),
            now()
        );
    END IF;
    
    -- Marcar como restaurado en el archivo
    UPDATE archived_cases 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN CORREGIDA PARA RESTAURAR TODOS
-- =====================================================

CREATE OR REPLACE FUNCTION restore_todo(
    p_archived_id uuid,
    p_restored_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_todo_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
    v_existing_todo_id uuid;
BEGIN
    -- Obtener datos del TODO archivado
    SELECT 
        original_data,
        control_data,
        original_todo_id
    INTO 
        v_original_data,
        v_control_data,
        v_existing_todo_id
    FROM archived_todos 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found or already restored';
    END IF;
    
    -- Verificar si el TODO original ya existe (por si fue restaurado antes)
    IF EXISTS (SELECT 1 FROM todos WHERE id = v_existing_todo_id) THEN
        RAISE EXCEPTION 'TODO already exists in the main table';
    END IF;
    
    -- Recrear el TODO original usando la estructura REAL de la tabla todos
    INSERT INTO todos (
        id,
        title,
        description,
        priority_id,
        assigned_user_id,
        created_by_user_id,
        due_date,
        estimated_minutes,
        is_completed,
        completed_at,
        created_at,
        updated_at
    ) 
    VALUES (
        v_existing_todo_id,
        COALESCE(v_original_data->>'title', 'TODO Restaurado'),
        v_original_data->>'description',
        (v_original_data->>'priority_id')::uuid,
        (v_original_data->>'assigned_user_id')::uuid,
        (v_original_data->>'created_by_user_id')::uuid,
        (v_original_data->>'due_date')::date,
        COALESCE((v_original_data->>'estimated_minutes')::integer, 0),
        false, -- Volver a estado no completado
        NULL, -- Sin fecha de completado
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now()
    )
    RETURNING id INTO v_todo_id;
    
    -- Recrear el control de TODO en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO todo_control (
            todo_id,
            user_id,
            status_id,
            total_time_minutes,
            assigned_at,
            created_at,
            updated_at
        ) VALUES (
            v_todo_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name ILIKE 'pendiente' LIMIT 1),
            0, -- Reiniciar tiempo
            now(),
            now(),
            now()
        );
    END IF;
    
    -- Marcar como restaurado en el archivo
    UPDATE archived_todos 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios actualizados
COMMENT ON FUNCTION restore_case(uuid, uuid, TEXT) IS 'Restaura un caso archivado recreando el registro original - Nombres de columnas corregidos';
COMMENT ON FUNCTION restore_todo(uuid, uuid, TEXT) IS 'Restaura un TODO archivado recreando el registro original - Nombres de columnas corregidos';
