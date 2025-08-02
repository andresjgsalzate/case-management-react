-- ================================================================
-- MIGRACIÓN: CORRECCIÓN FINAL DE FUNCIONES DE BÚSQUEDA
-- ================================================================
-- Descripción: Fuerza la recreación correcta de las funciones de búsqueda
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar TODAS las funciones de búsqueda existentes (con CASCADE para seguridad)
DROP FUNCTION IF EXISTS search_documents_simple(text) CASCADE;
DROP FUNCTION IF EXISTS search_documents_full(text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS quick_search_documents(text, integer) CASCADE;
DROP FUNCTION IF EXISTS search_solution_documents_advanced(text, text, integer[], boolean, integer, integer) CASCADE;

-- Recrear función simple de búsqueda SIN GROUP BY
CREATE OR REPLACE FUNCTION search_documents_simple(search_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  current_user_id uuid;
BEGIN
  -- Obtener ID del usuario actual
  current_user_id := auth.uid();
  
  -- Si no hay texto de búsqueda, retornar array vacío
  IF search_text IS NULL OR trim(search_text) = '' THEN
    RETURN '[]'::json;
  END IF;
  
  -- Ejecutar búsqueda y construir JSON sin GROUP BY
  SELECT json_agg(
    json_build_object(
      'id', sd.id,
      'title', sd.title,
      'matched_content', 
        CASE 
          WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN
            substring(sd.title from 1 for 150)
          WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN
            'Tags: ' || array_to_string(sd.tags, ', ')
          ELSE
            COALESCE(substring(sd.content::text from 1 for 200), 'Sin contenido')
        END,
      'relevance_score',
        (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
         CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
         CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END),
      'category', COALESCE(sd.solution_type, 'Sin categoría'),
      'difficulty_level', sd.difficulty_level,
      'view_count', sd.view_count,
      'helpful_count', sd.helpful_count,
      'created_at', sd.created_at,
      'updated_at', sd.updated_at
    )
  ) INTO result
  FROM solution_documents sd
  WHERE 
    -- Solo documentos publicados o del usuario actual
    (sd.is_published = true OR sd.created_by = current_user_id)
    -- Búsqueda en título, tags o contenido
    AND (
      lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%'
    )
  ORDER BY 
    -- Ordenar por relevancia: título > tags > contenido
    (CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_text)) || '%' THEN 5.0 ELSE 0.0 END +
     CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_text)) || '%' THEN 3.0 ELSE 0.0 END +
     CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_text)) || '%' THEN 1.0 ELSE 0.0 END) DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT 10;
  
  -- Retornar resultado (o array vacío si no hay coincidencias)
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Recrear función completa de búsqueda
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
            substring(sd.title from 1 for 150)
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

-- Otorgar permisos explícitamente
GRANT EXECUTE ON FUNCTION search_documents_simple(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_full(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_simple(text) TO anon;
GRANT EXECUTE ON FUNCTION search_documents_full(text, text, integer) TO anon;

-- Verificar que las funciones existen
DO $$
BEGIN
  -- Comprobar que search_documents_simple existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'search_documents_simple' 
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función search_documents_simple no se creó correctamente';
  END IF;
  
  -- Comprobar que search_documents_full existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'search_documents_full' 
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función search_documents_full no se creó correctamente';
  END IF;
  
  RAISE NOTICE 'Funciones de búsqueda creadas correctamente';
END $$;
