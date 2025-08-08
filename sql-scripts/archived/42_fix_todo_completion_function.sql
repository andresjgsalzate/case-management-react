-- Script 42: Función para completar TODOs con privilegios especiales
-- Fecha: 2025-08-08
-- Descripción: Crear función para marcar TODOs como completados con privilegios de definer

-- Función para completar un TODO (con privilegios especiales)
CREATE OR REPLACE FUNCTION complete_todo(
    p_todo_id UUID,
    p_control_id UUID DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutar con privilegios del propietario de la función
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
    v_user_id UUID;
    v_can_complete BOOLEAN := false;
    v_now TIMESTAMPTZ;
BEGIN
    -- Obtener el usuario actual
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado');
    END IF;

    v_now := NOW();

    -- Verificar permisos para completar el TODO
    SELECT 
        CASE 
            WHEN has_permission(v_user_id, 'todos.update_all') THEN true
            WHEN has_permission(v_user_id, 'todos.update_team') THEN true
            WHEN has_permission(v_user_id, 'todos.update_own') THEN 
                (t.created_by_user_id = v_user_id OR t.assigned_user_id = v_user_id)
            ELSE false
        END
    INTO v_can_complete
    FROM todos t
    WHERE t.id = p_todo_id;

    -- Si no encontramos el TODO
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'TODO no encontrado');
    END IF;

    -- Si no tiene permisos
    IF NOT v_can_complete THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sin permisos para completar este TODO');
    END IF;

    -- Marcar el TODO como completado
    UPDATE todos SET
        is_completed = true,
        completed_at = v_now,
        updated_at = v_now
    WHERE id = p_todo_id;

    -- Si se proporcionó un control_id, también actualizar el control
    IF p_control_id IS NOT NULL THEN
        -- Obtener el estado "TERMINADA"
        UPDATE todo_control SET
            status_id = (SELECT id FROM case_status_control WHERE name = 'TERMINADA' LIMIT 1),
            completed_at = v_now,
            is_timer_active = false,
            timer_start_at = null,
            updated_at = v_now
        WHERE id = p_control_id AND todo_id = p_todo_id;
    END IF;

    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'TODO completado exitosamente',
            'completed_at', v_now
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Error al actualizar el TODO');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', SQLSTATE || ': ' || SQLERRM
        );
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION complete_todo(UUID, UUID) TO authenticated;

-- Función para reactivar un TODO (descompletar)
CREATE OR REPLACE FUNCTION reactivate_todo(
    p_todo_id UUID,
    p_control_id UUID DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutar con privilegios del propietario de la función
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
    v_user_id UUID;
    v_can_update BOOLEAN := false;
    v_now TIMESTAMPTZ;
BEGIN
    -- Obtener el usuario actual
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado');
    END IF;

    v_now := NOW();

    -- Verificar permisos para actualizar el TODO
    SELECT 
        CASE 
            WHEN has_permission(v_user_id, 'todos.update_all') THEN true
            WHEN has_permission(v_user_id, 'todos.update_team') THEN true
            WHEN has_permission(v_user_id, 'todos.update_own') THEN 
                (t.created_by_user_id = v_user_id OR t.assigned_user_id = v_user_id)
            ELSE false
        END
    INTO v_can_update
    FROM todos t
    WHERE t.id = p_todo_id;

    -- Si no encontramos el TODO
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'TODO no encontrado');
    END IF;

    -- Si no tiene permisos
    IF NOT v_can_update THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sin permisos para reactivar este TODO');
    END IF;

    -- Marcar el TODO como no completado
    UPDATE todos SET
        is_completed = false,
        completed_at = null,
        updated_at = v_now
    WHERE id = p_todo_id;

    -- Si se proporcionó un control_id, también actualizar el control
    IF p_control_id IS NOT NULL THEN
        -- Cambiar a estado "EN CURSO"
        UPDATE todo_control SET
            status_id = (SELECT id FROM case_status_control WHERE name = 'EN CURSO' LIMIT 1),
            completed_at = null,
            updated_at = v_now
        WHERE id = p_control_id AND todo_id = p_todo_id;
    END IF;

    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'TODO reactivado exitosamente'
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Error al reactivar el TODO');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', SQLSTATE || ': ' || SQLERRM
        );
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION reactivate_todo(UUID, UUID) TO authenticated;

-- Comentario explicativo
COMMENT ON FUNCTION complete_todo(UUID, UUID) IS 'Función para marcar un TODO como completado con verificación de permisos. Parámetros: todo_id, control_id (opcional)';
COMMENT ON FUNCTION reactivate_todo(UUID, UUID) IS 'Función para reactivar (descompletar) un TODO con verificación de permisos. Parámetros: todo_id, control_id (opcional)';
