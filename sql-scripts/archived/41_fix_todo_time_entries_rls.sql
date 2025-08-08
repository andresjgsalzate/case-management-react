-- =========================================================================
-- Script para corregir políticas RLS de todo_manual_time_entries
-- Error: new row violates row-level security policy for table "todo_manual_time_entries"
-- =========================================================================

-- 1. Agregar permisos específicos para tiempo manual de TODOs
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
  ('todos.manual_time_own', 'Gestionar tiempo manual de propios TODOs', 'todos', 'manual_time', 'own', true),
  ('todos.manual_time_team', 'Gestionar tiempo manual de TODOs del equipo', 'todos', 'manual_time', 'team', true),
  ('todos.manual_time_all', 'Gestionar tiempo manual de todos los TODOs', 'todos', 'manual_time', 'all', true),
  ('todos.timer_own', 'Gestionar timer de propios TODOs', 'todos', 'timer', 'own', true),
  ('todos.timer_team', 'Gestionar timer de TODOs del equipo', 'todos', 'timer', 'team', true),
  ('todos.timer_all', 'Gestionar timer de todos los TODOs', 'todos', 'timer', 'all', true)
ON CONFLICT (name) DO NOTHING;

-- Verificación inicial
SELECT 'Corrigiendo políticas RLS para todo_manual_time_entries y todo_time_entries' as status;

-- ================================================================
-- POLÍTICAS PARA TODO_TIME_ENTRIES
-- ================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "todo_time_entries_select_policy" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_insert_policy" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_update_policy" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_delete_policy" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_select_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_insert_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_update_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_delete_granular" ON todo_time_entries;

-- Política de lectura de entradas de tiempo de TODOs (granular)
CREATE POLICY "todo_time_entries_select_granular" ON todo_time_entries
    FOR SELECT USING (
        -- Puede ver si es el usuario asignado al TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          JOIN todos t ON t.id = tc.todo_id 
          WHERE tc.id = todo_time_entries.todo_control_id 
          AND (
            tc.user_id = auth.uid() OR 
            t.assigned_user_id = auth.uid() OR
            t.created_by_user_id = auth.uid()
          )
        )
        OR
        -- O si tiene permisos para ver TODOs del equipo/todos
        has_permission(auth.uid(), 'todos.timer_team')
        OR
        has_permission(auth.uid(), 'todos.timer_all')
    );

-- Política de inserción de entradas de tiempo de TODOs (granular)
CREATE POLICY "todo_time_entries_insert_granular" ON todo_time_entries
    FOR INSERT WITH CHECK (
        -- Puede agregar tiempo si es el usuario asignado al control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          WHERE tc.id = todo_time_entries.todo_control_id 
          AND tc.user_id = auth.uid()
        )
        OR
        -- O tiene permisos específicos para timer
        has_permission(auth.uid(), 'todos.timer_own')
        OR
        has_permission(auth.uid(), 'todos.timer_team')
        OR
        has_permission(auth.uid(), 'todos.timer_all')
    );

-- Política de actualización de entradas de tiempo de TODOs (granular)
CREATE POLICY "todo_time_entries_update_granular" ON todo_time_entries
    FOR UPDATE USING (
        -- Puede actualizar si es el usuario del control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          WHERE tc.id = todo_time_entries.todo_control_id 
          AND tc.user_id = auth.uid()
        )
        OR
        -- O tiene permisos para gestionar timer
        has_permission(auth.uid(), 'todos.timer_team')
        OR
        has_permission(auth.uid(), 'todos.timer_all')
    );

-- Política de eliminación de entradas de tiempo de TODOs (granular)
CREATE POLICY "todo_time_entries_delete_granular" ON todo_time_entries
    FOR DELETE USING (
        -- Puede eliminar si es el usuario del control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          WHERE tc.id = todo_time_entries.todo_control_id 
          AND tc.user_id = auth.uid()
        )
        OR
        -- O tiene permisos para gestionar timer
        has_permission(auth.uid(), 'todos.timer_team')
        OR
        has_permission(auth.uid(), 'todos.timer_all')
    );

-- ================================================================
-- POLÍTICAS PARA TODO_MANUAL_TIME_ENTRIES
-- ================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "todo_manual_time_entries_select_policy" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_insert_policy" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_update_policy" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_delete_policy" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_select_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_insert_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_update_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_delete_granular" ON todo_manual_time_entries;

