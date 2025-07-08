-- =====================================================
-- Corrección de Permisos del Módulo de Archivo
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Corrige las políticas RLS y permisos para que el módulo de archivo
--             respete la misma estructura de permisos que otros módulos:
--             - Admin: puede ver y restaurar todo
--             - Supervisor: puede ver y restaurar todo
--             - Analista: puede ver y restaurar solo sus propios elementos

-- =====================================================
-- CORREGIR FUNCIÓN DE PERMISOS DE RESTAURACIÓN
-- =====================================================

-- Función para verificar permisos de restauración (ahora incluye analistas)
CREATE OR REPLACE FUNCTION can_restore_items(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND up.is_active = true
    AND r.name IN ('admin', 'supervisor', 'analista')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA ARCHIVED_CASES
-- =====================================================

-- Eliminar política UPDATE existente
DROP POLICY IF EXISTS "Admins and supervisors can update archived cases" ON archived_cases;
DROP POLICY IF EXISTS "Users can update archived cases based on permissions" ON archived_cases;

-- Crear nueva política UPDATE que permite a analistas restaurar sus elementos
CREATE POLICY "Users can update archived cases based on permissions" ON archived_cases
  FOR UPDATE
  USING (
    -- Administradores y supervisores pueden actualizar todos los casos archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name IN ('admin', 'supervisor') AND up.is_active = true
    )
    OR
    -- Analistas pueden actualizar (restaurar) solo casos archivados por ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND archived_by = auth.uid()
    )
  );

-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA ARCHIVED_TODOS
-- =====================================================

-- Eliminar política UPDATE existente
DROP POLICY IF EXISTS "Admins and supervisors can update archived todos" ON archived_todos;
DROP POLICY IF EXISTS "Users can update archived todos based on permissions" ON archived_todos;

-- Crear nueva política UPDATE que permite a analistas restaurar sus elementos
CREATE POLICY "Users can update archived todos based on permissions" ON archived_todos
  FOR UPDATE
  USING (
    -- Administradores y supervisores pueden actualizar todos los TODOs archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name IN ('admin', 'supervisor') AND up.is_active = true
    )
    OR
    -- Analistas pueden actualizar (restaurar) solo TODOs archivados por ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND archived_by = auth.uid()
    )
  );

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION can_restore_items(uuid) IS 'Verifica si un usuario puede restaurar elementos - Admin/Supervisor: todos, Analista: solo los suyos';
