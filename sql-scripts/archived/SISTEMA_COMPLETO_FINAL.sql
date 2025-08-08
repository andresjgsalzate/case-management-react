-- ====================================================================
-- CONFIGURACIÓN COMPLETA DEL SISTEMA - VERSIÓN FINAL UNIFICADA
-- ====================================================================
-- Descripción: Script único que contiene todas las funciones necesarias
-- para el sistema de gestión de casos y documentación
-- Versión: Final - 6 de Agosto, 2025
-- ====================================================================

-- ====================
-- 1. DATOS ESENCIALES
-- ====================

-- Roles y permisos básicos
INSERT INTO user_roles (name, description, is_active) VALUES 
('admin', 'Administrador del sistema', true),
('coordinator', 'Coordinador de casos', true),
('analyst', 'Analista de casos', true),
('viewer', 'Solo lectura', true)
ON CONFLICT (name) DO NOTHING;

-- Permisos del sistema
INSERT INTO permissions (name, description, module) VALUES 
('cases.create', 'Crear casos', 'cases'),
('cases.read', 'Leer casos', 'cases'),
('cases.update', 'Actualizar casos', 'cases'),
('cases.delete', 'Eliminar casos', 'cases'),
('documentation.create_own', 'Crear documentación propia', 'documentation'),
('documentation.read_own', 'Leer documentación propia', 'documentation'),
('documentation.update_own', 'Actualizar documentación propia', 'documentation'),
('documentation.delete_own', 'Eliminar documentación propia', 'documentation'),
('documentation.read_all', 'Leer toda la documentación', 'documentation'),
('documentation.create_all', 'Crear cualquier documentación', 'documentation'),
('documentation.update_all', 'Actualizar cualquier documentación', 'documentation'),
('documentation.delete_all', 'Eliminar cualquier documentación', 'documentation')
ON CONFLICT (name) DO NOTHING;

-- Asignar permisos a roles
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM user_roles r, permissions p 
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- ====================
-- 2. FUNCIONES DE CASOS
-- ====================

