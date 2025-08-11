-- ================================================================
-- SCRIPT DE PRUEBA PARA TAGS
-- ================================================================
-- Insertar algunos tags de prueba para verificar funcionalidad
-- ================================================================

-- Insertar tags de prueba si no existen
INSERT INTO solution_tags (name, description, color, category, created_by)
SELECT 'SQL', 'Consultas y scripts SQL', '#4F46E5', 'technical', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM solution_tags WHERE name = 'SQL');

INSERT INTO solution_tags (name, description, color, category, created_by)
SELECT 'MIGRACION', 'Procesos de migración de datos', '#059669', 'process', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM solution_tags WHERE name = 'MIGRACION');

INSERT INTO solution_tags (name, description, color, category, created_by)
SELECT 'FONDOS', 'Fondos documentales', '#DC2626', 'business', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM solution_tags WHERE name = 'FONDOS');

INSERT INTO solution_tags (name, description, color, category, created_by)
SELECT 'CLIENTE', 'Casos relacionados con clientes', '#7C3AED', 'business', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM solution_tags WHERE name = 'CLIENTE');

-- Verificar tags creados
SELECT 
    id, 
    name, 
    description, 
    color, 
    category,
    created_at
FROM solution_tags 
WHERE name IN ('SQL', 'MIGRACION', 'FONDOS', 'CLIENTE')
ORDER BY name;
