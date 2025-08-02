-- ================================================================
-- MIGRACIÓN: Políticas RLS para Módulo de Documentación
-- Descripción: Configuración de seguridad a nivel de fila
-- Versión: 1.0
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view published documents or own documents" ON solution_documents;
DROP POLICY IF EXISTS "Authenticated users can create documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can delete own documents or admins all" ON solution_documents;

DROP POLICY IF EXISTS "Users can view versions of accessible documents" ON solution_document_versions;
DROP POLICY IF EXISTS "System can create document versions" ON solution_document_versions;

DROP POLICY IF EXISTS "Users can view feedback of accessible documents" ON solution_feedback;
DROP POLICY IF EXISTS "Users can create feedback on published documents" ON solution_feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON solution_feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON solution_feedback;

DROP POLICY IF EXISTS "Users can view active categories" ON solution_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON solution_categories;

-- ================================================================
-- POLÍTICAS PARA solution_documents
-- ================================================================

-- Política de lectura: usuarios pueden ver documentos publicados o sus propios documentos
CREATE POLICY "Users can view published documents or own documents" 
ON solution_documents FOR SELECT 
USING (
  is_published = true 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
  )
);

-- Política de creación: usuarios autenticados pueden crear documentos
CREATE POLICY "Authenticated users can create documents" 
ON solution_documents FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND created_by = auth.uid()
);

-- Política de actualización: usuarios pueden actualizar sus propios documentos
CREATE POLICY "Users can update own documents" 
ON solution_documents FOR UPDATE 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Política de eliminación: solo el creador o administradores pueden eliminar
CREATE POLICY "Users can delete own documents or admins all" 
ON solution_documents FOR DELETE 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'admin'
  )
);

-- ================================================================
-- POLÍTICAS PARA solution_document_versions
-- ================================================================

-- Política de lectura: usuarios pueden ver versiones de documentos que pueden ver
CREATE POLICY "Users can view versions of accessible documents" 
ON solution_document_versions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM solution_documents sd
    WHERE sd.id = document_id
    AND (
      sd.is_published = true 
      OR sd.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
      )
    )
  )
);

-- Política de creación: el sistema crea versiones automáticamente
CREATE POLICY "System can create document versions" 
ON solution_document_versions FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- ================================================================
-- POLÍTICAS PARA solution_feedback
-- ================================================================

-- Política de lectura: usuarios pueden ver feedback de documentos accesibles
CREATE POLICY "Users can view feedback of accessible documents" 
ON solution_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM solution_documents sd
    WHERE sd.id = document_id
    AND (
      sd.is_published = true 
      OR sd.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
      )
    )
  )
);

-- Política de creación: usuarios pueden dar feedback a documentos publicados
CREATE POLICY "Users can create feedback on published documents" 
ON solution_feedback FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM solution_documents sd
    WHERE sd.id = document_id AND sd.is_published = true
  )
);

-- Política de actualización: usuarios pueden actualizar su propio feedback
CREATE POLICY "Users can update own feedback" 
ON solution_feedback FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política de eliminación: usuarios pueden eliminar su propio feedback
CREATE POLICY "Users can delete own feedback" 
ON solution_feedback FOR DELETE 
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'admin'
  )
);

-- ================================================================
-- POLÍTICAS PARA solution_categories
-- ================================================================

-- Política de lectura: todos pueden ver categorías activas
CREATE POLICY "Users can view active categories" 
ON solution_categories FOR SELECT 
USING (is_active = true);

-- Política de creación/actualización/eliminación: solo administradores
CREATE POLICY "Only admins can manage categories" 
ON solution_categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'admin'
  )
);

-- ================================================================
-- GRANTS para las tablas
-- ================================================================

-- Otorgar permisos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_documents TO authenticated;
GRANT SELECT, INSERT ON solution_document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_feedback TO authenticated;
GRANT SELECT ON solution_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON solution_categories TO authenticated; -- Solo para admins via RLS

-- Otorgar permisos en secuencias si las hubiera
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
