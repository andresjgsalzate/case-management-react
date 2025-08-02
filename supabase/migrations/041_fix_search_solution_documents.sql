-- ================================================================
-- MIGRACIÓN: FUNCIÓN DE BÚSQUEDA COMPATIBLE CON HOOK EXISTENTE
-- ================================================================
-- Descripción: Crea función search_solution_documents compatible y sin errores GROUP BY
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar función existente si tiene problemas
DROP FUNCTION IF EXISTS search_solution_documents(text, text, integer[], boolean, integer) CASCADE;

-- Recrear función compatible con el hook existente
CREATE OR REPLACE FUNCTION search_solution_documents(
  search_term text,
  category_filter text DEFAULT NULL,
  difficulty_filter integer[] DEFAULT NULL,
  is_template_filter boolean DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  content jsonb,
  case_id uuid,
  archived_case_id uuid,
  case_reference_type text,
  solution_type text,
  category text,
  difficulty_level integer,
  tags text[],
  is_template boolean,
  is_published boolean,
  is_deprecated boolean,
  avg_rating numeric,
  view_count integer,
  helpful_count integer,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.content,
    sd.case_id,
    sd.archived_case_id,
    sd.case_reference_type,
    sd.solution_type,
    sd.solution_type as category, -- Mapear solution_type a category para compatibilidad
    sd.difficulty_level,
    sd.tags,
    sd.is_template,
    sd.is_published,
    sd.is_deprecated,
    0::numeric as avg_rating, -- Por ahora, rating fijo en 0
    sd.view_count,
    sd.helpful_count,
    sd.version,
    sd.created_at,
    sd.updated_at,
    sd.created_by,
    sd.updated_by,
    -- Calcular relevancia basada en título, contenido y tags
    (
      CASE WHEN lower(sd.title) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 5.0 ELSE 0.0 END +
      CASE WHEN lower(array_to_string(sd.tags, ' ')) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN lower(sd.content::text) LIKE '%' || lower(COALESCE(search_term, '')) || '%' THEN 1.0 ELSE 0.0 END +
      (sd.view_count::real / 100.0) + (sd.helpful_count::real / 10.0)
    )::real as relevance_score
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
    -- Filtro de categoría
    AND (category_filter IS NULL OR sd.solution_type = category_filter)
    -- Filtro de dificultad
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
    -- Filtro de template
    AND (is_template_filter IS NULL OR sd.is_template = is_template_filter)
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
  LIMIT limit_count;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_solution_documents(text, text, integer[], boolean, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_solution_documents(text, text, integer[], boolean, integer) TO anon;

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
  
  RAISE NOTICE 'Función search_solution_documents recreada correctamente';
END $$;
