/**
 * =================================================================
 * BLOQUE: ENCABEZADO
 * =================================================================
 * Descripción: Bloque de título/encabezado con diferentes niveles
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';

interface HeadingBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const level = block.metadata?.level || 1;

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
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ content: e.target.value });
  };

  // Manejar cambios de nivel
  const handleLevelChange = (newLevel: number) => {
    onUpdate({ 
      metadata: { 
        ...block.metadata, 
        level: newLevel 
      } 
    });
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter: crear nuevo párrafo
    if (e.key === 'Enter') {
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

    // Shortcuts para cambiar nivel
    if (e.ctrlKey || e.metaKey) {
      if (e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        handleLevelChange(parseInt(e.key));
      }
    }
  };

  // Enfocar cuando entre en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !isEditing) {
      enterEditMode();
    }
  }, [isActive, readOnly, isEditing]);

  // Obtener clases CSS según el nivel
  const getHeadingClasses = (level: number) => {
    const baseClasses = "font-bold text-gray-900 dark:text-white";
    switch (level) {
      case 1:
        return `${baseClasses} text-3xl leading-tight`;
      case 2:
        return `${baseClasses} text-2xl leading-tight`;
      case 3:
        return `${baseClasses} text-xl leading-tight`;
      case 4:
        return `${baseClasses} text-lg leading-tight`;
      case 5:
        return `${baseClasses} text-base leading-tight`;
      case 6:
        return `${baseClasses} text-sm leading-tight`;
      default:
        return `${baseClasses} text-xl leading-tight`;
    }
  };

  // Selector de nivel (solo en modo edición)
  const LevelSelector = () => (
    <div className="absolute -left-16 top-0 flex items-center">
      <select
        value={level}
        onChange={(e) => handleLevelChange(parseInt(e.target.value))}
        className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
      >
        <option value={1}>H1</option>
        <option value={2}>H2</option>
        <option value={3}>H3</option>
        <option value={4}>H4</option>
        <option value={5}>H5</option>
        <option value={6}>H6</option>
      </select>
    </div>
  );

  // Si está en modo edición, mostrar input
  if (isEditing && !readOnly) {
    return (
      <div className="block-heading editing relative">
        <LevelSelector />
        <input
          ref={inputRef}
          type="text"
          value={block.content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onBlur={exitEditMode}
          placeholder={`Encabezado ${level}`}
          className={`w-full border-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 ${getHeadingClasses(level)}`}
        />
      </div>
    );
  }

  // Modo de visualización
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <div 
      className={`block-heading ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : 'cursor-text'} relative group`}
      onClick={enterEditMode}
    >
      {/* Indicador de nivel */}
      {!readOnly && (
        <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            H{level}
          </span>
        </div>
      )}
      
      <HeadingTag
        className={`${getHeadingClasses(level)} ${
          block.content 
            ? '' 
            : 'text-gray-400 dark:text-gray-500'
        } ${!readOnly ? 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1 transition-colors' : ''}`}
      >
        {block.content || `Encabezado ${level}`}
      </HeadingTag>
    </div>
  );
};
