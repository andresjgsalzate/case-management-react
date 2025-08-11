-- ================================================================
-- PRUEBA DIRECTA DE ACTUALIZACIÓN DE TAGS
-- ================================================================
-- Probar directamente la función update_solution_document_final
-- con tags para verificar que funciona correctamente
-- ================================================================

-- Primero, verificar el estado actual
SELECT 
    id,
    title,
    tags,
    updated_at
FROM solution_documents 
WHERE id = '1f128b3b-4017-48b3-a705-47da5025305a';

-- Actualizar el documento con algunos tags de prueba
-- Usando nombres de tags que deberían existir
SELECT update_solution_document_final(
    '1f128b3b-4017-48b3-a705-47da5025305a'::uuid,
    NULL::text, -- title (no cambiar)
    NULL::jsonb, -- content (no cambiar)
    NULL::text, -- solution_type (no cambiar)
    NULL::integer, -- difficulty_level (no cambiar)
    NULL::uuid, -- case_id (no cambiar)
    NULL::uuid, -- archived_case_id (no cambiar)
    NULL::text, -- case_reference_type (no cambiar)
    NULL::text, -- complexity_notes (no cambiar)
    NULL::text, -- prerequisites (no cambiar)
    NULL::integer, -- estimated_solution_time (no cambiar)
    NULL::boolean, -- is_template (no cambiar)
    NULL::boolean, -- is_published (no cambiar)
    ARRAY['SQL', 'MIGRACION', 'FONDOS']::text[] -- tags a agregar
);

-- Verificar que los tags se guardaron correctamente
SELECT 
    id,
    title,
    tags,
    updated_at
FROM solution_documents 
WHERE id = '1f128b3b-4017-48b3-a705-47da5025305a';
