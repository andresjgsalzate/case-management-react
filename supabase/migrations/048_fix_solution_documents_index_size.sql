-- ================================================================
-- MIGRACIÓN: CORREGIR ÍNDICES PROBLEMÁTICOS
-- ================================================================
-- Descripción: Eliminar índices que causan el error de tamaño
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- 🚨 ELIMINAR ÍNDICES PROBLEMÁTICOS
-- Estos índices están causando el error de tamaño de fila

-- 1. Eliminar índices de búsqueda full-text si existen
DROP INDEX IF EXISTS idx_solution_documents_title_search;
DROP INDEX IF EXISTS idx_solution_documents_content_search; 
DROP INDEX IF EXISTS idx_solution_documents_tags_search;

-- 2. Eliminar las columnas de búsqueda full-text si existen
-- (Estas columnas pueden estar causando el problema)
ALTER TABLE solution_documents 
DROP COLUMN IF EXISTS title_search;

ALTER TABLE solution_documents 
DROP COLUMN IF EXISTS content_search;

ALTER TABLE solution_documents 
DROP COLUMN IF EXISTS tags_search;

-- 3. Crear índices alternativos más eficientes para búsqueda
-- Usando índices más pequeños y específicos

-- Índice básico en título (PostgreSQL automáticamente limita el tamaño)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_solution_documents_title_basic'
    ) THEN
        CREATE INDEX idx_solution_documents_title_basic 
        ON solution_documents (title);
    END IF;
END $$;

-- Índice en tags usando GIN 
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_solution_documents_tags_gin'
    ) THEN
        CREATE INDEX idx_solution_documents_tags_gin 
        ON solution_documents USING GIN(tags);
    END IF;
END $$;

-- Índice en campos básicos para filtros
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_solution_documents_filters'
    ) THEN
        CREATE INDEX idx_solution_documents_filters 
        ON solution_documents (is_published, created_at, difficulty_level);
    END IF;
END $$;
