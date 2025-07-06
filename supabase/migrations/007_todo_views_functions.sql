-- Migración: Vistas y funciones útiles para módulo TODO
-- Versión: 2.1.1
-- Fecha: 2025-07-05

-- =====================================================
-- VISTA COMPLETA DE TODOS CON INFORMACIÓN RELACIONADA
-- =====================================================

CREATE OR REPLACE VIEW todos_with_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.due_date,
    t.estimated_minutes,
    t.is_completed,
    t.completed_at,
    t.created_at,
    t.updated_at,
    
    -- Información de prioridad
    tp.name as priority_name,
    tp.description as priority_description,
    tp.color as priority_color,
    tp.level as priority_level,
    
    -- Información del usuario asignado
    up_assigned.id as assigned_user_id,
    up_assigned.full_name as assigned_user_name,
    up_assigned.email as assigned_user_email,
    
    -- Información del creador
    up_created.id as created_by_user_id,
    up_created.full_name as created_by_user_name,
    up_created.email as created_by_user_email,
    
    -- Información del control
    tc.id as control_id,
    tc.total_time_minutes,
    tc.is_timer_active,
    tc.timer_start_at,
    tc.started_at,
    tc.completed_at as control_completed_at,
    
    -- Información del estado
    csc.name as status_name,
    csc.description as status_description,
    csc.color as status_color,
    
    -- Campos calculados
    CASE 
        WHEN t.due_date < CURRENT_DATE AND NOT t.is_completed THEN true
        ELSE false
    END as is_overdue,
    
    CASE 
        WHEN tp.level >= 4 THEN true
        ELSE false
    END as is_high_priority,
    
    -- Tiempo total en formato legible
    CASE 
        WHEN tc.total_time_minutes IS NULL OR tc.total_time_minutes = 0 THEN '0 min'
        WHEN tc.total_time_minutes < 60 THEN tc.total_time_minutes || ' min'
        ELSE 
            (tc.total_time_minutes / 60) || 'h ' || 
            (tc.total_time_minutes % 60) || 'm'
    END as total_time_formatted

FROM todos t
LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
LEFT JOIN user_profiles up_assigned ON t.assigned_user_id = up_assigned.id
LEFT JOIN user_profiles up_created ON t.created_by_user_id = up_created.id
LEFT JOIN todo_control tc ON t.id = tc.todo_id
LEFT JOIN case_status_control csc ON tc.status_id = csc.id;

-- =====================================================
-- VISTA DE RESUMEN DE TIEMPO POR TODO
-- =====================================================

CREATE OR REPLACE VIEW todo_time_summary AS
SELECT 
    t.id as todo_id,
    t.title,
    tc.total_time_minutes,
    
    -- Tiempo automático
    COALESCE(SUM(
        CASE 
            WHEN tte.entry_type = 'automatic' THEN tte.duration_minutes
            ELSE 0
        END
    ), 0) as automatic_time_minutes,
    
    -- Tiempo manual
    COALESCE(SUM(
        CASE 
            WHEN tte.entry_type = 'manual' THEN tte.duration_minutes
            ELSE 0
        END
    ), 0) as manual_time_minutes,
    
    -- Tiempo de entradas manuales separadas
    COALESCE(SUM(tmte.duration_minutes), 0) as manual_entries_time_minutes,
    
    -- Número de sesiones de trabajo
    COUNT(DISTINCT tte.id) as work_sessions_count,
    
    -- Número de entradas manuales
    COUNT(DISTINCT tmte.id) as manual_entries_count,
    
    -- Último trabajo realizado
    MAX(GREATEST(tte.start_time, tmte.created_at)) as last_work_date,
    
    -- Promedio de tiempo por sesión
    CASE 
        WHEN COUNT(DISTINCT tte.id) > 0 THEN 
            COALESCE(SUM(tte.duration_minutes), 0) / COUNT(DISTINCT tte.id)
        ELSE 0
    END as avg_session_minutes

FROM todos t
LEFT JOIN todo_control tc ON t.id = tc.todo_id
LEFT JOIN todo_time_entries tte ON tc.id = tte.todo_control_id
LEFT JOIN todo_manual_time_entries tmte ON tc.id = tmte.todo_control_id
GROUP BY t.id, t.title, tc.total_time_minutes;

-- =====================================================
-- FUNCIÓN PARA INICIALIZAR CONTROL DE TODO
-- =====================================================

