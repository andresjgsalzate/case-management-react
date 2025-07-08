-- =====================================================
-- Agregar columna archive_reason a las tablas de archivo
-- =====================================================
-- Fecha: 2025-07-07
-- Descripción: Agrega la columna archive_reason a las tablas archived_cases y archived_todos

-- Agregar columna archive_reason a archived_cases
ALTER TABLE archived_cases 
ADD COLUMN archive_reason TEXT;

-- Agregar columna archive_reason a archived_todos
ALTER TABLE archived_todos 
ADD COLUMN archive_reason TEXT;

-- Comentarios
COMMENT ON COLUMN archived_cases.archive_reason IS 'Razón opcional para archivar el caso';
COMMENT ON COLUMN archived_todos.archive_reason IS 'Razón opcional para archivar el TODO';
