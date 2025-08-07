-- =====================================================
-- DROP Y RECREAR FUNCIONES CON TIPOS CORRECTOS
-- =====================================================
-- Descripción: Elimina las funciones existentes y las recrea con tipos exactos
-- Fecha: 6 de Agosto, 2025
-- =====================================================

-- 1. ELIMINAR FUNCIONES EXISTENTES
-- =====================================================

DROP FUNCTION IF EXISTS search_cases_autocomplete(TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS validate_case_exists(TEXT, TEXT);

-- 2. RECREAR FUNCIÓN search_cases_autocomplete CON TIPOS CORRECTOS
-- =====================================================

CREATE OR REPLACE FUNCTION search_cases_autocomplete(
  search_term TEXT,
  case_type TEXT DEFAULT 'both',
  search_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  numero_caso CHARACTER VARYING,
  descripcion TEXT,
  classification CHARACTER VARYING,
  type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log de entrada para debug
  RAISE NOTICE 'search_cases_autocomplete ejecutada con: term=%, type=%, limit=%', search_term, case_type, search_limit;

  -- Validar el parámetro case_type
  IF case_type NOT IN ('active', 'archived', 'both') THEN
    RAISE EXCEPTION 'case_type debe ser active, archived o both';
  END IF;

  -- Validar que el término de búsqueda no esté vacío
  IF search_term IS NULL OR TRIM(search_term) = '' THEN
    RAISE NOTICE 'Término de búsqueda vacío, retornando sin resultados';
    RETURN;
  END IF;

  -- Búsqueda en casos activos
  IF case_type IN ('active', 'both') THEN
    RAISE NOTICE 'Buscando en casos activos...';
    
    RETURN QUERY
    SELECT 
      c.id,
      c.numero_caso,
      c.descripcion,
      c.clasificacion,
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
    RAISE NOTICE 'Buscando en casos archivados...';
    
    RETURN QUERY
    SELECT 
      a.id,
      a.case_number,
      a.description,
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

  RAISE NOTICE 'Búsqueda completada';
END;
$$;

-- 3. RECREAR FUNCIÓN validate_case_exists
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
  -- Log de entrada para debug
  RAISE NOTICE 'validate_case_exists ejecutada con: identifier=%, type=%', case_identifier, case_type;

  -- Verificar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RAISE NOTICE 'Usuario no autenticado';
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
    RAISE NOTICE 'Usuario sin permisos';
    RETURN json_build_object(
      'exists', false,
      'error', 'Usuario no tiene permisos'
    );
  END IF;

  -- Validar caso según tipo
  IF case_type = 'active' THEN
    RAISE NOTICE 'Buscando en casos activos...';
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
    RAISE NOTICE 'Buscando en casos archivados...';
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
    RAISE NOTICE 'Caso encontrado: %', case_record;
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
    RAISE NOTICE 'Caso no encontrado';
    result := json_build_object(
      'exists', false,
      'type', case_type,
      'error', 'Caso no encontrado'
    );
  END IF;

  RETURN result;
END;
$$;

-- 4. OTORGAR PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION search_cases_autocomplete(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_case_exists(TEXT, TEXT) TO authenticated;

-- 5. VERIFICAR CREACIÓN Y TIPOS DE DATOS
-- =====================================================

DO $$
DECLARE
  active_cases_count INTEGER;
  archived_cases_count INTEGER;
  numero_caso_type TEXT;
  descripcion_type TEXT;
  clasificacion_type TEXT;
  function_exists BOOLEAN;
  sample_case RECORD;
BEGIN
  -- Verificar que las funciones existen
  SELECT EXISTS(
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'search_cases_autocomplete'
  ) INTO function_exists;
  
  RAISE NOTICE '=== VERIFICACIÓN DE FUNCIONES ===';
  RAISE NOTICE 'Función search_cases_autocomplete creada: %', function_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'validate_case_exists'
  ) INTO function_exists;
  
  RAISE NOTICE 'Función validate_case_exists creada: %', function_exists;
  
  -- Contar casos
  SELECT COUNT(*) INTO active_cases_count FROM cases;
  SELECT COUNT(*) INTO archived_cases_count FROM archived_cases;
  
  -- Obtener tipos de datos reales de la tabla cases
  SELECT data_type INTO numero_caso_type 
  FROM information_schema.columns 
  WHERE table_name = 'cases' AND column_name = 'numero_caso';
  
  SELECT data_type INTO descripcion_type 
  FROM information_schema.columns 
  WHERE table_name = 'cases' AND column_name = 'descripcion';
  
  SELECT data_type INTO clasificacion_type 
  FROM information_schema.columns 
  WHERE table_name = 'cases' AND column_name = 'clasificacion';
  
  RAISE NOTICE '';
  RAISE NOTICE '=== TIPOS DE DATOS EN BD ===';
  RAISE NOTICE 'numero_caso: %', numero_caso_type;
  RAISE NOTICE 'descripcion: %', descripcion_type;
  RAISE NOTICE 'clasificacion: %', clasificacion_type;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== ESTADO DE DATOS ===';
  RAISE NOTICE 'Casos activos: %', active_cases_count;
  RAISE NOTICE 'Casos archivados: %', archived_cases_count;
  
  -- Mostrar muestra de casos para verificar formato
  IF active_cases_count > 0 THEN
    SELECT numero_caso, descripcion, clasificacion 
    INTO sample_case 
    FROM cases 
    LIMIT 1;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MUESTRA DE CASO ===';
    RAISE NOTICE 'Ejemplo numero_caso: "%"', sample_case.numero_caso;
    RAISE NOTICE 'Ejemplo descripcion: "%"', sample_case.descripcion;
    RAISE NOTICE 'Ejemplo clasificacion: "%"', sample_case.clasificacion;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCIONES LISTAS PARA PROBAR ===';
  RAISE NOTICE 'Ahora puedes probar la búsqueda con "SR"';
END $$;
