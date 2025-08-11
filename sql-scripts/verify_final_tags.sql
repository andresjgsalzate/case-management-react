-- Verificar que los tags se guardaron correctamente en el array directo
SELECT 
    id,
    title,
    tags,
    updated_at,
    solution_type,
    difficulty_level
FROM solution_documents 
WHERE id = '1f128b3b-4017-48b3-a705-47da5025305a';

-- Verificar que los tags existen en la tabla solution_tags
SELECT 
    id,
    name,
    color,
    category
FROM solution_tags 
WHERE name IN ('SIGLA', 'INSUMOS', 'MIGRACION')
ORDER BY name;
