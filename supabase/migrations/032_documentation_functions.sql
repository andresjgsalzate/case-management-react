-- ================================================================
-- MIGRACIÓN: Funciones para Módulo de Documentación
-- Descripción: Funciones auxiliares y estadísticas
-- Versión: 1.0
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- ================================================================
-- FUNCIÓN: Obtener estadísticas de documentación
-- ================================================================
CREATE OR REPLACE FUNCTION get_solution_document_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  SELECT jsonb_build_object(
    'totalDocuments', (
      SELECT COUNT(*) 
      FROM solution_documents 
      WHERE is_published = true
    ),
    'publishedDocuments', (
      SELECT COUNT(*) 
      FROM solution_documents 
      WHERE is_published = true
    ),
    'templatesCount', (
      SELECT COUNT(*) 
      FROM solution_documents 
      WHERE is_template = true AND is_published = true
    ),
    'avgRating', (
      SELECT COALESCE(AVG(sf.rating), 0)
      FROM solution_documents sd
      LEFT JOIN solution_feedback sf ON sd.id = sf.document_id
      WHERE sd.is_published = true AND sf.rating IS NOT NULL
    ),
    'totalViews', (
      SELECT COALESCE(SUM(view_count), 0) 
      FROM solution_documents 
      WHERE is_published = true
    ),
    'myDocuments', (
      SELECT COUNT(*) 
      FROM solution_documents 
      WHERE created_by = user_id
    ),
    'categoriesCount', (
      SELECT COUNT(*) 
      FROM solution_categories 
      WHERE is_active = true
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ================================================================
-- FUNCIÓN: Búsqueda full-text de documentos
-- ================================================================
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
  category text,
  difficulty_level integer,
  tags text[],
  is_template boolean,
  avg_rating numeric,
  view_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.content,
    sd.case_id,
    sd.category,
    sd.difficulty_level,
    sd.tags,
    sd.is_template,
    COALESCE(AVG(sf.rating), 0) as avg_rating,
    sd.view_count,
    sd.created_at,
    sd.updated_at,
    -- Calcular relevancia basada en título, contenido y tags
    (
      CASE WHEN sd.title ILIKE '%' || search_term || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN sd.content::text ILIKE '%' || search_term || '%' THEN 1.0 ELSE 0.0 END
    )::real as relevance_score
  FROM solution_documents sd
  LEFT JOIN solution_feedback sf ON sd.id = sf.document_id
  WHERE 
    sd.is_published = true
    AND (
      search_term IS NULL OR search_term = '' OR
      sd.title ILIKE '%' || search_term || '%' OR
      array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%' OR
      sd.content::text ILIKE '%' || search_term || '%'
    )
    AND (category_filter IS NULL OR sd.category = category_filter)
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
    AND (is_template_filter IS NULL OR sd.is_template = is_template_filter)
  GROUP BY sd.id, sd.title, sd.content, sd.case_id, sd.category, sd.difficulty_level, sd.tags, sd.is_template, sd.view_count, sd.created_at, sd.updated_at
  HAVING (
    search_term IS NULL OR search_term = '' OR
    (
      CASE WHEN sd.title ILIKE '%' || search_term || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN sd.content::text ILIKE '%' || search_term || '%' THEN 1.0 ELSE 0.0 END
    ) > 0
  )
  ORDER BY 
    CASE WHEN search_term IS NULL OR search_term = '' THEN sd.updated_at END DESC,
    CASE WHEN search_term IS NOT NULL AND search_term != '' THEN relevance_score END DESC,
    sd.view_count DESC,
    sd.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ================================================================
-- FUNCIÓN: Obtener documentos relacionados por caso
-- ================================================================
CREATE OR REPLACE FUNCTION get_documents_by_case(case_id_param uuid)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  difficulty_level integer,
  is_template boolean,
  is_published boolean,
  view_count integer,
  avg_rating numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.category,
    sd.difficulty_level,
    sd.is_template,
    sd.is_published,
    sd.view_count,
    COALESCE(AVG(sf.rating), 0) as avg_rating,
    sd.created_at
  FROM solution_documents sd
  LEFT JOIN solution_feedback sf ON sd.id = sf.document_id
  WHERE 
    sd.case_id = case_id_param
    AND (sd.is_published = true OR sd.created_by = auth.uid())
  GROUP BY sd.id, sd.title, sd.category, sd.difficulty_level, sd.is_template, sd.is_published, sd.view_count, sd.created_at
  ORDER BY sd.created_at DESC;
END;
$$;

-- ================================================================
-- FUNCIÓN: Actualizar contador de visualizaciones
-- ================================================================
CREATE OR REPLACE FUNCTION increment_document_views(document_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE solution_documents 
  SET view_count = view_count + 1 
  WHERE id = document_id_param AND is_published = true;
END;
$$;

-- ================================================================
-- FUNCIÓN: Obtener documentos populares
-- ================================================================
CREATE OR REPLACE FUNCTION get_popular_documents(limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  difficulty_level integer,
  view_count integer,
  avg_rating numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.category,
    sd.difficulty_level,
    sd.view_count,
    COALESCE(AVG(sf.rating), 0) as avg_rating,
    sd.created_at
  FROM solution_documents sd
  LEFT JOIN solution_feedback sf ON sd.id = sf.document_id
  WHERE sd.is_published = true
  GROUP BY sd.id, sd.title, sd.category, sd.difficulty_level, sd.view_count, sd.created_at
  ORDER BY sd.view_count DESC, avg_rating DESC
  LIMIT limit_count;
END;
$$;

-- ================================================================
-- FUNCIÓN: Obtener templates disponibles
-- ================================================================
CREATE OR REPLACE FUNCTION get_available_templates()
RETURNS TABLE (
  id uuid,
  title text,
  content jsonb,
  category text,
  difficulty_level integer,
  estimated_solution_time integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.content,
    sd.category,
    sd.difficulty_level,
    sd.estimated_solution_time,
    sd.created_at
  FROM solution_documents sd
  WHERE 
    sd.is_template = true 
    AND sd.is_published = true
  ORDER BY sd.title;
END;
$$;

-- ================================================================
-- FUNCIÓN: Crear versión de documento (para historial)
-- ================================================================
CREATE OR REPLACE FUNCTION create_document_version(
  document_id_param uuid,
  content_param jsonb,
  change_summary_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  version_id uuid;
  current_version integer;
BEGIN
  -- Obtener la versión actual
  SELECT version INTO current_version
  FROM solution_documents
  WHERE id = document_id_param;
  
  -- Crear nueva versión
  INSERT INTO solution_document_versions (
    document_id,
    content,
    version,
    created_by,
    change_summary
  ) VALUES (
    document_id_param,
    content_param,
    current_version,
    auth.uid(),
    change_summary_param
  ) RETURNING id INTO version_id;
  
  RETURN version_id;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_solution_document_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_solution_documents(text, text, integer[], boolean, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_documents_by_case(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_document_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_documents(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_templates() TO authenticated;
GRANT EXECUTE ON FUNCTION create_document_version(uuid, jsonb, text) TO authenticated;
