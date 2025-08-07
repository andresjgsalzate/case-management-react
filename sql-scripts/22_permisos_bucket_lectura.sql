-- ================================================================
-- PERMISOS DE LECTURA PARA BUCKETS DE STORAGE
-- ================================================================
-- Descripción: Permitir que usuarios autenticados puedan ver buckets
-- Fecha: 6 de Agosto, 2025
-- Problema: StorageService no puede listar buckets disponibles
-- ================================================================

-- VERIFICAR BUCKETS ACTUALES
SELECT 
    id,
    name,
    public,
    owner,
    created_at
FROM storage.buckets 
WHERE id = 'document-attachments';

-- ================================================================
-- PERMITIR LECTURA DE BUCKETS PARA USUARIOS AUTENTICADOS
-- ================================================================

-- 1. CREAR POLÍTICA PARA LISTAR BUCKETS
DO $$
BEGIN
    -- Eliminar política si existe
    DROP POLICY IF EXISTS "bucket_list_policy" ON storage.buckets;
    
    -- Crear nueva política para listar buckets
    CREATE POLICY "bucket_list_policy" 
    ON storage.buckets 
    FOR SELECT 
    USING (true);  -- Permitir a todos los usuarios ver buckets
    
    RAISE NOTICE '✅ Política de lectura de buckets creada';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error al crear política de buckets: %', SQLERRM;
END $$;

-- ================================================================
-- HABILITAR RLS EN BUCKETS (si no está habilitado)
-- ================================================================

DO $$
BEGIN
    -- Verificar si RLS está habilitado
    IF NOT (SELECT row_security FROM pg_tables WHERE tablename = 'buckets' AND schemaname = 'storage') THEN
        ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado en storage.buckets';
    ELSE
        RAISE NOTICE '📋 RLS ya estaba habilitado en storage.buckets';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error al habilitar RLS: %', SQLERRM;
END $$;

-- ================================================================
-- VERIFICAR PERMISOS DE STORAGE.OBJECTS
-- ================================================================

-- Mostrar políticas actuales de storage.objects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename IN ('buckets', 'objects')
ORDER BY tablename, policyname;

-- ================================================================
-- ASEGURAR QUE EL BUCKET ES PÚBLICO
-- ================================================================

UPDATE storage.buckets 
SET public = true
WHERE id = 'document-attachments' 
AND public = false;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
    bucket_count INTEGER;
    bucket_public BOOLEAN;
    policies_count INTEGER;
BEGIN
    -- Verificar bucket
    SELECT COUNT(*), bool_or(public) 
    INTO bucket_count, bucket_public
    FROM storage.buckets 
    WHERE id = 'document-attachments';
    
    -- Contar políticas
    SELECT COUNT(*)
    INTO policies_count
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'buckets';
    
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFICACIÓN DE PERMISOS DE BUCKET';
    RAISE NOTICE '';
    RAISE NOTICE '📁 Bucket document-attachments encontrado: %', CASE WHEN bucket_count > 0 THEN 'SÍ' ELSE 'NO' END;
    RAISE NOTICE '🌐 Bucket es público: %', CASE WHEN bucket_public THEN 'SÍ' ELSE 'NO' END;
    RAISE NOTICE '🔐 Políticas en storage.buckets: %', policies_count;
    RAISE NOTICE '';
    
    IF bucket_count > 0 AND bucket_public AND policies_count > 0 THEN
        RAISE NOTICE '✅ CONFIGURACIÓN CORRECTA - StorageService debería funcionar';
    ELSE
        RAISE NOTICE '❌ CONFIGURACIÓN INCOMPLETA - Revisar permisos';
    END IF;
    RAISE NOTICE '';
END $$;
