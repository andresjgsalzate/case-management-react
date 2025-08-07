-- ================================================================
-- CONFIGURACIÓN DE STORAGE BUCKET PARA DOCUMENTOS
-- ================================================================
-- Descripción: Configuración del bucket para almacenamiento de archivos
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- Crear el bucket 'document-attachments' si no existe
DO $$
BEGIN
    -- Verificar si el bucket ya existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'document-attachments'
    ) THEN
        -- Crear el bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'document-attachments',
            'document-attachments',
            true,
            52428800, -- 50MB en bytes
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
        );
        
        RAISE NOTICE 'Bucket document-attachments creado exitosamente';
    ELSE
        RAISE NOTICE 'Bucket document-attachments ya existe';
    END IF;
END $$;

-- Configurar políticas de acceso para el bucket
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios archivos" ON storage.objects;
DROP POLICY IF EXISTS "Archivos públicos son visibles" ON storage.objects;

-- Crear políticas de acceso para el bucket
CREATE POLICY "Usuarios autenticados pueden subir archivos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'document-attachments');

CREATE POLICY "Usuarios autenticados pueden ver archivos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'document-attachments');

CREATE POLICY "Usuarios pueden eliminar sus propios archivos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'document-attachments' AND owner = auth.uid());

CREATE POLICY "Archivos públicos son visibles" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'document-attachments');
