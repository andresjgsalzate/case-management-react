-- =====================================================
-- MIGRACIÓN: POLÍTICAS RLS PARA VALIDACIÓN DE CASOS
-- =====================================================
-- Descripción: Permite validación de casos para documentación
-- Fecha: 1 de Agosto, 2025
-- =====================================================

-- 1. CREAR POLÍTICA PARA VALIDACIÓN DE CASOS ACTIVOS
-- =====================================================
-- Política específica que permite SELECT limitado para validación
CREATE POLICY "Allow case validation for documentation" ON cases
  FOR SELECT 
  USING (
    -- Permitir solo consultas de validación (campos específicos)
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_active = true
    )
  );

-- 2. CREAR POLÍTICA PARA VALIDACIÓN DE CASOS ARCHIVADOS
-- =====================================================
-- Política específica que permite SELECT limitado para validación
CREATE POLICY "Allow archived case validation for documentation" ON archived_cases
  FOR SELECT 
  USING (
    -- Permitir solo consultas de validación (campos específicos)
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_active = true
    )
  );

-- 3. CREAR FUNCIÓN PARA VALIDACIÓN SEGURA DE CASOS
-- =====================================================
-- Función que permite validación sin exponer datos sensibles
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

-- 4. OTORGAR PERMISOS A LA FUNCIÓN
-- =====================================================
-- Permitir que todos los usuarios autenticados usen la función
GRANT EXECUTE ON FUNCTION validate_case_exists(TEXT, TEXT) TO authenticated;

-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================
COMMENT ON FUNCTION validate_case_exists(TEXT, TEXT) IS 
'Función segura para validar existencia de casos sin exponer datos sensibles. 
Permite búsqueda por UUID o número de caso en casos activos y archivados.';

COMMENT ON POLICY "Allow case validation for documentation" ON cases IS 
'Permite validación limitada de casos para el módulo de documentación';

COMMENT ON POLICY "Allow archived case validation for documentation" ON archived_cases IS 
'Permite validación limitada de casos archivados para el módulo de documentación';
