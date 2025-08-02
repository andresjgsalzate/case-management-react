/**
 * =================================================================
 * COMPONENTE: RENDERIZADOR DE BLOQUES
 * =================================================================
 * Descripción: Renderiza diferentes tipos de bloques de contenido
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { ContentBlock } from '@/types/documentation';
import {
  ParagraphBlock,
  HeadingBlock,
  CodeBlock,
  ListBlock,
  CalloutBlock,
  ImageBlock,
  DividerBlock,
  TableBlock
} from '../BlockTypes';

interface BlockRendererProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const commonProps = {
    block,
    isActive,
    readOnly,
    onUpdate,
    onDelete,
    onAddAfter
  };

  switch (block.type) {
    case 'heading':
      return <HeadingBlock {...commonProps} />;
    
    case 'paragraph':
      return <ParagraphBlock {...commonProps} />;
    
    case 'code':
      return <CodeBlock {...commonProps} />;
    
    case 'list':
      return <ListBlock {...commonProps} />;
    
    case 'callout':
      return <CalloutBlock {...commonProps} />;
    
    case 'image':
      return <ImageBlock {...commonProps} />;
    
    case 'divider':
      return <DividerBlock {...commonProps} />;
    
    case 'table':
      return <TableBlock {...commonProps} />;
    
    default:
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">
            Tipo de bloque no soportado: {(block as any).type}
          </p>
        </div>
      );
  }
};
