-- ================================================================
-- VERIFICACIÓN DE STORAGE (SOLO LECTURA)
-- ================================================================
-- Descripción: Verificar bucket y políticas existentes
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- Verificar que el bucket existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'document-attachments') THEN
        RAISE NOTICE '✅ Bucket document-attachments existe';
        
        -- Mostrar información del bucket
        DECLARE
            bucket_info RECORD;
        BEGIN
            SELECT * INTO bucket_info FROM storage.buckets WHERE id = 'document-attachments';
            RAISE NOTICE 'Bucket info - Público: %, Límite de tamaño: %', bucket_info.public, bucket_info.file_size_limit;
        END;
    ELSE
        RAISE NOTICE '❌ Bucket document-attachments NO existe';
        RAISE NOTICE 'Debe crearse el bucket desde el dashboard de Supabase o con permisos de administrador';
    END IF;
END $$;

-- Verificar políticas existentes (solo lectura)
DO $$
DECLARE
    policy_count INTEGER;
    policy_record RECORD;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage';
    
    RAISE NOTICE '';
    RAISE NOTICE 'Políticas existentes en storage.objects: %', policy_count;
    
    -- Mostrar políticas relacionadas con document-attachments
    FOR policy_record IN 
        SELECT policyname, cmd, roles
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND (qual LIKE '%document-attachments%' OR with_check LIKE '%document-attachments%')
    LOOP
        RAISE NOTICE '  - Política: % (%) para roles: %', 
            policy_record.policyname, 
            policy_record.cmd, 
            policy_record.roles;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- Verificar permisos del usuario actual
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario autenticado: %', current_user_id;
        RAISE NOTICE '✅ Autenticación funcionando correctamente';
    ELSE
        RAISE NOTICE '❌ No hay usuario autenticado';
        RAISE NOTICE 'Las políticas de storage requieren autenticación';
    END IF;
END $$;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '� Verificación de storage completada';
    RAISE NOTICE 'Si el bucket existe pero hay errores de subida, revisar políticas en el dashboard de Supabase';
    RAISE NOTICE '';
END $$;
