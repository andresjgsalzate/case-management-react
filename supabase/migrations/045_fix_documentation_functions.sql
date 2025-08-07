-- ================================================================
-- MIGRACIÓN: CORRECCIÓN DE FUNCIONES DE DOCUMENTACIÓN
-- ================================================================
-- Descripción: Crea las funciones SQL faltantes para crear y actualizar
-- documentos que están siendo llamadas desde el hook useSolutionDocuments
-- Fecha: 6 de Enero, 2025
-- ================================================================

-- ================================================================
-- LIMPIAR FUNCIONES EXISTENTES
-- ================================================================
-- Eliminar todas las versiones de las funciones si existen
DROP FUNCTION IF EXISTS create_solution_document_final CASCADE;
DROP FUNCTION IF EXISTS update_solution_document_final CASCADE;
DROP FUNCTION IF EXISTS delete_solution_document CASCADE;

-- ================================================================
-- FUNCIÓN: Crear documento de solución (VERSION FINAL)
-- ================================================================
CREATE OR REPLACE FUNCTION create_solution_document_final(
  p_title text,
  p_content jsonb DEFAULT '[]'::jsonb,
  p_solution_type text DEFAULT 'solution',
  p_difficulty_level integer DEFAULT 1,
  p_case_id uuid DEFAULT NULL,
  p_archived_case_id uuid DEFAULT NULL,
  p_case_reference_type text DEFAULT 'active',
  p_complexity_notes text DEFAULT NULL,
  p_prerequisites text DEFAULT NULL,
  p_estimated_solution_time integer DEFAULT NULL,
  p_is_template boolean DEFAULT false,
  p_is_published boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_document_id uuid;
  v_user_id uuid;
BEGIN
  -- Obtener usuario actual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Validar parámetros
  IF p_title IS NULL OR trim(p_title) = '' THEN
    RAISE EXCEPTION 'El título es requerido';
  END IF;

  IF p_difficulty_level < 1 OR p_difficulty_level > 5 THEN
    RAISE EXCEPTION 'El nivel de dificultad debe estar entre 1 y 5';
  END IF;

  -- Validar que el tipo de solución existe en solution_document_types activos
  IF NOT EXISTS (
    SELECT 1 FROM solution_document_types 
    WHERE code = p_solution_type AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Tipo de solución inválido';
  END IF;

  -- Validar referencias de casos si se proporcionan
  IF p_case_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cases WHERE id = p_case_id) THEN
    RAISE EXCEPTION 'El caso referenciado no existe';
  END IF;

  IF p_archived_case_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM archived_cases WHERE id = p_archived_case_id) THEN
    RAISE EXCEPTION 'El caso archivado referenciado no existe';
  END IF;

  -- No permitir ambos tipos de caso
  IF p_case_id IS NOT NULL AND p_archived_case_id IS NOT NULL THEN
    RAISE EXCEPTION 'No se puede referenciar un caso activo y archivado al mismo tiempo';
  END IF;

  -- Insertar documento
  INSERT INTO solution_documents (
    title,
    content,
    solution_type,
    difficulty_level,
    case_id,
    archived_case_id,
    case_reference_type,
    complexity_notes,
    prerequisites,
    estimated_solution_time,
    is_template,
    is_published,
    created_by,
    updated_by,
    created_at,
    updated_at
  ) VALUES (
    trim(p_title),
    COALESCE(p_content, '[]'::jsonb),
    p_solution_type,
    p_difficulty_level,
    p_case_id,
    p_archived_case_id,
    p_case_reference_type,
    p_complexity_notes,
    p_prerequisites,
    p_estimated_solution_time,
    p_is_template,
    p_is_published,
    v_user_id,
    v_user_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_document_id;

  RETURN v_document_id;
END;
$$;

-- ================================================================
-- FUNCIÓN: Actualizar documento de solución (VERSION FINAL)
-- ================================================================
CREATE OR REPLACE FUNCTION update_solution_document_final(
  p_document_id uuid,
  p_title text DEFAULT NULL,
  p_content jsonb DEFAULT NULL,
  p_solution_type text DEFAULT NULL,
  p_difficulty_level integer DEFAULT NULL,
  p_case_id uuid DEFAULT NULL,
  p_archived_case_id uuid DEFAULT NULL,
  p_case_reference_type text DEFAULT NULL,
  p_complexity_notes text DEFAULT NULL,
  p_prerequisites text DEFAULT NULL,
  p_estimated_solution_time integer DEFAULT NULL,
  p_is_template boolean DEFAULT NULL,
  p_is_published boolean DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_document_exists boolean;
BEGIN
  -- Obtener usuario actual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Verificar que el documento existe
  SELECT EXISTS(SELECT 1 FROM solution_documents WHERE id = p_document_id) INTO v_document_exists;
  
  IF NOT v_document_exists THEN
    RAISE EXCEPTION 'Documento no encontrado';
  END IF;

  -- Validar parámetros si se proporcionan
  IF p_title IS NOT NULL AND trim(p_title) = '' THEN
    RAISE EXCEPTION 'El título no puede estar vacío';
  END IF;

  IF p_difficulty_level IS NOT NULL AND (p_difficulty_level < 1 OR p_difficulty_level > 5) THEN
    RAISE EXCEPTION 'El nivel de dificultad debe estar entre 1 y 5';
  END IF;

  IF p_solution_type IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM solution_document_types 
    WHERE code = p_solution_type AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Tipo de solución inválido';
  END IF;

  -- Validar referencias de casos si se proporcionan
  IF p_case_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cases WHERE id = p_case_id) THEN
    RAISE EXCEPTION 'El caso referenciado no existe';
  END IF;

  IF p_archived_case_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM archived_cases WHERE id = p_archived_case_id) THEN
    RAISE EXCEPTION 'El caso archivado referenciado no existe';
  END IF;

  -- Actualizar documento (solo campos no nulos)
  UPDATE solution_documents 
  SET 
    title = COALESCE(trim(p_title), title),
    content = COALESCE(p_content, content),
    solution_type = COALESCE(p_solution_type, solution_type),
    difficulty_level = COALESCE(p_difficulty_level, difficulty_level),
    case_id = CASE 
      WHEN p_case_id IS NOT NULL THEN p_case_id 
      ELSE case_id 
    END,
    archived_case_id = CASE 
      WHEN p_archived_case_id IS NOT NULL THEN p_archived_case_id 
      ELSE archived_case_id 
    END,
    case_reference_type = COALESCE(p_case_reference_type, case_reference_type),
    complexity_notes = CASE 
      WHEN p_complexity_notes IS NOT NULL THEN p_complexity_notes 
      ELSE complexity_notes 
    END,
    prerequisites = CASE 
      WHEN p_prerequisites IS NOT NULL THEN p_prerequisites 
      ELSE prerequisites 
    END,
    estimated_solution_time = CASE 
      WHEN p_estimated_solution_time IS NOT NULL THEN p_estimated_solution_time 
      ELSE estimated_solution_time 
    END,
    is_template = COALESCE(p_is_template, is_template),
    is_published = COALESCE(p_is_published, is_published),
    updated_by = v_user_id,
    updated_at = NOW()
  WHERE id = p_document_id;

  RETURN p_document_id;
