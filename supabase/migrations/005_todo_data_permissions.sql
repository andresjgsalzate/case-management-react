-- Migración: Datos iniciales y permisos para módulo TODO
-- Versión: 2.1.1
-- Fecha: 2025-07-05

-- =====================================================
-- DATOS INICIALES PARA PRIORIDADES TODO
-- =====================================================

INSERT INTO todo_priorities (name, description, color, level, display_order) VALUES 
('Muy Baja', 'Tareas de muy baja prioridad - pueden esperar', '#10B981', 1, 10),
('Baja', 'Tareas de baja prioridad - sin urgencia', '#3B82F6', 2, 20),
('Media', 'Tareas de prioridad media - atención normal', '#F59E0B', 3, 30),
('Alta', 'Tareas de alta prioridad - requieren atención pronto', '#EF4444', 4, 40),
('Crítica', 'Tareas críticas - atención inmediata requerida', '#DC2626', 5, 50)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PERMISOS PARA EL MÓDULO TODO
-- =====================================================

-- Permisos básicos para TODO
INSERT INTO permissions (name, description, resource, action) VALUES 
('view_todos', 'Ver lista de TODOs', 'todos', 'view'),
('create_todos', 'Crear nuevos TODOs', 'todos', 'create'),
('edit_todos', 'Editar TODOs existentes', 'todos', 'edit'),
('delete_todos', 'Eliminar TODOs', 'todos', 'delete'),
('assign_todos', 'Asignar TODOs a usuarios', 'todos', 'assign'),
('manage_todo_priorities', 'Gestionar prioridades de TODO', 'todo_priorities', 'manage'),
('view_all_todos', 'Ver todos los TODOs del sistema', 'todos', 'view_all'),
('todo_time_tracking', 'Usar timer y seguimiento de tiempo en TODOs', 'todo_control', 'time_tracking'),
('export_todos', 'Exportar datos de TODOs', 'todos', 'export')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- =====================================================

-- Permisos para ADMIN (acceso completo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin' 
AND p.name IN (
    'view_todos',
    'create_todos', 
    'edit_todos',
    'delete_todos',
    'assign_todos',
    'manage_todo_priorities',
    'view_all_todos',
    'todo_time_tracking',
    'export_todos'
)
ON CONFLICT DO NOTHING;

-- Permisos para SUPERVISOR (casi completo, sin gestión de prioridades)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'supervisor' 
AND p.name IN (
    'view_todos',
    'create_todos',
    'edit_todos',
    'assign_todos',
    'view_all_todos',
    'todo_time_tracking',
    'export_todos'
)
ON CONFLICT DO NOTHING;

-- Permisos para ANALISTA (básicos, solo sus TODOs)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'analista' 
AND p.name IN (
    'view_todos',
    'create_todos',
    'edit_todos',
    'todo_time_tracking'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCIÓN PARA OBTENER MÉTRICAS DE TODO
-- =====================================================

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
    SELECT r.name, up.is_active INTO user_role, is_user_active
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = COALESCE(user_id, auth.uid());
    
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
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE csc.name = 'Pendiente' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE csc.name = 'En Curso' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos 
        WHERE due_date < CURRENT_DATE AND is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE tp.level >= 4 AND t.is_completed = false;
        
    ELSE
        -- Analistas solo ven sus TODOs asignados
        SELECT COUNT(*) INTO total_todos 
        FROM todos 
        WHERE assigned_user_id = COALESCE(user_id, auth.uid()) 
        OR created_by_user_id = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO completed_todos 
        FROM todos 
        WHERE (assigned_user_id = COALESCE(user_id, auth.uid()) OR created_by_user_id = COALESCE(user_id, auth.uid()))
        AND is_completed = true;
        
        SELECT COUNT(*) INTO pending_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND csc.name = 'Pendiente' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND csc.name = 'En Curso' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos 
        WHERE (assigned_user_id = COALESCE(user_id, auth.uid()) OR created_by_user_id = COALESCE(user_id, auth.uid()))
        AND due_date < CURRENT_DATE AND is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND tp.level >= 4 AND t.is_completed = false;
    END IF;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalTodos', COALESCE(total_todos, 0),
        'completedTodos', COALESCE(completed_todos, 0),
        'pendingTodos', COALESCE(pending_todos, 0),
        'inProgressTodos', COALESCE(in_progress_todos, 0),
        'overdueTodos', COALESCE(overdue_todos, 0),
        'highPriorityTodos', COALESCE(high_priority_todos, 0),
        'userRole', user_role,
        'isActive', is_user_active
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