CREATE OR REPLACE FUNCTION initialize_todo_control(
    p_todo_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_status_name TEXT DEFAULT 'Pendiente'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_status_id UUID;
    v_control_id UUID;
BEGIN
    -- Determinar el usuario (por defecto el usuario actual)
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener el ID del estado
    SELECT id INTO v_status_id
    FROM case_status_control
    WHERE name = p_status_name
    LIMIT 1;
    
    -- Si no existe el estado, usar el primero disponible
    IF v_status_id IS NULL THEN
        SELECT id INTO v_status_id
        FROM case_status_control
        WHERE is_active = true
        ORDER BY display_order
        LIMIT 1;
    END IF;
    
    -- Crear el control si no existe
    INSERT INTO todo_control (
        todo_id,
        user_id,
        status_id,
        assigned_at
    )
    VALUES (
        p_todo_id,
        v_user_id,
        v_status_id,
        NOW()
    )
    ON CONFLICT (todo_id) DO UPDATE SET
        user_id = v_user_id,
        status_id = v_status_id,
        updated_at = NOW()
    RETURNING id INTO v_control_id;
    
    RETURN v_control_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN PARA INICIAR/PARAR TIMER DE TODO
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_todo_timer(
    p_todo_id UUID,
    p_action TEXT DEFAULT 'toggle' -- 'start', 'stop', 'toggle'
)
RETURNS JSON AS $$
DECLARE
    v_control_id UUID;
    v_is_active BOOLEAN;
    v_start_time TIMESTAMPTZ;
    v_entry_id UUID;
    v_duration INTEGER;
    result JSON;
BEGIN
    -- Obtener información del control
    SELECT id, is_timer_active, timer_start_at
    INTO v_control_id, v_is_active, v_start_time
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si no existe control, crearlo
    IF v_control_id IS NULL THEN
        v_control_id := initialize_todo_control(p_todo_id);
        v_is_active := false;
        v_start_time := NULL;
    END IF;
    
    -- Determinar acción a realizar
    IF p_action = 'start' OR (p_action = 'toggle' AND NOT v_is_active) THEN
        -- Iniciar timer
        UPDATE todo_control 
        SET 
            is_timer_active = true,
            timer_start_at = NOW(),
            started_at = COALESCE(started_at, NOW()),
            updated_at = NOW()
        WHERE id = v_control_id;
        
        -- Actualizar estado a "En Curso" si está en "Pendiente"
        UPDATE todo_control 
        SET status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'En Curso' 
            LIMIT 1
        )
        WHERE id = v_control_id 
        AND status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'Pendiente' 
            LIMIT 1
        );
        
        result := json_build_object(
            'action', 'started',
            'is_active', true,
            'start_time', NOW()
        );
        
    ELSIF p_action = 'stop' OR (p_action = 'toggle' AND v_is_active) THEN
        -- Calcular duración
        v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;
        
        -- Crear entrada de tiempo automática
        INSERT INTO todo_time_entries (
            todo_control_id,
            user_id,
            start_time,
            end_time,
            duration_minutes,
            entry_type,
            description
        )
        VALUES (
            v_control_id,
            auth.uid(),
            v_start_time,
            NOW(),
            v_duration,
            'automatic',
            'Sesión de trabajo automática'
        )
        RETURNING id INTO v_entry_id;
        
        -- Actualizar control
        UPDATE todo_control 
        SET 
            is_timer_active = false,
            timer_start_at = NULL,
            total_time_minutes = total_time_minutes + v_duration,
            updated_at = NOW()
        WHERE id = v_control_id;
        
        result := json_build_object(
            'action', 'stopped',
            'is_active', false,
            'duration_minutes', v_duration,
            'entry_id', v_entry_id
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN PARA COMPLETAR TODO
-- =====================================================

CREATE OR REPLACE FUNCTION complete_todo(p_todo_id UUID)
RETURNS JSON AS $$
DECLARE
    v_control_id UUID;
    v_is_timer_active BOOLEAN;
    result JSON;
BEGIN
    -- Verificar si hay timer activo y detenerlo
    SELECT id, is_timer_active
    INTO v_control_id, v_is_timer_active
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si hay timer activo, detenerlo primero
    IF v_is_timer_active THEN
        PERFORM toggle_todo_timer(p_todo_id, 'stop');
    END IF;
    
    -- Marcar TODO como completado
    UPDATE todos 
    SET 
        is_completed = true,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_todo_id;
    
    -- Actualizar estado del control a "Terminada"
    UPDATE todo_control 
    SET 
        status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'Terminada' 
            LIMIT 1
        ),
        completed_at = NOW(),
        updated_at = NOW()
    WHERE todo_id = p_todo_id;
    
    result := json_build_object(
        'action', 'completed',
        'completed_at', NOW(),
        'todo_id', p_todo_id
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
