/**
 * =================================================================
 * BLOQUE: DIVISOR
 * =================================================================
 * Descripción: Bloque divisor/separador simple
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { ContentBlock } from '@/types/documentation';

interface DividerBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  isActive,
  readOnly,
  onDelete,
  onAddAfter
}) => {
  // Manejar clic en el divisor (para seleccionarlo)
  const handleClick = () => {
    if (!readOnly) {
      // El divisor se puede seleccionar pero no editar su contenido
      // Solo se puede eliminar o añadir bloques después
    }
  };

  // Manejar teclas especiales cuando está activo
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive || readOnly) return;

    // Enter: crear nuevo párrafo después
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddAfter('paragraph');
    }
    
    // Backspace o Delete: eliminar divisor
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onDelete();
    }
  };

  // Escuchar teclas cuando el bloque está activo
  React.useEffect(() => {
    if (isActive && !readOnly) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, readOnly]);

  return (
    <div 
      className={`block-divider ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : 'cursor-pointer'} py-4 group`}
      onClick={handleClick}
      tabIndex={readOnly ? -1 : 0}
    >
      {/* Línea divisora */}
      <div className={`border-t transition-colors ${
        isActive 
          ? 'border-blue-300 dark:border-blue-600' 
          : 'border-gray-300 dark:border-gray-600'
      } ${
        !readOnly ? 'group-hover:border-gray-400 dark:group-hover:border-gray-500' : ''
      }`} />

      {/* Indicador de que el bloque está seleccionado */}
      {isActive && !readOnly && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Divisor seleccionado - Presiona Enter para añadir contenido, Backspace para eliminar
          </span>
        </div>
      )}
    </div>
  );
};

// Función helper para crear un bloque divisor
export const createDividerBlock = (): ContentBlock => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  type: 'divider',
  content: '',
  metadata: {}
});