-- Función para buscar casos con autocompletado
CREATE OR REPLACE FUNCTION search_cases_autocomplete(
    search_term text,
    case_type text DEFAULT 'both',
    search_limit integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    results json;
BEGIN
    WITH case_results AS (
        -- Casos activos
        SELECT 
            id::text,
            numero_caso,
            descripcion,
            classification,
            'active'::text as type
        FROM cases
        WHERE case_type IN ('both', 'active')
        AND (
            numero_caso ILIKE '%' || search_term || '%' 
            OR descripcion ILIKE '%' || search_term || '%'
        )
        
        UNION ALL
        
        -- Casos archivados
        SELECT 
            id::text,
            case_number as numero_caso,
            description as descripcion,
            classification,
            'archived'::text as type
        FROM archived_cases
        WHERE case_type IN ('both', 'archived')
        AND (
            case_number ILIKE '%' || search_term || '%' 
            OR description ILIKE '%' || search_term || '%'
        )
    )
    SELECT json_agg(
        json_build_object(
            'id', id,
            'numero_caso', numero_caso,
            'descripcion', descripcion,
            'classification', classification,
            'type', type
        )
    )
    INTO results
    FROM (
        SELECT * FROM case_results
        ORDER BY numero_caso
        LIMIT search_limit
    ) t;

    RETURN COALESCE(results, '[]'::json);
END;
$$;

-- Función para validar existencia de casos
CREATE OR REPLACE FUNCTION validate_case_exists(
    case_identifier text,
    case_type text DEFAULT 'active'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    case_data record;
BEGIN
    IF case_type = 'active' THEN
        SELECT * INTO case_data
        FROM cases
        WHERE numero_caso = case_identifier OR id::text = case_identifier;
        
        IF FOUND THEN
            result := json_build_object(
                'exists', true,
                'type', 'active',
                'id', case_data.id,
                'number', case_data.numero_caso,
                'description', case_data.descripcion,
                'classification', case_data.classification
            );
        ELSE
            result := json_build_object(
                'exists', false,
                'error', 'Caso activo no encontrado'
            );
        END IF;
    ELSE
        SELECT * INTO case_data
        FROM archived_cases
        WHERE case_number = case_identifier OR id::text = case_identifier;
        
        IF FOUND THEN
            result := json_build_object(
                'exists', true,
                'type', 'archived',
                'id', case_data.id,
                'case_number', case_data.case_number,
                'description', case_data.description,
                'classification', case_data.classification
            );
        ELSE
            result := json_build_object(
                'exists', false,
                'error', 'Caso archivado no encontrado'
            );
        END IF;
    END IF;

    RETURN result;
END;
$$;

-- ====================
-- 3. FUNCIONES DE DOCUMENTACIÓN
-- ====================

-- Función para crear documentos
CREATE OR REPLACE FUNCTION create_solution_document_final(
    p_title text,
    p_content jsonb,
    p_solution_type text DEFAULT NULL,
    p_case_id uuid DEFAULT NULL,
    p_archived_case_id uuid DEFAULT NULL,
    p_created_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_document_id uuid;
BEGIN
    INSERT INTO solution_documents (
        title,
        content,
        solution_type,
        case_id,
        archived_case_id,
        created_by,
        updated_by,
        is_published
    ) VALUES (
        p_title,
        p_content,
        p_solution_type,
        p_case_id,
        p_archived_case_id,
        p_created_by,
        p_created_by,
        false
    ) RETURNING id INTO v_document_id;

    RETURN v_document_id;
END;
$$;

-- Función para actualizar documentos
CREATE OR REPLACE FUNCTION update_solution_document_final(
    p_document_id uuid,
    p_content jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE solution_documents 
    SET 
        content = p_content,
        updated_at = now(),
        updated_by = auth.uid()
    WHERE id = p_document_id;

    RETURN FOUND;
END;
$$;

-- Función para eliminar documentos
CREATE OR REPLACE FUNCTION delete_solution_document_final(
    p_document_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Eliminar relaciones primero
    DELETE FROM solution_document_tags WHERE document_id = p_document_id;
    DELETE FROM document_attachments WHERE document_id = p_document_id;
    DELETE FROM solution_feedback WHERE document_id = p_document_id;
    
    -- Eliminar el documento
    DELETE FROM solution_documents WHERE id = p_document_id;

    RETURN FOUND;
END;
$$;

-- ====================
-- 4. FUNCIONES DE BÚSQUEDA (PRINCIPALES)
-- ====================

-- Función de sugerencias de búsqueda
CREATE OR REPLACE FUNCTION get_search_suggestions(
    partial_term text,
    suggestion_limit integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    suggestions json;
BEGIN
    SELECT json_agg(
        json_build_object(
            'suggestion', title,
            'frequency', 1
        )
    )
    INTO suggestions
    FROM (
        SELECT DISTINCT title
        FROM solution_documents
        WHERE title ILIKE '%' || partial_term || '%'
        ORDER BY title
        LIMIT suggestion_limit
    ) t;

    RETURN COALESCE(suggestions, '[]'::json);
END;
$$;

-- Función de búsqueda rápida
CREATE OR REPLACE FUNCTION search_docs_v2(
    search_term text,
    doc_limit integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    results json;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'matched_content', CASE 
                WHEN content IS NOT NULL THEN 
                    LEFT(content::text, 200) || '...'
                ELSE 
                    ''
            END,
            'relevance_score', 0.8,
            'category', CASE 
                WHEN NOT is_published THEN 
                    COALESCE(solution_type, 'Sin categoría') || ' (Borrador)'
                ELSE 
                    COALESCE(solution_type, 'Sin categoría')
            END
        )
    )
    INTO results
    FROM (
        SELECT 
            id,
            title,
            content,
            solution_type,
            is_published,
            created_at
        FROM solution_documents
        WHERE 
            title ILIKE '%' || search_term || '%' 
            OR content::text ILIKE '%' || search_term || '%'
        ORDER BY 
            CASE 
                WHEN title ILIKE '%' || search_term || '%' THEN 1 
                ELSE 2 
            END,
            created_at DESC
        LIMIT doc_limit
    ) t;

    RETURN COALESCE(results, '[]'::json);
END;
$$;

-- ====================
-- 5. FUNCIONES AUXILIARES
-- ====================

-- Incrementar contador de visualizaciones
CREATE OR REPLACE FUNCTION increment_view_count(document_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE solution_documents 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = document_id;
END;
$$;

-- Incrementar contador de útil
CREATE OR REPLACE FUNCTION increment_helpful_count(document_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE solution_documents 
    SET helpful_count = COALESCE(helpful_count, 0) + 1
    WHERE id = document_id;
END;
$$;

-- Obtener métricas de documentación
CREATE OR REPLACE FUNCTION get_documentation_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    metrics json;
BEGIN
    SELECT json_build_object(
        'total_documents', (SELECT COUNT(*) FROM solution_documents),
        'published_documents', (SELECT COUNT(*) FROM solution_documents WHERE is_published = true),
        'deprecated_documents', (SELECT COUNT(*) FROM solution_documents WHERE is_deprecated = true),
        'documents_by_type', (
            SELECT json_object_agg(solution_type, count)
            FROM (
                SELECT COALESCE(solution_type, 'Sin categoría') as solution_type, COUNT(*) as count
                FROM solution_documents
                GROUP BY solution_type
            ) t
        )
    ) INTO metrics;

    RETURN metrics;
END;
$$;

-- ====================
-- 6. PERMISOS
-- ====================

-- Conceder permisos de ejecución
GRANT EXECUTE ON FUNCTION search_cases_autocomplete(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_case_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_solution_document_final(text, jsonb, text, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document_final(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document_final(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_docs_v2(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_helpful_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_documentation_metrics() TO authenticated;

-- ====================
-- 7. COMENTARIOS
-- ====================

COMMENT ON FUNCTION search_cases_autocomplete IS 'Buscar casos activos y archivados para autocompletado';
COMMENT ON FUNCTION validate_case_exists IS 'Validar si un caso existe en el sistema';
COMMENT ON FUNCTION create_solution_document_final IS 'Crear nuevo documento de solución';
COMMENT ON FUNCTION update_solution_document_final IS 'Actualizar contenido de documento existente';
COMMENT ON FUNCTION delete_solution_document_final IS 'Eliminar documento y sus relaciones';
COMMENT ON FUNCTION get_search_suggestions IS 'Obtener sugerencias de búsqueda (bypass RLS)';
COMMENT ON FUNCTION search_docs_v2 IS 'Búsqueda rápida en documentos (bypass RLS)';
COMMENT ON FUNCTION increment_view_count IS 'Incrementar contador de visualizaciones';
COMMENT ON FUNCTION increment_helpful_count IS 'Incrementar contador de marcado como útil';
COMMENT ON FUNCTION get_documentation_metrics IS 'Obtener métricas generales de documentación';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURACIÓN COMPLETA DEL SISTEMA APLICADA EXITOSAMENTE';
    RAISE NOTICE '📋 Funciones disponibles:';
    RAISE NOTICE '   - Gestión de casos: search_cases_autocomplete, validate_case_exists';
    RAISE NOTICE '   - Gestión de documentos: create/update/delete_solution_document_final';
    RAISE NOTICE '   - Búsquedas: get_search_suggestions, search_docs_v2';
    RAISE NOTICE '   - Métricas: increment_view_count, increment_helpful_count, get_documentation_metrics';
END;
$$;
