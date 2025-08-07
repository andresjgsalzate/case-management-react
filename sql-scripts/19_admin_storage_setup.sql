-- ================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE STORAGE (SOLO ADMINISTRADOR)
-- ================================================================
-- Descripción: Este script debe ejecutarse desde el dashboard de Supabase
-- Requiere: Permisos de administrador/propietario
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- NOTA: Este script debe ejecutarse desde el SQL Editor del dashboard de Supabase
-- con una cuenta que tenga permisos de administrador

-- Verificar que el bucket existe
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'document-attachments';

-- Si el bucket no existe, crearlo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
    'document-attachments',
    'document-attachments',
    true,
    52428800, -- 50MB
    ARRAY[
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'document-attachments');

-- Habilitar RLS si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes para document-attachments
DROP POLICY IF EXISTS "document_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_update" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_delete" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_public_select" ON storage.objects;

-- Crear políticas optimizadas
CREATE POLICY "document_attachments_insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'document-attachments');

CREATE POLICY "document_attachments_select" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'document-attachments');

CREATE POLICY "document_attachments_update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'document-attachments' AND owner = auth.uid());

CREATE POLICY "document_attachments_delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'document-attachments' AND owner = auth.uid());

CREATE POLICY "document_attachments_public_select" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'document-attachments');

-- Verificar políticas creadas
SELECT 
    policyname,
    cmd,
    roles,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'document_attachments%'
ORDER BY policyname;
