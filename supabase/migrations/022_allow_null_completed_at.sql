-- =====================================================
-- Permitir completed_at NULL en tablas de archivo
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Permite que completed_at sea NULL en archived_todos y archived_cases
--              para poder archivar elementos sin importar si están completados

-- Modificar archived_todos para permitir completed_at NULL
ALTER TABLE archived_todos 
ALTER COLUMN completed_at DROP NOT NULL;

-- Modificar archived_cases para permitir completed_at NULL  
ALTER TABLE archived_cases 
ALTER COLUMN completed_at DROP NOT NULL;

-- Comentarios
COMMENT ON COLUMN archived_todos.completed_at IS 'Fecha de completado del TODO - NULL si no fue completado antes del archivado';
COMMENT ON COLUMN archived_cases.completed_at IS 'Fecha de completado del caso - NULL si no fue completado antes del archivado';
