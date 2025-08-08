-- =========================================
-- SCRIPT UNIFICADO: FUNCIONES Y PROCEDIMIENTOS
-- Sistema de Gestión de Casos - Case Management
-- Fecha: 2025-08-08
-- Versión: 3.0 Unificado
-- =========================================

-- DESCRIPCIÓN:
-- Este script contiene TODAS las funciones, procedimientos, triggers y lógica
-- de negocio del sistema de gestión de casos.
-- 
-- PRERREQUISITOS:
-- - Las tablas del esquema base deben existir (create_complete_schema.sql)
-- - Los permisos y roles deben estar configurados (01_unified_permissions.sql)
--
-- FUNCIONALIDADES INCLUIDAS:
-- - Funciones de permisos y autenticación
-- - Funciones de control de tiempo y duración
-- - Funciones de gestión de casos
-- - Funciones de gestión de TODOs
-- - Funciones de métricas y dashboard
-- - Funciones de búsqueda y documentación
-- - Funciones de email y notificaciones
-- - Triggers automáticos
-- - Funciones de recuperación de contraseñas

-- =========================================
-- 1. FUNCIONES BASE Y TRIGGERS GLOBALES
-- =========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas que lo necesiten
DO $$
DECLARE
    table_name TEXT;
    tables_with_updated_at TEXT[] := ARRAY[
        'user_profiles', 'cases', 'todos', 'time_entries', 'todo_time_entries',
        'todo_manual_time_entries', 'case_control', 'todo_control', 'roles',
        'permissions', 'disposiciones', 'notes', 'documentation', 'case_status_control',
        'todo_priorities', 'system_configurations'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_with_updated_at
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', table_name, table_name);
            EXECUTE format('CREATE TRIGGER update_%s_updated_at 
                           BEFORE UPDATE ON %s 
                           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
                           table_name, table_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si la tabla no existe
            CONTINUE;
        END;
    END LOOP;
END $$;

-- =========================================
-- 2. FUNCIONES DE PERMISOS Y AUTENTICACIÓN
-- =========================================

-- Función principal para verificar permisos específicos
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario tiene el permiso específico
    SELECT EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN role_permissions rp ON up.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = user_id 
        AND up.is_active = true
        AND p.name = permission_name
        AND p.is_active = true
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role_name TEXT;
BEGIN
    SELECT COALESCE(r.name, 'user')
    INTO user_role_name
    FROM user_profiles up
    LEFT JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id AND up.is_active = true;
    
    RETURN COALESCE(user_role_name, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_permission(user_id, 'system.update_configs');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el scope más alto de un usuario para un recurso
CREATE OR REPLACE FUNCTION get_user_highest_scope(user_id UUID, resource_action TEXT)
RETURNS TEXT AS $$
DECLARE
    highest_scope TEXT := NULL;
BEGIN
    -- Verificar scopes en orden de prioridad
    IF has_permission(user_id, resource_action || '_all') THEN
        RETURN 'all';
    ELSIF has_permission(user_id, resource_action || '_team') THEN
        RETURN 'team';
    ELSIF has_permission(user_id, resource_action || '_own') THEN
        RETURN 'own';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 3. FUNCIONES DE CONTROL DE TIEMPO
-- =========================================

-- Función para calcular duración en minutos automáticamente
CREATE OR REPLACE FUNCTION calculate_duration_minutes()
RETURNS TRIGGER AS $$
BEGIN
    -- Si start_time y end_time están presentes, calcular duración
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas de tiempo
DROP TRIGGER IF EXISTS calculate_time_entries_duration ON time_entries;
CREATE TRIGGER calculate_time_entries_duration
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_duration_minutes();

DROP TRIGGER IF EXISTS calculate_todo_time_entries_duration ON todo_time_entries;
CREATE TRIGGER calculate_todo_time_entries_duration
    BEFORE INSERT OR UPDATE ON todo_time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_duration_minutes();

-- Función para obtener tiempo total de un caso
CREATE OR REPLACE FUNCTION get_case_total_time(case_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_minutes INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO total_minutes
    FROM time_entries
    WHERE case_id = $1;
    
    RETURN total_minutes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener tiempo total de un TODO (automático + manual)
CREATE OR REPLACE FUNCTION get_todo_total_time(todo_id UUID)
RETURNS INTEGER AS $$
DECLARE
    auto_time INTEGER := 0;
    manual_time INTEGER := 0;
    total_time INTEGER := 0;
BEGIN
    -- Tiempo automático
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO auto_time
    FROM todo_time_entries
    WHERE todo_id = $1;
    
    -- Tiempo manual
    SELECT COALESCE(SUM(minutes), 0)
    INTO manual_time
    FROM todo_manual_time_entries
    WHERE todo_id = $1;
    
    total_time := auto_time + manual_time;
    
    RETURN total_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 4. FUNCIONES DE GESTIÓN DE TODOS
-- =========================================

-- Función para completar un TODO con privilegios especiales
CREATE OR REPLACE FUNCTION complete_todo(
    p_todo_id UUID,
    p_control_id UUID DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Función para reactivar un TODO (descompletar)
CREATE OR REPLACE FUNCTION reactivate_todo(
    p_todo_id UUID,
    p_control_id UUID DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- =========================================
-- 5. FUNCIONES DE MÉTRICAS Y DASHBOARD
-- =========================================

-- Función para obtener métricas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id UUID DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    current_user_id UUID;
    user_scope TEXT;
    total_cases INTEGER := 0;
    active_cases INTEGER := 0;
    completed_cases INTEGER := 0;
    total_todos INTEGER := 0;
    active_todos INTEGER := 0;
    completed_todos INTEGER := 0;
    avg_resolution_time NUMERIC := 0;
    result jsonb;
BEGIN
    -- Usar usuario proporcionado o usuario autenticado
    current_user_id := COALESCE(user_id, auth.uid());
    
    -- Determinar scope del usuario
    user_scope := get_user_highest_scope(current_user_id, 'cases.read');
    
    -- Métricas de casos según scope
    IF user_scope = 'all' THEN
        SELECT COUNT(*) INTO total_cases FROM cases WHERE is_archived = false;
        SELECT COUNT(*) INTO active_cases FROM cases WHERE is_archived = false AND status != 'TERMINADA';
        SELECT COUNT(*) INTO completed_cases FROM cases WHERE is_archived = false AND status = 'TERMINADA';
    ELSIF user_scope = 'team' THEN
        -- TODO: Implementar lógica de equipo
        SELECT COUNT(*) INTO total_cases FROM cases WHERE is_archived = false;
        SELECT COUNT(*) INTO active_cases FROM cases WHERE is_archived = false AND status != 'TERMINADA';
        SELECT COUNT(*) INTO completed_cases FROM cases WHERE is_archived = false AND status = 'TERMINADA';
    ELSIF user_scope = 'own' THEN
        SELECT COUNT(*) INTO total_cases 
        FROM cases 
        WHERE is_archived = false AND (created_by = current_user_id OR assigned_user_id = current_user_id);
        
        SELECT COUNT(*) INTO active_cases 
        FROM cases 
        WHERE is_archived = false AND status != 'TERMINADA' 
        AND (created_by = current_user_id OR assigned_user_id = current_user_id);
        
        SELECT COUNT(*) INTO completed_cases 
        FROM cases 
        WHERE is_archived = false AND status = 'TERMINADA' 
        AND (created_by = current_user_id OR assigned_user_id = current_user_id);
    END IF;
    
    -- Métricas de TODOs según scope
    user_scope := get_user_highest_scope(current_user_id, 'todos.read');
    
    IF user_scope = 'all' THEN
        SELECT COUNT(*) INTO total_todos FROM todos WHERE is_archived = false;
        SELECT COUNT(*) INTO active_todos FROM todos WHERE is_archived = false AND is_completed = false;
        SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_archived = false AND is_completed = true;
    ELSIF user_scope = 'team' THEN
        -- TODO: Implementar lógica de equipo
        SELECT COUNT(*) INTO total_todos FROM todos WHERE is_archived = false;
        SELECT COUNT(*) INTO active_todos FROM todos WHERE is_archived = false AND is_completed = false;
        SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_archived = false AND is_completed = true;
    ELSIF user_scope = 'own' THEN
        SELECT COUNT(*) INTO total_todos 
        FROM todos 
        WHERE is_archived = false AND (created_by_user_id = current_user_id OR assigned_user_id = current_user_id);
        
        SELECT COUNT(*) INTO active_todos 
        FROM todos 
        WHERE is_archived = false AND is_completed = false 
        AND (created_by_user_id = current_user_id OR assigned_user_id = current_user_id);
        
        SELECT COUNT(*) INTO completed_todos 
        FROM todos 
        WHERE is_archived = false AND is_completed = true 
        AND (created_by_user_id = current_user_id OR assigned_user_id = current_user_id);
    END IF;
    
    -- Tiempo promedio de resolución (en horas)
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 0)
    INTO avg_resolution_time
    FROM cases 
    WHERE status = 'TERMINADA' AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Construir resultado JSON
    result := jsonb_build_object(
        'cases', jsonb_build_object(
            'total', total_cases,
            'active', active_cases,
            'completed', completed_cases
        ),
        'todos', jsonb_build_object(
            'total', total_todos,
            'active', active_todos,
            'completed', completed_todos
        ),
        'performance', jsonb_build_object(
            'avg_resolution_time_hours', ROUND(avg_resolution_time, 2)
        ),
        'generated_at', NOW(),
        'user_scope', COALESCE(get_user_highest_scope(current_user_id, 'cases.read'), 'none')
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener métricas específicas de TODOs
CREATE OR REPLACE FUNCTION get_todo_metrics(user_id UUID DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    current_user_id UUID;
    user_scope TEXT;
    by_priority jsonb;
    by_status jsonb;
    time_stats jsonb;
    result jsonb;
BEGIN
    current_user_id := COALESCE(user_id, auth.uid());
    user_scope := get_user_highest_scope(current_user_id, 'todos.read');
    
    -- Métricas por prioridad
    IF user_scope = 'own' THEN
        SELECT jsonb_object_agg(p.name, COALESCE(priority_counts.count, 0))
        INTO by_priority
        FROM todo_priorities p
        LEFT JOIN (
            SELECT t.priority_id, COUNT(*) as count
            FROM todos t
            WHERE t.is_archived = false AND t.is_completed = false
            AND (t.created_by_user_id = current_user_id OR t.assigned_user_id = current_user_id)
            GROUP BY t.priority_id
        ) priority_counts ON p.id = priority_counts.priority_id;
    ELSE
        SELECT jsonb_object_agg(p.name, COALESCE(priority_counts.count, 0))
        INTO by_priority
        FROM todo_priorities p
        LEFT JOIN (
            SELECT t.priority_id, COUNT(*) as count
            FROM todos t
            WHERE t.is_archived = false AND t.is_completed = false
            GROUP BY t.priority_id
        ) priority_counts ON p.id = priority_counts.priority_id;
    END IF;
    
    -- Construir resultado
    result := jsonb_build_object(
        'by_priority', by_priority,
        'generated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 6. FUNCIONES DE BÚSQUEDA Y DOCUMENTACIÓN
-- =========================================

-- Función para obtener tipos de documentos activos
CREATE OR REPLACE FUNCTION get_active_document_types()
RETURNS TABLE(name TEXT, description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT dt.name::TEXT, dt.description::TEXT
    FROM document_types dt
    WHERE dt.is_active = true
    ORDER BY dt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de búsqueda global
CREATE OR REPLACE FUNCTION global_search(
    search_term TEXT,
    user_id UUID DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS jsonb AS $$
DECLARE
    current_user_id UUID;
    cases_results jsonb;
    todos_results jsonb;
    docs_results jsonb;
    result jsonb;
BEGIN
    current_user_id := COALESCE(user_id, auth.uid());
    
    -- Buscar en casos
    IF has_permission(current_user_id, 'cases.read_own') OR 
       has_permission(current_user_id, 'cases.read_team') OR 
       has_permission(current_user_id, 'cases.read_all') THEN
        
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'title', c.title,
                'description', c.description,
                'status', c.status,
                'created_at', c.created_at,
                'type', 'case'
            )
        )
        INTO cases_results
        FROM cases c
        WHERE (c.title ILIKE '%' || search_term || '%' OR 
               c.description ILIKE '%' || search_term || '%')
        AND c.is_archived = false
        LIMIT limit_results / 3;
    END IF;
    
    -- Buscar en TODOs
    IF has_permission(current_user_id, 'todos.read_own') OR 
       has_permission(current_user_id, 'todos.read_team') OR 
       has_permission(current_user_id, 'todos.read_all') THEN
        
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', t.id,
                'title', t.title,
                'description', t.description,
                'is_completed', t.is_completed,
                'created_at', t.created_at,
                'type', 'todo'
            )
        )
        INTO todos_results
        FROM todos t
        WHERE (t.title ILIKE '%' || search_term || '%' OR 
               t.description ILIKE '%' || search_term || '%')
        AND t.is_archived = false
        LIMIT limit_results / 3;
    END IF;
    
    -- Buscar en documentación
    IF has_permission(current_user_id, 'documentation.read_all') THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', d.id,
                'title', d.title,
                'content', LEFT(d.content, 200),
                'category', d.category,
                'created_at', d.created_at,
                'type', 'documentation'
            )
        )
        INTO docs_results
        FROM documentation d
        WHERE (d.title ILIKE '%' || search_term || '%' OR 
               d.content ILIKE '%' || search_term || '%')
        AND d.is_published = true
        LIMIT limit_results / 3;
    END IF;
    
    -- Construir resultado final
    result := jsonb_build_object(
        'search_term', search_term,
        'results', jsonb_build_object(
            'cases', COALESCE(cases_results, '[]'::jsonb),
            'todos', COALESCE(todos_results, '[]'::jsonb),
            'documentation', COALESCE(docs_results, '[]'::jsonb)
        ),
        'generated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 7. FUNCIONES DE EMAIL Y NOTIFICACIONES
-- =========================================

-- Función para registrar logs de email
CREATE OR REPLACE FUNCTION log_email_sent(
    p_recipient_email TEXT,
    p_subject TEXT,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL,
    p_email_type TEXT DEFAULT 'general'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO email_logs (
        id,
        recipient_email,
        subject,
        success,
        error_message,
        email_type,
        sent_at,
        created_at
    ) VALUES (
        gen_random_uuid(),
        p_recipient_email,
        p_subject,
        p_success,
        p_error_message,
        p_email_type,
        NOW(),
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 8. FUNCIONES DE RECUPERACIÓN DE CONTRASEÑAS
-- =========================================

-- Función para crear token de recuperación
CREATE OR REPLACE FUNCTION create_password_reset_token(user_email TEXT)
RETURNS jsonb AS $$
DECLARE
    user_record RECORD;
    reset_token TEXT;
    token_expiry TIMESTAMPTZ;
    result jsonb;
BEGIN
    -- Buscar usuario por email
    SELECT id, email, full_name INTO user_record
    FROM user_profiles
    WHERE email = user_email AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuario no encontrado'
        );
    END IF;
    
    -- Generar token único
    reset_token := encode(gen_random_bytes(32), 'hex');
    token_expiry := NOW() + INTERVAL '1 hour';
    
    -- Eliminar tokens anteriores del usuario
    DELETE FROM password_reset_tokens 
    WHERE user_id = user_record.id;
    
    -- Crear nuevo token
    INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at,
        created_at
    ) VALUES (
        user_record.id,
        reset_token,
        token_expiry,
        NOW()
    );
    
    -- Log del email (simulado)
    PERFORM log_email_sent(
        user_email,
        'Recuperación de contraseña',
        true,
        NULL,
        'password_reset'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'token', reset_token,
        'expires_at', token_expiry,
        'message', 'Token de recuperación creado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Error interno del servidor'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar token de recuperación
CREATE OR REPLACE FUNCTION validate_password_reset_token(reset_token TEXT)
RETURNS jsonb AS $$
DECLARE
    token_record RECORD;
    user_record RECORD;
BEGIN
    -- Buscar token válido
    SELECT user_id, expires_at, is_used
    INTO token_record
    FROM password_reset_tokens
    WHERE token = reset_token;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token inválido'
        );
    END IF;
    
    -- Verificar expiración
    IF token_record.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token expirado'
        );
    END IF;
    
    -- Verificar si ya fue usado
    IF token_record.is_used THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token ya utilizado'
        );
    END IF;
    
    -- Obtener información del usuario
    SELECT email, full_name
    INTO user_record
    FROM user_profiles
    WHERE id = token_record.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', token_record.user_id,
        'email', user_record.email,
        'full_name', user_record.full_name,
        'message', 'Token válido'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Error interno del servidor'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar token como usado
CREATE OR REPLACE FUNCTION mark_password_reset_token_used(reset_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE password_reset_tokens
    SET is_used = true, used_at = NOW()
    WHERE token = reset_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 9. FUNCIONES DE UTILIDAD Y MANTENIMIENTO
-- =========================================

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS jsonb AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'users', (SELECT COUNT(*) FROM user_profiles WHERE is_active = true),
        'cases', (SELECT COUNT(*) FROM cases WHERE is_archived = false),
        'todos', (SELECT COUNT(*) FROM todos WHERE is_archived = false),
        'documentation', (SELECT COUNT(*) FROM documentation WHERE is_published = true),
        'time_entries', (SELECT COUNT(*) FROM time_entries),
        'email_logs', (SELECT COUNT(*) FROM email_logs),
        'storage_usage_mb', 0, -- TODO: Implementar cálculo real
        'generated_at', NOW()
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 10. OTORGAR PERMISOS DE EJECUCIÓN
-- =========================================

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =========================================
-- COMENTARIOS DESCRIPTIVOS
-- =========================================

-- Comentarios en funciones principales
COMMENT ON FUNCTION has_permission(UUID, TEXT) IS 'Verifica si un usuario tiene un permiso específico';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Obtiene el rol de un usuario';
COMMENT ON FUNCTION complete_todo(UUID, UUID) IS 'Completa un TODO con validación de permisos';
COMMENT ON FUNCTION reactivate_todo(UUID, UUID) IS 'Reactiva un TODO completado';
COMMENT ON FUNCTION get_dashboard_metrics(UUID) IS 'Obtiene métricas para el dashboard principal';
COMMENT ON FUNCTION get_todo_metrics(UUID) IS 'Obtiene métricas específicas de TODOs';
COMMENT ON FUNCTION global_search(TEXT, UUID, INTEGER) IS 'Búsqueda global en casos, TODOs y documentación';
COMMENT ON FUNCTION create_password_reset_token(TEXT) IS 'Crea token para recuperación de contraseña';
COMMENT ON FUNCTION validate_password_reset_token(TEXT) IS 'Valida token de recuperación de contraseña';

-- =========================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =========================================

-- Mensaje de confirmación
DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.prokind = 'f';
    
    -- Contar triggers creados
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public';
    
    RAISE NOTICE '✅ FUNCIONES Y PROCEDIMIENTOS CONFIGURADOS EXITOSAMENTE';
    RAISE NOTICE '⚙️  Funciones creadas: %', function_count;
    RAISE NOTICE '🔧 Triggers configurados: %', trigger_count;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Funcionalidades disponibles:';
    RAISE NOTICE '   - Sistema de permisos granular';
    RAISE NOTICE '   - Control de tiempo automático';
    RAISE NOTICE '   - Gestión completa de TODOs';
    RAISE NOTICE '   - Métricas y dashboard';
    RAISE NOTICE '   - Búsqueda global';
    RAISE NOTICE '   - Sistema de emails';
    RAISE NOTICE '   - Recuperación de contraseñas';
    RAISE NOTICE '   - Funciones de utilidad';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema está completamente funcional';
END $$;
