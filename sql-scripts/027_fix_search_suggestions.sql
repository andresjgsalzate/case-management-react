-- =====================================================
-- CORRECCIÓN DE FUNCIÓN get_search_suggestions
-- =====================================================
-- Descripción: Corregir el tipo de retorno para compatibilidad con Supabase
-- Fecha: 6 de Agosto, 2025
-- =====================================================

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS get_search_suggestions(TEXT, INTEGER);

-- Recrear función con retorno JSON compatible
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_term TEXT,
  suggestion_limit INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  results_array JSON[] := '{}';
  suggestion_record RECORD;
BEGIN
  -- Validar entrada
  IF partial_term IS NULL OR TRIM(partial_term) = '' OR LENGTH(TRIM(partial_term)) < 2 THEN
    RETURN '[]'::JSON;
  END IF;

  -- Sugerencias basadas en títulos de documentos
  FOR suggestion_record IN
    SELECT DISTINCT
      sd.title as suggestion,
      1 as frequency
    FROM solution_documents sd
    WHERE 
      sd.is_published = true
      AND sd.title ILIKE '%' || partial_term || '%'
    ORDER BY sd.title
    LIMIT suggestion_limit / 2
  LOOP
    results_array := array_append(results_array, 
      json_build_object(
        'suggestion', suggestion_record.suggestion,
        'frequency', suggestion_record.frequency
      )
    );
  END LOOP;

  -- Sugerencias basadas en etiquetas
  FOR suggestion_record IN
    SELECT DISTINCT
      st.name as suggestion,
      COUNT(sdt.document_id)::INTEGER as frequency
    FROM solution_tags st
    JOIN solution_document_tags sdt ON st.id = sdt.tag_id
    JOIN solution_documents sd ON sdt.document_id = sd.id
    WHERE 
      sd.is_published = true
      AND st.name ILIKE '%' || partial_term || '%'
    GROUP BY st.name
    ORDER BY frequency DESC, st.name
    LIMIT suggestion_limit / 2
  LOOP
    results_array := array_append(results_array, 
      json_build_object(
        'suggestion', suggestion_record.suggestion,
        'frequency', suggestion_record.frequency
      )
    );
  END LOOP;

  -- Convertir array a JSON
  SELECT array_to_json(results_array) INTO result;
  
  RETURN result;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_search_suggestions(TEXT, INTEGER) TO authenticated;

-- Comentario
COMMENT ON FUNCTION get_search_suggestions(TEXT, INTEGER) IS 'Obtiene sugerencias de búsqueda como JSON array compatible con Supabase';

-- Verificar creación
DO $$
BEGIN
    RAISE NOTICE 'Función get_search_suggestions corregida exitosamente';
    RAISE NOTICE 'Ahora retorna JSON array compatible con Supabase RPC';
END $$;
