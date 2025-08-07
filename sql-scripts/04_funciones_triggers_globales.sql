-- ================================================================
-- FUNCIONES Y TRIGGERS GLOBALES CON SISTEMA DE PERMISOS GRANULAR
-- ================================================================
-- Descripción: Funciones base del sistema usando permisos granulares
-- Reemplaza: 04_funciones_triggers_globales.sql
-- Sistema: Basado en user_has_permission(user_id, "modulo.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  CREANDO FUNCIONES GLOBALES';
    RAISE NOTICE '  CON SISTEMA DE PERMISOS GRANULAR';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
    
    -- Eliminar funciones existentes que podrían causar conflictos
    RAISE NOTICE 'Eliminando funciones existentes que podrían causar conflictos...';
END $$;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS has_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_highest_scope(UUID, TEXT);
DROP FUNCTION IF EXISTS get_dashboard_metrics(UUID);
DROP FUNCTION IF EXISTS get_todo_metrics(UUID);

-- ================================================================
-- 1. FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger para actualizar automáticamente updated_at';

-- ================================================================
-- 2. FUNCIÓN PARA VERIFICAR PERMISOS ESPECÍFICOS (SISTEMA GRANULAR)
-- ================================================================

-- Primero eliminar función existente si existe
DROP FUNCTION IF EXISTS has_permission(UUID, TEXT);

-- ================================================================
-- 2. FUNCIÓN PARA VERIFICAR PERMISOS ESPECÍFICOS (SISTEMA GRANULAR)
-- ================================================================

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

-- Comentario
COMMENT ON FUNCTION has_permission(UUID, TEXT) IS 'Verifica si un usuario tiene un permiso específico usando sistema granular';

-- ================================================================
-- 3. FUNCIÓN PARA OBTENER ROL DE USUARIO (COMPATIBILIDAD)
-- ================================================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role_name TEXT;
BEGIN
    -- Obtener rol del usuario desde user_profiles y roles
    SELECT COALESCE(r.name, up.role_name, 'user')
    INTO user_role_name
    FROM user_profiles up
    LEFT JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id AND up.is_active = true;
    
    RETURN COALESCE(user_role_name, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_user_role(UUID) IS 'Obtiene el rol de un usuario (función de compatibilidad)';

-- ================================================================
-- 4. FUNCIÓN PARA VERIFICAR SI ES ADMIN (BASADA EN PERMISOS)
-- ================================================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Un usuario es admin si tiene permisos administrativos globales
    RETURN has_permission(user_id, 'users.admin_all') OR 
           has_permission(user_id, 'roles.admin_all') OR 
           has_permission(user_id, 'permissions.admin_all');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION is_admin(UUID) IS 'Verifica si un usuario tiene permisos administrativos';

-- ================================================================
-- 4.1. FUNCIÓN AUXILIAR PARA OBTENER EL SCOPE MÁS ALTO
-- ================================================================
CREATE OR REPLACE FUNCTION get_user_highest_scope(user_id UUID, permission_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
    user_scope TEXT := NULL;
BEGIN
    -- Verificar scopes en orden de prioridad: all -> team -> own
    IF has_permission(user_id, permission_prefix || '_all') THEN
        user_scope := 'all';
    ELSIF has_permission(user_id, permission_prefix || '_team') THEN
        user_scope := 'team';
    ELSIF has_permission(user_id, permission_prefix || '_own') THEN
        user_scope := 'own';
    END IF;
    
    RETURN user_scope;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_user_highest_scope(UUID, TEXT) IS 'Obtiene el scope más alto que tiene un usuario para un tipo de permiso';

-- ================================================================
-- 6. FUNCIÓN PARA OBTENER ESTADÍSTICAS DEL DASHBOARD
-- ================================================================
CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    target_user UUID;
    user_scope TEXT;
    total_cases INTEGER := 0;
    pending_cases INTEGER := 0;
    completed_cases INTEGER := 0;
    in_progress_cases INTEGER := 0;
    total_todos INTEGER := 0;
    completed_todos INTEGER := 0;
    pending_todos INTEGER := 0;
    overdue_todos INTEGER := 0;
BEGIN
    target_user := COALESCE(user_id, auth.uid());
    
    -- Verificar acceso al dashboard
    IF NOT has_permission(target_user, 'dashboard.read_own') 
       AND NOT has_permission(target_user, 'dashboard.read_team')
       AND NOT has_permission(target_user, 'dashboard.read_all') THEN
        RETURN json_build_object(
            'error', 'Sin permisos para ver métricas del dashboard',
            'total_cases', 0,
            'total_todos', 0
        );
    END IF;
    
    -- Obtener el scope más alto que tiene el usuario
    user_scope := get_user_highest_scope(target_user, 'dashboard.read');
    
    -- Contar casos según el scope
    CASE user_scope
        WHEN 'all' THEN
            -- Puede ver todos los casos
            SELECT COUNT(*) INTO total_cases FROM cases;
            SELECT COUNT(*) INTO pending_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'pending' OR cc.status_id IS NULL;
            SELECT COUNT(*) INTO completed_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'completed';
            SELECT COUNT(*) INTO in_progress_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'in_progress';
            
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo cuando esté disponible
            -- Por ahora se comporta como 'all'
            SELECT COUNT(*) INTO total_cases FROM cases;
            SELECT COUNT(*) INTO pending_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'pending' OR cc.status_id IS NULL;
            SELECT COUNT(*) INTO completed_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'completed';
            SELECT COUNT(*) INTO in_progress_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE csc.name = 'in_progress';
            
        WHEN 'own' THEN
            -- Solo puede ver sus propios casos
            SELECT COUNT(*) INTO total_cases FROM cases c WHERE c.user_id = target_user;
            SELECT COUNT(*) INTO pending_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE c.user_id = target_user AND (csc.name = 'pending' OR cc.status_id IS NULL);
            SELECT COUNT(*) INTO completed_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE c.user_id = target_user AND csc.name = 'completed';
            SELECT COUNT(*) INTO in_progress_cases FROM cases c 
            LEFT JOIN case_control cc ON c.id = cc.case_id 
            LEFT JOIN case_status_control csc ON cc.status_id = csc.id 
            WHERE c.user_id = target_user AND csc.name = 'in_progress';
            
        ELSE
            -- Sin permisos, no ve nada
            total_cases := 0;
            pending_cases := 0;
            completed_cases := 0;
            in_progress_cases := 0;
    END CASE;
    
    -- Contar TODOs según el scope del permiso de TODOs
    user_scope := get_user_highest_scope(target_user, 'todos.read');
    
    CASE user_scope
        WHEN 'all' THEN
            -- Puede ver todos los TODOs
            SELECT COUNT(*) INTO total_todos FROM todos;
            SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
            SELECT COUNT(*) INTO pending_todos FROM todos WHERE is_completed = false;
            SELECT COUNT(*) INTO overdue_todos FROM todos WHERE due_date < CURRENT_DATE AND is_completed = false;
            
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            SELECT COUNT(*) INTO total_todos FROM todos;
            SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
            SELECT COUNT(*) INTO pending_todos FROM todos WHERE is_completed = false;
            SELECT COUNT(*) INTO overdue_todos FROM todos WHERE due_date < CURRENT_DATE AND is_completed = false;
            
        WHEN 'own' THEN
            -- Solo puede ver TODOs asignados a él o creados por él
            SELECT COUNT(*) INTO total_todos 
            FROM todos t WHERE t.assigned_user_id = target_user OR t.created_by_user_id = target_user;
            
            SELECT COUNT(*) INTO completed_todos 
            FROM todos t WHERE (t.assigned_user_id = target_user OR t.created_by_user_id = target_user) AND t.is_completed = true;
            
            SELECT COUNT(*) INTO pending_todos 
            FROM todos t WHERE (t.assigned_user_id = target_user OR t.created_by_user_id = target_user) AND t.is_completed = false;
            
            SELECT COUNT(*) INTO overdue_todos 
            FROM todos t WHERE (t.assigned_user_id = target_user OR t.created_by_user_id = target_user) 
            AND t.due_date < CURRENT_DATE AND t.is_completed = false;
            
        ELSE
            -- Sin permisos
            total_todos := 0;
            completed_todos := 0;
            pending_todos := 0;
            overdue_todos := 0;
    END CASE;
    
    -- Construir resultado
    result := json_build_object(
        'user_id', target_user,
        'dashboard_scope', get_user_highest_scope(target_user, 'dashboard.read'),
        'cases', json_build_object(
            'total', total_cases,
            'pending', pending_cases,
            'completed', completed_cases,
            'in_progress', in_progress_cases
        ),
        'todos', json_build_object(
            'total', total_todos,
            'completed', completed_todos,
            'pending', pending_todos,
            'overdue', overdue_todos
        ),
        'permissions', json_build_object(
            'can_export', has_permission(target_user, 'dashboard.export_own') OR 
                         has_permission(target_user, 'dashboard.export_team') OR 
                         has_permission(target_user, 'dashboard.export_all'),
            'can_admin', has_permission(target_user, 'dashboard.admin_own') OR 
                        has_permission(target_user, 'dashboard.admin_team') OR 
                        has_permission(target_user, 'dashboard.admin_all')
        ),
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_dashboard_metrics(UUID) IS 'Obtiene métricas del dashboard respetando permisos granulares';

-- ================================================================
-- 7. FUNCIÓN PARA OBTENER ESTADÍSTICAS DE TODOS
-- ================================================================
CREATE OR REPLACE FUNCTION get_todo_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    target_user UUID;
    user_scope TEXT;
    total_todos INTEGER := 0;
    my_todos INTEGER := 0;
    assigned_todos INTEGER := 0;
    completed_todos INTEGER := 0;
    pending_todos INTEGER := 0;
    overdue_todos INTEGER := 0;
    high_priority_todos INTEGER := 0;
BEGIN
    target_user := COALESCE(user_id, auth.uid());
    
    -- Verificar acceso a métricas de TODOs
    IF NOT has_permission(target_user, 'todos.read_own') 
       AND NOT has_permission(target_user, 'todos.read_team')
       AND NOT has_permission(target_user, 'todos.read_all') THEN
        RETURN json_build_object('error', 'Sin permisos para ver métricas de TODOs');
    END IF;
    
    -- Obtener scope
    user_scope := get_user_highest_scope(target_user, 'todos.read');
    
    -- Calcular métricas según el scope
    CASE user_scope
        WHEN 'all' THEN
            -- Puede ver todos los TODOs
            SELECT COUNT(*) INTO total_todos FROM todos;
            SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
            SELECT COUNT(*) INTO pending_todos FROM todos WHERE is_completed = false;
            SELECT COUNT(*) INTO overdue_todos FROM todos WHERE due_date < CURRENT_DATE AND is_completed = false;
            SELECT COUNT(*) INTO high_priority_todos FROM todos t 
            JOIN todo_priorities tp ON t.priority_id = tp.id 
            WHERE tp.name = 'High' AND t.is_completed = false;
            
            -- Para admin, "mis TODOs" son todos los asignados al usuario
            SELECT COUNT(*) INTO my_todos FROM todos t WHERE t.assigned_user_id = target_user;
            assigned_todos := my_todos;
            
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            -- Por ahora igual que 'all'
            SELECT COUNT(*) INTO total_todos FROM todos;
            SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
            SELECT COUNT(*) INTO pending_todos FROM todos WHERE is_completed = false;
            SELECT COUNT(*) INTO overdue_todos FROM todos WHERE due_date < CURRENT_DATE AND is_completed = false;
            SELECT COUNT(*) INTO high_priority_todos FROM todos t 
            JOIN todo_priorities tp ON t.priority_id = tp.id 
            WHERE tp.name = 'High' AND t.is_completed = false;
            
            SELECT COUNT(*) INTO my_todos FROM todos t WHERE t.assigned_user_id = target_user;
            assigned_todos := my_todos;
            
        WHEN 'own' THEN
            -- Solo TODOs relacionados con el usuario
            SELECT COUNT(*) INTO total_todos 
            FROM todos WHERE assigned_user_id = target_user OR created_by_user_id = target_user;
            
            SELECT COUNT(*) INTO completed_todos 
            FROM todos WHERE (assigned_user_id = target_user OR created_by_user_id = target_user) AND is_completed = true;
            
            SELECT COUNT(*) INTO pending_todos 
            FROM todos WHERE (assigned_user_id = target_user OR created_by_user_id = target_user) AND is_completed = false;
            
            SELECT COUNT(*) INTO overdue_todos 
            FROM todos WHERE (assigned_user_id = target_user OR created_by_user_id = target_user) 
            AND due_date < CURRENT_DATE AND is_completed = false;
            
            SELECT COUNT(*) INTO high_priority_todos 
            FROM todos t 
            JOIN todo_priorities tp ON t.priority_id = tp.id 
            WHERE (t.assigned_user_id = target_user OR t.created_by_user_id = target_user)
            AND tp.name = 'High' AND t.is_completed = false;
            
            SELECT COUNT(*) INTO my_todos FROM todos t WHERE t.assigned_user_id = target_user;
            SELECT COUNT(*) INTO assigned_todos FROM todos t WHERE t.assigned_user_id = target_user;
            
        ELSE
            -- Sin permisos
            total_todos := 0;
            my_todos := 0;
            assigned_todos := 0;
            completed_todos := 0;
            pending_todos := 0;
            overdue_todos := 0;
            high_priority_todos := 0;
    END CASE;
    
    -- Construir resultado
    result := json_build_object(
        'user_id', target_user,
        'todos_scope', user_scope,
        'total_todos', total_todos,
        'my_todos', my_todos,
        'assigned_todos', assigned_todos,
        'completed_todos', completed_todos,
        'pending_todos', pending_todos,
        'overdue_todos', overdue_todos,
        'high_priority_todos', high_priority_todos,
        'permissions', json_build_object(
            'can_create', has_permission(target_user, 'todos.create_own') OR 
                         has_permission(target_user, 'todos.create_team') OR 
                         has_permission(target_user, 'todos.create_all'),
            'can_control', has_permission(target_user, 'todos.control_own') OR 
                          has_permission(target_user, 'todos.control_team') OR 
                          has_permission(target_user, 'todos.control_all'),
            'can_assign', has_permission(target_user, 'todos.assign_own') OR 
                         has_permission(target_user, 'todos.assign_team') OR 
                         has_permission(target_user, 'todos.assign_all')
        ),
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_todo_metrics(UUID) IS 'Obtiene métricas de TODOs respetando permisos granulares';

-- ================================================================
-- 8. APLICAR TRIGGERS DE UPDATED_AT A TABLAS PRINCIPALES
-- ================================================================
DO $$
DECLARE
    current_table TEXT;
    tables_to_update TEXT[] := ARRAY[
        'user_profiles', 'cases', 'case_control', 'time_entries', 'manual_time_entries',
        'todos', 'todo_control', 'todo_time_entries', 'todo_manual_time_entries',
        'notes', 'solution_documents', 'solution_document_versions', 'solution_feedback',
        'archived_cases', 'archived_todos', 'disposiciones_scripts'
    ];
BEGIN
    RAISE NOTICE 'APLICANDO TRIGGERS updated_at:';
    
    FOREACH current_table IN ARRAY tables_to_update
    LOOP
        BEGIN
            -- Eliminar trigger existente si existe
            EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', current_table, current_table);
            
            -- Crear nuevo trigger
            EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', current_table, current_table);
            
            RAISE NOTICE '  ✓ Trigger updated_at aplicado a: %', current_table;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE '  ⚠ Tabla no encontrada: %', current_table;
            WHEN OTHERS THEN
                RAISE NOTICE '  ⚠ Error en tabla %: %', current_table, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 9. OTORGAR PERMISOS A LAS FUNCIONES
-- ================================================================

-- Permisos en funciones básicas
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_highest_scope(UUID, TEXT) TO authenticated;

-- Permisos en funciones de métricas
GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_todo_metrics(UUID) TO authenticated;

-- Permisos para usuarios anónimos (solo funciones públicas)
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;

-- ================================================================
-- 10. VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
    test_user_id UUID;
    test_result JSON;
BEGIN
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'update_updated_at_column', 'has_permission', 'get_user_role', 'is_admin',
        'get_user_highest_scope', 'get_dashboard_metrics', 'get_todo_metrics'
    );
    
    -- Contar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%';
    
    RAISE NOTICE 'VERIFICACIÓN FINAL:';
    RAISE NOTICE '- Funciones creadas: %', function_count;
    RAISE NOTICE '- Triggers creados: %', trigger_count;
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Probar función de métricas
        SELECT get_dashboard_metrics(test_user_id) INTO test_result;
        RAISE NOTICE '- Test dashboard: %', 
            CASE WHEN test_result IS NOT NULL THEN 'OK' ELSE 'ERROR' END;
        
        RAISE NOTICE '- Usuario de prueba: %', test_user_id;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES GLOBALES CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
END $$;
