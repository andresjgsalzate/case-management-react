-- =====================================================
-- Corrección de Funciones de Archivo y Restauración
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Corrige las funciones de archivo y restauración para:
--             1. Restaurar casos/TODOs recreando los registros originales en estado "pendiente"
--             2. Asegurar que el archivado elimine completamente los registros originales

-- =====================================================
-- CORREGIR FUNCIÓN DE RESTAURACIÓN DE CASOS
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
        complejidad,
        puntuacion,
        is_active,
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
        v_original_data->>'complejidad',
        (v_original_data->>'puntuacion')::integer,
        COALESCE((v_original_data->>'is_active')::boolean, true),
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_case_id;
    
    -- Recrear el control de caso en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO case_control (
            case_id,
            user_id,
            status,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_case_id,
            (v_control_data->>'user_id')::uuid,
            'PENDIENTE', -- Estado pendiente para poder trabajar nuevamente
            0, -- Reiniciar tiempo
            NULL, -- Sin fecha de inicio
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
        restored_reason = p_reason,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_case_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORREGIR FUNCIÓN DE RESTAURACIÓN DE TODOS
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
        status,
        due_date,
        created_by_user_id,
        is_active,
        created_at,
        updated_at
    ) 
    SELECT 
        (v_original_data->>'id')::uuid,
        v_original_data->>'title',
        v_original_data->>'description',
        (v_original_data->>'priority_id')::uuid,
        'pendiente', -- Estado pendiente para poder trabajar nuevamente
        CASE 
            WHEN v_original_data->>'due_date' IS NOT NULL 
            THEN (v_original_data->>'due_date')::timestamptz 
            ELSE NULL 
        END,
        (v_original_data->>'created_by_user_id')::uuid,
        COALESCE((v_original_data->>'is_active')::boolean, true),
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_todo_id;
    
    -- Recrear el control de TODO en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO todo_control (
            todo_id,
            user_id,
            status,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_todo_id,
            (v_control_data->>'user_id')::uuid,
            'PENDIENTE', -- Estado pendiente para poder trabajar nuevamente
            0, -- Reiniciar tiempo
            NULL, -- Sin fecha de inicio
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
        restored_reason = p_reason,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_todo_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICAR Y CORREGIR FUNCIÓN DE ARCHIVADO DE CASOS
-- =====================================================

-- La función archive_case ya elimina correctamente con:
-- DELETE FROM cases WHERE id = p_case_id;
-- Esto elimina el caso y por CASCADE también el case_control

-- =====================================================
-- VERIFICAR Y CORREGIR FUNCIÓN DE ARCHIVADO DE TODOS
-- =====================================================

-- La función archive_todo ya elimina correctamente con:
-- DELETE FROM todos WHERE id = p_todo_id;
-- Esto elimina el TODO y por CASCADE también el todo_control

-- =====================================================
-- COMENTARIOS ACTUALIZADOS
-- =====================================================

COMMENT ON FUNCTION restore_case(uuid, uuid, TEXT) IS 'Restaura un caso archivado recreando los registros originales en estado PENDIENTE';
COMMENT ON FUNCTION restore_todo(uuid, uuid, TEXT) IS 'Restaura un TODO archivado recreando los registros originales en estado PENDIENTE';
