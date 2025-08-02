/**
 * =================================================================
 * COMPONENTE: EDITOR DE BLOQUES TIPO NOTION
 * =================================================================
 * Descripción: Editor principal de bloques de contenido
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { ContentBlock, BlockEditorConfig } from '@/types/documentation';
import { BlockRenderer } from './BlockRenderer';
import { BlockToolbar } from './BlockToolbar';
import { AddBlockMenu } from './AddBlockMenu';

interface BlockEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  readOnly?: boolean;
  config?: BlockEditorConfig;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  onChange,
  readOnly = false
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Crear un nuevo bloque
  const createBlock = useCallback((type: ContentBlock['type']): ContentBlock => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      metadata: getDefaultMetadata(type)
    };

    return newBlock;
  }, []);

  // Obtener metadatos por defecto según el tipo
  const getDefaultMetadata = (type: ContentBlock['type']) => {
    switch (type) {
      case 'heading':
        return { level: 1 };
      case 'list':
        return { 
          listType: 'bullet' as const,
          items: [{ id: '1', content: '', level: 0 }]
        };
      case 'callout':
        return { calloutType: 'info' as const };
      case 'code':
        return { language: 'javascript' };
      case 'table':
        return {
          tableHeaders: ['Columna 1', 'Columna 2'],
          tableRows: [['', '']]
        };
      default:
        return {};
    }
  };

  // Agregar un nuevo bloque
  const addBlock = useCallback((type: ContentBlock['type'], afterBlockId?: string) => {
    const newBlock = createBlock(type);
    
    if (!afterBlockId) {
      // Agregar al final
      onChange([...content, newBlock]);
    } else {
      // Insertar después del bloque especificado
      const index = content.findIndex(block => block.id === afterBlockId);
      const newContent = [...content];
      newContent.splice(index + 1, 0, newBlock);
      onChange(newContent);
    }
    
    setShowAddMenu(null);
    setActiveBlockId(newBlock.id);
  }, [content, onChange, createBlock]);

  // Actualizar un bloque
  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    const newContent = content.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onChange(newContent);
  }, [content, onChange]);

  // Eliminar un bloque
  const deleteBlock = useCallback((blockId: string) => {
    const newContent = content.filter(block => block.id !== blockId);
    onChange(newContent);
    setActiveBlockId(null);
  }, [content, onChange]);

  // Mover un bloque por índice (para drag and drop)
  const moveBlockToIndex = useCallback((blockId: string, newIndex: number) => {
    const currentIndex = content.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newContent = [...content];
    const [movedBlock] = newContent.splice(currentIndex, 1);
    newContent.splice(newIndex, 0, movedBlock);
    onChange(newContent);
  }, [content, onChange]);

  // Mover un bloque
  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const currentIndex = content.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < content.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return; // No se puede mover
    }

    const newContent = [...content];
    const [movedBlock] = newContent.splice(currentIndex, 1);
    newContent.splice(newIndex, 0, movedBlock);
    onChange(newContent);
  }, [content, onChange]);

  // Duplicar un bloque
  const duplicateBlock = useCallback((blockId: string) => {
    const blockIndex = content.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = content[blockIndex];
    const duplicatedBlock: ContentBlock = {
      ...originalBlock,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const newContent = [...content];
    newContent.splice(blockIndex + 1, 0, duplicatedBlock);
    onChange(newContent);
    setActiveBlockId(duplicatedBlock.id);
  }, [content, onChange]);

  // Manejar teclas globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;

      // Crear nuevo bloque con Enter al final
      if (e.key === 'Enter' && e.target === editorRef.current) {
        e.preventDefault();
        addBlock('paragraph');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addBlock, readOnly]);

  // Manejar clic fuera para deseleccionar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setActiveBlockId(null);
        setShowAddMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBlockId(blockId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    
    if (draggedBlockId !== targetBlockId) {
      const targetIndex = content.findIndex(block => block.id === targetBlockId);
      moveBlockToIndex(draggedBlockId, targetIndex);
    }
    
    setDragOverBlockId(null);
  }, [content, moveBlockToIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverBlockId(null);
  }, []);

  if (content.length === 0 && !readOnly) {
    return (
      <div 
        ref={editorRef}
        className="min-h-96 p-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
      >
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
            📝 Comienza a escribir tu documento
          </div>
          <button
            onClick={() => addBlock('paragraph')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar primer bloque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={editorRef} className="block-editor p-6 space-y-2">
      {content.map((block) => (
        <div
          key={block.id}
          className={`block-container group relative ${
            dragOverBlockId === block.id ? 'border-t-2 border-primary-500' : ''
          }`}
          draggable={!readOnly}
          onDragStart={(e) => handleDragStart(e, block.id)}
          onDragOver={(e) => handleDragOver(e, block.id)}
          onDrop={(e) => handleDrop(e, block.id)}
          onDragLeave={handleDragLeave}
        >
          {/* Handle de arrastre */}
          {!readOnly && (
            <div className="absolute left-0 top-0 transform -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Arrastrar para reordenar"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Contenido del bloque */}
          <div
            className={`block-content ${
              activeBlockId === block.id ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
            }`}
            onClick={() => !readOnly && setActiveBlockId(block.id)}
          >
            <BlockRenderer
              block={block}
              isActive={activeBlockId === block.id}
              readOnly={readOnly}
              onUpdate={(updates: Partial<ContentBlock>) => updateBlock(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
              onAddAfter={(type: ContentBlock['type']) => addBlock(type, block.id)}
            />
          </div>

          {/* Toolbar del bloque */}
          {!readOnly && activeBlockId === block.id && (
            <BlockToolbar
              block={block}
              onDelete={() => deleteBlock(block.id)}
              onMoveUp={() => moveBlock(block.id, 'up')}
              onMoveDown={() => moveBlock(block.id, 'down')}
              onDuplicate={() => duplicateBlock(block.id)}
              canMoveUp={content.findIndex(b => b.id === block.id) > 0}
              canMoveDown={content.findIndex(b => b.id === block.id) < content.length - 1}
            />
          )}

          {/* Botón de agregar bloque */}
          {!readOnly && (
            <div className="flex items-center justify-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowAddMenu(showAddMenu === block.id ? null : block.id)}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Agregar bloque
              </button>
            </div>
          )}

          {/* Menú de agregar bloque */}
          {showAddMenu === block.id && (
            <AddBlockMenu
              isVisible={showAddMenu === block.id}
              onAddBlock={(type: ContentBlock['type']) => addBlock(type, block.id)}
              onClose={() => setShowAddMenu(null)}
            />
          )}
        </div>
      ))}

      {/* Área para agregar al final */}
      {!readOnly && content.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <button
            onClick={() => addBlock('paragraph')}
            className="inline-flex items-center px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar bloque al final
          </button>
        </div>
      )}
    </div>
  );
};
