/**
 * =================================================================
 * BLOQUE: PÁRRAFO
 * =================================================================
 * Descripción: Bloque de texto simple tipo párrafo
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';

interface ParagraphBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLParagraphElement>(null);

  // Auto-ajustar altura del textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Entrar en modo edición
  const enterEditMode = () => {
    if (readOnly) return;
    setIsEditing(true);
  };

  // Salir del modo edición
  const exitEditMode = () => {
    setIsEditing(false);
  };

  // Manejar cambios de contenido
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
    adjustTextareaHeight();
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter: crear nuevo párrafo
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddAfter('paragraph');
      exitEditMode();
    }
    
    // Escape: salir del modo edición
    if (e.key === 'Escape') {
      exitEditMode();
    }
    
    // Backspace en contenido vacío: eliminar bloque
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  // Enfocar cuando entre en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
      adjustTextareaHeight();
    }
  }, [isEditing]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !isEditing) {
      enterEditMode();
    }
  }, [isActive, readOnly, isEditing]);

  // Si está en modo edición, mostrar textarea
  if (isEditing && !readOnly) {
    return (
      <div className="block-paragraph editing">
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onBlur={exitEditMode}
          placeholder="Escribe un párrafo..."
          className="w-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base leading-relaxed"
          style={{ minHeight: '1.5em' }}
        />
      </div>
    );
  }

  // Modo de visualización
  return (
    <div 
      className={`block-paragraph ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : 'cursor-text'}`}
      onClick={enterEditMode}
    >
      <p
        ref={displayRef}
        className={`text-base leading-relaxed ${
          block.content 
            ? 'text-gray-900 dark:text-white' 
            : 'text-gray-400 dark:text-gray-500'
        } ${!readOnly ? 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1 transition-colors' : ''}`}
      >
        {block.content || 'Párrafo vacío'}
      </p>
    </div>
  );
};
