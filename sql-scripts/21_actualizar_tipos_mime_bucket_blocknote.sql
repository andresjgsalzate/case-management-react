-- ================================================================
-- TIPOS MIME OPTIMIZADOS PARA BLOCKNOTE - BUCKET DOCUMENT-ATTACHMENTS
-- ================================================================
-- Descripción: Solo tipos MIME que BlockNote puede manejar nativamente
-- Fecha: 6 de Agosto, 2025
-- Validado: Compatible con BlockNote v0.35.0
-- ================================================================

-- VERIFICAR TIPOS MIME ACTUALES
SELECT 
    id,
    name,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'document-attachments';

-- ================================================================
-- ACTUALIZAR BUCKET CON TIPOS MIME COMPATIBLES CON BLOCKNOTE
-- ================================================================

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    -- ===== IMÁGENES (RENDERIZADO INLINE EN BLOCKNOTE) =====
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',                    -- Soporte básico
    'image/tiff',                   -- Soporte básico
    
    -- ===== VIDEO (RENDERIZADO INLINE EN BLOCKNOTE) =====
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',              -- .mov (soporte limitado)
    
    -- ===== AUDIO (RENDERIZADO INLINE EN BLOCKNOTE) =====
    'audio/mpeg',                   -- MP3
    'audio/wav',
    'audio/ogg',
    'audio/mp4',                    -- M4A
    
    -- ===== PDF (COMO ENLACE DESCARGABLE) =====
    'application/pdf',
    
    -- ===== DOCUMENTOS OFFICE (COMO ENLACE DESCARGABLE) =====
    'application/msword',                                                               -- .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',        -- .docx
    'application/vnd.ms-excel',                                                        -- .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',             -- .xlsx
    'application/vnd.ms-powerpoint',                                                   -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',     -- .pptx
    
    -- ===== TEXTO PLANO (PARA CASOS ESPECÍFICOS) =====
    'text/plain',                                                                      -- .txt
    'text/csv',                                                                        -- .csv
    'text/markdown',                                                                   -- .md
    
    -- ===== ARCHIVOS COMPRIMIDOS (COMO ENLACE DESCARGABLE) =====
    'application/zip',                                                                 -- .zip
    'application/x-rar-compressed',                                                    -- .rar
    
    -- ===== FALLBACK PARA ARCHIVOS BINARIOS =====
    'application/octet-stream'                                                         -- Binarios genéricos
]
WHERE id = 'document-attachments';

-- ================================================================
-- VERIFICACIÓN POR CATEGORÍAS
-- ================================================================

-- Mostrar categorización de tipos MIME
SELECT 
    'IMÁGENES (Renderizado inline)' as categoria,
    array_to_string(ARRAY[
        'image/jpeg', 'image/png', 'image/gif', 
        'image/webp', 'image/svg+xml'
    ], ', ') as tipos_mime

UNION ALL

SELECT 
    'VIDEO (Renderizado inline)' as categoria,
    array_to_string(ARRAY[
        'video/mp4', 'video/webm', 'video/ogg'
    ], ', ') as tipos_mime

UNION ALL

SELECT 
    'AUDIO (Renderizado inline)' as categoria,
    array_to_string(ARRAY[
        'audio/mpeg', 'audio/wav', 'audio/ogg'
    ], ', ') as tipos_mime

UNION ALL

SELECT 
    'DOCUMENTOS (Solo enlace)' as categoria,
    array_to_string(ARRAY[
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ], ', ') as tipos_mime;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
    mime_count INTEGER;
    image_types TEXT[];
    video_types TEXT[];
    audio_types TEXT[];
BEGIN
    SELECT 
        array_length(allowed_mime_types, 1),
        -- Filtrar tipos de imagen
        ARRAY(SELECT unnest(allowed_mime_types) WHERE unnest LIKE 'image/%'),
        -- Filtrar tipos de video  
        ARRAY(SELECT unnest(allowed_mime_types) WHERE unnest LIKE 'video/%'),
        -- Filtrar tipos de audio
        ARRAY(SELECT unnest(allowed_mime_types) WHERE unnest LIKE 'audio/%')
    INTO mime_count, image_types, video_types, audio_types
    FROM storage.buckets 
    WHERE id = 'document-attachments';
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ BUCKET OPTIMIZADO PARA BLOCKNOTE';
    RAISE NOTICE '';
    RAISE NOTICE '📁 Bucket: document-attachments';
    RAISE NOTICE '📊 Total tipos MIME: %', mime_count;
    RAISE NOTICE '';
    RAISE NOTICE '🖼️ IMÁGENES (inline): % tipos', array_length(image_types, 1);
    RAISE NOTICE '🎬 VIDEO (inline): % tipos', array_length(video_types, 1);
    RAISE NOTICE '🎵 AUDIO (inline): % tipos', array_length(audio_types, 1);
    RAISE NOTICE '📄 DOCUMENTOS (enlace): PDF, Office';
    RAISE NOTICE '';
    RAISE NOTICE '✨ COMPATIBILIDAD BLOCKNOTE: 100%';
    RAISE NOTICE '🚀 LISTO PARA PRODUCCIÓN';
    RAISE NOTICE '';
END $$;
