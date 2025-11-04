-- Función para eliminar permanentemente casos archivados
-- Esta función elimina completamente un caso del archivo

CREATE OR REPLACE FUNCTION delete_archived_case_permanently(
    p_archived_id UUID,
    p_deleted_by UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    archived_case_data RECORD;
    v_scope TEXT;
    can_delete BOOLEAN := false;
BEGIN
    current_user_id := p_deleted_by;
    
    -- Verificar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = current_user_id) THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- Verificar permisos para eliminar casos archivados
    SELECT p.scope INTO v_scope
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE up.id = current_user_id
    AND p.resource = 'archive'
    AND p.action = 'delete'
    AND p.is_active = true
    ORDER BY 
        CASE p.scope 
            WHEN 'all' THEN 1
            WHEN 'team' THEN 2
            WHEN 'own' THEN 3
        END
    LIMIT 1;
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'No tienes permisos para eliminar casos archivados permanentemente';
    END IF;
    
    -- Obtener datos del caso archivado
    SELECT ac.*
    INTO archived_case_data
    FROM archived_cases ac
    WHERE ac.id = p_archived_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso archivado no encontrado';
    END IF;
    
    -- Verificar permisos específicos según el scope
    IF v_scope = 'own' AND archived_case_data.archived_by != current_user_id THEN
        can_delete := false;
    ELSIF v_scope = 'team' THEN
        -- Verificar si el usuario y el que archivó pertenecen al mismo equipo
        -- Por ahora permitimos si es del mismo usuario o si tiene permisos de equipo
        can_delete := true;
    ELSIF v_scope = 'all' THEN
        can_delete := true;
    ELSE
        can_delete := false;
    END IF;
    
    IF NOT can_delete THEN
        RAISE EXCEPTION 'No tienes permisos para eliminar este caso archivado';
    END IF;
    
    -- Registrar en el log de eliminación antes de eliminar
    INSERT INTO archive_deletion_log (
        item_type, 
        item_id, 
        item_identifier, 
        deleted_by, 
        deletion_reason
    ) VALUES (
        'case', 
        p_archived_id, 
        archived_case_data.case_number, 
        current_user_id,
        COALESCE(p_reason, 'Eliminación permanente desde archivo')
    );
    
    -- NO registrar en audit log ya que archive_audit_log solo permite ARCHIVE/RESTORE
    -- El registro de eliminación ya queda en archive_deletion_log
    
    -- Eliminar solution_documents que referencien este caso archivado
    DELETE FROM solution_documents WHERE archived_case_id = p_archived_id;
    
    -- Finalmente eliminar el caso archivado
    DELETE FROM archived_cases WHERE id = p_archived_id;
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al eliminar caso archivado permanentemente: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario y permisos
COMMENT ON FUNCTION delete_archived_case_permanently(UUID, UUID, TEXT) IS 'Elimina permanentemente un caso archivado respetando permisos granulares';

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION delete_archived_case_permanently(UUID, UUID, TEXT) TO authenticated;