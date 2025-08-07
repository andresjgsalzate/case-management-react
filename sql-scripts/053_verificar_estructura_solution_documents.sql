-- Verificar estructura de la tabla solution_documents
-- Este script ayuda a diagnosticar problemas con las búsquedas de texto

-- 1. Verificar que la tabla existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'solution_documents';

-- 2. Verificar estructura de columnas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'solution_documents'
ORDER BY ordinal_position;

-- 3. Verificar datos existentes (primeros 3 registros)
SELECT 
    id,
    title,
    CASE 
        WHEN content IS NULL THEN 'NULL'
        WHEN pg_typeof(content)::text = 'jsonb' THEN 'JSONB: ' || left(content::text, 100)
        ELSE 'TEXT: ' || left(content::text, 100)
    END as content_preview,
    solution_type,
    is_published,
    created_at
FROM solution_documents 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Verificar tipo de datos del campo content específicamente
SELECT 
    pg_typeof(content) as content_type,
    COUNT(*) as count
FROM solution_documents 
GROUP BY pg_typeof(content);

-- 5. Test de búsqueda para verificar la sintaxis
-- (Solo seleccionar, no ejecutar si hay problemas)
SELECT 
    id,
    title,
    content::text as content_as_text
FROM solution_documents 
WHERE title ILIKE '%TRANS%' 
   OR content::text ILIKE '%TRANS%'
LIMIT 2;
