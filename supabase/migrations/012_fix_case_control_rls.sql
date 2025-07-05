-- Migración 012: Corregir relaciones y RLS del módulo Control de Casos
-- Esta migración corrige los problemas encontrados en las migraciones 009 y 011

-- 1. Primero eliminar todas las políticas RLS que dependen de las funciones
DROP POLICY IF EXISTS "case_status_control_select" ON case_status_control;
DROP POLICY IF EXISTS "case_status_control_insert" ON case_status_control;
DROP POLICY IF EXISTS "case_status_control_update" ON case_status_control;
DROP POLICY IF EXISTS "case_status_control_delete" ON case_status_control;
DROP POLICY IF EXISTS "case_status_control_select_policy" ON case_status_control;

DROP POLICY IF EXISTS "case_control_select" ON case_control;
DROP POLICY IF EXISTS "case_control_insert" ON case_control;
DROP POLICY IF EXISTS "case_control_update" ON case_control;
DROP POLICY IF EXISTS "case_control_delete" ON case_control;
DROP POLICY IF EXISTS "case_control_select_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_insert_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_update_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_delete_policy" ON case_control;

DROP POLICY IF EXISTS "time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete" ON time_entries;
DROP POLICY IF EXISTS "time_entries_select_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON time_entries;

DROP POLICY IF EXISTS "manual_time_entries_select" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_insert" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_update" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_delete" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_select_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_insert_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_update_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_delete_policy" ON manual_time_entries;

-- 2. Ahora eliminar las funciones con errores
DROP FUNCTION IF EXISTS has_case_control_permission(text);
DROP FUNCTION IF EXISTS is_case_control_owner(uuid);

-- 3. Recrear las funciones corregidas
CREATE OR REPLACE FUNCTION has_case_control_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid() 
        AND p.name = permission_name
        AND up.is_active = true
        AND r.is_active = true
        AND p.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear función de verificación de propietario corregida
CREATE OR REPLACE FUNCTION is_case_control_owner(case_control_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN case_control_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear todas las políticas RLS corregidas
-- Políticas para case_status_control (solo lectura para usuarios autenticados)
CREATE POLICY "case_status_control_select_policy" ON case_status_control
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Políticas para case_control
CREATE POLICY "case_control_select_policy" ON case_control
    FOR SELECT
    USING (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    );

CREATE POLICY "case_control_insert_policy" ON case_control
    FOR INSERT
    WITH CHECK (
        has_case_control_permission('case_control.assign_cases') AND
        user_id = auth.uid()
    );

CREATE POLICY "case_control_update_policy" ON case_control
    FOR UPDATE
    USING (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    )
    WITH CHECK (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    );

CREATE POLICY "case_control_delete_policy" ON case_control
    FOR DELETE
    USING (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    );

-- Políticas para time_entries
CREATE POLICY "time_entries_select_policy" ON time_entries
    FOR SELECT
    USING (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    );

CREATE POLICY "time_entries_insert_policy" ON time_entries
    FOR INSERT
    WITH CHECK (
        has_case_control_permission('case_control.start_timer') AND
        user_id = auth.uid()
    );

CREATE POLICY "time_entries_update_policy" ON time_entries
    FOR UPDATE
    USING (
        has_case_control_permission('case_control.edit_time') AND
        user_id = auth.uid()
    )
    WITH CHECK (
        has_case_control_permission('case_control.edit_time') AND
        user_id = auth.uid()
    );

CREATE POLICY "time_entries_delete_policy" ON time_entries
    FOR DELETE
    USING (
        has_case_control_permission('case_control.delete_time') AND
        user_id = auth.uid()
    );

-- Políticas para manual_time_entries
CREATE POLICY "manual_time_entries_select_policy" ON manual_time_entries
    FOR SELECT
    USING (
        has_case_control_permission('case_control.view_all') OR
        (has_case_control_permission('case_control.view_own') AND user_id = auth.uid())
    );

CREATE POLICY "manual_time_entries_insert_policy" ON manual_time_entries
    FOR INSERT
    WITH CHECK (
        has_case_control_permission('case_control.add_manual_time') AND
        user_id = auth.uid() AND
        created_by = auth.uid()
    );

CREATE POLICY "manual_time_entries_update_policy" ON manual_time_entries
    FOR UPDATE
    USING (
        has_case_control_permission('case_control.edit_time') AND
        created_by = auth.uid()
    )
    WITH CHECK (
        has_case_control_permission('case_control.edit_time') AND
        created_by = auth.uid()
    );

CREATE POLICY "manual_time_entries_delete_policy" ON manual_time_entries
    FOR DELETE
    USING (
        has_case_control_permission('case_control.delete_time') AND
        created_by = auth.uid()
    );

-- 5. Asegurar que RLS está habilitado en todas las tablas
ALTER TABLE case_status_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_time_entries ENABLE ROW LEVEL SECURITY;
