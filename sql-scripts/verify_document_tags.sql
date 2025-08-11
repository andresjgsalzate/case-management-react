-- Verificar el estado actual del documento específico
SELECT 
    id,
    title,
    tags,
    created_at,
    updated_at
FROM solution_documents 
WHERE id = '1f128b3b-4017-48b3-a705-47da5025305a';

-- Verificar si hay tags relacionales para ese documento
SELECT 
    sdt.document_id,
    st.name as tag_name,
    st.color,
    st.category
FROM solution_document_tags sdt
JOIN solution_tags st ON sdt.tag_id = st.id
WHERE sdt.document_id = '1f128b3b-4017-48b3-a705-47da5025305a';

-- Verificar todos los tags disponibles
SELECT 
    id,
    name,
    description,
    color,
    category,
    usage_count
FROM solution_tags 
WHERE is_active = true
ORDER BY name;
