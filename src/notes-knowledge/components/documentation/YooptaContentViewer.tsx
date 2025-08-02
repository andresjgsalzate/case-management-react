/**
 * =================================================================
 * COMPONENTE: VISUALIZADOR DE CONTENIDO YOOPTA
 * =================================================================
 * Descripción: Componente para renderizar contenido de Yoopta en modo solo lectura
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useMemo } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';

// Plugins básicos para visualización
import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Link from '@yoopta/link';
import Callout from '@yoopta/callout';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Code from '@yoopta/code';
import Divider from '@yoopta/divider';

interface YooptaContentViewerProps {
  content: YooptaContentValue;
  className?: string;
}

export const YooptaContentViewer: React.FC<YooptaContentViewerProps> = ({
  content,
  className = '',
}) => {
  const editor = useMemo(() => createYooptaEditor(), []);

  const plugins = [
    Paragraph,
    HeadingOne,
    HeadingTwo, 
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Link,
    Divider,
  ];

  const marks = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

  return (
    <div className={`yoopta-content-viewer ${className}`}>
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={marks}
        value={content}
        readOnly={true}
        autoFocus={false}
        className="yoopta-readonly"
        style={{
          minHeight: 'auto',
        }}
      />
    </div>
  );
};
