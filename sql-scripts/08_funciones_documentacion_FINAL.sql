-- ================================================================
-- MÓDULO DE DOCUMENTACIÓN - SOLUCIÓN DEFINITIVA
-- ================================================================
-- Descripción: Funciones corregidas y simplificadas para documentación
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- ================================================================
-- 1. FUNCIÓN CREAR DOCUMENTO (SIMPLIFICADA)
-- ================================================================
CREATE OR REPLACE FUNCTION create_solution_document(
    p_title TEXT,
    p_content JSONB DEFAULT '[]'::jsonb,
    p_category TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_is_published BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    new_document_id UUID;
    current_user_id UUID;
BEGIN
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Crear el documento con contenido vacío inicial
    INSERT INTO solution_documents (
        title, 
        content, 
        category, 
        tags, 
        is_published,
        created_by,
        version
    ) VALUES (
        p_title, 
        COALESCE(p_content, '[]'::jsonb), 
        p_category, 
        COALESCE(p_tags, ARRAY[]::TEXT[]), 
        p_is_published,
        current_user_id,
        1
    ) RETURNING id INTO new_document_id;
    
    -- Crear primera versión en historial
    INSERT INTO solution_document_versions (
        document_id, 
        content, 
        version, 
        created_by, 
        change_summary
    ) VALUES (
        new_document_id, 
        COALESCE(p_content, '[]'::jsonb), 
        1, 
        current_user_id, 
        'Versión inicial del documento'
    );
    
    RAISE NOTICE 'Documento creado: % por usuario: %', new_document_id, current_user_id;
    RETURN new_document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. FUNCIÓN ACTUALIZAR DOCUMENTO (SIMPLIFICADA)
-- ================================================================
CREATE OR REPLACE FUNCTION update_solution_document(
    p_document_id UUID,
    p_title TEXT DEFAULT NULL,
    p_content JSONB DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_is_published BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    current_version INTEGER;
    content_changed BOOLEAN := false;
BEGIN
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Verificar que el documento existe
    SELECT version INTO current_version
    FROM solution_documents 
    WHERE id = p_document_id;
    
    IF current_version IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Verificar si el contenido cambió
    IF p_content IS NOT NULL THEN
        content_changed := true;
    END IF;
    
    -- Actualizar documento
    UPDATE solution_documents SET
        title = COALESCE(p_title, title),
        content = COALESCE(p_content, content),
        category = COALESCE(p_category, category),
        tags = COALESCE(p_tags, tags),
        is_published = COALESCE(p_is_published, is_published),
        updated_by = current_user_id,
        updated_at = CURRENT_TIMESTAMP,
        version = CASE WHEN content_changed THEN version + 1 ELSE version END
    WHERE id = p_document_id;
    
    -- Crear nueva versión si el contenido cambió
    IF content_changed THEN
        INSERT INTO solution_document_versions (
            document_id, 
            content, 
            version, 
            created_by, 
            change_summary
        ) VALUES (
            p_document_id, 
            p_content,
            current_version + 1,
            current_user_id,
            'Actualización del documento'
        );
    END IF;
    
    RAISE NOTICE 'Documento actualizado: % por usuario: %', p_document_id, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. FUNCIÓN ELIMINAR DOCUMENTO (CON CASCADE)
-- ================================================================
CREATE OR REPLACE FUNCTION delete_solution_document(
    p_document_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_title TEXT;
BEGIN
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Obtener título del documento
    SELECT title INTO document_title
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_title IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Eliminar registros relacionados (CASCADE)
    DELETE FROM solution_feedback WHERE document_id = p_document_id;
    DELETE FROM solution_document_versions WHERE document_id = p_document_id;
    DELETE FROM document_attachments WHERE document_id = p_document_id;
    DELETE FROM solution_document_tags WHERE document_id = p_document_id;
    
    -- Limpiar referencias
    UPDATE solution_documents 
    SET replacement_document_id = NULL 
    WHERE replacement_document_id = p_document_id;
    
    -- Eliminar documento principal
    DELETE FROM solution_documents WHERE id = p_document_id;
    
    RAISE NOTICE 'Documento eliminado: % ("%") por usuario: %', p_document_id, document_title, current_user_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. FUNCIÓN GUARDAR ADJUNTO
-- ================================================================
CREATE OR REPLACE FUNCTION save_document_attachment(
    p_document_id UUID,
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size BIGINT,
    p_mime_type TEXT,
    p_file_type TEXT DEFAULT 'other',
    p_is_embedded BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    new_attachment_id UUID;
    current_user_id UUID;
BEGIN
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Verificar que el documento existe
    IF NOT EXISTS (SELECT 1 FROM solution_documents WHERE id = p_document_id) THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Guardar adjunto
    INSERT INTO document_attachments (
        document_id,
        file_name,
        file_path,
        file_size,
        mime_type,
        file_type,
        is_embedded,
        uploaded_by
    ) VALUES (
        p_document_id,
        p_file_name,
        p_file_path,
        p_file_size,
        p_mime_type,
        p_file_type,
        p_is_embedded,
        current_user_id
    ) RETURNING id INTO new_attachment_id;
    
    RAISE NOTICE 'Adjunto guardado: % para documento: %', new_attachment_id, p_document_id;
    RETURN new_attachment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. OTORGAR PERMISOS
-- ================================================================
GRANT EXECUTE ON FUNCTION create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_document_attachment(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT, BOOLEAN) TO authenticated;

-- ================================================================
-- 6. VERIFICACIÓN
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE DOCUMENTACIÓN FINALES CREADAS';
    RAISE NOTICE '- create_solution_document: LISTO';
    RAISE NOTICE '- update_solution_document: LISTO';
    RAISE NOTICE '- delete_solution_document: LISTO';
    RAISE NOTICE '- save_document_attachment: LISTO';
    RAISE NOTICE '';
END $$;
