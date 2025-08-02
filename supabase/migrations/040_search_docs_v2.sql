-- ================================================================
-- MIGRACIÓN: NUEVA FUNCIÓN DE BÚSQUEDA SIN CONFLICTOS
-- ================================================================
-- Descripción: Crea una función completamente nueva para evitar conflictos
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Crear función con nombre completamente nuevo
CREATE OR REPLACE FUNCTION search_docs_v2(search_text text)
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
  
  -- Ejecutar búsqueda simple sin GROUP BY
  SELECT json_agg(doc_result) INTO result
  FROM (
    SELECT json_build_object(
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
    ) as doc_result
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
    LIMIT 10
  ) search_results;
  
  -- Retornar resultado (o array vacío si no hay coincidencias)
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_docs_v2(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_docs_v2(text) TO anon;

-- Verificar que la función existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'search_docs_v2' 
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función search_docs_v2 no se creó correctamente';
  END IF;
  
  RAISE NOTICE 'Función search_docs_v2 creada correctamente';
END $$;
