/**
 * =================================================================
 * COMPONENTE: YOOPTA EDITOR NATIVO - EDITOR VISUAL TIPO NOTION
 * =================================================================
 * Descripción: Editor visual avanzado usando funcionalidades nativas de Yoopta-Editor
 * con soporte completo para dark mode usando next-themes
 * Versión: 3.0 (Nativo)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useMemo, useRef } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import { useTheme as useNextTheme } from 'next-themes';

// ===== PLUGINS =====
import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Code from '@yoopta/code';
import Link from '@yoopta/link';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';
import Embed from '@yoopta/embed';
// import Table from '@yoopta/table'; // Comentado temporalmente por compatibilidad de tipos

// ===== TOOLS =====
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

// ===== MARKS =====
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

// ===== ESTILOS NATIVOS =====
import './yoopta-native-styles.css';

interface YooptaDocumentEditorProps {
  value: YooptaContentValue;
  onChange: (value: YooptaContentValue) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export const YooptaDocumentEditor: React.FC<YooptaDocumentEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = "Comienza a escribir tu documento...",
  className = ""
}) => {
  const selectionRef = useRef(null);
  const { theme } = useNextTheme();

  // ===== CONFIGURACIÓN DE PLUGINS =====
  const plugins = useMemo(() => [
    // Plugin de párrafo básico
    Paragraph,

    // Headings (títulos)
    HeadingOne,
    HeadingTwo,
    HeadingThree,

    // Listas
    BulletedList,
    NumberedList,
    TodoList,

    // Citas y llamadas de atención
    Blockquote,
    Callout,

    // Código
    Code,

    // Enlaces
    Link,

    // Media
    Image.extend({
      options: {
        async onUpload(file: File) {
          // Implementar subida de archivos a tu servicio preferido
          return {
            src: URL.createObjectURL(file),
            alt: file.name,
            sizes: {
              width: 500,
              height: 300,
            },
          };
        },
      },
    }),

    // Video
    Video.extend({
      options: {
        onUpload: async (file: File) => {
          return {
            src: URL.createObjectURL(file),
            alt: file.name,
            sizes: {
              width: 500,
              height: 300,
            },
          };
        },
      },
    }),

    // File
    File.extend({
      options: {
        onUpload: async (file: File) => {
          return {
            src: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
          };
        },
      },
    }),

    // Embed
    Embed,

    // Elementos de estructura
    Divider,
  ], []);

  // ===== CONFIGURACIÓN DE MARKS =====
  const marks = useMemo(() => [
    Bold,        // Texto en negrita
    Italic,      // Texto en cursiva
    CodeMark,    // Código inline
    Underline,   // Texto subrayado
    Strike,      // Texto tachado
    Highlight,   // Texto resaltado
  ], []);

  // ===== CONFIGURACIÓN DE TOOLS =====
  const tools = useMemo(() => ({
    // Menú de acciones (/)
    ActionMenu: {
      tool: ActionMenu,
      render: DefaultActionMenuRender,
    },
    
    // Barra de herramientas flotante
    Toolbar: {
      tool: Toolbar,
      render: DefaultToolbarRender,
    },
    
    // Herramienta de enlaces
    LinkTool: {
      tool: LinkTool,
      render: DefaultLinkToolRender,
    },
  }), []);

  // ===== CREAR EDITOR =====
  const editor = useMemo(() => createYooptaEditor(), []);

  // ===== DERIVAR isDarkMode del tema =====
  const isDarkMode = useMemo(() => {
    return theme === 'dark';
  }, [theme]);

  // ===== CLASES CSS NATIVAS =====
  const editorClasses = useMemo(() => {
    const baseClasses = "yoopta-editor w-full focus:outline-none";
    return `${baseClasses} ${className}`.trim();
  }, [className]);

  // ===== ESTILOS NATIVOS (forzando tema) =====
  const editorStyle = useMemo(() => ({
    width: '100%',
    minHeight: '500px',
    padding: '2rem',
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
  }), []);

  // ===== ESTILOS PARA EL CONTENEDOR =====
  const wrapperStyle = useMemo(() => ({
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
  }), []);

  return (
    <div 
      className={`yoopta-editor-wrapper yoopta-wrapper w-full ${isDarkMode ? 'dark' : ''}`}
      data-theme={isDarkMode ? 'dark' : 'light'}
      style={wrapperStyle}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={tools}
        marks={marks}
        value={value}
        onChange={onChange}
        selectionBoxRoot={selectionRef}
        readOnly={readOnly}
        placeholder={placeholder}
        className={editorClasses}
        style={editorStyle}
        autoFocus={!readOnly}
      />
      <div ref={selectionRef} />
    </div>
  );
};

// ===== FUNCIÓN HELPER PARA CREAR CONTENIDO VACÍO =====
export const createEmptyYooptaContent = (): YooptaContentValue => {
  const blockId = crypto.randomUUID();
  return {
    [blockId]: {
      id: blockId,
      type: 'Paragraph',
      value: [{
        id: crypto.randomUUID(),
        type: 'paragraph',
        children: [{ text: '' }],
      }],
      meta: {
        order: 0,
        depth: 0,
      },
    },
  };
};

// ===== FUNCIONES DE CONVERSIÓN DE DATOS =====
export const convertToYooptaFormat = (oldContent: any[]): YooptaContentValue => {
  if (!oldContent || oldContent.length === 0) {
    return createEmptyYooptaContent();
  }

  const yooptaContent: YooptaContentValue = {};
  
  oldContent.forEach((block, index) => {
    const blockId = crypto.randomUUID();
    
    let type = 'Paragraph';
    switch (block.type) {
      case 'heading':
        type = block.metadata?.level === 1 ? 'HeadingOne' : 
               block.metadata?.level === 2 ? 'HeadingTwo' : 'HeadingThree';
        break;
      case 'code':
        type = 'Code';
        break;
      case 'list':
        if (block.metadata?.listType === 'numbered') type = 'NumberedList';
        else if (block.metadata?.listType === 'todo') type = 'TodoList';
        else type = 'BulletedList';
        break;
      case 'callout':
        type = 'Callout';
        break;
      case 'blockquote':
        type = 'Blockquote';
        break;
      case 'divider':
        type = 'Divider';
        break;
      case 'image':
        type = 'Image';
        break;
      case 'video':
        type = 'Video';
        break;
      case 'file':
        type = 'File';
        break;
      case 'table':
        type = 'Table';
        break;
      case 'accordion':
        type = 'Accordion';
        break;
      case 'embed':
        type = 'Embed';
        break;
      default:
        type = 'Paragraph';
    }

    yooptaContent[blockId] = {
      id: blockId,
      type,
      value: [{
        id: crypto.randomUUID(),
        type: type.toLowerCase().replace(/one|two|three/, ''),
        children: [{ text: block.content || '' }],
      }],
      meta: {
        order: index,
        depth: 0,
      },
    };
  });

  return yooptaContent;
};
