-- Script temporal para corregir políticas RLS de case_status_control
-- Ejecutar en la consola SQL de Supabase

-- Agregar políticas para INSERT, UPDATE y DELETE en case_status_control
-- Solo los usuarios con rol admin pueden realizar estas operaciones

-- Política para INSERT (crear nuevos estados de control)
CREATE POLICY "case_status_control_insert_policy" ON case_status_control
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Política para UPDATE (actualizar estados de control existentes)
CREATE POLICY "case_status_control_update_policy" ON case_status_control
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Política para DELETE (eliminar estados de control)
CREATE POLICY "case_status_control_delete_policy" ON case_status_control
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid()
            AND r.name = 'admin'
        )
    );
