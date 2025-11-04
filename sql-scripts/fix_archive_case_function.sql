-- Función actualizada para archivar casos que coincida con el esquema actual
-- Reemplaza la función antigua que tenía campos incorrectos

CREATE OR REPLACE FUNCTION archive_case(
    p_case_id UUID,
    p_archive_reason TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    archived_case_id UUID;
    current_user_id UUID;
    case_data RECORD;
    control_data JSONB;
    v_scope TEXT;
    can_archive BOOLEAN := false;
    total_time INTEGER := 0;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = current_user_id) THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- Verificar permisos para archivar casos
    -- Buscar permisos de archive.create para el usuario
    SELECT p.scope INTO v_scope
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE up.id = current_user_id
    AND p.resource = 'archive'
    AND p.action = 'create'
    AND p.is_active = true
    ORDER BY 
        CASE p.scope 
            WHEN 'all' THEN 1
            WHEN 'team' THEN 2
            WHEN 'own' THEN 3
        END
    LIMIT 1;
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'No tienes permisos para archivar casos';
    END IF;
    
    -- Obtener datos del caso
    SELECT c.*
    INTO case_data
    FROM cases c
    WHERE c.id = p_case_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso no encontrado';
    END IF;
    
    -- Verificar si el caso ya está archivado
    IF EXISTS (SELECT 1 FROM archived_cases WHERE original_case_id = p_case_id) THEN
        RAISE EXCEPTION 'El caso ya está archivado';
    END IF;
    
    -- Verificar permisos específicos según el scope
    IF v_scope = 'own' AND case_data.user_id != current_user_id THEN
        can_archive := false;
    ELSIF v_scope = 'team' THEN
        -- Verificar si el usuario y el caso pertenecen al mismo equipo
        -- Por ahora permitimos si es del mismo usuario o si tiene permisos de equipo
        can_archive := true;
    ELSIF v_scope = 'all' THEN
        can_archive := true;
    ELSE
        can_archive := false;
    END IF;
    
    IF NOT can_archive THEN
        RAISE EXCEPTION 'No tienes permisos para archivar este caso';
    END IF;
    
    -- Calcular tiempo total del caso si existe control
    SELECT COALESCE(cc.total_time_minutes, 0)
    INTO total_time
    FROM case_control cc
    WHERE cc.case_id = p_case_id;
    
    -- Recopilar datos de control del caso
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', cc.id,
            'status_id', cc.status_id,
            'total_time_minutes', cc.total_time_minutes,
            'timer_start_at', cc.timer_start_at,
            'is_timer_active', cc.is_timer_active,
            'assigned_at', cc.assigned_at,
            'started_at', cc.started_at,
            'completed_at', cc.completed_at,
            'created_at', cc.created_at,
            'user_id', cc.user_id
        )
    )
    INTO control_data
    FROM case_control cc
    WHERE cc.case_id = p_case_id;
    
    -- Crear entrada en archived_cases con el esquema correcto
    INSERT INTO archived_cases (
        original_case_id, 
        case_number, 
        description, 
        classification,
        total_time_minutes,
        completed_at,
        archived_at,
        archived_by,
        original_data,
        control_data,
        archive_reason
    ) VALUES (
        case_data.id,
        case_data.numero_caso,
        case_data.descripcion,
        case_data.clasificacion,
        total_time,
        (SELECT completed_at FROM case_control WHERE case_id = p_case_id),
        CURRENT_TIMESTAMP,
        current_user_id,
        to_jsonb(case_data),
        COALESCE(control_data, '[]'::jsonb),
        p_archive_reason
    ) RETURNING id INTO archived_case_id;
    
    -- Registrar en audit log
    INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id, reason)
    VALUES ('ARCHIVE', 'CASE', p_case_id, current_user_id, p_archive_reason);
    
    -- ELIMINAR los datos originales para mover (no copiar) el caso
    -- Eliminar entradas de tiempo relacionadas
    DELETE FROM time_entries WHERE case_control_id IN (
        SELECT id FROM case_control WHERE case_id = p_case_id
    );
    
    -- Eliminar entradas de tiempo manual relacionadas  
    DELETE FROM manual_time_entries WHERE case_control_id IN (
        SELECT id FROM case_control WHERE case_id = p_case_id
    );
    
    -- Eliminar control del caso
    DELETE FROM case_control WHERE case_id = p_case_id;
    
    -- MANTENER disposiciones como historial - quitar referencia del caso
    -- Las disposiciones se conservan pero sin referencia directa al caso eliminado
    -- En el futuro, deberían poder referenciar tanto cases como archived_cases
    UPDATE disposiciones_scripts 
    SET case_id = NULL 
    WHERE case_id = p_case_id;
    
    -- Actualizar solution_documents para que referencien el caso archivado
    EXECUTE format('UPDATE solution_documents SET case_id = NULL, archived_case_id = %L WHERE case_id = %L', 
                   archived_case_id, p_case_id);
    
    -- Actualizar notas para que no referencien el caso eliminado
    UPDATE notes 
    SET case_id = NULL 
    WHERE case_id = p_case_id;
    
    -- Finalmente eliminar el caso original
    DELETE FROM cases WHERE id = p_case_id;
    
    RETURN archived_case_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al archivar caso: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario y permisos
COMMENT ON FUNCTION archive_case(UUID, TEXT, UUID) IS 'Archiva un caso respetando permisos granulares y esquema actual';

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION archive_case(UUID, TEXT, UUID) TO authenticated;