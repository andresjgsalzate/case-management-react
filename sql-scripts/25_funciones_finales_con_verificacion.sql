-- =====================================================
-- FUNCIONES FINALES CORREGIDAS PARA BÚSQUEDA Y VALIDACIÓN DE CASOS
-- =====================================================
-- Descripción: Funciones corregidas basadas en la estructura real de la BD
-- Fecha: 6 de Agosto, 2025
-- =====================================================

-- 1. FUNCIÓN PARA BÚSQUEDA DE CASOS CON AUTOCOMPLETADO
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
      c.clasificacion as classification,
      'active'::TEXT as type
    FROM cases c
    WHERE 
      (
        c.numero_caso ILIKE '%' || search_term || '%' OR
        c.descripcion ILIKE '%' || search_term || '%'
      )
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

-- 2. FUNCIÓN PARA VALIDACIÓN DE CASOS
-- =====================================================

CREATE OR REPLACE FUNCTION validate_case_exists(
  case_identifier TEXT,
  case_type TEXT DEFAULT 'active'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  case_record RECORD;
BEGIN
  -- Verificar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'exists', false,
      'error', 'Usuario no autenticado'
    );
  END IF;

  -- Verificar que el usuario esté activo
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_active = true
  ) THEN
    RETURN json_build_object(
      'exists', false,
      'error', 'Usuario no tiene permisos'
    );
  END IF;

  -- Validar caso según tipo
  IF case_type = 'active' THEN
    -- Buscar en casos activos
    IF case_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      -- Es un UUID, buscar por ID
      SELECT id, numero_caso, descripcion, clasificacion
      INTO case_record
      FROM cases
      WHERE id = case_identifier::uuid
      LIMIT 1;
    ELSE
      -- Es un número de caso, buscar por numero_caso
      SELECT id, numero_caso, descripcion, clasificacion
      INTO case_record
      FROM cases
      WHERE numero_caso = case_identifier
      LIMIT 1;
    END IF;
  ELSIF case_type = 'archived' THEN
    -- Buscar en casos archivados
    IF case_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      -- Es un UUID, buscar por ID
      SELECT id, case_number, description, classification
      INTO case_record
      FROM archived_cases
      WHERE id = case_identifier::uuid
      LIMIT 1;
    ELSE
      -- Es un número de caso, buscar por case_number
      SELECT id, case_number, description, classification
      INTO case_record
      FROM archived_cases
      WHERE case_number = case_identifier
      LIMIT 1;
    END IF;
  END IF;

  -- Construir respuesta
  IF case_record IS NOT NULL THEN
    IF case_type = 'active' THEN
      result := json_build_object(
        'exists', true,
        'type', 'active',
        'id', case_record.id,
        'number', case_record.numero_caso,
        'description', case_record.descripcion,
        'classification', case_record.clasificacion
      );
    ELSE
      result := json_build_object(
        'exists', true,
        'type', 'archived',
        'id', case_record.id,
        'number', case_record.case_number,
        'description', case_record.description,
        'classification', case_record.classification
      );
    END IF;
  ELSE
    result := json_build_object(
      'exists', false,
      'type', case_type,
      'error', 'Caso no encontrado'
    );
  END IF;

  RETURN result;
END;
$$;

-- 3. OTORGAR PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION search_cases_autocomplete(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_case_exists(TEXT, TEXT) TO authenticated;

-- 4. VERIFICAR EXISTENCIA DE DATOS PARA PRUEBAS
-- =====================================================

DO $$
DECLARE
  active_cases_count INTEGER;
  archived_cases_count INTEGER;
BEGIN
  -- Contar casos activos
  SELECT COUNT(*) INTO active_cases_count FROM cases;
  
  -- Contar casos archivados  
  SELECT COUNT(*) INTO archived_cases_count FROM archived_cases;
  
  RAISE NOTICE 'Funciones creadas exitosamente:';
  RAISE NOTICE '1. search_cases_autocomplete - Búsqueda con autocompletado';
  RAISE NOTICE '2. validate_case_exists - Validación de casos';
  RAISE NOTICE '';
  RAISE NOTICE 'Estado de la base de datos:';
  RAISE NOTICE 'Casos activos encontrados: %', active_cases_count;
  RAISE NOTICE 'Casos archivados encontrados: %', archived_cases_count;
  
  IF active_cases_count = 0 AND archived_cases_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'ADVERTENCIA: No se encontraron casos en la base de datos.';
    RAISE NOTICE 'Esto explicaría por qué la búsqueda no devuelve resultados.';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE 'Datos disponibles para búsqueda.';
  END IF;
END $$;
