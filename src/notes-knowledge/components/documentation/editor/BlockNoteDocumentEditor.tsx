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

import React, { useMemo, useEffect } from 'react';
import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useNativeTheme } from '../../../../shared/hooks/useNativeTheme';
import { StorageService } from '../../../../shared/services/StorageService';
import { createHighlighter } from "../../../../lib/shiki.bundle";

// ===== ESTILOS =====
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-fixes.css";
import "./dropdown-force-visible.css";
import "./readonly-mode-minimal.css";
import "./language-indicators.css";
import "./force-readonly.css"; // CSS agresivo para readonly
// import "./shiki-theme-fix.css"; // Temporalmente deshabilitado para debug

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
  const { isDark, resolvedTheme } = useNativeTheme();

  // ===== DERIVAR isDarkMode del tema =====
  const isDarkMode = useMemo(() => {
    return isDark;
  }, [isDark]);

  // Debug para verificar tema
  useEffect(() => {
    console.log('🎨 BlockNote Theme Debug:', {
      resolvedTheme,
      isDark,
      isDarkMode,
      readOnly,
      component: readOnly ? 'VIEWER' : 'EDITOR'
    });
  }, [resolvedTheme, isDark, isDarkMode, readOnly]);

  // ===== CREAR EDITOR =====
  const editor = useCreateBlockNote({
    initialContent: value && value.length > 0 ? value : undefined,
    // ===== CONFIGURACIÓN DE CODE BLOCKS =====
    codeBlock: {
      indentLineWithTab: !readOnly, // Solo en modo editable
      defaultLanguage: "typescript",
      supportedLanguages: {
        typescript: {
          name: "TypeScript",
          aliases: ["ts"],
        },
        javascript: {
          name: "JavaScript", 
          aliases: ["js"],
        },
        python: {
          name: "Python",
          aliases: ["py"],
        },
        java: {
          name: "Java",
        },
        sql: {
          name: "SQL",
        },
        html: {
          name: "HTML",
        },
        css: {
          name: "CSS",
        },
        json: {
          name: "JSON",
        },
        markdown: {
          name: "Markdown",
          aliases: ["md"],
        },
      },
      createHighlighter: () =>
        createHighlighter({
          themes: ["light-plus", "dark-plus"],
          langs: [],
        }),
    },
    // ===== CONFIGURACIÓN DE TABLAS (condicional) =====
    ...(readOnly ? {} : {
      tables: {
        cellBackgroundColor: true,
        cellTextColor: true,
        headers: true,
        splitCells: true,
      },
    }),
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
    // Actualizar indicadores de lenguaje después del cambio
    setTimeout(() => updateLanguageIndicators(), 100);
  };

  // ===== FUNCIÓN PARA ACTUALIZAR INDICADORES DE LENGUAJE =====
  const updateLanguageIndicators = () => {
    const codeBlocks = document.querySelectorAll('.bn-code-block');
    codeBlocks.forEach((block) => {
      try {
        // Buscar el selector de lenguaje dentro del bloque
        const langSelector = block.querySelector('.mantine-Select-input, .mantine-Combobox-input') as HTMLInputElement;
        let language = 'TEXT';
        
        if (langSelector) {
          language = langSelector.value || langSelector.getAttribute('value') || 'text';
        } else {
          // Si no hay selector, intentar detectar el lenguaje por el contenido
          const codeContent = block.querySelector('pre, code')?.textContent || '';
          language = detectLanguageFromContent(codeContent);
        }
        
        // Establecer el atributo data-language
        block.setAttribute('data-language', language.toUpperCase());
      } catch (error) {
        console.warn('Error updating language indicator:', error);
        block.setAttribute('data-language', 'TEXT');
      }
    });
  };

  // ===== FUNCIÓN PARA DETECTAR LENGUAJE POR CONTENIDO =====
  const detectLanguageFromContent = (content: string): string => {
    if (!content) return 'text';
    
    // Detección simple basada en patrones comunes
    if (content.includes('function ') || content.includes('const ') || content.includes('let ') || content.includes('=>')) {
      if (content.includes(': ') && content.includes('interface ')) return 'typescript';
      return 'javascript';
    }
    if (content.includes('def ') || content.includes('import ') || content.includes('print(')) return 'python';
    if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) return 'sql';
    if (content.includes('<html') || content.includes('<div') || content.includes('</')) return 'html';
    if (content.includes('{') && content.includes('}') && content.includes(':')) {
      if (content.includes('"') && !content.includes('function')) return 'json';
    }
    if (content.includes('class ') && content.includes('public ')) return 'java';
    if (content.includes('#') && content.includes('##')) return 'markdown';
    
    return 'text';
  };

  // ===== EFFECT PARA ACTUALIZAR INDICADORES INICIALES =====
  React.useEffect(() => {
    // Actualizar indicadores después de que el editor se monte
    const timer = setTimeout(() => {
      updateLanguageIndicators();
    }, 500);

    return () => clearTimeout(timer);
  }, [editor, value]);

  // ===== EFFECT PARA OBSERVAR CAMBIOS EN SELECTORES =====
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'value' || mutation.attributeName === 'aria-expanded')) {
          setTimeout(() => updateLanguageIndicators(), 100);
        }
        if (mutation.type === 'childList') {
          setTimeout(() => updateLanguageIndicators(), 200);
        }
      });
    });

    // Observar cambios en el DOM del editor
    const editorContainer = document.querySelector('.blocknote-editor-wrapper');
    if (editorContainer) {
      observer.observe(editorContainer, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['value', 'aria-expanded', 'data-language']
      });
    }

    // Observar cambios globales en selectores
    const handleSelectChange = () => {
      setTimeout(() => updateLanguageIndicators(), 50);
    };

    // Escuchar eventos de cambio en selectores
    document.addEventListener('change', handleSelectChange);
    document.addEventListener('input', handleSelectChange);
    document.addEventListener('click', handleSelectChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('change', handleSelectChange);
      document.removeEventListener('input', handleSelectChange);
      document.removeEventListener('click', handleSelectChange);
    };
  }, []);

  // ===== EFFECT PARA DESACTIVAR DROPDOWNS EN MODO READONLY =====
  React.useEffect(() => {
    if (!readOnly) return;

    // Función agresiva para interceptar TODOS los clicks en readonly
    const interceptAllClicks = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInReadonly = target.closest('.blocknote-readonly');
      
      if (isInReadonly) {
        // Verificar si es cualquier elemento dentro de un code block
        const isInCodeBlock = target.closest('.bn-code-block');
        
        if (isInCodeBlock) {
          // INTERCEPTAR CUALQUIER CLICK en code blocks de readonly
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // Log para debug
          console.log('🚫 Click interceptado en code block readonly:', target);
          
          return false;
        }
      }
    };

    // Función para eliminar físicamente dropdowns
    const nukeDropdowns = () => {
      // Eliminar TODOS los portales
      const portals = document.querySelectorAll('[data-floating-ui-portal]');
      portals.forEach((portal) => {
        portal.remove();
      });

      // Eliminar dropdowns específicos
      const dropdowns = document.querySelectorAll(
        '.mantine-Select-dropdown, .mantine-Combobox-dropdown, [role="listbox"], .mantine-Popover-dropdown'
      );
      dropdowns.forEach((dropdown) => {
        dropdown.remove();
      });

      // Ocultar y deshabilitar selectores en readonly
      const selectors = document.querySelectorAll(
        '.blocknote-readonly .bn-code-block .mantine-Select-root, .blocknote-readonly .bn-code-block .mantine-Combobox-root'
      );
      selectors.forEach((selector: any) => {
        selector.style.display = 'none';
        selector.style.pointerEvents = 'none';
        selector.remove(); // Eliminar completamente
      });
    };

    // Interceptors más agresivos
    const events = ['click', 'mousedown', 'mouseup', 'keydown', 'keyup', 'focus', 'focusin'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, interceptAllClicks, true);
    });

    // Ejecutar nukeo inmediato
    nukeDropdowns();
    
    // Nukeo periódico
    const nukeInterval = setInterval(nukeDropdowns, 500);

    // Observer del body para nukear nuevos portales
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node: any) => {
            if (node.nodeType === 1) { // Element node
              // Si es un portal, eliminarlo inmediatamente
              if (node.hasAttribute && node.hasAttribute('data-floating-ui-portal')) {
                node.remove();
              }
              // Si contiene portales, eliminarlos
              if (node.querySelectorAll) {
                const innerPortals = node.querySelectorAll('[data-floating-ui-portal]');
                innerPortals.forEach((portal: any) => portal.remove());
              }
            }
          });
        }
      });
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, interceptAllClicks, true);
      });
      clearInterval(nukeInterval);
      bodyObserver.disconnect();
    };
  }, [readOnly]);
  // ===== EFFECT ADICIONAL PARA INTERVALO DE ACTUALIZACIÓN =====
  React.useEffect(() => {
    // Actualizar indicadores cada 2 segundos como respaldo
    const interval = setInterval(() => {
      updateLanguageIndicators();
      
      // Si es readonly, ejecutar deshabilitación agresiva de dropdowns
      if (readOnly) {
        // Ocultar selectores
        const selectors = document.querySelectorAll(
          '.blocknote-readonly .mantine-Select-root, .blocknote-readonly .mantine-Combobox-root, .blocknote-readonly input, .blocknote-readonly select, .blocknote-readonly button'
        );
        selectors.forEach((element: any) => {
          const isInCodeBlock = element.closest('.bn-code-block');
          if (isInCodeBlock) {
            element.style.display = 'none !important';
            element.style.pointerEvents = 'none !important';
            element.style.visibility = 'hidden !important';
          }
        });

        // Ocultar portales globales
        const portals = document.querySelectorAll('[data-floating-ui-portal]');
        portals.forEach((portal: any) => {
          portal.style.display = 'none !important';
          portal.remove();
        });

        // Ocultar dropdowns específicos
        const dropdowns = document.querySelectorAll('.mantine-Select-dropdown, .mantine-Combobox-dropdown, [role="listbox"]');
        dropdowns.forEach((dropdown: any) => {
          dropdown.style.display = 'none !important';
          dropdown.remove();
        });
      }
    }, 1000); // Reducido a 1 segundo para ser más agresivo

    return () => clearInterval(interval);
  }, [readOnly]);

  return (
    <div 
      className={`blocknote-editor-wrapper w-full ${className} ${readOnly ? 'blocknote-readonly' : ''}`}
      style={{ 
        minHeight: readOnly ? '200px' : '400px',
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate'
      }}
      data-theme={isDarkMode ? "dark" : "light"}
      data-readonly={readOnly}
    >
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        onChange={handleChange}
        theme={isDarkMode ? "dark" : "light"}
        data-editable={!readOnly}
        data-theme={isDarkMode ? "dark" : "light"}
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
