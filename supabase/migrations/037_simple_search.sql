-- ================================================================
-- MIGRACIÓN: FUNCIÓN DE BÚSQUEDA SIMPLE Y COMPATIBLE
-- ================================================================
-- Descripción: Crea una función de búsqueda simple que funcione
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS quick_search_documents(text, integer);
DROP FUNCTION IF EXISTS search_solution_documents_advanced(text, text, integer[], boolean, integer, integer);

-- Función simple de búsqueda que devuelve JSON
CREATE OR REPLACE FUNCTION search_documents_simple(search_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF search_text IS NULL OR trim(search_text) = '' THEN
    RETURN '[]'::json;
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'id', sd.id,
      'title', sd.title,
      'matched_content', 
        CASE 
          WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN
            substring(sd.title from 1 for 100)
          WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN
            'Tags: ' || array_to_string(sd.tags, ', ')
          ELSE
            COALESCE(substring(sd.content::text from 1 for 100), 'Sin contenido')
        END,
      'relevance_score',
        (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
         CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
         CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END),
      'category', COALESCE(sd.solution_type, 'Sin categoría')
    )
  ) INTO result
  FROM solution_documents sd
  WHERE 
    (sd.is_published = true OR sd.created_by = current_user_id)
    AND (
      lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%'
    )
  ORDER BY 
    (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
     CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
     CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END) DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT 10;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Función para búsqueda completa con filtros
CREATE OR REPLACE FUNCTION search_documents_full(
  search_text text,
  category_filter text DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  SELECT json_agg(
    json_build_object(
      'id', sd.id,
      'title', sd.title,
      'content', sd.content,
      'case_id', sd.case_id,
      'archived_case_id', sd.archived_case_id,
      'case_reference_type', sd.case_reference_type,
      'solution_type', sd.solution_type,
      'difficulty_level', sd.difficulty_level,
      'tags', sd.tags,
      'is_template', sd.is_template,
      'is_published', sd.is_published,
      'is_deprecated', sd.is_deprecated,
      'view_count', sd.view_count,
      'helpful_count', sd.helpful_count,
      'version', sd.version,
      'created_at', sd.created_at,
      'updated_at', sd.updated_at,
      'created_by', sd.created_by,
      'updated_by', sd.updated_by,
      'relevance_score',
        CASE 
          WHEN search_text IS NULL OR trim(search_text) = '' THEN 1.0
          ELSE
            (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
             CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
             CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END +
             (sd.view_count::real / 100.0) + (sd.helpful_count::real / 10.0))
        END,
      'matched_content',
        CASE 
          WHEN search_text IS NULL OR trim(search_text) = '' THEN ''
          WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN
            substring(sd.title from 1 for 100)
          WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN
            'Tags: ' || array_to_string(sd.tags, ', ')
          ELSE
            COALESCE(substring(sd.content::text from 1 for 200), 'Sin contenido')
        END
    )
  ) INTO result
  FROM solution_documents sd
  WHERE 
    (sd.is_published = true OR sd.created_by = current_user_id)
    AND (category_filter IS NULL OR sd.solution_type = category_filter)
    AND (
      search_text IS NULL OR trim(search_text) = '' OR
      lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%'
    )
  ORDER BY 
    CASE 
      WHEN search_text IS NULL OR trim(search_text) = '' THEN sd.updated_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN search_text IS NOT NULL AND trim(search_text) != '' THEN
        (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
         CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
         CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END +
         (sd.view_count::real / 100.0) + (sd.helpful_count::real / 10.0))
      ELSE NULL
    END DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT limit_count;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_documents_simple(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_full(text, text, integer) TO authenticated;
