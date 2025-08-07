-- ===================================================================
-- CORRECCIÓN: FUNCIÓN DE BÚSQUEDA SIMPLE FALTANTE
-- ===================================================================
-- Descripción: Crear la función search_docs_simple que falta
-- Fecha: 6 de Agosto, 2025
-- ===================================================================

-- Verificar si existe y eliminar si es necesario
DROP FUNCTION IF EXISTS search_docs_simple(TEXT);

-- Crear función simple de búsqueda
CREATE OR REPLACE FUNCTION search_docs_simple(
  search_text TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Validar entrada
  IF search_text IS NULL OR TRIM(search_text) = '' THEN
    RETURN '[]'::JSON;
  END IF;

  -- Buscar documentos reales pero con lógica simple
  SELECT json_agg(
    json_build_object(
      'id', sd.id,
      'title', sd.title,
      'matched_content', SUBSTRING(sd.content, 1, 200),
      'relevance_score', 0.8,
      'category', COALESCE(sd.solution_type, 'Sin categoría')
    )
  ) INTO result
  FROM solution_documents sd
  WHERE 
    sd.is_published = true
    AND (
      sd.title ILIKE '%' || search_text || '%'
      OR sd.content ILIKE '%' || search_text || '%'
    )
  LIMIT 8;
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION search_docs_simple(TEXT) TO authenticated;

-- Comentario
COMMENT ON FUNCTION search_docs_simple(TEXT) IS 'Función de búsqueda simple para testing de documentación';

-- Verificar que ambas funciones existen
DO $$
BEGIN
    -- Verificar get_search_suggestions_simple
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_search_suggestions_simple') THEN
        RAISE NOTICE '✅ get_search_suggestions_simple existe';
    ELSE
        RAISE NOTICE '❌ get_search_suggestions_simple NO existe';
    END IF;
    
    -- Verificar search_docs_simple
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_docs_simple') THEN
        RAISE NOTICE '✅ search_docs_simple existe';
    ELSE
        RAISE NOTICE '❌ search_docs_simple NO existe';
    END IF;
    
    RAISE NOTICE 'Corrección de función search_docs_simple completada';
END $$;
