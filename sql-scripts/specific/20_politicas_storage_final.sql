-- ================================================================
-- POLÍTICAS RLS PARA STORAGE BUCKET - DOCUMENT-ATTACHMENTS
-- ================================================================
-- Descripción: Crear políticas de seguridad para el bucket ya existente
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- Verificar que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "document_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_update" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_delete" ON storage.objects;
DROP POLICY IF EXISTS "document_attachments_public_select" ON storage.objects;

-- ================================================================
-- POLÍTICAS DE SEGURIDAD PARA DOCUMENT-ATTACHMENTS
-- ================================================================

-- 1. INSERTAR: Solo usuarios autenticados pueden subir archivos
CREATE POLICY "document_attachments_insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'document-attachments');

-- 2. SELECCIONAR: Cualquiera puede ver archivos (bucket público)
CREATE POLICY "document_attachments_select" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'document-attachments');

-- 3. ACTUALIZAR: Solo el propietario puede modificar metadatos
CREATE POLICY "document_attachments_update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'document-attachments' AND owner = auth.uid());

-- 4. ELIMINAR: Solo el propietario puede eliminar archivos
CREATE POLICY "document_attachments_delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'document-attachments' AND owner = auth.uid());

-- ================================================================
-- VERIFICACIÓN DE POLÍTICAS CREADAS
-- ================================================================

-- Mostrar todas las políticas creadas para document-attachments
SELECT 
    policyname as "Política",
    cmd as "Comando",
    roles as "Roles",
    CASE 
        WHEN qual IS NOT NULL THEN '✅' 
        ELSE '❌' 
    END as "USING",
    CASE 
        WHEN with_check IS NOT NULL THEN '✅' 
        ELSE '❌' 
    END as "WITH CHECK"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'document_attachments%'
ORDER BY policyname;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ BUCKET DOCUMENT-ATTACHMENTS CONFIGURADO CORRECTAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE '📁 Bucket: document-attachments';
    RAISE NOTICE '🔒 RLS: Habilitado';
    RAISE NOTICE '👥 Acceso público: Sí (solo lectura)';
    RAISE NOTICE '📝 Subida: Solo usuarios autenticados';
    RAISE NOTICE '🗑️ Eliminación: Solo propietarios';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 LISTO PARA USAR CON BLOCKNOTE';
    RAISE NOTICE '';
END $$;
