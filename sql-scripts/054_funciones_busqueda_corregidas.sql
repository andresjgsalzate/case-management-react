-- ===================================================================
-- FUNCIONES DE BÚSQUEDA MEJORADAS - CORRECCIÓN FINAL
-- ===================================================================
-- Descripción: Funciones corregidas que manejan content como jsonb
-- y bypasean las políticas RLS restrictivas
-- Fecha: 6 de Agosto, 2025
-- ===================================================================

-- 0. ELIMINAR FUNCIONES EXISTENTES (si existen)
DROP FUNCTION IF EXISTS get_search_suggestions(text, integer);
DROP FUNCTION IF EXISTS get_search_suggestions(text);
DROP FUNCTION IF EXISTS search_docs_v2(text, integer);
DROP FUNCTION IF EXISTS search_docs_v2(text);
DROP FUNCTION IF EXISTS full_search_docs(text, integer, boolean);
DROP FUNCTION IF EXISTS full_search_docs(text, integer);
DROP FUNCTION IF EXISTS full_search_docs(text);
DROP FUNCTION IF EXISTS diagnose_solution_documents();

-- 1. FUNCIÓN: Obtener sugerencias de búsqueda (corregida)
CREATE OR REPLACE FUNCTION get_search_suggestions(
    partial_term text,
    suggestion_limit integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del owner
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

-- 2. FUNCIÓN: Búsqueda rápida de documentos (corregida)
CREATE OR REPLACE FUNCTION search_docs_v2(
    search_term text,
    doc_limit integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del owner
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

-- 3. FUNCIÓN: Búsqueda completa de documentos (nueva)
CREATE OR REPLACE FUNCTION full_search_docs(
    search_term text,
    doc_limit integer DEFAULT 20,
    include_unpublished boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    results json;
    where_clause text;
BEGIN
    -- Construir cláusula WHERE dinámicamente
    where_clause := '(title ILIKE ''%' || search_term || '%'' OR content::text ILIKE ''%' || search_term || '%'')';
    
    IF NOT include_unpublished THEN
        where_clause := where_clause || ' AND is_published = true';
    END IF;

    EXECUTE format('
        SELECT json_agg(
            json_build_object(
                ''id'', id,
                ''title'', title,
                ''content_preview'', CASE 
                    WHEN content IS NOT NULL THEN 
                        LEFT(content::text, 300) || ''...''
                    ELSE 
                        ''''
                END,
                ''solution_type'', solution_type,
                ''is_published'', is_published,
                ''created_at'', created_at,
                ''status'', CASE 
                    WHEN NOT is_published THEN ''Borrador''
                    ELSE ''Publicado''
                END
            )
        )
        FROM (
            SELECT *
            FROM solution_documents
            WHERE %s
            ORDER BY 
                CASE 
                    WHEN title ILIKE ''%%%s%%'' THEN 1 
                    ELSE 2 
                END,
                is_published DESC,
                created_at DESC
            LIMIT %s
        ) t
    ', where_clause, search_term, doc_limit)
    INTO results;

    RETURN COALESCE(results, '[]'::json);
END;
$$;

-- 4. CONCEDER PERMISOS DE EJECUCIÓN
GRANT EXECUTE ON FUNCTION get_search_suggestions(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_docs_v2(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION full_search_docs(text, integer, boolean) TO authenticated;

-- 5. FUNCIÓN DE DIAGNÓSTICO: Verificar estructura de la tabla
CREATE OR REPLACE FUNCTION diagnose_solution_documents()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    diagnostic json;
BEGIN
    SELECT json_build_object(
        'table_exists', (
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'solution_documents'
            )
        ),
        'total_documents', (
            SELECT COUNT(*) FROM solution_documents
        ),
        'published_documents', (
            SELECT COUNT(*) FROM solution_documents WHERE is_published = true
        ),
        'draft_documents', (
            SELECT COUNT(*) FROM solution_documents WHERE is_published = false
        ),
        'content_types', (
            SELECT json_agg(DISTINCT pg_typeof(content)::text)
            FROM solution_documents
            WHERE content IS NOT NULL
        ),
        'sample_titles', (
            SELECT json_agg(title)
            FROM (
                SELECT title 
                FROM solution_documents 
                ORDER BY created_at DESC 
                LIMIT 3
            ) t
        )
    ) INTO diagnostic;

    RETURN diagnostic;
END;
$$;

GRANT EXECUTE ON FUNCTION diagnose_solution_documents() TO authenticated;

-- 6. COMENTARIOS DE INFORMACIÓN
COMMENT ON FUNCTION get_search_suggestions IS 'Obtiene sugerencias de búsqueda basadas en títulos de documentos (bypass RLS)';
COMMENT ON FUNCTION search_docs_v2 IS 'Búsqueda rápida en título y contenido jsonb (bypass RLS)';
COMMENT ON FUNCTION full_search_docs IS 'Búsqueda completa con filtros opcionales (bypass RLS)';
COMMENT ON FUNCTION diagnose_solution_documents IS 'Diagnóstico de la tabla solution_documents';
