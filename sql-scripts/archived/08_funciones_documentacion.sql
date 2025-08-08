-- ================================================================
-- MÓDULO DE GESTIÓN DE DOCUMENTACIÓN CON PERMISOS GRANULARES
-- ================================================================
-- Descripción: Funciones para gestión de documentación usando permisos granulares
-- Actualización del script 08 para usar sistema de permisos
-- Sistema: Basado en user_has_permission(user_id, "documentation.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  FUNCIONES DE DOCUMENTACIÓN CON';
    RAISE NOTICE '  PERMISOS GRANULARES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 1. FUNCIÓN PARA CREAR DOCUMENTO DE SOLUCIÓN
-- ================================================================
CREATE OR REPLACE FUNCTION create_solution_document(
    p_title TEXT,
    p_content JSONB,
    p_category TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_is_published BOOLEAN DEFAULT false,
    p_created_by_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_document_id UUID;
    creator_user_id UUID;
    v_scope TEXT;
BEGIN
    creator_user_id := COALESCE(p_created_by_user_id, auth.uid());
    
    -- Verificar permisos para crear documentos
    IF NOT user_has_permission(creator_user_id, 'documentation.create_own') 
       AND NOT user_has_permission(creator_user_id, 'documentation.create_team')
       AND NOT user_has_permission(creator_user_id, 'documentation.create_all') THEN
        RAISE EXCEPTION 'Sin permisos para crear documentos';
    END IF;
    
    -- Verificar permisos específicos para publicar
    IF p_is_published = true THEN
        IF NOT user_has_permission(creator_user_id, 'documentation.publish_own') 
           AND NOT user_has_permission(creator_user_id, 'documentation.publish_team')
           AND NOT user_has_permission(creator_user_id, 'documentation.publish_all') THEN
            RAISE EXCEPTION 'Sin permisos para publicar documentos';
        END IF;
    END IF;
    
    -- Crear el documento
    INSERT INTO solution_documents (
        title, content, category, tags, is_published,
        created_by, version
    ) VALUES (
        p_title, p_content, p_category, p_tags, p_is_published,
        creator_user_id, 1
    ) RETURNING id INTO new_document_id;
    
    -- Crear primera versión en historial
    INSERT INTO solution_document_versions (
        document_id, content, version, created_by, change_summary
    ) VALUES (
        new_document_id, p_content, 1, creator_user_id, 'Versión inicial del documento'
    );
    
    RAISE NOTICE 'Documento creado: % por usuario: %', new_document_id, creator_user_id;
    RETURN new_document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN, UUID) IS 'Crea un nuevo documento de solución respetando permisos granulares';

-- ================================================================
-- 2. FUNCIÓN PARA ACTUALIZAR DOCUMENTO DE SOLUCIÓN
-- ================================================================
CREATE OR REPLACE FUNCTION update_solution_document(
    p_document_id UUID,
    p_title TEXT DEFAULT NULL,
    p_content JSONB DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_is_published BOOLEAN DEFAULT NULL,
    p_change_summary TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_creator_id UUID;
    current_published BOOLEAN;
    current_version INTEGER;
    v_scope TEXT;
    can_update BOOLEAN := false;
    was_changed BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del documento
    SELECT created_by, is_published, version 
    INTO document_creator_id, current_published, current_version
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_creator_id IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Verificar permisos de actualización
    v_scope := get_user_highest_scope(current_user_id, 'documentation.update');
    
    CASE v_scope
        WHEN 'all' THEN
            can_update := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_update := true;
        WHEN 'own' THEN
            can_update := (document_creator_id = current_user_id);
        ELSE
            can_update := false;
    END CASE;
    
    IF NOT can_update THEN
        RAISE EXCEPTION 'Sin permisos para actualizar este documento';
    END IF;
    
    -- Verificar permisos específicos para publicar/despublicar
    IF p_is_published IS NOT NULL AND p_is_published != current_published THEN
        IF NOT user_has_permission(current_user_id, 'documentation.publish_own') 
           AND NOT user_has_permission(current_user_id, 'documentation.publish_team')
           AND NOT user_has_permission(current_user_id, 'documentation.publish_all') THEN
            RAISE EXCEPTION 'Sin permisos para cambiar el estado de publicación';
        END IF;
    END IF;
    
    -- Verificar si hubo cambios significativos
    IF p_title IS NOT NULL OR p_content IS NOT NULL OR p_category IS NOT NULL 
       OR p_tags IS NOT NULL OR p_is_published IS NOT NULL THEN
        was_changed := true;
    END IF;
    
    -- Actualizar documento
    UPDATE solution_documents SET
        title = COALESCE(p_title, title),
        content = COALESCE(p_content, content),
        category = COALESCE(p_category, category),
        tags = COALESCE(p_tags, tags),
        is_published = COALESCE(p_is_published, is_published),
        updated_at = CURRENT_TIMESTAMP,
        version = CASE WHEN was_changed THEN version + 1 ELSE version END
    WHERE id = p_document_id;
    
    -- Crear nueva versión si hubo cambios
    IF was_changed THEN
        INSERT INTO solution_document_versions (
            document_id, content, version, created_by, change_summary
        ) VALUES (
            p_document_id, 
            COALESCE(p_content, (SELECT content FROM solution_documents WHERE id = p_document_id)),
            current_version + 1,
            current_user_id,
            COALESCE(p_change_summary, 'Actualización del documento')
        );
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN, TEXT, UUID) IS 'Actualiza un documento de solución respetando permisos granulares';

-- ================================================================
-- 3. FUNCIÓN PARA ELIMINAR DOCUMENTO DE SOLUCIÓN
-- ================================================================
CREATE OR REPLACE FUNCTION delete_solution_document(
    p_document_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_creator_id UUID;
    document_title TEXT;
    v_scope TEXT;
    can_delete BOOLEAN := false;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del documento
    SELECT created_by, title INTO document_creator_id, document_title
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_creator_id IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Verificar permisos de eliminación
    v_scope := get_user_highest_scope(current_user_id, 'documentation.delete');
    
    CASE v_scope
        WHEN 'all' THEN
            can_delete := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_delete := true;
        WHEN 'own' THEN
            can_delete := (document_creator_id = current_user_id);
        ELSE
            can_delete := false;
    END CASE;
    
    IF NOT can_delete THEN
        RAISE EXCEPTION 'Sin permisos para eliminar este documento';
    END IF;
    
    -- Eliminar registros relacionados antes de eliminar el documento principal
    DELETE FROM solution_feedback WHERE document_id = p_document_id;
    DELETE FROM solution_document_versions WHERE document_id = p_document_id;
    DELETE FROM document_attachments WHERE document_id = p_document_id;
    
    -- Eliminar referencias de replacement_document_id que apunten a este documento
    UPDATE solution_documents SET replacement_document_id = NULL WHERE replacement_document_id = p_document_id;
    
    -- Finalmente eliminar el documento principal
    DELETE FROM solution_documents WHERE id = p_document_id;
    
    RAISE NOTICE 'Documento eliminado: % ("%") por usuario: %', p_document_id, document_title, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION delete_solution_document(UUID, UUID) IS 'Elimina un documento de solución respetando permisos granulares';

-- ================================================================
-- 4. FUNCIÓN PARA OBTENER DOCUMENTOS ACCESIBLES
-- ================================================================
CREATE OR REPLACE FUNCTION get_accessible_solution_documents(
    p_user_id UUID DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_is_published BOOLEAN DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category_name TEXT,
    tags TEXT[],
    is_published BOOLEAN,
    version INTEGER,
    created_by_user_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    view_count INTEGER,
    avg_rating DECIMAL,
    feedback_count INTEGER,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    can_publish BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    v_scope TEXT;
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos de lectura
    v_scope := get_user_highest_scope(current_user_id, 'documentation.read');
    
    IF v_scope IS NULL THEN
        RAISE EXCEPTION 'Sin permisos para leer documentos';
    END IF;
    
    -- Construir query base
    base_query := '
        SELECT 
            sd.id,
            sd.title,
            sd.content::text,
            sd.category as category_name,
            sd.tags,
            sd.is_published,
            sd.version,
            up.full_name as created_by_user_name,
            sd.created_at,
            sd.updated_at,
            sd.view_count,
            COALESCE(AVG(sf.rating), 0) as avg_rating,
            COUNT(sf.id) as feedback_count,
            user_can_access_resource($1, ''documentation.update'', sd.created_by, NULL) as can_update,
            user_can_access_resource($1, ''documentation.delete'', sd.created_by, NULL) as can_delete,
            user_can_access_resource($1, ''documentation.publish'', sd.created_by, NULL) as can_publish
        FROM solution_documents sd
        LEFT JOIN user_profiles up ON sd.created_by = up.id
        LEFT JOIN solution_feedback sf ON sd.id = sf.document_id';
    
    -- Agregar condiciones según el scope
    CASE v_scope
        WHEN 'all' THEN
            -- Puede ver todos los documentos publicados y sus propios borradores
            where_conditions := array_append(where_conditions, 
                format('(sd.is_published = true OR sd.created_by = ''%s'')', current_user_id));
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            -- Por ahora igual que 'all'
            where_conditions := array_append(where_conditions, 
                format('(sd.is_published = true OR sd.created_by = ''%s'')', current_user_id));
        WHEN 'own' THEN
            -- Solo puede ver sus propios documentos
            where_conditions := array_append(where_conditions, 
                format('sd.created_by = ''%s''', current_user_id));
    END CASE;
    
    -- Agregar filtros adicionales
    IF p_category IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('sd.category = ''%s''', p_category));
    END IF;
    
    IF p_is_published IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('sd.is_published = %s', p_is_published));
    END IF;
    
    IF p_search_term IS NOT NULL THEN
        where_conditions := array_append(where_conditions, 
            format('(sd.title ILIKE ''%%%s%%'' OR sd.content ILIKE ''%%%s%%'')', p_search_term, p_search_term));
    END IF;
    
    IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
        where_conditions := array_append(where_conditions, 
            format('sd.tags && ARRAY[%s]', array_to_string(p_tags, ',')));
    END IF;
    
    -- Construir query final
    final_query := base_query;
    
    IF array_length(where_conditions, 1) > 0 THEN
        final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    final_query := final_query || 
        format(' GROUP BY sd.id, sd.title, sd.content, sd.category, sd.tags, sd.is_published, sd.version, up.full_name, sd.created_at, sd.updated_at, sd.view_count
                ORDER BY sd.updated_at DESC LIMIT %s OFFSET %s', p_limit, p_offset);
    
    -- Ejecutar query
    RETURN QUERY EXECUTE final_query USING current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_accessible_solution_documents(UUID, TEXT, BOOLEAN, TEXT, TEXT[], INTEGER, INTEGER) IS 'Obtiene documentos accesibles según permisos granulares';

-- ================================================================
-- 5. FUNCIÓN PARA AGREGAR FEEDBACK A DOCUMENTO
-- ================================================================
CREATE OR REPLACE FUNCTION add_solution_feedback(
    p_document_id UUID,
    p_rating INTEGER,
    p_comment TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_feedback_id UUID;
    current_user_id UUID;
    document_exists BOOLEAN;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos para agregar feedback
    IF NOT user_has_permission(current_user_id, 'documentation.feedback_own') 
       AND NOT user_has_permission(current_user_id, 'documentation.feedback_team')
       AND NOT user_has_permission(current_user_id, 'documentation.feedback_all') THEN
        RAISE EXCEPTION 'Sin permisos para agregar feedback a documentos';
    END IF;
    
    -- Verificar que el documento existe y está publicado
    SELECT EXISTS(SELECT 1 FROM solution_documents WHERE id = p_document_id AND is_published = true)
    INTO document_exists;
    
    IF NOT document_exists THEN
        RAISE EXCEPTION 'Documento no encontrado o no está publicado';
    END IF;
    
    -- Validar rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'El rating debe estar entre 1 y 5';
    END IF;
    
    -- Verificar si ya existe feedback del usuario para este documento
    IF EXISTS (SELECT 1 FROM solution_feedback WHERE document_id = p_document_id AND user_id = current_user_id) THEN
        -- Actualizar feedback existente
        UPDATE solution_feedback SET
            rating = p_rating,
            comment = p_comment,
            updated_at = CURRENT_TIMESTAMP
        WHERE document_id = p_document_id AND user_id = current_user_id
        RETURNING id INTO new_feedback_id;
    ELSE
        -- Crear nuevo feedback
        INSERT INTO solution_feedback (
            document_id, user_id, rating, comment
        ) VALUES (
            p_document_id, current_user_id, p_rating, p_comment
        ) RETURNING id INTO new_feedback_id;
    END IF;
    
    RETURN new_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION add_solution_feedback(UUID, INTEGER, TEXT, UUID) IS 'Agrega feedback a un documento respetando permisos granulares';

-- ================================================================
-- 6. FUNCIÓN PARA INCREMENTAR VISUALIZACIONES
-- ================================================================
CREATE OR REPLACE FUNCTION increment_document_views(
    p_document_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_exists BOOLEAN;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Verificar permisos de lectura
    IF NOT user_has_permission(current_user_id, 'documentation.read_own') 
       AND NOT user_has_permission(current_user_id, 'documentation.read_team')
       AND NOT user_has_permission(current_user_id, 'documentation.read_all') THEN
        RAISE EXCEPTION 'Sin permisos para ver documentos';
    END IF;
    
    -- Verificar que el documento existe
    SELECT EXISTS(SELECT 1 FROM solution_documents WHERE id = p_document_id)
    INTO document_exists;
    
    IF NOT document_exists THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Incrementar contador de visualizaciones
    UPDATE solution_documents SET
        view_count = view_count + 1,
        last_viewed_at = CURRENT_TIMESTAMP
    WHERE id = p_document_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION increment_document_views(UUID, UUID) IS 'Incrementa las visualizaciones de un documento respetando permisos granulares';

-- ================================================================
-- 7. FUNCIÓN PARA OBTENER HISTORIAL DE VERSIONES
-- ================================================================
CREATE OR REPLACE FUNCTION get_document_version_history(
    p_document_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    version_number INTEGER,
    title TEXT,
    change_summary TEXT,
    created_by_user_name TEXT,
    created_at TIMESTAMPTZ,
    is_current BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    document_creator_id UUID;
    current_version INTEGER;
    can_view_history BOOLEAN := false;
    v_scope TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del documento
    SELECT created_by, version INTO document_creator_id, current_version
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_creator_id IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Verificar permisos para ver historial
    v_scope := get_user_highest_scope(current_user_id, 'documentation.read');
    
    CASE v_scope
        WHEN 'all' THEN
            can_view_history := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_view_history := true;
        WHEN 'own' THEN
            can_view_history := (document_creator_id = current_user_id);
        ELSE
            can_view_history := false;
    END CASE;
    
    IF NOT can_view_history THEN
        RAISE EXCEPTION 'Sin permisos para ver el historial de este documento';
    END IF;
    
    -- Obtener historial de versiones
    RETURN QUERY
    SELECT 
        sdv.id,
        sdv.version_number,
        sdv.title,
        sdv.change_summary,
        up.full_name as created_by_user_name,
        sdv.created_at,
        (sdv.version_number = current_version) as is_current
    FROM solution_document_versions sdv
    LEFT JOIN user_profiles up ON sdv.created_by = up.id
    WHERE sdv.document_id = p_document_id
    ORDER BY sdv.version_number DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_document_version_history(UUID, UUID, INTEGER) IS 'Obtiene el historial de versiones de un documento respetando permisos granulares';

-- ================================================================
-- 8. FUNCIÓN PARA PUBLICAR/DESPUBLICAR DOCUMENTO
-- ================================================================
CREATE OR REPLACE FUNCTION toggle_document_publication(
    p_document_id UUID,
    p_is_published BOOLEAN,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_creator_id UUID;
    can_publish BOOLEAN := false;
    v_scope TEXT;
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del documento
    SELECT created_by INTO document_creator_id
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_creator_id IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Verificar permisos de publicación
    v_scope := get_user_highest_scope(current_user_id, 'documentation.publish');
    
    CASE v_scope
        WHEN 'all' THEN
            can_publish := true;
        WHEN 'team' THEN
            -- TODO: Implementar lógica de equipo
            can_publish := true;
        WHEN 'own' THEN
            can_publish := (document_creator_id = current_user_id);
        ELSE
            can_publish := false;
    END CASE;
    
    IF NOT can_publish THEN
        RAISE EXCEPTION 'Sin permisos para cambiar el estado de publicación de este documento';
    END IF;
    
    -- Actualizar estado de publicación
    UPDATE solution_documents SET
        is_published = p_is_published,
        published_at = CASE WHEN p_is_published THEN CURRENT_TIMESTAMP ELSE NULL END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_document_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION toggle_document_publication(UUID, BOOLEAN, UUID) IS 'Cambia el estado de publicación de un documento respetando permisos granulares';

-- ================================================================
-- 9. OTORGAR PERMISOS
-- ================================================================

-- Funciones principales
GRANT EXECUTE ON FUNCTION create_solution_document(TEXT, TEXT, UUID, TEXT[], BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document(UUID, TEXT, TEXT, UUID, TEXT[], BOOLEAN, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_solution_documents(UUID, UUID, BOOLEAN, TEXT, TEXT[], INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_solution_feedback(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_document_views(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_version_history(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_document_publication(UUID, BOOLEAN, UUID) TO authenticated;

-- ================================================================
-- 10. VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    function_count INTEGER;
    test_user_id UUID;
BEGIN
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'create_solution_document', 'update_solution_document', 'delete_solution_document',
        'get_accessible_solution_documents', 'add_solution_feedback', 'increment_document_views',
        'get_document_version_history', 'toggle_document_publication'
    );
    
    RAISE NOTICE 'VERIFICACIÓN FINAL - DOCUMENTACIÓN:';
    RAISE NOTICE '- Funciones creadas: %', function_count;
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '- Usuario de prueba: %', test_user_id;
        
        -- Verificar si puede leer documentación
        IF user_has_permission(test_user_id, 'documentation.read_own') OR 
           user_has_permission(test_user_id, 'documentation.read_team') OR 
           user_has_permission(test_user_id, 'documentation.read_all') THEN
            RAISE NOTICE '- Permisos de lectura documentación: OK';
        ELSE
            RAISE NOTICE '- Permisos de lectura documentación: NO DISPONIBLE';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE DOCUMENTACIÓN CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- FUNCIÓN ADICIONAL: GET_ACTIVE_DOCUMENT_TYPES
-- ================================================================
CREATE OR REPLACE FUNCTION get_active_document_types()
RETURNS TABLE (
    id UUID,
    name CHARACTER VARYING,
    description TEXT,
    icon CHARACTER VARYING,
    color CHARACTER VARYING,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Verificar si el usuario tiene permisos para leer tipos de documentos
    IF NOT user_has_permission(auth.uid(), 'documentation.read_own') 
       AND NOT user_has_permission(auth.uid(), 'documentation.read_team')
       AND NOT user_has_permission(auth.uid(), 'documentation.read_all') THEN
        RAISE EXCEPTION 'Sin permisos para leer tipos de documentos';
    END IF;
    
    -- Retornar tipos de documentos activos (ORDER CORRECTO DE CAMPOS)
    RETURN QUERY
    SELECT 
        sdt.id,
        sdt.name,
        sdt.description,
        sdt.icon,
        sdt.color,
        sdt.is_active,
        sdt.created_at,
        sdt.updated_at
    FROM solution_document_types sdt
    WHERE sdt.is_active = true
    ORDER BY sdt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_active_document_types() IS 'Obtiene todos los tipos de documentos activos respetando permisos granulares';
