-- ================================================================
-- MIGRACIÓN: POLÍTICAS RLS SIMPLIFICADAS PARA SOLUTION_DOCUMENTS
-- ================================================================
-- Descripción: Simplifica las políticas RLS para permitir consultas directas
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Eliminar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Users can view published documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON solution_documents;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON solution_documents;
DROP POLICY IF EXISTS "Enable read access for public" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_select_policy" ON solution_documents;

-- Crear política simplificada para lectura
CREATE POLICY "allow_read_published_and_own" 
ON solution_documents FOR SELECT 
USING (
    is_published = true 
    OR created_by = auth.uid()
);

-- Asegurar que RLS esté habilitado
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos básicos
GRANT SELECT ON solution_documents TO authenticated;
GRANT SELECT ON solution_documents TO anon;
