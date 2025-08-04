-- ================================================================
-- MIGRACIÓN: CONFIGURACIÓN DE STORAGE PARA DOCUMENTOS
-- ================================================================
-- Descripción: Crea buckets y políticas de storage para archivos
-- de documentación (imágenes, PDFs, documentos)
-- Versión: 1.0
-- Fecha: 4 de Agosto, 2025
-- ================================================================

-- 1. CREAR BUCKETS DE STORAGE
-- ================================================================

-- Bucket para documentos (público para lectura)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  true,
  52428800, -- 50MB límite
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para imágenes temporales (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-uploads',
  'temp-uploads',
  false,
  10485760, -- 10MB límite
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. CREAR TABLA DE REGISTRO DE ARCHIVOS
-- ================================================================

CREATE TABLE IF NOT EXISTS document_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES solution_documents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Ruta en storage
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_type VARCHAR(20) CHECK (file_type IN ('image', 'document', 'spreadsheet', 'other')),
  is_embedded BOOLEAN DEFAULT false, -- Si está embebido en el contenido
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_document_attachments_document_id ON document_attachments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_attachments_file_type ON document_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_document_attachments_uploaded_by ON document_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_document_attachments_created_at ON document_attachments(created_at);

-- 3. POLÍTICAS RLS PARA STORAGE
-- ================================================================

-- Política para leer archivos en bucket documents
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Política para subir archivos (solo usuarios autenticados)
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Política para actualizar archivos (solo el propietario)
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para eliminar archivos (solo el propietario o admins)
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Admin'
    )
  )
);

-- Políticas para temp-uploads (más restrictivas)
CREATE POLICY "Temp upload access" ON storage.objects FOR SELECT 
USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Temp upload insert" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'temp-uploads' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Temp upload delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. POLÍTICAS RLS PARA TABLA DE ATTACHMENTS
-- ================================================================

ALTER TABLE document_attachments ENABLE ROW LEVEL SECURITY;

-- Ver attachments si tienes acceso al documento
CREATE POLICY "Users can view document attachments" ON document_attachments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM solution_documents sd
    WHERE sd.id = document_id
    AND (sd.is_published = true OR sd.created_by = auth.uid())
  )
);

-- Crear attachments si tienes permiso de crear documentos
CREATE POLICY "Users can create attachments" ON document_attachments FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM solution_documents sd
    WHERE sd.id = document_id
    AND sd.created_by = auth.uid()
  )
);

-- Actualizar solo propios attachments
CREATE POLICY "Users can update own attachments" ON document_attachments FOR UPDATE 
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Eliminar solo propios attachments o si eres admin
CREATE POLICY "Users can delete own attachments" ON document_attachments FOR DELETE 
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'Admin'
  )
);

-- 5. FUNCIONES AUXILIARES
-- ================================================================

-- Función para limpiar archivos huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Eliminar registros de attachments sin documento
  DELETE FROM document_attachments 
  WHERE document_id NOT IN (SELECT id FROM solution_documents);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Eliminar archivos temporales más antiguos que 24 horas
  DELETE FROM storage.objects 
  WHERE bucket_id = 'temp-uploads' 
  AND created_at < NOW() - INTERVAL '24 hours';
  
  RETURN deleted_count;
END;
$$;

-- Función para obtener estadísticas de storage
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_files', COUNT(*),
    'total_size_mb', ROUND(SUM(metadata->>'size')::BIGINT / 1048576.0, 2),
    'images_count', COUNT(*) FILTER (WHERE metadata->>'mimetype' LIKE 'image/%'),
    'documents_count', COUNT(*) FILTER (WHERE metadata->>'mimetype' LIKE 'application/%'),
    'avg_file_size_kb', ROUND(AVG((metadata->>'size')::BIGINT) / 1024.0, 2)
  ) INTO result
  FROM storage.objects 
  WHERE bucket_id = 'documents';
  
  RETURN result;
END;
$$;

-- 6. TRIGGER PARA ACTUALIZAR updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION update_document_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_document_attachments_updated_at
  BEFORE UPDATE ON document_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_document_attachments_updated_at();

-- 7. PERMISOS PARA FUNCIONES
-- ================================================================

GRANT EXECUTE ON FUNCTION cleanup_orphaned_files() TO authenticated;
GRANT EXECUTE ON FUNCTION get_storage_stats() TO authenticated;

-- 8. COMENTARIOS PARA DOCUMENTACIÓN
-- ================================================================

COMMENT ON TABLE document_attachments IS 'Registro de archivos adjuntos a documentos de solución';
COMMENT ON COLUMN document_attachments.is_embedded IS 'Indica si el archivo está embebido en el contenido del documento';
COMMENT ON FUNCTION cleanup_orphaned_files() IS 'Limpia archivos huérfanos y temporales antiguos';
COMMENT ON FUNCTION get_storage_stats() IS 'Obtiene estadísticas de uso del storage';

-- Confirmar creación
DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets y políticas configurados correctamente';
  RAISE NOTICE '✅ Tabla document_attachments creada';
  RAISE NOTICE '✅ Funciones auxiliares implementadas';
END $$;
