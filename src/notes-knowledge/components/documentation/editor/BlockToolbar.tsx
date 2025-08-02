/**
 * =================================================================
 * COMPONENTE: BARRA DE HERRAMIENTAS DE BLOQUE
 * =================================================================
 * Descripción: Barra de herramientas flotante para bloques activos
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { ContentBlock } from '@/types/documentation';
import {
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface BlockToolbarProps {
  block: ContentBlock;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  canMoveUp,
  canMoveDown
}) => {
  return (
    <div className="absolute -right-12 top-0 flex flex-col bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-1 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {/* Mover hacia arriba */}
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Mover arriba"
      >
        <ArrowUpIcon className="h-4 w-4" />
      </button>

      {/* Mover hacia abajo */}
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Mover abajo"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </button>

      {/* Duplicar */}
      <button
        onClick={onDuplicate}
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title="Duplicar bloque"
      >
        <DocumentDuplicateIcon className="h-4 w-4" />
      </button>

      {/* Divisor */}
      <div className="border-t border-gray-300 dark:border-gray-600 my-1" />

      {/* Eliminar */}
      <button
        onClick={onDelete}
        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        title="Eliminar bloque"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
