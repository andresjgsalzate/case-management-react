-- Script para verificar que las etiquetas se están guardando correctamente
-- Ejecutar después de crear o actualizar un documento con etiquetas

-- 1. Verificar documentos con tags en el array
SELECT 
    id,
    title,
    tags,
    array_length(tags, 1) as tag_count,
    created_at
FROM solution_documents 
WHERE tags IS NOT NULL 
AND array_length(tags, 1) > 0
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar relaciones en solution_document_tags
SELECT 
    sdt.document_id,
    sd.title as document_title,
    st.name as tag_name,
    st.category as tag_category,
    sdt.created_at
FROM solution_document_tags sdt
JOIN solution_documents sd ON sdt.document_id = sd.id
JOIN solution_tags st ON sdt.tag_id = st.id
ORDER BY sdt.created_at DESC
LIMIT 10;

-- 3. Verificar coincidencia entre array y relaciones
SELECT 
    sd.id,
    sd.title,
    sd.tags as array_tags,
    array_agg(st.name) as relation_tags
FROM solution_documents sd
LEFT JOIN solution_document_tags sdt ON sd.id = sdt.document_id
LEFT JOIN solution_tags st ON sdt.tag_id = st.id
WHERE sd.tags IS NOT NULL 
AND array_length(sd.tags, 1) > 0
GROUP BY sd.id, sd.title, sd.tags
ORDER BY sd.created_at DESC
LIMIT 5;

-- 4. Verificar tags activos disponibles
SELECT 
    id,
    name,
    category,
    usage_count,
    is_active
FROM solution_tags 
WHERE is_active = true
ORDER BY usage_count DESC, name;
