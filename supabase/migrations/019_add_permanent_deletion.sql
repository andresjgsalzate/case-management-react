-- =====================================================
-- Función de Eliminación Permanente para Administradores
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Agrega funciones para que solo los administradores puedan
--             eliminar permanentemente casos y TODOs desde el archivo

-- =====================================================
-- FUNCIÓN PARA ELIMINAR CASOS ARCHIVADOS PERMANENTEMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION delete_archived_case_permanently(
    p_archived_id uuid,
    p_deleted_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
    v_is_admin boolean := false;
    v_case_number varchar;
BEGIN
    -- Verificar que el usuario es administrador
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = p_deleted_by 
        AND up.is_active = true
        AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only administrators can permanently delete archived cases';
    END IF;
    
    -- Obtener número de caso para logging
    SELECT case_number INTO v_case_number
    FROM archived_cases 
    WHERE id = p_archived_id;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found';
    END IF;
    
    -- Registrar la eliminación en logs (opcional - crear tabla si no existe)
    BEGIN
        INSERT INTO archive_deletion_log (
            item_type,
            item_id,
            item_identifier,
            deleted_by,
            deleted_at,
            deletion_reason
        ) VALUES (
            'case',
            p_archived_id,
            v_case_number,
            p_deleted_by,
            now(),
            p_reason
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Si la tabla no existe, continuar sin registrar
            NULL;
    END;
    
    -- Eliminar permanentemente el caso archivado
    DELETE FROM archived_cases 
    WHERE id = p_archived_id;
    
    -- Verificar que se eliminó
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete archived case';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN PARA ELIMINAR TODOS ARCHIVADOS PERMANENTEMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION delete_archived_todo_permanently(
    p_archived_id uuid,
    p_deleted_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
    v_is_admin boolean := false;
    v_todo_title varchar;
BEGIN
    -- Verificar que el usuario es administrador
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = p_deleted_by 
        AND up.is_active = true
        AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only administrators can permanently delete archived TODOs';
    END IF;
    
    -- Obtener título del TODO para logging
    SELECT title INTO v_todo_title
    FROM archived_todos 
    WHERE id = p_archived_id;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found';
    END IF;
    
    -- Registrar la eliminación en logs (opcional - crear tabla si no existe)
    BEGIN
        INSERT INTO archive_deletion_log (
            item_type,
            item_id,
            item_identifier,
            deleted_by,
            deleted_at,
            deletion_reason
        ) VALUES (
            'todo',
            p_archived_id,
            v_todo_title,
            p_deleted_by,
            now(),
            p_reason
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Si la tabla no existe, continuar sin registrar
            NULL;
    END;
    
    -- Eliminar permanentemente el TODO archivado
    DELETE FROM archived_todos 
    WHERE id = p_archived_id;
    
    -- Verificar que se eliminó
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete archived TODO';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TABLA DE LOG PARA ELIMINACIONES (OPCIONAL)
-- =====================================================

-- Crear tabla de log para registrar eliminaciones permanentes
CREATE TABLE IF NOT EXISTS archive_deletion_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type varchar(10) NOT NULL CHECK (item_type IN ('case', 'todo')),
    item_id uuid NOT NULL,
    item_identifier varchar(255) NOT NULL, -- case_number o title
    deleted_by uuid NOT NULL REFERENCES user_profiles(id),
    deleted_at timestamptz NOT NULL DEFAULT now(),
    deletion_reason text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_archive_deletion_log_deleted_by ON archive_deletion_log(deleted_by);
CREATE INDEX IF NOT EXISTS idx_archive_deletion_log_deleted_at ON archive_deletion_log(deleted_at);
CREATE INDEX IF NOT EXISTS idx_archive_deletion_log_item_type ON archive_deletion_log(item_type);

-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA DE LOG
-- =====================================================

ALTER TABLE archive_deletion_log ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver el log de eliminaciones
CREATE POLICY "Only admins can view deletion log" ON archive_deletion_log
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT up.id FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Solo el sistema puede insertar en el log (vía función SECURITY DEFINER)
CREATE POLICY "System can insert deletion log" ON archive_deletion_log
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- FUNCIÓN PARA VERIFICAR PERMISOS DE ELIMINACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION can_delete_archived_items(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = user_id 
        AND up.is_active = true
        AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION delete_archived_case_permanently(uuid, uuid, TEXT) IS 'Elimina permanentemente un caso archivado - Solo administradores';
COMMENT ON FUNCTION delete_archived_todo_permanently(uuid, uuid, TEXT) IS 'Elimina permanentemente un TODO archivado - Solo administradores';
COMMENT ON FUNCTION can_delete_archived_items(uuid) IS 'Verifica si un usuario puede eliminar elementos archivados permanentemente';
COMMENT ON TABLE archive_deletion_log IS 'Log de eliminaciones permanentes de elementos archivados';

-- =====================================================
-- VISTA PARA ESTADÍSTICAS DE ELIMINACIONES
-- =====================================================

CREATE OR REPLACE VIEW archive_deletion_stats AS
SELECT 
    item_type,
    COUNT(*) as total_deleted,
    COUNT(CASE WHEN deleted_at >= date_trunc('month', now()) THEN 1 END) as deleted_this_month,
    COUNT(CASE WHEN deleted_at >= date_trunc('year', now()) THEN 1 END) as deleted_this_year
FROM archive_deletion_log
GROUP BY item_type;
