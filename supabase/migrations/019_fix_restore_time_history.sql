-- =====================================================
-- Corrección de Restauración para Preservar Historial de Tiempo
-- =====================================================
-- Fecha: 2025-07-08
-- Descripción: Corrige las funciones de restauración para preservar el historial de tiempo
--             de casos y TODOs cuando se restauran desde el archivo

-- =====================================================
-- NUEVA FUNCIÓN PARA RESTAURAR CASOS CON HISTORIAL DE TIEMPO
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
    v_original_case_id uuid;
    v_control_id uuid;
    v_time_entry JSONB;
    v_manual_entry JSONB;
BEGIN
    -- Obtener datos del caso archivado
    SELECT 
        original_case_id,
        original_data,
        control_data
    INTO 
        v_original_case_id,
        v_original_data,
        v_control_data
    FROM archived_cases 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found or already restored';
    END IF;
    
    -- Recrear el caso original usando los datos JSON
    INSERT INTO cases (
        id,
        numero_caso,
        descripcion,
        clasificacion,
        origen_id,
        aplicacion_id,
        puntuacion,
        historial_caso,
        conocimiento_modulo,
        manipulacion_datos,
        claridad_descripcion,
        causa_fallo,
        fecha,
        user_id,
        created_at,
        updated_at
    ) 
    SELECT 
        (v_original_data->>'id')::uuid,
        v_original_data->>'numero_caso',
        v_original_data->>'descripcion',
        v_original_data->>'clasificacion',
        (v_original_data->>'origen_id')::uuid,
        (v_original_data->>'aplicacion_id')::uuid,
        (v_original_data->>'puntuacion')::integer,
        (v_original_data->>'historial_caso')::integer,
        (v_original_data->>'conocimiento_modulo')::integer,
        (v_original_data->>'manipulacion_datos')::integer,
        (v_original_data->>'claridad_descripcion')::integer,
        (v_original_data->>'causa_fallo')::integer,
        COALESCE((v_original_data->>'fecha')::date, CURRENT_DATE),
        (v_original_data->>'user_id')::uuid,
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_case_id;
    
    -- Recrear el control de caso en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO case_control (
            case_id,
            user_id,
            status_id,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_case_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name = 'PENDIENTE' LIMIT 1), -- Estado pendiente para poder trabajar nuevamente
            COALESCE((v_control_data->>'total_time_minutes')::integer, 0), -- Preservar tiempo total
            NULL, -- Sin fecha de inicio activa
            now(),
            now()
        ) RETURNING id INTO v_control_id;
        
        -- Restaurar entradas de tiempo automáticas si existen
        IF v_control_data ? 'time_entries' AND jsonb_array_length(v_control_data->'time_entries') > 0 THEN
            FOR v_time_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'time_entries')
            LOOP
                INSERT INTO time_entries (
                    case_control_id,
                    user_id,
                    start_time,
                    end_time,
                    duration_minutes,
                    entry_type,
                    description,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_time_entry->>'user_id')::uuid,
                    (v_time_entry->>'start_time')::timestamptz,
                    (v_time_entry->>'end_time')::timestamptz,
                    (v_time_entry->>'duration_minutes')::integer,
                    COALESCE(v_time_entry->>'entry_type', 'automatic'),
                    v_time_entry->>'description',
                    COALESCE((v_time_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
        
        -- Restaurar entradas de tiempo manual si existen
        IF v_control_data ? 'manual_time_entries' AND jsonb_array_length(v_control_data->'manual_time_entries') > 0 THEN
            FOR v_manual_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'manual_time_entries')
            LOOP
                INSERT INTO manual_time_entries (
                    case_control_id,
                    user_id,
                    date,
                    duration_minutes,
                    description,
                    created_by,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_manual_entry->>'user_id')::uuid,
                    (v_manual_entry->>'date')::date,
                    (v_manual_entry->>'duration_minutes')::integer,
                    v_manual_entry->>'description',
                    (v_manual_entry->>'created_by')::uuid,
                    COALESCE((v_manual_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- NUEVA FUNCIÓN PARA RESTAURAR TODOS CON HISTORIAL DE TIEMPO
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
    v_original_todo_id uuid;
    v_control_id uuid;
    v_time_entry JSONB;
    v_manual_entry JSONB;
BEGIN
    -- Obtener datos del TODO archivado
    SELECT 
        original_todo_id,
        original_data,
        control_data
    INTO 
        v_original_todo_id,
        v_original_data,
        v_control_data
    FROM archived_todos 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found or already restored';
    END IF;
    
    -- Recrear el TODO original usando los datos JSON
    INSERT INTO todos (
        id,
        title,
        description,
        priority_id,
        due_date,
        estimated_minutes,
        created_by_user_id,
        assigned_user_id,
        is_completed,
        completed_at,
        created_at,
        updated_at
    ) 
    SELECT 
        (v_original_data->>'id')::uuid,
        v_original_data->>'title',
        v_original_data->>'description',
        (v_original_data->>'priority_id')::uuid,
        CASE 
            WHEN v_original_data->>'due_date' IS NOT NULL 
            THEN (v_original_data->>'due_date')::date 
            ELSE NULL 
        END,
        (v_original_data->>'estimated_minutes')::integer,
        (v_original_data->>'created_by_user_id')::uuid,
        (v_original_data->>'assigned_user_id')::uuid,
        false, -- No completado para poder trabajar nuevamente
        NULL, -- Sin fecha de completado
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_todo_id;
    
    -- Recrear el control de TODO en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO todo_control (
            todo_id,
            user_id,
            status_id,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_todo_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name = 'PENDIENTE' LIMIT 1), -- Estado pendiente para poder trabajar nuevamente
            COALESCE((v_control_data->>'total_time_minutes')::integer, 0), -- Preservar tiempo total
            NULL, -- Sin fecha de inicio activa
            now(),
            now()
        ) RETURNING id INTO v_control_id;
        
        -- Restaurar entradas de tiempo automáticas si existen
        IF v_control_data ? 'time_entries' AND jsonb_array_length(v_control_data->'time_entries') > 0 THEN
            FOR v_time_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'time_entries')
            LOOP
                INSERT INTO todo_time_entries (
                    todo_control_id,
                    user_id,
                    start_time,
                    end_time,
                    duration_minutes,
                    entry_type,
                    description,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_time_entry->>'user_id')::uuid,
                    (v_time_entry->>'start_time')::timestamptz,
                    (v_time_entry->>'end_time')::timestamptz,
                    (v_time_entry->>'duration_minutes')::integer,
                    COALESCE(v_time_entry->>'entry_type', 'automatic'),
                    v_time_entry->>'description',
                    COALESCE((v_time_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
        
        -- Restaurar entradas de tiempo manual si existen
        IF v_control_data ? 'manual_time_entries' AND jsonb_array_length(v_control_data->'manual_time_entries') > 0 THEN
            FOR v_manual_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'manual_time_entries')
            LOOP
                INSERT INTO todo_manual_time_entries (
                    todo_control_id,
                    user_id,
                    date,
                    duration_minutes,
                    description,
                    created_by,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_manual_entry->>'user_id')::uuid,
                    (v_manual_entry->>'date')::date,
                    (v_manual_entry->>'duration_minutes')::integer,
                    v_manual_entry->>'description',
                    (v_manual_entry->>'created_by')::uuid,
                    COALESCE((v_manual_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- MEJORAR FUNCIONES DE ARCHIVADO PARA INCLUIR HISTORIAL DE TIEMPO
-- =====================================================

CREATE OR REPLACE FUNCTION archive_case(
    p_case_id uuid,
    p_archived_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_archived_id uuid;
    v_case_data JSONB;
    v_control_data JSONB;
    v_case_number character varying;
    v_description TEXT;
    v_classification character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
    v_control_id uuid;
    v_time_entries JSONB;
    v_manual_entries JSONB;
BEGIN
    -- Obtener datos del caso y control
    SELECT 
        c.numero_caso,
        c.descripcion,
        c.clasificacion,
        COALESCE(cc.total_time_minutes, 0),
        cc.completed_at,
        cc.id,
        row_to_json(c.*),
        row_to_json(cc.*)
    INTO 
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        v_control_id,
        v_case_data,
        v_control_data
    FROM cases c
    LEFT JOIN case_control cc ON c.id = cc.case_id
    WHERE c.id = p_case_id;
    
    -- Verificar que el caso existe y está terminado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'Case not found or not completed';
    END IF;
    
    -- Obtener entradas de tiempo automáticas si existe control
    IF v_control_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(te.*), '[]'::jsonb)
        INTO v_time_entries
        FROM time_entries te
        WHERE te.case_control_id = v_control_id;
        
        -- Obtener entradas de tiempo manual
        SELECT COALESCE(jsonb_agg(mte.*), '[]'::jsonb)
        INTO v_manual_entries
        FROM manual_time_entries mte
        WHERE mte.case_control_id = v_control_id;
        
        -- Agregar las entradas de tiempo al control_data
        v_control_data = v_control_data || jsonb_build_object(
            'time_entries', v_time_entries,
            'manual_time_entries', v_manual_entries
        );
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_cases (
        original_case_id,
        case_number,
        description,
        classification,
        total_time_minutes,
        completed_at,
        archived_by,
        archive_reason,
        original_data,
        control_data
    ) VALUES (
        p_case_id,
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        p_archived_by,
        p_reason,
        v_case_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el caso original y sus datos relacionados (CASCADE se encarga del resto)
    DELETE FROM cases WHERE id = p_case_id;
    
    RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para archivar TODOs
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
    v_control_id uuid;
    v_time_entries JSONB;
    v_manual_entries JSONB;
BEGIN
    -- Obtener datos del TODO y control
    SELECT 
        t.title,
        t.description,
        tp.name,
        COALESCE(tc.total_time_minutes, 0),
        tc.completed_at,
        tc.id,
        row_to_json(t.*),
        row_to_json(tc.*)
    INTO 
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        v_control_id,
        v_todo_data,
        v_control_data
    FROM todos t
    LEFT JOIN todo_control tc ON t.id = tc.todo_id
    LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
    WHERE t.id = p_todo_id;
    
    -- Verificar que el TODO existe y está completado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'TODO not found or not completed';
    END IF;
    
    -- Obtener entradas de tiempo automáticas si existe control
    IF v_control_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(tte.*), '[]'::jsonb)
        INTO v_time_entries
        FROM todo_time_entries tte
        WHERE tte.todo_control_id = v_control_id;
        
        -- Obtener entradas de tiempo manual
        SELECT COALESCE(jsonb_agg(tmte.*), '[]'::jsonb)
        INTO v_manual_entries
        FROM todo_manual_time_entries tmte
        WHERE tmte.todo_control_id = v_control_id;
        
        -- Agregar las entradas de tiempo al control_data
        v_control_data = v_control_data || jsonb_build_object(
            'time_entries', v_time_entries,
            'manual_time_entries', v_manual_entries
        );
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
        archive_reason,
        original_data,
        control_data
    ) VALUES (
        p_todo_id,
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        p_archived_by,
        p_reason,
        v_todo_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el TODO original y sus datos relacionados (CASCADE se encarga del resto)
    DELETE FROM todos WHERE id = p_todo_id;
    
    RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICAR QUE LAS FUNCIONES DE ARCHIVADO GUARDEN EL HISTORIAL DE TIEMPO
-- =====================================================
-- Nota: Necesitamos verificar que las funciones archive_case y archive_todo
-- estén guardando las entradas de tiempo en el JSON control_data

-- Verifiquemos la función archive_case actual
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'archive_case'
AND routine_schema = 'public';

-- =====================================================
-- COMENTARIOS ACTUALIZADOS
-- =====================================================

COMMENT ON FUNCTION restore_case(uuid, uuid, TEXT) IS 'Restaura un caso archivado recreando los registros originales en estado PENDIENTE y preservando todo el historial de tiempo';
COMMENT ON FUNCTION restore_todo(uuid, uuid, TEXT) IS 'Restaura un TODO archivado recreando los registros originales en estado PENDIENTE y preservando todo el historial de tiempo';
COMMENT ON FUNCTION archive_case(uuid, uuid, TEXT) IS 'Archiva un caso terminado con todos sus datos incluyendo historial completo de tiempo';
COMMENT ON FUNCTION archive_todo(uuid, uuid, TEXT) IS 'Archiva un TODO terminado con todos sus datos incluyendo historial completo de tiempo';
