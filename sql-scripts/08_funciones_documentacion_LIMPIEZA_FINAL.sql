-- ================================================================
-- LIMPIEZA Y CORRECCIÓN DEFINITIVA - DOCUMENTACIÓN
-- ================================================================
-- Fecha: 6 de Agosto, 2025
-- Descripción: Eliminar conflictos de funciones y crear versiones definitivas
-- ================================================================

-- PASO 1: ELIMINAR TODAS LAS VERSIONES CONFLICTIVAS
DROP FUNCTION IF EXISTS create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN, UUID);
DROP FUNCTION IF EXISTS create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN);
DROP FUNCTION IF EXISTS create_solution_document(TEXT, JSONB);

DROP FUNCTION IF EXISTS update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN, TEXT, UUID);
DROP FUNCTION IF EXISTS update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN);
DROP FUNCTION IF EXISTS update_solution_document(UUID, JSONB);

DROP FUNCTION IF EXISTS delete_solution_document(UUID, UUID);
DROP FUNCTION IF EXISTS delete_solution_document(UUID);

DROP FUNCTION IF EXISTS save_document_attachment(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS save_document_attachment(UUID, TEXT, TEXT, BIGINT, TEXT);

-- PASO 2: CREAR FUNCIONES ÚNICAS Y DEFINITIVAS

-- ================================================================
-- 1. FUNCIÓN CREAR DOCUMENTO
-- ================================================================
CREATE FUNCTION create_solution_document_final(
    p_title TEXT,
    p_content JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_document_id UUID;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    INSERT INTO solution_documents (
        title, 
        content, 
        created_by,
        updated_by,
        version,
        tags,
        is_published
    ) VALUES (
        p_title, 
        COALESCE(p_content, '[]'::jsonb), 
        current_user_id,
        current_user_id,
        1,
        ARRAY[]::TEXT[],
        false
    ) RETURNING id INTO new_document_id;
    
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
    
    RETURN new_document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. FUNCIÓN ACTUALIZAR DOCUMENTO
-- ================================================================
CREATE FUNCTION update_solution_document_final(
    p_document_id UUID,
    p_content JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    current_version INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    SELECT version INTO current_version
    FROM solution_documents 
    WHERE id = p_document_id;
    
    IF current_version IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    UPDATE solution_documents SET
        content = p_content,
        updated_by = current_user_id,
        updated_at = CURRENT_TIMESTAMP,
        version = version + 1
    WHERE id = p_document_id;
    
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
        'Actualización del contenido'
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. FUNCIÓN ELIMINAR DOCUMENTO
-- ================================================================
CREATE FUNCTION delete_solution_document_final(
    p_document_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    document_title TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    SELECT title INTO document_title
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_title IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Eliminar en orden correcto
    DELETE FROM solution_document_tags WHERE document_id = p_document_id;
    DELETE FROM solution_feedback WHERE document_id = p_document_id;
    DELETE FROM document_attachments WHERE document_id = p_document_id;
    DELETE FROM solution_document_versions WHERE document_id = p_document_id;
    
    UPDATE solution_documents 
    SET replacement_document_id = NULL 
    WHERE replacement_document_id = p_document_id;
    
    DELETE FROM solution_documents WHERE id = p_document_id;
    
    RAISE NOTICE 'Documento eliminado: % ("%") por usuario: %', 
                 p_document_id, document_title, current_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. FUNCIÓN GUARDAR ADJUNTO
-- ================================================================
CREATE FUNCTION save_document_attachment_final(
    p_document_id UUID,
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size BIGINT,
    p_mime_type TEXT
)
RETURNS UUID AS $$
DECLARE
    new_attachment_id UUID;
    current_user_id UUID;
    file_type_calculated TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM solution_documents WHERE id = p_document_id) THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    file_type_calculated := CASE 
        WHEN p_mime_type LIKE 'image/%' THEN 'image'
        WHEN p_mime_type LIKE 'application/pdf' OR p_mime_type LIKE 'application/msword%' OR p_mime_type LIKE 'application/vnd.openxmlformats%' THEN 'document'
        WHEN p_mime_type LIKE 'application/vnd.ms-excel%' OR p_mime_type LIKE 'text/csv' THEN 'spreadsheet'
        ELSE 'other'
    END;
    
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
        file_type_calculated,
        false,
        current_user_id
    ) RETURNING id INTO new_attachment_id;
    
    RETURN new_attachment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. OTORGAR PERMISOS
-- ================================================================
GRANT EXECUTE ON FUNCTION create_solution_document_final(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document_final(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document_final(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_document_attachment_final(UUID, TEXT, TEXT, BIGINT, TEXT) TO authenticated;

-- ================================================================
-- 6. VERIFICACIÓN
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONFLICTOS DE FUNCIONES RESUELTOS';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Funciones creadas:';
    RAISE NOTICE '   - create_solution_document_final(título, contenido)';
    RAISE NOTICE '   - update_solution_document_final(id, contenido)';
    RAISE NOTICE '   - delete_solution_document_final(id)';
    RAISE NOTICE '   - save_document_attachment_final(id, nombre, path, size, mime)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Actualizar frontend para usar nombres _final';
    RAISE NOTICE '';
END $$;
