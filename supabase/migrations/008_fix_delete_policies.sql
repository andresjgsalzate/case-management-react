-- =====================================================
-- AGREGAR POLÍTICAS DE DELETE FALTANTES PARA ENTRADAS DE TIEMPO
-- =====================================================

-- Política para eliminar entradas de tiempo automático
CREATE POLICY "Eliminar entradas de tiempo automático según rol" ON todo_time_entries
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden eliminar todas las entradas
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden eliminar solo sus entradas en sus TODOs
                (r.name = 'analista' AND todo_time_entries.user_id = auth.uid() AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );

-- Política para eliminar entradas de tiempo manual
CREATE POLICY "Eliminar entradas de tiempo manual según rol" ON todo_manual_time_entries
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id
            JOIN todo_control tc ON todo_manual_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden eliminar todas las entradas
                r.name IN ('admin', 'supervisor') OR
                -- Analistas pueden eliminar solo sus entradas en sus TODOs
                (r.name = 'analista' AND todo_manual_time_entries.user_id = auth.uid() AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );
