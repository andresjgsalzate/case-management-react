-- =====================================================
-- Corrección de Función restore_case - Columnas Inexistentes
-- =====================================================
-- Fecha: 2025-07-08
-- Descripción: Corrige la función restore_case para que solo use columnas que existen en la tabla cases

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
    
    -- Recrear el caso original usando los datos JSON (solo columnas que existen)
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
-- COMENTARIO ACTUALIZADO
-- =====================================================

COMMENT ON FUNCTION restore_case(uuid, uuid, TEXT) IS 'Restaura un caso archivado recreando los registros originales en estado PENDIENTE y preservando todo el historial de tiempo - Versión corregida sin columnas inexistentes';
