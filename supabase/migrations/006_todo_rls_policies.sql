-- Migración: Políticas RLS para módulo TODO
-- Versión: 2.1.1
-- Fecha: 2025-07-05

-- =====================================================
-- HABILITAR RLS EN TABLAS TODO
-- =====================================================

ALTER TABLE todo_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_manual_time_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA TODO_PRIORITIES
-- =====================================================

-- Todos pueden ver las prioridades (son datos de referencia)
CREATE POLICY "Todos pueden ver prioridades de TODO" ON todo_priorities
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Solo admins pueden gestionar prioridades
CREATE POLICY "Solo admins pueden gestionar prioridades de TODO" ON todo_priorities
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'admin'
            AND up.is_active = true
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA TODOS
-- =====================================================

-- Ver TODOs según rol
CREATE POLICY "Ver TODOs según rol y asignación" ON todos
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos
                r.name IN ('admin', 'supervisor') OR
                -- Analistas ven solo los asignados a ellos o creados por ellos
                (r.name = 'analista' AND (todos.assigned_user_id = auth.uid() OR todos.created_by_user_id = auth.uid()))
            )
        )
    );

-- Crear TODOs (usuarios activos)
CREATE POLICY "Usuarios activos pueden crear TODOs" ON todos
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND created_by_user_id = auth.uid()
    );

-- Actualizar TODOs según rol
CREATE POLICY "Actualizar TODOs según rol y permisos" ON todos
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden editar todos
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden editar solo los asignados a ellos o creados por ellos
                (r.name = 'analista' AND (todos.assigned_user_id = auth.uid() OR todos.created_by_user_id = auth.uid()))
            )
        )
    );

-- Eliminar TODOs (solo admins)
CREATE POLICY "Solo admins pueden eliminar TODOs" ON todos
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'admin'
            AND up.is_active = true
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA TODO_CONTROL
-- =====================================================

-- Ver control de TODOs según rol
CREATE POLICY "Ver control de TODOs según rol" ON todo_control
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todos t ON todo_control.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todo el control
                r.name IN ('admin', 'supervisor') OR
                -- Analistas ven solo el control de sus TODOs
                (r.name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_control.user_id = auth.uid()))
            )
        )
    );

-- Crear control de TODOs
CREATE POLICY "Crear control de TODOs" ON todo_control
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar control de TODOs según rol
CREATE POLICY "Actualizar control de TODOs según rol" ON todo_control
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todos t ON todo_control.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden actualizar todo el control
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden actualizar solo el control de sus TODOs
                (r.name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_control.user_id = auth.uid()))
            )
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA TODO_TIME_ENTRIES
-- =====================================================

-- Ver entradas de tiempo según rol
CREATE POLICY "Ver entradas de tiempo de TODOs según rol" ON todo_time_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todas las entradas
                r.name IN ('admin', 'supervisor') OR
                -- Analistas ven solo las entradas de sus TODOs
                (r.name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_time_entries.user_id = auth.uid()))
            )
        )
    );

-- Crear entradas de tiempo
CREATE POLICY "Crear entradas de tiempo para TODOs" ON todo_time_entries
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND user_id = auth.uid()
    );

-- Actualizar entradas de tiempo según rol
CREATE POLICY "Actualizar entradas de tiempo de TODOs según rol" ON todo_time_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden actualizar todas las entradas
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden actualizar solo sus entradas en sus TODOs
                (r.name = 'analista' AND todo_time_entries.user_id = auth.uid() AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA TODO_MANUAL_TIME_ENTRIES
-- =====================================================

-- Ver entradas manuales de tiempo según rol
CREATE POLICY "Ver entradas manuales de tiempo de TODOs según rol" ON todo_manual_time_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_manual_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todas las entradas manuales
                r.name IN ('admin', 'supervisor') OR
                -- Analistas ven solo las entradas manuales de sus TODOs
                (r.name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_manual_time_entries.user_id = auth.uid()))
            )
        )
    );

-- Crear entradas manuales de tiempo
CREATE POLICY "Crear entradas manuales de tiempo para TODOs" ON todo_manual_time_entries
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND created_by = auth.uid()
    );

-- Actualizar entradas manuales de tiempo según rol
CREATE POLICY "Actualizar entradas manuales de tiempo de TODOs según rol" ON todo_manual_time_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_manual_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden actualizar todas las entradas manuales
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden actualizar solo sus entradas manuales en sus TODOs
                (r.name = 'analista' AND todo_manual_time_entries.created_by = auth.uid() AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );
