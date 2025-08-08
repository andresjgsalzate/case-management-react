-- ================================================================
-- DATOS INICIALES PARA SOLUTION_DOCUMENT_TYPES
-- ================================================================
-- Descripción: Tipos de documentos básicos para el módulo de documentación
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- Insertar tipos de documentos básicos si no existen
INSERT INTO solution_document_types (code, name, description, icon, color, created_by)
SELECT 
    'GUIDE', 
    'Guía', 
    'Documentos de guía paso a paso', 
    'book-open', 
    '#3B82F6',
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM solution_document_types WHERE code = 'GUIDE');

INSERT INTO solution_document_types (code, name, description, icon, color, created_by)
SELECT 
    'FAQ', 
    'Preguntas Frecuentes', 
    'Preguntas y respuestas comunes', 
    'question-mark-circle', 
    '#10B981',
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM solution_document_types WHERE code = 'FAQ');

INSERT INTO solution_document_types (code, name, description, icon, color, created_by)
SELECT 
    'PROCEDURE', 
    'Procedimiento', 
    'Procedimientos operativos estándar', 
    'clipboard-document-list', 
    '#F59E0B',
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM solution_document_types WHERE code = 'PROCEDURE');

INSERT INTO solution_document_types (code, name, description, icon, color, created_by)
SELECT 
    'TEMPLATE', 
    'Plantilla', 
    'Plantillas reutilizables para documentos', 
    'document-duplicate', 
    '#8B5CF6',
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM solution_document_types WHERE code = 'TEMPLATE');

INSERT INTO solution_document_types (code, name, description, icon, color, created_by)
SELECT 
    'SOLUTION', 
    'Solución', 
    'Soluciones técnicas específicas', 
    'light-bulb', 
    '#EF4444',
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM solution_document_types WHERE code = 'SOLUTION');