END;
$$;

-- ================================================================
-- FUNCIÓN: Eliminar documento de solución
-- ================================================================
CREATE OR REPLACE FUNCTION delete_solution_document(
  p_document_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_document_exists boolean;
  v_can_delete boolean;
BEGIN
  -- Obtener usuario actual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Verificar que el documento existe y el usuario puede eliminarlo
  SELECT EXISTS(
    SELECT 1 FROM solution_documents 
    WHERE id = p_document_id 
    AND (
      created_by = v_user_id 
      OR EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = v_user_id AND r.name = 'Admin'
      )
    )
  ) INTO v_can_delete;
  
  IF NOT v_can_delete THEN
    RAISE EXCEPTION 'No tienes permisos para eliminar este documento o el documento no existe';
  END IF;

  -- Eliminar documento (las tablas relacionadas se eliminan en cascada)
  DELETE FROM solution_documents WHERE id = p_document_id;
  
  RETURN true;
END;
$$;

-- ================================================================
-- OTORGAR PERMISOS
-- ================================================================
GRANT EXECUTE ON FUNCTION create_solution_document_final(text, jsonb, text, integer, uuid, uuid, text, text, text, integer, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document_final(uuid, text, jsonb, text, integer, uuid, uuid, text, text, text, integer, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_solution_document(uuid) TO authenticated;

-- ================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ================================================================
COMMENT ON FUNCTION create_solution_document_final IS 'Crea un nuevo documento de solución con validación completa de parámetros';
COMMENT ON FUNCTION update_solution_document_final IS 'Actualiza un documento de solución existente con validación completa';
COMMENT ON FUNCTION delete_solution_document IS 'Elimina un documento de solución con validación de permisos';

-- Verificar que las funciones se crearon correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_solution_document_final'
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función create_solution_document_final no se creó correctamente';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_solution_document_final'
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función update_solution_document_final no se creó correctamente';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'delete_solution_document'
    AND pg_function_is_visible(oid)
  ) THEN
    RAISE EXCEPTION 'Error: La función delete_solution_document no se creó correctamente';
  END IF;
  
  RAISE NOTICE 'Funciones de documentación creadas correctamente';
END $$;
