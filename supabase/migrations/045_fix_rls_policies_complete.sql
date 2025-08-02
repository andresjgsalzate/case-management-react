-- ================================================================
-- MIGRACIÓN: POLÍTICAS RLS COMPLETAS PARA SOLUTION_DOCUMENTS
-- ================================================================
-- Descripción: Agrega políticas RLS para todas las operaciones (SELECT, INSERT, UPDATE, DELETE)
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "allow_read_published_and_own" ON solution_documents;
DROP POLICY IF EXISTS "Users can create documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON solution_documents;

-- ================================================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ================================================================

-- Permitir leer documentos publicados o propios
CREATE POLICY "allow_read_published_and_own" 
ON solution_documents FOR SELECT 
USING (
    is_published = true 
    OR created_by = auth.uid()
);

-- ================================================================
-- POLÍTICAS DE INSERCIÓN (INSERT)
-- ================================================================

-- Permitir a usuarios autenticados crear documentos
CREATE POLICY "allow_insert_authenticated" 
ON solution_documents FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
);

-- ================================================================
-- POLÍTICAS DE ACTUALIZACIÓN (UPDATE)
-- ================================================================

-- Permitir actualizar solo documentos propios
CREATE POLICY "allow_update_own_documents" 
ON solution_documents FOR UPDATE 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ================================================================
-- POLÍTICAS DE ELIMINACIÓN (DELETE)
-- ================================================================

-- Permitir eliminar solo documentos propios
CREATE POLICY "allow_delete_own_documents" 
ON solution_documents FOR DELETE 
USING (created_by = auth.uid());

-- ================================================================
-- CONFIGURACIÓN DE RLS Y PERMISOS
-- ================================================================

-- Asegurar que RLS esté habilitado
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos necesarios
GRANT SELECT ON solution_documents TO authenticated;
GRANT SELECT ON solution_documents TO anon;
GRANT INSERT ON solution_documents TO authenticated;
GRANT UPDATE ON solution_documents TO authenticated;
GRANT DELETE ON solution_documents TO authenticated;

-- ================================================================
-- VERIFICACIÓN DE POLÍTICAS
-- ================================================================

-- Mostrar todas las políticas activas (para verificación)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'solution_documents';
