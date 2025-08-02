/**
 * =================================================================
 * BLOQUE: CALLOUT
 * =================================================================
 * Descripción: Bloque de callout/nota destacada con diferentes tipos
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CalloutBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const calloutType = block.metadata?.calloutType || 'info';

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

  // Manejar cambios de tipo
  const handleTypeChange = (newType: 'info' | 'warning' | 'error' | 'success') => {
    onUpdate({ 
      metadata: { 
        ...block.metadata, 
        calloutType: newType 
      } 
    });
  };

  // Ajustar altura del textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter: crear nuevo párrafo después
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAddAfter('paragraph');
      exitEditMode();
    }
    
    // Escape: salir del modo edición
    if (e.key === 'Escape') {
      exitEditMode();
    }
    
    // Backspace en contenido vacío: eliminar bloque
    if (e.key === 'Backspace' && block.content === '' && e.currentTarget.selectionStart === 0) {
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

  // Ajustar altura en cambios de contenido
  useEffect(() => {
    adjustTextareaHeight();
  }, [block.content]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !isEditing) {
      enterEditMode();
    }
  }, [isActive, readOnly, isEditing]);

  // Configuración de tipos de callout
  const calloutTypes = {
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      iconColor: 'text-blue-500 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100',
      label: 'Información'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      label: 'Advertencia'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      iconColor: 'text-red-500 dark:text-red-400',
      textColor: 'text-red-900 dark:text-red-100',
      label: 'Error'
    },
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      iconColor: 'text-green-500 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100',
      label: 'Éxito'
    }
  };

  const currentType = calloutTypes[calloutType];
  const Icon = currentType.icon;

  // Selector de tipo de callout
  const TypeSelector = () => (
    <div className="absolute -left-24 top-0 flex flex-col space-y-1">
      {Object.entries(calloutTypes).map(([type, config]) => {
        const TypeIcon = config.icon;
        return (
          <button
            key={type}
            onClick={() => handleTypeChange(type as keyof typeof calloutTypes)}
            className={`p-1 rounded ${
              calloutType === type 
                ? `${config.bgColor} ${config.iconColor}` 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={config.label}
          >
            <TypeIcon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );

  // Si está en modo edición, mostrar textarea
  if (isEditing && !readOnly) {
    return (
      <div className={`block-callout editing border-l-4 ${currentType.borderColor} ${currentType.bgColor} p-4 rounded-r-lg relative group`}>
        {/* Selector de tipo */}
        <div className="absolute -left-28 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <TypeSelector />
        </div>

        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${currentType.iconColor} mt-1 flex-shrink-0`} />
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={exitEditMode}
            placeholder={`Escribe una nota de ${currentType.label.toLowerCase()}...`}
            className={`flex-1 border-none outline-none bg-transparent resize-none overflow-hidden ${currentType.textColor} placeholder-gray-400 dark:placeholder-gray-500 min-h-[1.5rem]`}
          />
        </div>
      </div>
    );
  }

  // Modo de visualización
  return (
    <div 
      className={`block-callout ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : 'cursor-text'} border-l-4 ${currentType.borderColor} ${currentType.bgColor} p-4 rounded-r-lg relative group ${!readOnly ? 'hover:shadow-sm transition-shadow' : ''}`}
      onClick={enterEditMode}
    >
      {/* Selector de tipo */}
      {!readOnly && (
        <div className="absolute -left-28 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <TypeSelector />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${currentType.iconColor} mt-1 flex-shrink-0`} />
        <div className={`flex-1 ${currentType.textColor} ${
          block.content 
            ? '' 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {block.content || `Escribe una nota de ${currentType.label.toLowerCase()}...`}
        </div>
      </div>
    </div>
  );
};
