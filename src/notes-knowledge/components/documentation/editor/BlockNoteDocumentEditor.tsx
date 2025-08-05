/**
 * =================================================================
 * COMPONENTE: BLOCKNOTE EDITOR - EDITOR VISUAL TIPO NOTION
 * =================================================================
 * Descripción: Editor visual avanzado usando BlockNote
 * con soporte completo para dark mode y todas las funcionalidades de Notion
 * Versión: 1.0
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

import React, { useMemo, useRef } from 'react';
import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme as useNextTheme } from 'next-themes';
import { StorageService } from '../../../../shared/services/StorageService';

// ===== ESTILOS =====
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface BlockNoteDocumentEditorProps {
  value: PartialBlock[];
  onChange: (blocks: PartialBlock[]) => void;
  readOnly?: boolean;
  className?: string;
  documentId?: string; // ID del documento para asociar archivos
}

export const BlockNoteDocumentEditor: React.FC<BlockNoteDocumentEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className = "",
  documentId
}) => {
  // Debug logs (optimizado para performance)
  const logRef = useRef(Date.now());
  const changeLogRef = useRef(Date.now());
  
  if (Date.now() - logRef.current > 2000) { // Solo log cada 2 segundos
    console.log('🎯 BlockNoteDocumentEditor inicializado:', {
      documentId: documentId,
      hasDocumentId: !!documentId,
      readOnly: readOnly,
      hasValue: value && value.length > 0,
      timestamp: new Date().toISOString()
    });
    logRef.current = Date.now();
  }

  const { theme } = useNextTheme();

  // ===== DERIVAR isDarkMode del tema =====
  const isDarkMode = useMemo(() => {
    return theme === 'dark';
  }, [theme]);

  // ===== CREAR EDITOR =====
  const editor = useCreateBlockNote({
    initialContent: value && value.length > 0 ? value : undefined,
    uploadFile: async (file: File) => {
      console.log('🔥 BLOCKNOTE UPLOAD INICIADO:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentId: documentId,
        hasDocumentId: !!documentId,
        documentIdValid: documentId && documentId.trim() !== '',
        timestamp: new Date().toISOString()
      });

      // Validar que tengamos un documentId válido
      if (!documentId || documentId.trim() === '') {
        console.error('❌ ERROR: No hay documentId válido para subir archivos');
        console.error('📝 Esto significa que el documento aún no se ha guardado');
        
        // Crear URL temporal como fallback
        const tempUrl = URL.createObjectURL(file);
        console.log('🔄 Usando URL temporal como fallback:', tempUrl);
        return tempUrl;
      }

      try {
        // Usar StorageService para subir archivos reales
        console.log('📤 Llamando StorageService.uploadFile con documentId:', documentId);
        const result = await StorageService.uploadFile(file, documentId, {
          isEmbedded: true
        });

        console.log('📥 Resultado de StorageService:', {
          success: result.success,
          hasData: !!result.data,
          error: result.error,
          url: result.data?.url,
          fileId: result.data?.id
        });

        if (result.success && result.data) {
          console.log('✅ ARCHIVO SUBIDO EXITOSAMENTE:', {
            url: result.data.url,
            fileId: result.data.id,
            fileName: file.name,
            documentId: documentId
          });
          return result.data.url;
        } else {
          console.error('❌ ERROR EN SUBIDA - usando URL temporal:', result.error);
          // Fallback a URL temporal si falla la subida
          const tempUrl = URL.createObjectURL(file);
          console.log('🔄 URL temporal creada:', tempUrl);
          return tempUrl;
        }
      } catch (error) {
        console.error('💥 EXCEPCIÓN EN UPLOAD:', {
          error: error,
          fileName: file.name,
          documentId: documentId
        });
        // Fallback a URL temporal si hay error
        const tempUrl = URL.createObjectURL(file);
        console.log('🔄 URL temporal de emergencia:', tempUrl);
        return tempUrl;
      }
    },
  });

  // ===== MANEJAR CAMBIOS (optimizado) =====
  const handleChange = () => {
    // Solo log cada 3 segundos para handleChange
    if (Date.now() - changeLogRef.current > 3000) {
      console.log('📝 BlockNote handleChange ejecutado:', {
        documentId: documentId,
        hasDocument: !!documentId,
        documentLength: editor.document.length,
        timestamp: new Date().toISOString()
      });
      changeLogRef.current = Date.now();
    }
    onChange(editor.document);
  };

  return (
    <div 
      className={`blocknote-editor-wrapper w-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        onChange={handleChange}
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
};

// ===== FUNCIÓN HELPER PARA CREAR CONTENIDO VACÍO =====
export const createEmptyBlockNoteContent = (): PartialBlock[] => {
  return [
    {
      type: "paragraph",
      content: "",
    },
  ];
};

// ===== FUNCIONES DE CONVERSIÓN DE DATOS =====
export const convertFromLegacyToBlockNote = (legacyContent: any): PartialBlock[] => {
  if (!legacyContent || typeof legacyContent !== 'object') {
    return createEmptyBlockNoteContent();
  }

  // ===== VERIFICAR SI YA ES FORMATO BLOCKNOTE =====
  if (Array.isArray(legacyContent)) {
    const firstItem = legacyContent[0];
    if (firstItem && typeof firstItem === 'object' && firstItem.id && firstItem.type) {
      return legacyContent as PartialBlock[];
    }
  }

  // ===== CONVERSIÓN DESDE FORMATO LEGACY =====
  try {
    // Convertir desde formato legacy al formato BlockNote
    const blocks: PartialBlock[] = [];
    
    Object.values(legacyContent).forEach((block: any) => {
      if (block && block.type) {
        switch (block.type) {
          case 'Paragraph':
            blocks.push({
              type: "paragraph",
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'HeadingOne':
            blocks.push({
              type: "heading",
              props: { level: 1 },
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'HeadingTwo':
            blocks.push({
              type: "heading",
              props: { level: 2 },
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'HeadingThree':
            blocks.push({
              type: "heading",
              props: { level: 3 },
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'BulletedList':
            blocks.push({
              type: "bulletListItem",
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'NumberedList':
            blocks.push({
              type: "numberedListItem",
              content: extractTextFromLegacyBlock(block),
            });
            break;
          case 'Code':
            blocks.push({
              type: "codeBlock",
              props: {
                language: block.props?.language || "javascript",
              },
              content: extractTextFromLegacyBlock(block),
            });
            break;
          default:
            // Para tipos no reconocidos, convertir a párrafo
            blocks.push({
              type: "paragraph",
              content: extractTextFromLegacyBlock(block),
            });
        }
      }
    });

    console.log('✅ CONVERSIÓN LEGACY COMPLETADA:', {
      originalKeysCount: Object.keys(legacyContent).length,
      generatedBlocksCount: blocks.length,
      blocks: blocks.map(b => ({ type: b.type, hasContent: !!b.content })),
      willReturnEmpty: blocks.length === 0
    });

    return blocks.length > 0 ? blocks : createEmptyBlockNoteContent();
  } catch (error) {
    console.error('Error converting legacy format to BlockNote:', error);
    return createEmptyBlockNoteContent();
  }
};

// Helper para extraer texto de bloques legacy
const extractTextFromLegacyBlock = (block: any): string => {
  if (!block || !block.value) return '';
  
  try {
    if (Array.isArray(block.value)) {
      return block.value
        .map((item: any) => {
          if (item && item.children && Array.isArray(item.children)) {
            return item.children.map((child: any) => child.text || '').join('');
          }
          return item?.text || '';
        })
        .join('');
    }
    
    if (typeof block.value === 'string') {
      return block.value;
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting text from legacy block:', error);
    return '';
  }
};

export default BlockNoteDocumentEditor;
