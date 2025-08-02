-- ================================================================
-- MIGRACIÓN: FUNCIÓN DE BÚSQUEDA CON FORMATO JSON PARA HOOK
-- ================================================================
-- Descripción: Crea función search_solution_documents que retorna 
-- datos en formato JSON compatible con el hook React
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar función existente
DROP FUNCTION IF EXISTS search_solution_documents(text, text, integer[], text[], text, integer, integer) CASCADE;

-- Crear nueva función que retorna JSON
CREATE OR REPLACE FUNCTION search_solution_documents(
  search_term text DEFAULT NULL,
  solution_type_filter text DEFAULT NULL,
  difficulty_filter integer[] DEFAULT NULL,
  tags_filter text[] DEFAULT NULL,
  case_reference_filter text DEFAULT NULL,
  page_param integer DEFAULT 1,
  page_size_param integer DEFAULT 20
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  offset_count integer;
  total_count integer;
  documents_json json;
  result_json json;
BEGIN
  current_user_id := auth.uid();
  offset_count := (page_param - 1) * page_size_param;
  
  -- Obtener el total de documentos que coinciden
  SELECT COUNT(*) INTO total_count
  FROM solution_documents sd
  WHERE 
    -- Solo documentos publicados o del usuario actual
    (sd.is_published = true OR sd.created_by = current_user_id)
    -- Filtro de búsqueda
    AND (
      search_term IS NULL OR search_term = '' OR
      lower(sd.title) LIKE '%' || lower(search_term) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(search_term) || '%'
    )
    -- Filtro de tipo de solución
    AND (solution_type_filter IS NULL OR sd.solution_type = solution_type_filter)
    -- Filtro de dificultad
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
    -- Filtro de etiquetas
    AND (tags_filter IS NULL OR sd.tags && tags_filter)
    -- Filtro de referencia de caso
    AND (case_reference_filter IS NULL OR sd.case_reference_type = case_reference_filter);

  -- Obtener los documentos con paginación
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
      'avgRating', NULL,
      -- Mapear campos snake_case a camelCase para compatibilidad
      'caseId', sd.case_id,
      'createdBy', sd.created_by,
      'updatedBy', sd.updated_by,
      'difficultyLevel', sd.difficulty_level,
      'estimatedSolutionTime', sd.estimated_solution_time,
      'isTemplate', sd.is_template,
      'isPublished', sd.is_published,
      'viewCount', sd.view_count,
      'helpfulCount', sd.helpful_count,
      'createdAt', sd.created_at,
      'updatedAt', sd.updated_at,
      'relevance_score', (
        CASE WHEN lower(sd.title) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 5.0 ELSE 0.0 END +
        CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 3.0 ELSE 0.0 END +
        CASE WHEN lower(sd.content::text) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 1.0 ELSE 0.0 END +
        (sd.view_count::real / 100.0) + (sd.helpful_count::real / 10.0)
      )::real
    )
  ) INTO documents_json
  FROM solution_documents sd
  WHERE 
    -- Solo documentos publicados o del usuario actual
    (sd.is_published = true OR sd.created_by = current_user_id)
    -- Filtro de búsqueda
    AND (
      search_term IS NULL OR search_term = '' OR
      lower(sd.title) LIKE '%' || lower(search_term) || '%' OR
      lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(search_term) || '%' OR
      lower(sd.content::text) LIKE '%' || lower(search_term) || '%'
    )
    -- Filtro de tipo de solución
    AND (solution_type_filter IS NULL OR sd.solution_type = solution_type_filter)
    -- Filtro de dificultad
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
    -- Filtro de etiquetas
    AND (tags_filter IS NULL OR sd.tags && tags_filter)
    -- Filtro de referencia de caso
    AND (case_reference_filter IS NULL OR sd.case_reference_type = case_reference_filter)
  ORDER BY 
    -- Ordenar por relevancia primero, luego por popularidad
    (
      CASE WHEN lower(sd.title) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 5.0 ELSE 0.0 END +
      CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN lower(sd.content::text) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 1.0 ELSE 0.0 END +
      (sd.view_count::real / 100.0) + (sd.helpful_count::real / 10.0)
    ) DESC,
    sd.view_count DESC,
    sd.updated_at DESC
  LIMIT page_size_param
  OFFSET offset_count;

  -- Construir el resultado final en formato JSON
  result_json := json_build_object(
    'documents', COALESCE(documents_json, '[]'::json),
    'pagination', json_build_object(
      'page', page_param,
      'per_page', page_size_param,
      'total_count', total_count,
      'total_pages', CEIL(total_count::real / page_size_param::real)::integer
    )
  );

  RETURN result_json;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_solution_documents(text, text, integer[], text[], text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_solution_documents(text, text, integer[], text[], text, integer, integer) TO anon;

-- Verificar que la función existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'search_solution_documents' 
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función search_solution_documents no se creó correctamente';
  END IF;
  
  RAISE NOTICE 'Función search_solution_documents con formato JSON creada correctamente';
END $$;
