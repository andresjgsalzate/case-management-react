-- ===================================================================
-- FUNCIONES DE BÚSQUEDA SIMPLIFICADAS PARA TESTING
-- ===================================================================
-- Descripción: Versiones simplificadas para probar conectividad
-- Fecha: 6 de Agosto, 2025
-- ===================================================================

-- Función simple de sugerencias de búsqueda
CREATE OR REPLACE FUNCTION get_search_suggestions_simple(
  partial_term TEXT,
  suggestion_limit INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Retornar datos de prueba simples
  SELECT json_agg(
    json_build_object(
      'suggestion', 'Test: ' || partial_term,
      'frequency', 1
    )
  ) INTO result
  FROM generate_series(1, LEAST(suggestion_limit, 3));
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- Función simple de búsqueda rápida
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
  -- Buscar documentos reales pero con lógica simple
  SELECT json_agg(
    json_build_object(
      'id', sd.id,
      'title', sd.title,
      'matched_content', SUBSTRING(sd.content, 1, 200),
      'relevance_score', 0.8,
      'category', sd.solution_type
    )
  ) INTO result
  FROM solution_documents sd
  WHERE 
    sd.is_published = true
    AND (
      sd.title ILIKE '%' || search_text || '%'
      OR sd.content ILIKE '%' || search_text || '%'
    )
  LIMIT 5;
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_search_suggestions_simple(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_docs_simple(TEXT) TO authenticated;

-- Comentarios
COMMENT ON FUNCTION get_search_suggestions_simple(TEXT, INTEGER) IS 'Función simplificada de sugerencias para testing';
COMMENT ON FUNCTION search_docs_simple(TEXT) IS 'Función simplificada de búsqueda para testing';

-- Notificación de finalización
DO $$
BEGIN
    RAISE NOTICE 'Funciones de búsqueda simplificadas creadas exitosamente';
    RAISE NOTICE 'get_search_suggestions_simple - Para sugerencias de prueba';
    RAISE NOTICE 'search_docs_simple - Para búsqueda de prueba';
END $$;
