-- Migration: Crear funciones de búsqueda para documentación
-- Created at: 2025-08-06

-- =====================================================
-- FUNCIONES DE BÚSQUEDA PARA DOCUMENTACIÓN
-- =====================================================
-- Descripción: Funciones RPC necesarias para el buscador de documentos
-- Fecha: 6 de Agosto, 2025
-- =====================================================

-- 1. FUNCIÓN PARA BÚSQUEDA RÁPIDA DE DOCUMENTOS (search_docs_v2)
-- =====================================================

CREATE OR REPLACE FUNCTION search_docs_v2(
  search_text TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  search_results RECORD;
  results_array JSON[] := '{}';
BEGIN
  -- Validar entrada
  IF search_text IS NULL OR TRIM(search_text) = '' THEN
    RETURN '[]'::JSON;
  END IF;

  -- Buscar en documentos publicados con relevancia
  FOR search_results IN
    SELECT 
      sd.id,
      sd.title,
      sd.solution_type as category,
      -- Extraer fragmento relevante del contenido
      CASE 
        WHEN sd.content::text ILIKE '%' || search_text || '%' THEN
          SUBSTRING(
            sd.content::text FROM 
            GREATEST(1, POSITION(LOWER(search_text) IN LOWER(sd.content::text)) - 50) 
            FOR 200
          )
        ELSE ''
      END as matched_content,
      -- Calcular puntuación de relevancia
      (
        CASE WHEN sd.title ILIKE '%' || search_text || '%' THEN 3.0 ELSE 0.0 END +
        CASE WHEN sd.content::text ILIKE '%' || search_text || '%' THEN 1.0 ELSE 0.0 END +
        CASE WHEN EXISTS(
          SELECT 1 FROM solution_document_tags sdt 
          JOIN solution_tags st ON sdt.tag_id = st.id 
          WHERE sdt.document_id = sd.id AND st.name ILIKE '%' || search_text || '%'
        ) THEN 2.0 ELSE 0.0 END
      ) as relevance_score
    FROM solution_documents sd
    WHERE 
      sd.is_published = true
      AND (
        sd.title ILIKE '%' || search_text || '%' OR
        sd.content::text ILIKE '%' || search_text || '%' OR
        EXISTS(
          SELECT 1 FROM solution_document_tags sdt 
          JOIN solution_tags st ON sdt.tag_id = st.id 
          WHERE sdt.document_id = sd.id AND st.name ILIKE '%' || search_text || '%'
        )
      )
    ORDER BY relevance_score DESC, sd.updated_at DESC
    LIMIT 10
  LOOP
    -- Agregar resultado al array
    results_array := array_append(results_array, 
      json_build_object(
        'id', search_results.id,
        'title', search_results.title,
        'category', COALESCE(search_results.category, 'Sin categoría'),
        'matched_content', search_results.matched_content,
        'relevance_score', search_results.relevance_score
      )
    );
  END LOOP;

  -- Convertir array a JSON
  SELECT array_to_json(results_array) INTO result;
  
  RETURN result;
END;
$$;

-- 2. FUNCIÓN PARA BÚSQUEDA COMPLETA DE DOCUMENTOS (search_documents_full)
-- =====================================================

CREATE OR REPLACE FUNCTION search_documents_full(
  search_text TEXT,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  search_results RECORD;
  results_array JSON[] := '{}';
  current_user_id UUID;
BEGIN
  -- Obtener usuario actual
  current_user_id := auth.uid();
  
  -- Validar entrada
  IF search_text IS NULL OR TRIM(search_text) = '' THEN
    RETURN '[]'::JSON;
  END IF;

  -- Buscar documentos con acceso granular
  FOR search_results IN
    SELECT 
      sd.id,
      sd.title,
      sd.content,
      sd.solution_type,
      sd.difficulty_level,
      sd.tags,
      sd.is_published,
      sd.version,
      sd.created_by,
      sd.created_at,
      sd.updated_at,
      sd.view_count,
      up.full_name as created_by_name,
      up.email as created_by_email,
      -- Calcular puntuación de relevancia
      (
        CASE WHEN sd.title ILIKE '%' || search_text || '%' THEN 3.0 ELSE 0.0 END +
        CASE WHEN sd.content::text ILIKE '%' || search_text || '%' THEN 1.0 ELSE 0.0 END +
        CASE WHEN EXISTS(
          SELECT 1 FROM solution_document_tags sdt 
          JOIN solution_tags st ON sdt.tag_id = st.id 
          WHERE sdt.document_id = sd.id AND st.name ILIKE '%' || search_text || '%'
        ) THEN 2.0 ELSE 0.0 END
      ) as relevance_score
    FROM solution_documents sd
    LEFT JOIN user_profiles up ON sd.created_by = up.id
    WHERE 
      (
        -- Documentos publicados visibles para todos
        sd.is_published = true OR
        -- Documentos propios (publicados o no)
        sd.created_by = current_user_id
      )
      AND (
        sd.title ILIKE '%' || search_text || '%' OR
        sd.content::text ILIKE '%' || search_text || '%' OR
        EXISTS(
          SELECT 1 FROM solution_document_tags sdt 
          JOIN solution_tags st ON sdt.tag_id = st.id 
          WHERE sdt.document_id = sd.id AND st.name ILIKE '%' || search_text || '%'
        )
      )
      AND (category_filter IS NULL OR sd.solution_type = category_filter)
    ORDER BY relevance_score DESC, sd.updated_at DESC
    LIMIT limit_count
  LOOP
    -- Agregar resultado al array
    results_array := array_append(results_array, 
      json_build_object(
        'id', search_results.id,
        'title', search_results.title,
        'content', search_results.content,
        'solution_type', search_results.solution_type,
        'difficulty_level', search_results.difficulty_level,
        'tags', search_results.tags,
        'is_published', search_results.is_published,
        'version', search_results.version,
        'created_by', search_results.created_by,
        'created_by_name', search_results.created_by_name,
        'created_by_email', search_results.created_by_email,
        'created_at', search_results.created_at,
        'updated_at', search_results.updated_at,
        'view_count', search_results.view_count,
        'relevance_score', search_results.relevance_score
      )
    );
  END LOOP;

  -- Convertir array a JSON
  SELECT array_to_json(results_array) INTO result;
  
  RETURN result;
END;
$$;

-- 3. FUNCIÓN PARA OBTENER SUGERENCIAS DE BÚSQUEDA
-- =====================================================

CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_term TEXT,
  suggestion_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  suggestion TEXT,
  frequency INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar entrada
  IF partial_term IS NULL OR TRIM(partial_term) = '' OR LENGTH(TRIM(partial_term)) < 2 THEN
    RETURN;
  END IF;

  -- Sugerencias basadas en títulos de documentos
  RETURN QUERY
  SELECT DISTINCT
    sd.title as suggestion,
    1 as frequency
  FROM solution_documents sd
  WHERE 
    sd.is_published = true
    AND sd.title ILIKE '%' || partial_term || '%'
  ORDER BY sd.title
  LIMIT suggestion_limit / 2;

  -- Sugerencias basadas en etiquetas
  RETURN QUERY
  SELECT DISTINCT
    st.name as suggestion,
    COUNT(sdt.document_id)::INTEGER as frequency
  FROM solution_tags st
  JOIN solution_document_tags sdt ON st.id = sdt.tag_id
  JOIN solution_documents sd ON sdt.document_id = sd.id
  WHERE 
    sd.is_published = true
    AND st.name ILIKE '%' || partial_term || '%'
  GROUP BY st.name
  ORDER BY frequency DESC, st.name
  LIMIT suggestion_limit / 2;
END;
$$;

-- 4. OTORGAR PERMISOS
-- =====================================================

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION search_docs_v2(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_full(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions(TEXT, INTEGER) TO authenticated;

-- 5. COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION search_docs_v2(TEXT) IS 'Búsqueda rápida de documentos con fragmentos relevantes';
COMMENT ON FUNCTION search_documents_full(TEXT, TEXT, INTEGER) IS 'Búsqueda completa de documentos con filtros y permisos granulares';
COMMENT ON FUNCTION get_search_suggestions(TEXT, INTEGER) IS 'Obtiene sugerencias de búsqueda basadas en títulos y etiquetas';
