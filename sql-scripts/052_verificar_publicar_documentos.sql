-- ===================================================================
-- VERIFICAR DOCUMENTOS DISPONIBLES PARA BÚSQUEDA
-- ===================================================================
-- Descripción: Verificar todos los documentos disponibles para búsqueda
-- Fecha: 6 de Agosto, 2025
-- ===================================================================

-- Verificar todos los documentos (publicados y borradores)
SELECT 
    id,
    title,
    solution_type,
    is_published,
    CASE 
        WHEN is_published THEN 'Publicado'
        ELSE 'Borrador'
    END as estado
FROM solution_documents 
ORDER BY created_at DESC;
