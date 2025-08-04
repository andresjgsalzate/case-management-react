-- =====================================================
-- FUNCIÓN RPC: BÚSQUEDA DE CASOS CON AUTOCOMPLETADO
-- =====================================================
-- Descripción: Función para buscar casos que coincidan parcialmente
-- con el término de búsqueda para implementar autocompletado
-- Fecha: 4 de Agosto, 2025
-- =====================================================

CREATE OR REPLACE FUNCTION search_cases_autocomplete(
  search_term TEXT,
  case_type TEXT DEFAULT 'both',
  search_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  numero_caso TEXT,
  descripcion TEXT,
  classification TEXT,
  type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar el parámetro case_type
  IF case_type NOT IN ('active', 'archived', 'both') THEN
    RAISE EXCEPTION 'case_type debe ser active, archived o both';
  END IF;

  -- Validar que el término de búsqueda no esté vacío
  IF search_term IS NULL OR TRIM(search_term) = '' THEN
    RETURN;
  END IF;

  -- Búsqueda en casos activos
  IF case_type IN ('active', 'both') THEN
    RETURN QUERY
    SELECT 
      c.id,
      c.numero_caso,
      c.descripcion,
      c.classification,
      'active'::TEXT as type
    FROM casos c
    WHERE 
      (
        c.numero_caso ILIKE '%' || search_term || '%' OR
        c.descripcion ILIKE '%' || search_term || '%'
      )
      AND c.deleted_at IS NULL
    ORDER BY 
      -- Priorizar coincidencias exactas en numero_caso
      CASE WHEN c.numero_caso ILIKE search_term THEN 1
           WHEN c.numero_caso ILIKE search_term || '%' THEN 2
           WHEN c.numero_caso ILIKE '%' || search_term || '%' THEN 3
           WHEN c.descripcion ILIKE search_term || '%' THEN 4
           ELSE 5 END,
      c.created_at DESC
    LIMIT search_limit;
  END IF;

  -- Búsqueda en casos archivados
  IF case_type IN ('archived', 'both') THEN
    RETURN QUERY
    SELECT 
      a.id,
      a.case_number as numero_caso,
      a.description as descripcion,
      a.classification,
      'archived'::TEXT as type
    FROM archived_cases a
    WHERE 
      (
        a.case_number ILIKE '%' || search_term || '%' OR
        a.description ILIKE '%' || search_term || '%'
      )
      AND a.deleted_at IS NULL
    ORDER BY 
      -- Priorizar coincidencias exactas en case_number
      CASE WHEN a.case_number ILIKE search_term THEN 1
           WHEN a.case_number ILIKE search_term || '%' THEN 2
           WHEN a.case_number ILIKE '%' || search_term || '%' THEN 3
           WHEN a.description ILIKE search_term || '%' THEN 4
           ELSE 5 END,
      a.created_at DESC
    LIMIT search_limit;
  END IF;

END;
$$;

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION search_cases_autocomplete(TEXT, TEXT, INTEGER) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION search_cases_autocomplete IS 'Busca casos (activos y/o archivados) que coincidan parcialmente con el término de búsqueda para autocompletado';
