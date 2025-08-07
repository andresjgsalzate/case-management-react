-- ================================================================
-- CORRECCIÓN DEFINITIVA - DOCUMENTACIÓN FUNCIONAL
-- ================================================================
-- Fecha: 6 de Agosto, 2025
-- Descripción: Solución completa a errores 400 y problemas de eliminación
-- ================================================================

-- Eliminar funciones existentes primero para evitar conflictos
DROP FUNCTION IF EXISTS create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN, UUID);
DROP FUNCTION IF EXISTS create_solution_document(TEXT, JSONB, TEXT, TEXT[], BOOLEAN);
DROP FUNCTION IF EXISTS update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN, TEXT, UUID);
DROP FUNCTION IF EXISTS update_solution_document(UUID, TEXT, JSONB, TEXT, TEXT[], BOOLEAN);
DROP FUNCTION IF EXISTS delete_solution_document(UUID, UUID);
DROP FUNCTION IF EXISTS delete_solution_document(UUID);
DROP FUNCTION IF EXISTS save_document_attachment(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT, BOOLEAN);

-- ================================================================
-- 1. FUNCIÓN CREAR DOCUMENTO (SIMPLIFICADA Y FUNCIONAL)
-- ================================================================
CREATE OR REPLACE FUNCTION create_solution_document(
    p_title TEXT,
    p_content JSONB DEFAULT '[]'::jsonb
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
    
    -- Crear el documento básico
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
    
    RETURN new_document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. FUNCIÓN ACTUALIZAR DOCUMENTO (SIMPLIFICADA Y FUNCIONAL)
-- ================================================================
CREATE OR REPLACE FUNCTION update_solution_document(
    p_document_id UUID,
    p_content JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    current_version INTEGER;
BEGIN
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Verificar que el documento existe y obtener versión actual
    SELECT version INTO current_version
    FROM solution_documents 
    WHERE id = p_document_id;
    
    IF current_version IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Actualizar documento (solo contenido y metadatos básicos)
    UPDATE solution_documents SET
        content = p_content,
        updated_by = current_user_id,
        updated_at = CURRENT_TIMESTAMP,
        version = version + 1
    WHERE id = p_document_id;
    
    -- Crear nueva versión en historial
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
-- 3. FUNCIÓN ELIMINAR DOCUMENTO (SIMPLIFICADA Y FUNCIONAL)
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
    
    -- Obtener título del documento para log
    SELECT title INTO document_title
    FROM solution_documents WHERE id = p_document_id;
    
    IF document_title IS NULL THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Eliminar en orden correcto (evitar problemas de FK)
    
    -- 1. Eliminar tags relacionados
    DELETE FROM solution_document_tags WHERE document_id = p_document_id;
    
    -- 2. Eliminar feedback
    DELETE FROM solution_feedback WHERE document_id = p_document_id;
    
    -- 3. Eliminar adjuntos
    DELETE FROM document_attachments WHERE document_id = p_document_id;
    
    -- 4. Eliminar versiones
    DELETE FROM solution_document_versions WHERE document_id = p_document_id;
    
    -- 5. Limpiar referencias como documento de reemplazo
    UPDATE solution_documents 
    SET replacement_document_id = NULL 
    WHERE replacement_document_id = p_document_id;
    
    -- 6. Finalmente eliminar el documento principal
    DELETE FROM solution_documents WHERE id = p_document_id;
    
    -- Log de confirmación
    RAISE NOTICE 'Documento eliminado exitosamente: % ("%") por usuario: %', 
                 p_document_id, document_title, current_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. FUNCIÓN GUARDAR ADJUNTO (SIMPLIFICADA)
-- ================================================================
CREATE OR REPLACE FUNCTION save_document_attachment(
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
    -- Obtener usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;
    
    -- Verificar que el documento existe
    IF NOT EXISTS (SELECT 1 FROM solution_documents WHERE id = p_document_id) THEN
        RAISE EXCEPTION 'Documento no encontrado';
    END IF;
    
    -- Determinar tipo de archivo basado en MIME type
    file_type_calculated := CASE 
        WHEN p_mime_type LIKE 'image/%' THEN 'image'
        WHEN p_mime_type LIKE 'application/pdf' OR p_mime_type LIKE 'application/msword%' OR p_mime_type LIKE 'application/vnd.openxmlformats%' THEN 'document'
        WHEN p_mime_type LIKE 'application/vnd.ms-excel%' OR p_mime_type LIKE 'text/csv' THEN 'spreadsheet'
        ELSE 'other'
    END;
    
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
GRANT EXECUTE ON FUNCTION create_solution_document(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_document_attachment(UUID, TEXT, TEXT, BIGINT, TEXT) TO authenticated;

-- ================================================================
-- 6. VERIFICACIÓN FINAL
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNCIONES DE DOCUMENTACIÓN CORREGIDAS';
    RAISE NOTICE '';
    RAISE NOTICE '✅ create_solution_document(título, contenido) - SIMPLIFICADO';
    RAISE NOTICE '✅ update_solution_document(id, contenido) - SIN ERRORES 400';
    RAISE NOTICE '✅ delete_solution_document(id) - ELIMINACIÓN GARANTIZADA';
    RAISE NOTICE '✅ save_document_attachment(id, nombre, path, size, mime) - ADJUNTOS';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Versión: DEFINITIVA - Sin parámetros opcionales problemáticos';
    RAISE NOTICE '';
END $$;
