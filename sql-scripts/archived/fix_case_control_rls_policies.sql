-- Script para verificar y crear políticas RLS para case_control
-- ================================================================

-- Verificar políticas existentes para case_control
SELECT 'Políticas RLS existentes para case_control:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'case_control'
ORDER BY policyname;

-- Verificar si RLS está habilitado en la tabla case_control
SELECT 'Estado de RLS en case_control:' as info;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'case_control';

-- Habilitar RLS en case_control si no está habilitado
ALTER TABLE case_control ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para recrearlas (evitar conflictos)
DROP POLICY IF EXISTS "case_control_insert_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_select_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_update_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_delete_policy" ON case_control;

-- Política para INSERT en case_control
-- Permite insertar si el usuario tiene los permisos correspondientes
CREATE POLICY "case_control_insert_policy" ON case_control
    FOR INSERT
    WITH CHECK (
        -- Permitir si el usuario es el propietario del caso
        (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        OR
        -- Permitir si tiene permiso cases.control_own y es su caso
        (
            has_permission(auth.uid(), 'cases.control_own') AND
            (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        )
        OR
        -- Permitir si tiene permiso cases.control_team (sin restricción de equipo por ahora)
        has_permission(auth.uid(), 'cases.control_team')
        OR
        -- Permitir si tiene permiso cases.control_all
        has_permission(auth.uid(), 'cases.control_all')
    );

-- Política para SELECT en case_control
CREATE POLICY "case_control_select_policy" ON case_control
    FOR SELECT
    USING (
        -- Permitir si el usuario es el propietario del caso
        (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        OR
        -- Permitir si tiene permiso case_control.read_own y es su caso
        (
            has_permission(auth.uid(), 'case_control.read_own') AND
            (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        )
        OR
        -- Permitir si tiene permiso case_control.read_team (sin restricción de equipo por ahora)
        has_permission(auth.uid(), 'case_control.read_team')
        OR
        -- Permitir si tiene permiso case_control.read_all
        has_permission(auth.uid(), 'case_control.read_all')
    );

-- Política para UPDATE en case_control
CREATE POLICY "case_control_update_policy" ON case_control
    FOR UPDATE
    USING (
        -- Permitir si el usuario es el propietario del caso
        (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        OR
        -- Permitir si tiene permiso case_control.update_status_own y es su caso
        (
            has_permission(auth.uid(), 'case_control.update_status_own') AND
            (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        )
        OR
        -- Permitir si tiene permiso case_control.update_status_team (sin restricción de equipo por ahora)
        has_permission(auth.uid(), 'case_control.update_status_team')
        OR
        -- Permitir si tiene permiso case_control.update_status_all
        has_permission(auth.uid(), 'case_control.update_status_all')
    )
    WITH CHECK (
        -- Las mismas condiciones para el CHECK
        (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        OR
        (
            has_permission(auth.uid(), 'case_control.update_status_own') AND
            (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        )
        OR
        has_permission(auth.uid(), 'case_control.update_status_team')
        OR
        has_permission(auth.uid(), 'case_control.update_status_all')
    );

-- Política para DELETE en case_control
CREATE POLICY "case_control_delete_policy" ON case_control
    FOR DELETE
    USING (
        -- Permitir si el usuario es el propietario del caso
        (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        OR
        -- Permitir si tiene permiso cases.delete_own y es su caso
        (
            has_permission(auth.uid(), 'cases.delete_own') AND
            (SELECT user_id FROM cases WHERE id = case_control.case_id) = auth.uid()
        )
        OR
        -- Permitir si tiene permiso cases.delete_team (sin restricción de equipo por ahora)
        has_permission(auth.uid(), 'cases.delete_team')
        OR
        -- Permitir si tiene permiso cases.delete_all
        has_permission(auth.uid(), 'cases.delete_all')
    );

-- Verificar las políticas creadas
SELECT 'Políticas RLS creadas para case_control:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'case_control'
ORDER BY policyname;

-- Verificar que RLS está habilitado
SELECT 'Estado final de RLS en case_control:' as info;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'case_control';

SELECT 'Script completado exitosamente - Políticas RLS configuradas para case_control' as status;