-- Política de lectura de entradas de tiempo manual de TODOs (granular)
CREATE POLICY "todo_manual_time_entries_select_granular" ON todo_manual_time_entries
    FOR SELECT USING (
        -- Puede ver si es el usuario asignado al TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          JOIN todos t ON t.id = tc.todo_id 
          WHERE tc.id = todo_manual_time_entries.todo_control_id 
          AND (
            tc.user_id = auth.uid() OR 
            t.assigned_user_id = auth.uid() OR
            t.created_by_user_id = auth.uid()
          )
        )
        OR
        -- O si tiene permisos para ver TODOs del equipo/todos
        has_permission(auth.uid(), 'todos.manual_time_team')
        OR
        has_permission(auth.uid(), 'todos.manual_time_all')
    );

-- Política de inserción de entradas de tiempo manual de TODOs (granular)
CREATE POLICY "todo_manual_time_entries_insert_granular" ON todo_manual_time_entries
    FOR INSERT WITH CHECK (
        -- Puede agregar tiempo manual si es el usuario asignado al control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          JOIN todos t ON t.id = tc.todo_id 
          WHERE tc.id = todo_manual_time_entries.todo_control_id 
          AND (
            tc.user_id = auth.uid() OR 
            t.assigned_user_id = auth.uid() OR
            t.created_by_user_id = auth.uid()
          )
        )
        OR
        -- O tiene permisos específicos para tiempo manual
        has_permission(auth.uid(), 'todos.manual_time_own')
        OR
        has_permission(auth.uid(), 'todos.manual_time_team')
        OR
        has_permission(auth.uid(), 'todos.manual_time_all')
    );

-- Política de actualización de entradas de tiempo manual de TODOs (granular)
CREATE POLICY "todo_manual_time_entries_update_granular" ON todo_manual_time_entries
    FOR UPDATE USING (
        -- Puede actualizar si es quien creó la entrada
        created_by = auth.uid()
        OR
        -- O si es el usuario del control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          WHERE tc.id = todo_manual_time_entries.todo_control_id 
          AND tc.user_id = auth.uid()
        )
        OR
        -- O tiene permisos para gestionar tiempo manual
        has_permission(auth.uid(), 'todos.manual_time_team')
        OR
        has_permission(auth.uid(), 'todos.manual_time_all')
    );

-- Política de eliminación de entradas de tiempo manual de TODOs (granular)
CREATE POLICY "todo_manual_time_entries_delete_granular" ON todo_manual_time_entries
    FOR DELETE USING (
        -- Puede eliminar si es quien creó la entrada
        created_by = auth.uid()
        OR
        -- O si es el usuario del control del TODO
        EXISTS (
          SELECT 1 FROM todo_control tc 
          WHERE tc.id = todo_manual_time_entries.todo_control_id 
          AND tc.user_id = auth.uid()
        )
        OR
        -- O tiene permisos para gestionar tiempo manual
        has_permission(auth.uid(), 'todos.manual_time_team')
        OR
        has_permission(auth.uid(), 'todos.manual_time_all')
    );

-- ================================================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- ================================================================

-- Asignar permiso básico a usuarios normales (asumiendo que existe un rol 'user')
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'user' 
AND p.name IN ('todos.manual_time_own', 'todos.timer_own')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Asignar permisos de equipo a supervisores/managers (asumiendo que existe un rol 'manager')
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('manager', 'supervisor') 
AND p.name IN ('todos.manual_time_own', 'todos.manual_time_team', 'todos.timer_own', 'todos.timer_team')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Asignar todos los permisos a administradores
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('admin', 'administrator') 
AND p.name IN ('todos.manual_time_own', 'todos.manual_time_team', 'todos.manual_time_all', 'todos.timer_own', 'todos.timer_team', 'todos.timer_all')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- ================================================================
-- VERIFICACIÓN DE POLÍTICAS CREADAS
-- ================================================================

-- Verificar que las políticas se crearon correctamente
SELECT 'Verificando políticas creadas:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('todo_time_entries', 'todo_manual_time_entries')
ORDER BY tablename, policyname;

-- Verificar los permisos creados
SELECT 'Permisos de tiempo para TODOs creados:' as info;
SELECT name, description, resource, action, scope
FROM permissions 
WHERE resource = 'todos' AND action IN ('manual_time', 'timer')
ORDER BY action, scope;

SELECT 'Políticas RLS para TODOs time entries corregidas exitosamente' as status;
