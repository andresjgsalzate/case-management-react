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

import React, { useMemo } from 'react';
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
  const { theme } = useNextTheme();

  // ===== DERIVAR isDarkMode del tema =====
  const isDarkMode = useMemo(() => {
    return theme === 'dark';
  }, [theme]);

  // ===== CREAR EDITOR =====
  const editor = useCreateBlockNote({
    initialContent: value && value.length > 0 ? value : undefined,
    uploadFile: async (file: File) => {
      // Validar que tengamos un documentId válido
      if (!documentId || documentId.trim() === '') {
        // Crear URL temporal como fallback
        const tempUrl = URL.createObjectURL(file);
        return tempUrl;
      }

      try {
        // Usar StorageService para subir archivos reales
        const result = await StorageService.uploadFile(file, documentId, {
          isEmbedded: true
        });

        if (result.success && result.data) {
          return result.data.url;
        } else {
          // Fallback a URL temporal si falla la subida
          const tempUrl = URL.createObjectURL(file);
          return tempUrl;
        }
      } catch (error) {
        console.error('Error en StorageService.uploadFile:', error);
        // Fallback a URL temporal en caso de error
        const tempUrl = URL.createObjectURL(file);
        return tempUrl;
      }
    },
  });

  // ===== MANEJAR CAMBIOS =====
  const handleChange = () => {
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
