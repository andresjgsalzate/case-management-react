-- ================================================================
-- MIGRACIÓN: CORRECCIÓN DE FUNCIONES DE BÚSQUEDA
-- ================================================================
-- Descripción: Corrige errores en GROUP BY y HAVING clauses
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar la función existente
DROP FUNCTION IF EXISTS search_solution_documents_advanced(text, text, integer[], boolean, integer, integer);

-- Función corregida de búsqueda con texto completo
CREATE OR REPLACE FUNCTION search_solution_documents_advanced(
  search_term text,
  category_filter text DEFAULT NULL,
  difficulty_filter integer[] DEFAULT NULL,
  is_template_filter boolean DEFAULT NULL,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  content jsonb,
  case_id uuid,
  archived_case_id uuid,
  case_reference_type text,
  solution_type text,
  difficulty_level integer,
  tags text[],
  is_template boolean,
  is_published boolean,
  is_deprecated boolean,
  view_count integer,
  helpful_count integer,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid,
  relevance_score real,
  matched_content text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_query tsquery;
  search_words text[];
  current_user_id uuid;
BEGIN
  -- Obtener el usuario actual
  current_user_id := auth.uid();
  
  -- Si no hay término de búsqueda, devolver todos los documentos
  IF search_term IS NULL OR trim(search_term) = '' THEN
    RETURN QUERY
    SELECT 
      sd.id,
      sd.title,
      sd.content,
      sd.case_id,
      sd.archived_case_id,
      sd.case_reference_type,
      sd.solution_type,
      sd.difficulty_level,
      sd.tags,
      sd.is_template,
      sd.is_published,
      sd.is_deprecated,
      sd.view_count,
      sd.helpful_count,
      sd.version,
      sd.created_at,
      sd.updated_at,
      sd.created_by,
      sd.updated_by,
      0.0::real as relevance_score,
      ''::text as matched_content
    FROM solution_documents sd
    WHERE 
      (sd.is_published = true OR sd.created_by = current_user_id)
      AND (category_filter IS NULL OR sd.solution_type = category_filter)
      AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
      AND (is_template_filter IS NULL OR sd.is_template = is_template_filter)
    ORDER BY sd.updated_at DESC
    LIMIT limit_count OFFSET offset_count;
    RETURN;
  END IF;

  -- Preparar el término de búsqueda
  search_term := trim(search_term);
  
  -- Dividir en palabras para búsqueda flexible
  search_words := string_to_array(lower(search_term), ' ');
  
  -- Crear consulta de texto completo
  BEGIN
    search_query := plainto_tsquery('spanish', search_term);
  EXCEPTION WHEN OTHERS THEN
    search_query := plainto_tsquery('simple', search_term);
  END;

  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.content,
    sd.case_id,
    sd.archived_case_id,
    sd.case_reference_type,
    sd.solution_type,
    sd.difficulty_level,
    sd.tags,
    sd.is_template,
    sd.is_published,
    sd.is_deprecated,
    sd.view_count,
    sd.helpful_count,
    sd.version,
    sd.created_at,
    sd.updated_at,
    sd.created_by,
    sd.updated_by,
    -- Cálculo mejorado de relevancia
    (
      -- Búsqueda de texto completo en título (peso alto)
      CASE WHEN sd.title_search @@ search_query THEN 5.0 ELSE 0.0 END +
      
      -- Búsqueda exacta en título (peso muy alto)
      CASE WHEN lower(sd.title) LIKE '%' || lower(search_term) || '%' THEN 4.0 ELSE 0.0 END +
      
      -- Búsqueda de texto completo en tags
      CASE WHEN sd.tags_search @@ search_query THEN 3.0 ELSE 0.0 END +
      
      -- Búsqueda exacta en tags
      CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' THEN 2.5 ELSE 0.0 END +
      
      -- Búsqueda de texto completo en contenido
      CASE WHEN sd.content_search @@ search_query THEN 2.0 ELSE 0.0 END +
      
      -- Búsqueda exacta en contenido (para números, códigos, etc.)
      CASE WHEN lower(sd.content::text) LIKE '%' || lower(search_term) || '%' THEN 1.5 ELSE 0.0 END +
      
      -- Bonus por popularidad
      (sd.view_count::real / 100.0) +
      
      -- Bonus por helpful count
      (sd.helpful_count::real / 10.0)
      
    )::real as relevance_score,
    
    -- Extraer fragmento del contenido que coincide
    CASE 
      WHEN lower(sd.title) LIKE '%' || lower(search_term) || '%' THEN
        substring(sd.title from 1 for 100)
      WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' THEN
        'Tags: ' || array_to_string(sd.tags, ', ')
      ELSE
        COALESCE(
          substring(
            regexp_replace(sd.content::text, '[{}",\[\]]', ' ', 'g') 
            from greatest(1, position(lower(search_term) in lower(sd.content::text)) - 50)
            for 200
          ),
          substring(sd.content::text from 1 for 200)
        )
    END as matched_content
    
  FROM solution_documents sd
  WHERE 
    (sd.is_published = true OR sd.created_by = current_user_id)
    AND (
      -- Búsqueda de texto completo
      sd.title_search @@ search_query OR
      sd.tags_search @@ search_query OR
      sd.content_search @@ search_query OR
      
      -- Búsqueda exacta (para números, códigos, fragmentos específicos)
      lower(sd.title) LIKE '%' || lower(search_term) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(search_term) || '%' OR
      
      -- Búsqueda por palabras individuales
      EXISTS (
        SELECT 1 FROM unnest(search_words) AS word
        WHERE lower(sd.title) LIKE '%' || word || '%' 
           OR lower(sd.content::text) LIKE '%' || word || '%'
           OR lower(array_to_string(sd.tags, ' ')) LIKE '%' || word || '%'
      )
    )
    AND (category_filter IS NULL OR sd.solution_type = category_filter)
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
    AND (is_template_filter IS NULL OR sd.is_template = is_template_filter)
  ORDER BY 
    -- Calcular relevancia en ORDER BY para filtrar resultados con relevancia > 0
    (
      CASE WHEN sd.title_search @@ search_query THEN 5.0 ELSE 0.0 END +
      CASE WHEN lower(sd.title) LIKE '%' || lower(search_term) || '%' THEN 4.0 ELSE 0.0 END +
      CASE WHEN sd.tags_search @@ search_query THEN 3.0 ELSE 0.0 END +
      CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' THEN 2.5 ELSE 0.0 END +
      CASE WHEN sd.content_search @@ search_query THEN 2.0 ELSE 0.0 END +
      CASE WHEN lower(sd.content::text) LIKE '%' || lower(search_term) || '%' THEN 1.5 ELSE 0.0 END +
      (sd.view_count::real / 100.0) +
      (sd.helpful_count::real / 10.0)
    ) DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_solution_documents_advanced(text, text, integer[], boolean, integer, integer) TO authenticated;

-- Función simple para búsqueda rápida sin GROUP BY
CREATE OR REPLACE FUNCTION quick_search_documents(
  search_term text,
  search_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  matched_content text,
  relevance_score real,
  category text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF search_term IS NULL OR trim(search_term) = '' THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    CASE 
      WHEN lower(sd.title) LIKE '%' || lower(trim(search_term)) || '%' THEN
        substring(sd.title from 1 for 100)
      WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_term)) || '%' THEN
        'Tags: ' || array_to_string(sd.tags, ', ')
      ELSE
        COALESCE(
          substring(sd.content::text from 1 for 100),
          'Sin contenido'
        )
    END as matched_content,
    (
      CASE WHEN lower(sd.title) LIKE '%' || lower(trim(search_term)) || '%' THEN 5.0 ELSE 0.0 END +
      CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_term)) || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN lower(sd.content::text) LIKE '%' || lower(trim(search_term)) || '%' THEN 1.0 ELSE 0.0 END
    )::real as relevance_score,
    COALESCE(sd.solution_type, 'Sin categoría') as category
  FROM solution_documents sd
  WHERE 
    (sd.is_published = true OR sd.created_by = current_user_id)
    AND (
      lower(sd.title) LIKE '%' || lower(trim(search_term)) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(trim(search_term)) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(trim(search_term)) || '%'
    )
  ORDER BY 
    relevance_score DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT search_limit;
END;
$$;

-- Otorgar permisos para búsqueda rápida
GRANT EXECUTE ON FUNCTION quick_search_documents(text, integer) TO authenticated;
