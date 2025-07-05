-- Migración 011: Políticas RLS para Control de Casos

-- Habilitar RLS en todas las tablas del módulo
ALTER TABLE case_status_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_time_entries ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar permisos de control de casos
CREATE OR REPLACE FUNCTION has_case_control_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN role_permissions rp ON up.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid()
        AND p.name = permission_name
        AND up.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si puede ver todos los controles (admin)
CREATE OR REPLACE FUNCTION can_view_all_case_controls()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_case_control_permission('case_control.view_all');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si puede ver sus propios controles
CREATE OR REPLACE FUNCTION can_view_own_case_controls()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_case_control_permission('case_control.view_own') OR 
           has_case_control_permission('case_control.view_all');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para case_status_control (todos pueden leer, solo admin puede modificar)
CREATE POLICY "case_status_control_select" ON case_status_control
    FOR SELECT USING (has_case_control_permission('case_control.view'));

CREATE POLICY "case_status_control_insert" ON case_status_control
    FOR INSERT WITH CHECK (has_case_control_permission('case_control.manage_status'));

CREATE POLICY "case_status_control_update" ON case_status_control
    FOR UPDATE USING (has_case_control_permission('case_control.manage_status'));

CREATE POLICY "case_status_control_delete" ON case_status_control
    FOR DELETE USING (has_case_control_permission('case_control.manage_status'));

-- Políticas para case_control
CREATE POLICY "case_control_select" ON case_control
    FOR SELECT USING (
        can_view_all_case_controls() OR 
        (can_view_own_case_controls() AND user_id = auth.uid())
    );

CREATE POLICY "case_control_insert" ON case_control
    FOR INSERT WITH CHECK (
        has_case_control_permission('case_control.assign_cases') AND
        (can_view_all_case_controls() OR user_id = auth.uid())
    );

CREATE POLICY "case_control_update" ON case_control
    FOR UPDATE USING (
        (has_case_control_permission('case_control.reassign_cases') AND can_view_all_case_controls()) OR
        (has_case_control_permission('case_control.update_status') AND user_id = auth.uid())
    );

CREATE POLICY "case_control_delete" ON case_control
    FOR DELETE USING (
        has_case_control_permission('case_control.reassign_cases') AND 
        can_view_all_case_controls()
    );

-- Políticas para time_entries
CREATE POLICY "time_entries_select" ON time_entries
    FOR SELECT USING (
        can_view_all_case_controls() OR 
        (can_view_own_case_controls() AND user_id = auth.uid())
    );

CREATE POLICY "time_entries_insert" ON time_entries
    FOR INSERT WITH CHECK (
        has_case_control_permission('case_control.start_timer') AND
        (can_view_all_case_controls() OR user_id = auth.uid())
    );

CREATE POLICY "time_entries_update" ON time_entries
    FOR UPDATE USING (
        (has_case_control_permission('case_control.edit_time') AND can_view_all_case_controls()) OR
        (has_case_control_permission('case_control.start_timer') AND user_id = auth.uid())
    );

CREATE POLICY "time_entries_delete" ON time_entries
    FOR DELETE USING (
        (has_case_control_permission('case_control.delete_time') AND can_view_all_case_controls()) OR
        (has_case_control_permission('case_control.delete_time') AND user_id = auth.uid())
    );

-- Políticas para manual_time_entries
CREATE POLICY "manual_time_entries_select" ON manual_time_entries
    FOR SELECT USING (
        can_view_all_case_controls() OR 
        (can_view_own_case_controls() AND user_id = auth.uid())
    );

CREATE POLICY "manual_time_entries_insert" ON manual_time_entries
    FOR INSERT WITH CHECK (
        has_case_control_permission('case_control.add_manual_time') AND
        (can_view_all_case_controls() OR user_id = auth.uid()) AND
        created_by = auth.uid()
    );

CREATE POLICY "manual_time_entries_update" ON manual_time_entries
    FOR UPDATE USING (
        (has_case_control_permission('case_control.edit_time') AND can_view_all_case_controls()) OR
        (has_case_control_permission('case_control.edit_time') AND user_id = auth.uid())
    );

CREATE POLICY "manual_time_entries_delete" ON manual_time_entries
    FOR DELETE USING (
        (has_case_control_permission('case_control.delete_time') AND can_view_all_case_controls()) OR
        (has_case_control_permission('case_control.delete_time') AND user_id = auth.uid())
    );
