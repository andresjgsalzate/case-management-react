-- ================================================================
-- SCRIPT DE LIMPIEZA: ELIMINACIÓN DE FUNCIONES V2 Y RECIENTES
-- ================================================================
-- Descripción: Elimina todas las funciones v2 y recientes no originales
-- Fecha: 4 de Agosto, 2025
-- Versión: 1.0.0
-- ================================================================
-- IMPORTANTE: Este script elimina funciones agregadas posteriormente
-- y mantiene solo las funciones básicas originales del sistema
-- ================================================================

-- ================================================================
-- ELIMINAR FUNCIONES V2 Y DE BÚSQUEDA AVANZADA
-- ================================================================

-- Funciones de búsqueda v2 y autocomplete
DROP FUNCTION IF EXISTS search_cases_autocomplete(TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS search_cases_autocomplete(TEXT);
DROP FUNCTION IF EXISTS search_docs_v2(text);
DROP FUNCTION IF EXISTS search_docs_v2(text, int);
DROP FUNCTION IF EXISTS search_solution_documents(text, uuid[], text[], integer, integer);
DROP FUNCTION IF EXISTS search_solution_documents_advanced(text, uuid[], text[], integer, integer);
DROP FUNCTION IF EXISTS search_documents_simple(text);
DROP FUNCTION IF EXISTS search_documents_full(text, text[], uuid[], text, integer, integer);
DROP FUNCTION IF EXISTS quick_search_documents(text, integer);
DROP FUNCTION IF EXISTS get_search_suggestions(text, integer);
DROP FUNCTION IF EXISTS update_solution_documents_search_vectors();

-- ================================================================
-- ELIMINAR FUNCIONES DE ADMINISTRACIÓN AVANZADA
-- ================================================================

-- Funciones admin bypass (no originales)
DROP FUNCTION IF EXISTS admin_update_role(uuid, text, text, boolean);
DROP FUNCTION IF EXISTS admin_update_aplicacion(uuid, text, text, boolean);
DROP FUNCTION IF EXISTS admin_update_origen(uuid, text, text, boolean);
DROP FUNCTION IF EXISTS admin_update_user(uuid, text, text, uuid, boolean);
DROP FUNCTION IF EXISTS admin_delete_user(uuid);
DROP FUNCTION IF EXISTS admin_update_permission(uuid, text, text);
DROP FUNCTION IF EXISTS admin_delete_permission(uuid);
DROP FUNCTION IF EXISTS admin_create_permission(text, text);
DROP FUNCTION IF EXISTS admin_create_origen(text, text);
DROP FUNCTION IF EXISTS admin_delete_origen(uuid);
DROP FUNCTION IF EXISTS admin_create_aplicacion(text, text);
DROP FUNCTION IF EXISTS admin_delete_aplicacion(uuid);

-- ================================================================
-- ELIMINAR FUNCIONES DE ARCHIVO AVANZADAS
-- ================================================================

-- Funciones de eliminación permanente (no originales)
DROP FUNCTION IF EXISTS delete_archived_case_permanently(uuid, text);
DROP FUNCTION IF EXISTS delete_archived_todo_permanently(uuid, text);
DROP FUNCTION IF EXISTS can_delete_archived_items(uuid);

-- Funciones de estadísticas de archivo (no originales)
DROP FUNCTION IF EXISTS get_archive_stats();
DROP FUNCTION IF EXISTS get_archive_stats_monthly();
DROP FUNCTION IF EXISTS cleanup_orphaned_records();

-- ================================================================
-- ELIMINAR FUNCIONES DE DOCUMENTACIÓN AVANZADAS
-- ================================================================

-- Funciones del módulo de documentación (no originales)
DROP FUNCTION IF EXISTS get_solution_document_stats();
DROP FUNCTION IF EXISTS get_documents_by_case(uuid);
DROP FUNCTION IF EXISTS increment_document_views(uuid);
DROP FUNCTION IF EXISTS get_popular_documents(integer);
DROP FUNCTION IF EXISTS get_available_templates();
DROP FUNCTION IF EXISTS create_document_version(uuid, text, jsonb, text[]);
DROP FUNCTION IF EXISTS validate_case_reference();
DROP FUNCTION IF EXISTS update_tag_usage_count();
DROP FUNCTION IF EXISTS preserve_documentation_on_case_archive();
DROP FUNCTION IF EXISTS restore_documentation_on_case_restore();
DROP FUNCTION IF EXISTS validate_case_exists(text);

-- Funciones de triggers documentación
DROP FUNCTION IF EXISTS update_solution_document_updated_at();
DROP FUNCTION IF EXISTS increment_document_view_count();

-- ================================================================
-- ELIMINAR FUNCIONES DE NOTAS AVANZADAS
-- ================================================================

-- Funciones del módulo de notas (no originales)
DROP FUNCTION IF EXISTS can_view_note(uuid, uuid);
DROP FUNCTION IF EXISTS search_notes(text, uuid, boolean, text[], text, integer, integer);
DROP FUNCTION IF EXISTS get_notes_stats(uuid);
DROP FUNCTION IF EXISTS update_notes_updated_at();

-- ================================================================
-- ELIMINAR FUNCIONES DE STORAGE Y ADJUNTOS
-- ================================================================

-- Funciones de storage (no originales)
DROP FUNCTION IF EXISTS cleanup_orphaned_files();
DROP FUNCTION IF EXISTS get_storage_stats();
DROP FUNCTION IF EXISTS update_document_attachments_updated_at();

-- ================================================================
-- ELIMINAR FUNCIONES DE VALIDACIÓN Y DISPOSICIONES
-- ================================================================

-- Funciones de validación de casos (no originales)
DROP FUNCTION IF EXISTS validate_case_number(text);

-- Funciones de sistema (no originales)
DROP FUNCTION IF EXISTS has_system_access();
DROP FUNCTION IF EXISTS archive_audit_trigger();

-- ================================================================
-- ELIMINAR FUNCIONES DE PERMISOS AVANZADOS
-- ================================================================

-- Funciones de permisos complejos (no originales)
DROP FUNCTION IF EXISTS can_archive_items(uuid);
DROP FUNCTION IF EXISTS can_restore_items(uuid);

-- ================================================================
-- ELIMINAR FUNCIONES DE PRUEBA
-- ================================================================

-- Funciones de testing (no originales)
DROP FUNCTION IF EXISTS test_get_cases();

-- ================================================================
-- RESTAURAR SOLO LAS FUNCIONES ORIGINALES BÁSICAS
-- ================================================================

-- ================================================================
-- 1. FUNCIÓN DE ACTUALIZACIÓN DE TIMESTAMPS (ORIGINAL)
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================================================
-- 2. FUNCIÓN DE MÉTRICAS DEL DASHBOARD (ORIGINAL)
-- ================================================================

CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_cases INTEGER;
    completed_cases INTEGER;
    pending_cases INTEGER;
    in_progress_cases INTEGER;
    user_role TEXT;
    is_user_active BOOLEAN;
BEGIN
    -- Obtener rol y estado del usuario
    SELECT role_name, is_active INTO user_role, is_user_active
    FROM user_profiles 
    WHERE id = COALESCE(user_id, auth.uid());
    
    -- Si el usuario no está activo, devolver métricas vacías
    IF NOT is_user_active THEN
        RETURN json_build_object(
            'totalCases', 0,
            'completedCases', 0,
            'pendingCases', 0,
            'inProgressCases', 0,
            'userRole', user_role,
            'isActive', is_user_active
        );
    END IF;
    
    -- Contar casos según el rol del usuario
    IF user_role IN ('admin', 'supervisor') THEN
        -- Admin y supervisor ven todos los casos
        SELECT COUNT(*) INTO total_cases FROM cases;
        
        SELECT COUNT(*) INTO completed_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'Terminada';
        
        SELECT COUNT(*) INTO pending_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'Pendiente';
        
        SELECT COUNT(*) INTO in_progress_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'En Curso';
        
    ELSE
        -- Analistas solo ven sus casos
        SELECT COUNT(*) INTO total_cases 
        FROM cases c 
        WHERE c.created_by = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO completed_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'Terminada' 
        AND c.created_by = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO pending_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'Pendiente' 
        AND c.created_by = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO in_progress_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'En Curso' 
        AND c.created_by = COALESCE(user_id, auth.uid());
    END IF;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalCases', total_cases,
        'completedCases', completed_cases,
        'pendingCases', pending_cases,
        'inProgressCases', in_progress_cases,
        'userRole', user_role,
        'isActive', is_user_active
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. FUNCIÓN DE MÉTRICAS DE TODO (ORIGINAL)
-- ================================================================

CREATE OR REPLACE FUNCTION get_todo_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_todos INTEGER;
    completed_todos INTEGER;
    pending_todos INTEGER;
    in_progress_todos INTEGER;
    overdue_todos INTEGER;
    high_priority_todos INTEGER;
    user_role TEXT;
    is_user_active BOOLEAN;
BEGIN
    -- Obtener rol y estado del usuario
    SELECT role_name, is_active INTO user_role, is_user_active
    FROM user_profiles 
    WHERE id = COALESCE(user_id, auth.uid());
    
    -- Si el usuario no está activo, devolver métricas vacías
    IF NOT is_user_active THEN
        RETURN json_build_object(
            'totalTodos', 0,
            'completedTodos', 0,
            'pendingTodos', 0,
            'inProgressTodos', 0,
            'overdueTodos', 0,
            'highPriorityTodos', 0,
            'userRole', user_role,
            'isActive', is_user_active
        );
    END IF;
    
    -- Contar TODOs según el rol del usuario
    IF user_role IN ('admin', 'supervisor') THEN
        -- Admin y supervisor ven todos los TODOs
        SELECT COUNT(*) INTO total_todos FROM todos;
        
        SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
        
        SELECT COUNT(*) INTO pending_todos 
        FROM todos t
        LEFT JOIN todo_control tc ON t.id = tc.todo_id
        WHERE t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        WHERE t.is_completed = false AND tc.start_time IS NOT NULL AND tc.end_time IS NULL;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos 
        WHERE due_date < CURRENT_DATE AND is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE tp.level >= 4 AND t.is_completed = false;
        
    ELSE
        -- Analistas solo ven sus TODOs
        SELECT COUNT(*) INTO total_todos 
        FROM todos t
        WHERE t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO completed_todos 
        FROM todos t
        WHERE (t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid()))
        AND t.is_completed = true;
        
        SELECT COUNT(*) INTO pending_todos 
        FROM todos t
        LEFT JOIN todo_control tc ON t.id = tc.todo_id
        WHERE (t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid()))
        AND t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        WHERE (t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid()))
        AND t.is_completed = false AND tc.start_time IS NOT NULL AND tc.end_time IS NULL;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos t
        WHERE (t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid()))
        AND t.due_date < CURRENT_DATE AND t.is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE (t.created_by_user_id = COALESCE(user_id, auth.uid()) 
        OR t.assigned_user_id = COALESCE(user_id, auth.uid()))
        AND tp.level >= 4 AND t.is_completed = false;
    END IF;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalTodos', total_todos,
        'completedTodos', completed_todos,
        'pendingTodos', pending_todos,
        'inProgressTodos', in_progress_todos,
        'overdueTodos', overdue_todos,
        'highPriorityTodos', high_priority_todos,
        'userRole', user_role,
        'isActive', is_user_active
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. FUNCIONES DE TODO BÁSICAS (ORIGINALES)
-- ================================================================

-- Función para inicializar control de TODO
CREATE OR REPLACE FUNCTION initialize_todo_control(
    p_todo_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_control_id UUID;
BEGIN
    -- Determinar el usuario (por defecto el usuario actual)
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Crear el control si no existe
    INSERT INTO todo_control (
        todo_id,
        assigned_user_id,
        status,
        created_at
    )
    VALUES (
        p_todo_id,
        v_user_id,
        'Pendiente',
        NOW()
    )
    ON CONFLICT (todo_id) DO UPDATE SET
        assigned_user_id = v_user_id,
        updated_at = NOW()
    RETURNING id INTO v_control_id;
    
    RETURN v_control_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para iniciar/parar timer de TODO (simplificada)
CREATE OR REPLACE FUNCTION toggle_todo_timer(
    p_todo_id UUID,
    p_action TEXT DEFAULT 'toggle'
)
RETURNS JSON AS $$
DECLARE
    v_control_id UUID;
    v_start_time TIMESTAMPTZ;
    v_entry_id UUID;
    v_duration INTEGER;
    result JSON;
BEGIN
    -- Obtener información del control
    SELECT id, start_time
    INTO v_control_id, v_start_time
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si no existe control, crearlo
    IF v_control_id IS NULL THEN
        v_control_id := initialize_todo_control(p_todo_id);
        v_start_time := NULL;
    END IF;
    
    -- Determinar acción a realizar
    IF p_action = 'start' OR (p_action = 'toggle' AND v_start_time IS NULL) THEN
        -- Iniciar timer
        UPDATE todo_control 
        SET 
            start_time = NOW(),
            status = 'En Curso',
            updated_at = NOW()
        WHERE id = v_control_id;
        
        result := json_build_object(
            'action', 'started',
            'start_time', NOW()
        );
        
    ELSIF p_action = 'stop' OR (p_action = 'toggle' AND v_start_time IS NOT NULL) THEN
        -- Calcular duración
        v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;
        
        -- Crear entrada de tiempo
        INSERT INTO todo_time_entries (
            todo_control_id,
            start_time,
            end_time,
            duration_minutes,
            description
        )
        VALUES (
            v_control_id,
            v_start_time,
            NOW(),
            v_duration,
            'Sesión de trabajo'
        )
        RETURNING id INTO v_entry_id;
        
        -- Actualizar control
        UPDATE todo_control 
        SET 
            start_time = NULL,
            end_time = NOW(),
            total_time_minutes = COALESCE(total_time_minutes, 0) + v_duration,
            updated_at = NOW()
        WHERE id = v_control_id;
        
        result := json_build_object(
            'action', 'stopped',
            'duration_minutes', v_duration,
            'entry_id', v_entry_id
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para completar TODO
CREATE OR REPLACE FUNCTION complete_todo(p_todo_id UUID)
RETURNS JSON AS $$
DECLARE
    v_control_id UUID;
    result JSON;
BEGIN
    -- Obtener control del TODO
    SELECT id INTO v_control_id
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si no existe control, crearlo
    IF v_control_id IS NULL THEN
        v_control_id := initialize_todo_control(p_todo_id);
    END IF;
    
    -- Actualizar TODO como completado
    UPDATE todos 
    SET 
        is_completed = true,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_todo_id;
    
    -- Actualizar control
    UPDATE todo_control 
    SET 
        status = 'Terminada',
        end_time = COALESCE(end_time, NOW()),
        updated_at = NOW()
    WHERE id = v_control_id;
    
    result := json_build_object(
        'action', 'completed',
        'todo_id', p_todo_id,
        'completed_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. FUNCIONES DE ARCHIVO BÁSICAS (ORIGINALES)
-- ================================================================

-- Función para archivar caso
CREATE OR REPLACE FUNCTION archive_case(
    p_case_id UUID,
    p_reason TEXT DEFAULT 'Archivado'
)
RETURNS JSON AS $$
DECLARE
    v_case_record RECORD;
    v_archived_id UUID;
    result JSON;
BEGIN
    -- Verificar permisos de admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_name = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden archivar casos';
    END IF;
    
    -- Obtener datos del caso
    SELECT * INTO v_case_record FROM cases WHERE id = p_case_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_cases (
        original_id,
        radicado_simat,
        nombre_caso,
        origen_aplicacion,
        destino_aplicacion,
        descripcion,
        puntuacion,
        clasificacion,
        original_created_by,
        original_created_at,
        original_updated_at,
        archived_by,
        archived_at,
        archive_reason
    )
    VALUES (
        v_case_record.id,
        v_case_record.radicado_simat,
        v_case_record.nombre_caso,
        v_case_record.origen_aplicacion,
        v_case_record.destino_aplicacion,
        v_case_record.descripcion,
        v_case_record.puntuacion,
        v_case_record.clasificacion,
        v_case_record.created_by,
        v_case_record.created_at,
        v_case_record.updated_at,
        auth.uid(),
        NOW(),
        p_reason
    )
    RETURNING id INTO v_archived_id;
    
    -- Eliminar caso original
    DELETE FROM cases WHERE id = p_case_id;
    
    result := json_build_object(
        'action', 'archived',
        'original_id', p_case_id,
        'archived_id', v_archived_id,
        'archived_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para archivar TODO
CREATE OR REPLACE FUNCTION archive_todo(
    p_todo_id UUID,
    p_reason TEXT DEFAULT 'Archivado'
)
RETURNS JSON AS $$
DECLARE
    v_todo_record RECORD;
    v_archived_id UUID;
    result JSON;
BEGIN
    -- Verificar permisos de admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_name = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden archivar TODOs';
    END IF;
    
    -- Obtener datos del TODO
    SELECT * INTO v_todo_record FROM todos WHERE id = p_todo_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TODO no encontrado';
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_todos (
        original_id,
        title,
        description,
        original_created_by_user_id,
        original_assigned_user_id,
        priority_id,
        due_date,
        is_completed,
        completed_at,
        original_created_at,
        original_updated_at,
        archived_by,
        archived_at,
        archive_reason
    )
    VALUES (
        v_todo_record.id,
        v_todo_record.title,
        v_todo_record.description,
        v_todo_record.created_by_user_id,
        v_todo_record.assigned_user_id,
        v_todo_record.priority_id,
        v_todo_record.due_date,
        v_todo_record.is_completed,
        v_todo_record.completed_at,
        v_todo_record.created_at,
        v_todo_record.updated_at,
        auth.uid(),
        NOW(),
        p_reason
    )
    RETURNING id INTO v_archived_id;
    
    -- Eliminar TODO original
    DELETE FROM todos WHERE id = p_todo_id;
    
    result := json_build_object(
        'action', 'archived',
        'original_id', p_todo_id,
        'archived_id', v_archived_id,
        'archived_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para restaurar caso
CREATE OR REPLACE FUNCTION restore_case(
    p_archived_case_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_archived_record RECORD;
    v_restored_id UUID;
    result JSON;
BEGIN
    -- Verificar permisos de admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_name = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden restaurar casos';
    END IF;
    
    -- Obtener datos del caso archivado
    SELECT * INTO v_archived_record FROM archived_cases WHERE id = p_archived_case_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso archivado no encontrado';
    END IF;
    
    -- Insertar caso restaurado
    INSERT INTO cases (
        id,
        radicado_simat,
        nombre_caso,
        origen_aplicacion,
        destino_aplicacion,
        descripcion,
        puntuacion,
        created_by,
        created_at,
        updated_at
    )
    VALUES (
        v_archived_record.original_id,
        v_archived_record.radicado_simat,
        v_archived_record.nombre_caso,
        v_archived_record.origen_aplicacion,
        v_archived_record.destino_aplicacion,
        v_archived_record.descripcion,
        v_archived_record.puntuacion,
        v_archived_record.original_created_by,
        v_archived_record.original_created_at,
        NOW()
    )
    RETURNING id INTO v_restored_id;
    
    -- Eliminar del archivo
    DELETE FROM archived_cases WHERE id = p_archived_case_id;
    
    result := json_build_object(
        'action', 'restored',
        'restored_id', v_restored_id,
        'restored_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para restaurar TODO
CREATE OR REPLACE FUNCTION restore_todo(
    p_archived_todo_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_archived_record RECORD;
    v_restored_id UUID;
    result JSON;
BEGIN
    -- Verificar permisos de admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role_name = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden restaurar TODOs';
    END IF;
    
    -- Obtener datos del TODO archivado
    SELECT * INTO v_archived_record FROM archived_todos WHERE id = p_archived_todo_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TODO archivado no encontrado';
    END IF;
    
    -- Insertar TODO restaurado
    INSERT INTO todos (
        id,
        title,
        description,
        created_by_user_id,
        assigned_user_id,
        priority_id,
        due_date,
        is_completed,
        completed_at,
        created_at,
        updated_at
    )
    VALUES (
        v_archived_record.original_id,
        v_archived_record.title,
        v_archived_record.description,
        v_archived_record.original_created_by_user_id,
        v_archived_record.original_assigned_user_id,
        v_archived_record.priority_id,
        v_archived_record.due_date,
        v_archived_record.is_completed,
        v_archived_record.completed_at,
        v_archived_record.original_created_at,
        NOW()
    )
    RETURNING id INTO v_restored_id;
    
    -- Eliminar del archivo
    DELETE FROM archived_todos WHERE id = p_archived_todo_id;
    
    result := json_build_object(
        'action', 'restored',
        'restored_id', v_restored_id,
        'restored_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- OTORGAR PERMISOS A FUNCIONES BÁSICAS
-- ================================================================

-- Permisos para funciones de métricas
GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_todo_metrics(UUID) TO authenticated;

-- Permisos para funciones de TODO
GRANT EXECUTE ON FUNCTION initialize_todo_control(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_todo_timer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_todo(UUID) TO authenticated;

-- Permisos para funciones de archivo (solo admins las usarán por RLS)
GRANT EXECUTE ON FUNCTION archive_case(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_todo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_case(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_todo(UUID) TO authenticated;

-- ================================================================
-- RECREAR TRIGGERS BÁSICOS
-- ================================================================

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_case_status_control_updated_at ON case_status_control;
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
DROP TRIGGER IF EXISTS update_todo_control_updated_at ON todo_control;

-- Recrear triggers básicos
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_status_control_updated_at 
    BEFORE UPDATE ON case_status_control 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_control_updated_at 
    BEFORE UPDATE ON todo_control 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

-- Mostrar funciones que permanecen
SELECT 
    proname as function_name,
    pronargs as num_args,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN (
    'update_updated_at_column',
    'get_dashboard_metrics',
    'get_todo_metrics',
    'initialize_todo_control',
    'toggle_todo_timer',
    'complete_todo',
    'archive_case',
    'archive_todo',
    'restore_case',
    'restore_todo'
)
ORDER BY proname;

-- ================================================================
-- FIN DEL SCRIPT DE LIMPIEZA
-- ================================================================
-- Se han eliminado todas las funciones v2 y recientes
-- Se han restaurado solo las funciones básicas originales:
-- - update_updated_at_column: Trigger de timestamps
-- - get_dashboard_metrics: Métricas básicas del dashboard
-- - get_todo_metrics: Métricas básicas de TODOs
-- - initialize_todo_control: Control básico de TODOs
-- - toggle_todo_timer: Timer básico de TODOs
-- - complete_todo: Completar TODO
-- - archive_case/archive_todo: Archivo básico
-- - restore_case/restore_todo: Restauración básica
-- ================================================================
