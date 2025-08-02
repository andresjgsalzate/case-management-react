-- =================================================================
-- MIGRACIÓN: Arreglar función de búsqueda con etiquetas y nombres de usuario
-- =================================================================
-- Descripción: Actualizar search_documents_full para incluir etiquetas y nombres
-- Fecha: 1 de Agosto, 2025
-- =================================================================

-- Primero eliminamos la función actual
DROP FUNCTION IF EXISTS search_documents_full(text, text, int);

-- Recreamos la función con etiquetas y nombres de usuario
CREATE OR REPLACE FUNCTION search_documents_full(
  search_text text,
  category_filter text DEFAULT NULL,
  limit_count int DEFAULT 50
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Buscar documentos con texto completo, incluyendo etiquetas y nombres de usuario
  WITH document_search AS (
    SELECT 
      sd.*,
      p.full_name as created_by_name,
      p.email as created_by_email,
      -- Agregar etiquetas como JSON
      COALESCE(
        json_agg(
          json_build_object(
            'id', st.id,
            'name', st.name,
            'description', st.description,
            'color', st.color,
            'category', st.category
          )
        ) FILTER (WHERE st.id IS NOT NULL),
        '[]'::json
      ) as tags
    FROM solution_documents sd
    LEFT JOIN profiles p ON sd.created_by = p.id
    LEFT JOIN solution_document_tags sdt ON sd.id = sdt.document_id
    LEFT JOIN solution_tags st ON sdt.tag_id = st.id
    WHERE 
      -- Búsqueda en múltiples campos
      (
        sd.title ILIKE '%' || search_text || '%'
        OR sd.content::text ILIKE '%' || search_text || '%'
        OR sd.complexity_notes ILIKE '%' || search_text || '%'
        OR sd.prerequisites ILIKE '%' || search_text || '%'
        OR sd.case_id ILIKE '%' || search_text || '%'
        OR sd.archived_case_id ILIKE '%' || search_text || '%'
        OR EXISTS (
          SELECT 1 FROM solution_document_tags sdt2
          JOIN solution_tags st2 ON sdt2.tag_id = st2.id
          WHERE sdt2.document_id = sd.id
          AND st2.name ILIKE '%' || search_text || '%'
        )
      )
      -- Filtro por categoría si se especifica
      AND (category_filter IS NULL OR sd.solution_type = category_filter)
    GROUP BY sd.id, p.full_name, p.email
    ORDER BY 
      -- Priorizar por relevancia
      CASE 
        WHEN sd.title ILIKE '%' || search_text || '%' THEN 1
        WHEN sd.content::text ILIKE '%' || search_text || '%' THEN 2
        WHEN sd.complexity_notes ILIKE '%' || search_text || '%' THEN 3
        ELSE 4
      END,
      sd.updated_at DESC
    LIMIT limit_count
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'title', title,
      'content', content,
      'case_id', case_id,
      'archived_case_id', archived_case_id,
      'case_reference_type', case_reference_type,
      'created_by', created_by,
      'created_by_name', created_by_name,
      'created_by_email', created_by_email,
      'updated_by', updated_by,
      'solution_type', solution_type,
      'difficulty_level', difficulty_level,
      'complexity_notes', complexity_notes,
      'prerequisites', prerequisites,
      'related_applications', related_applications,
      'estimated_solution_time', estimated_solution_time,
      'is_template', is_template,
      'is_published', is_published,
      'is_deprecated', is_deprecated,
      'deprecation_reason', deprecation_reason,
      'replacement_document_id', replacement_document_id,
      'version', version,
      'view_count', view_count,
      'helpful_count', helpful_count,
      'last_reviewed_at', last_reviewed_at,
      'last_reviewed_by', last_reviewed_by,
      'created_at', created_at,
      'updated_at', updated_at,
      'tags', tags
    )
  ) INTO result
  FROM document_search;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- También actualizar search_docs_v2 para consistencia
DROP FUNCTION IF EXISTS search_docs_v2(text, int);

CREATE OR REPLACE FUNCTION search_docs_v2(
  search_text text,
  limit_count int DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH document_search AS (
    SELECT 
      sd.*,
      p.full_name as created_by_name,
      p.email as created_by_email,
      COALESCE(
        json_agg(
          json_build_object(
            'id', st.id,
            'name', st.name,
            'description', st.description,
            'color', st.color,
            'category', st.category
          )
        ) FILTER (WHERE st.id IS NOT NULL),
        '[]'::json
      ) as tags
    FROM solution_documents sd
    LEFT JOIN profiles p ON sd.created_by = p.id
    LEFT JOIN solution_document_tags sdt ON sd.id = sdt.document_id
    LEFT JOIN solution_tags st ON sdt.tag_id = st.id
    WHERE 
      sd.title ILIKE '%' || search_text || '%'
      OR sd.content::text ILIKE '%' || search_text || '%'
      OR EXISTS (
        SELECT 1 FROM solution_document_tags sdt2
        JOIN solution_tags st2 ON sdt2.tag_id = st2.id
        WHERE sdt2.document_id = sd.id
        AND st2.name ILIKE '%' || search_text || '%'
      )
    GROUP BY sd.id, p.full_name, p.email
    ORDER BY sd.updated_at DESC
    LIMIT limit_count
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'title', title,
      'solution_type', solution_type,
      'difficulty_level', difficulty_level,
      'view_count', view_count,
      'helpful_count', helpful_count,
      'is_published', is_published,
      'is_template', is_template,
      'created_by', created_by,
      'created_by_name', created_by_name,
      'created_by_email', created_by_email,
      'created_at', created_at,
      'updated_at', updated_at,
      'tags', tags
    )
  ) INTO result
  FROM document_search;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Comentario de migración
COMMENT ON FUNCTION search_documents_full IS 'Búsqueda completa de documentos con etiquetas y nombres de usuario incluidos';
COMMENT ON FUNCTION search_docs_v2 IS 'Búsqueda rápida de documentos con etiquetas y nombres de usuario incluidos';
