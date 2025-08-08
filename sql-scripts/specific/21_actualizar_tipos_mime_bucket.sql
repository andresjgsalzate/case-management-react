-- ================================================================
-- ACTUALIZACIÓN DE TIPOS MIME - BUCKET DOCUMENT-ATTACHMENTS
-- ================================================================
-- Descripción: Agregar tipos MIME faltantes para soporte completo de adjuntos
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICAR TIPOS MIME ACTUALES
SELECT 
    id,
    name,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'document-attachments';

-- ================================================================
-- ACTUALIZAR BUCKET CON TIPOS MIME COMPLETOS
-- ================================================================

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    -- ===== IMÁGENES =====
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/tif',
    'image/svg+xml',
    'image/ico',
    'image/icon',
    'image/x-icon',
    
    -- ===== DOCUMENTOS PDF =====
    'application/pdf',
    
    -- ===== MICROSOFT OFFICE =====
    'application/msword',                                                               -- .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',        -- .docx
    'application/vnd.ms-excel',                                                        -- .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',             -- .xlsx
    'application/vnd.ms-powerpoint',                                                   -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',     -- .pptx
    
    -- ===== DOCUMENTOS OPEN OFFICE / LIBRE OFFICE =====
    'application/vnd.oasis.opendocument.text',                                        -- .odt
    'application/vnd.oasis.opendocument.spreadsheet',                                 -- .ods
    'application/vnd.oasis.opendocument.presentation',                                -- .odp
    
    -- ===== TEXTO =====
    'text/plain',                                                                      -- .txt
    'text/csv',                                                                        -- .csv
    'text/rtf',                                                                        -- .rtf
    'application/rtf',                                                                 -- .rtf (alternativo)
    'text/markdown',                                                                   -- .md
    'text/html',                                                                       -- .html
    'application/xml',                                                                 -- .xml
    'text/xml',                                                                        -- .xml
    
    -- ===== ARCHIVOS COMPRIMIDOS =====
    'application/zip',                                                                 -- .zip
    'application/x-rar-compressed',                                                    -- .rar
    'application/x-7z-compressed',                                                     -- .7z
    'application/gzip',                                                                -- .gz
    'application/x-tar',                                                               -- .tar
    
    -- ===== CÓDIGO Y DESARROLLO =====
    'application/json',                                                                -- .json
    'text/javascript',                                                                 -- .js
    'application/javascript',                                                          -- .js
    'text/css',                                                                        -- .css
    'application/sql',                                                                 -- .sql
    'text/x-sql',                                                                      -- .sql
    
    -- ===== AUDIO =====
    'audio/mpeg',                                                                      -- .mp3
    'audio/wav',                                                                       -- .wav
    'audio/ogg',                                                                       -- .ogg
    'audio/mp4',                                                                       -- .m4a
    
    -- ===== VIDEO (BÁSICO) =====
    'video/mp4',                                                                       -- .mp4
    'video/mpeg',                                                                      -- .mpeg
    'video/quicktime',                                                                 -- .mov
    'video/x-msvideo',                                                                 -- .avi
    
    -- ===== OTROS FORMATOS ÚTILES =====
    'application/octet-stream'                                                         -- Binarios genéricos
]
WHERE id = 'document-attachments';

-- ================================================================
-- VERIFICACIÓN DE LA ACTUALIZACIÓN
-- ================================================================

-- Mostrar los tipos MIME actualizados
SELECT 
    id as "Bucket ID",
    name as "Nombre",
    public as "Público",
    file_size_limit as "Límite (bytes)",
    array_length(allowed_mime_types, 1) as "Tipos MIME (cantidad)",
    allowed_mime_types as "Tipos MIME permitidos"
FROM storage.buckets 
WHERE id = 'document-attachments';

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
    mime_count INTEGER;
BEGIN
    SELECT array_length(allowed_mime_types, 1) INTO mime_count
    FROM storage.buckets 
    WHERE id = 'document-attachments';
    
    RAISE NOTICE '';
    RAISE NOTICE 'BUCKET DOCUMENT-ATTACHMENTS ACTUALIZADO';
    RAISE NOTICE '';
    RAISE NOTICE 'Bucket: document-attachments';
    RAISE NOTICE 'Tipos MIME soportados: %', mime_count;
    RAISE NOTICE '';
    RAISE NOTICE 'IMAGENES: jpeg, png, gif, webp, bmp, tiff, svg, ico';
    RAISE NOTICE 'DOCUMENTOS: pdf, doc, docx, xls, xlsx, ppt, pptx';
    RAISE NOTICE 'TEXTO: txt, csv, rtf, md, html, xml';
    RAISE NOTICE 'COMPRIMIDOS: zip, rar, 7z, gz, tar';
    RAISE NOTICE 'CODIGO: json, js, css, sql';
    RAISE NOTICE 'AUDIO: mp3, wav, ogg, m4a';
    RAISE NOTICE 'VIDEO: mp4, mpeg, mov, avi';
    RAISE NOTICE '';
    RAISE NOTICE 'SOPORTE COMPLETO DE ADJUNTOS HABILITADO';
    RAISE NOTICE '';
END $$;
