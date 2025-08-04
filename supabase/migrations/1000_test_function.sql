-- =====================================================
-- FUNCIÓN DE PRUEBA: VERIFICAR CASOS SIMPLES
-- =====================================================
-- Descripción: Función simple para verificar que hay casos
-- y que la búsqueda básica funciona
-- Fecha: 4 de Agosto, 2025
-- =====================================================

-- Función para obtener algunos casos como prueba
CREATE OR REPLACE FUNCTION test_get_cases()
RETURNS TABLE(
  id UUID,
  numero_caso TEXT,
  descripcion TEXT,
  type TEXT,
  total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Contar casos activos
  DECLARE
    active_count BIGINT;
    archived_count BIGINT;
  BEGIN
    SELECT COUNT(*) INTO active_count FROM casos WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO archived_count FROM archived_cases WHERE deleted_at IS NULL;
    
    -- Retornar algunos casos activos
    RETURN QUERY
    SELECT 
      c.id,
      c.numero_caso,
      c.descripcion,
      'active'::TEXT as type,
      active_count as total_count
    FROM casos c
    WHERE c.deleted_at IS NULL
    ORDER BY c.created_at DESC
    LIMIT 5;
    
    -- Retornar algunos casos archivados
    RETURN QUERY
    SELECT 
      a.id,
      a.case_number as numero_caso,
      a.description as descripcion,
      'archived'::TEXT as type,
      archived_count as total_count
    FROM archived_cases a
    WHERE a.deleted_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT 5;
  END;
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION test_get_cases() TO authenticated;

-- Comentario
COMMENT ON FUNCTION test_get_cases IS 'Función de prueba para verificar casos en la base de datos';
