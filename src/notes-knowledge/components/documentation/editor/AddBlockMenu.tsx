/**
 * =================================================================
 * COMPONENTE: MENÚ AÑADIR BLOQUE
 * =================================================================
 * Descripción: Menú flotante para añadir nuevos tipos de bloques
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { ContentBlock } from '@/types/documentation';
import {
  PlusIcon,
  H1Icon,
  DocumentTextIcon,
  CodeBracketIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  MinusIcon,
  TableCellsIcon,
  DocumentIcon,
  VideoCameraIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface AddBlockMenuProps {
  onAddBlock: (type: ContentBlock['type']) => void;
  isVisible: boolean;
  onClose: () => void;
}

interface BlockType {
  type: ContentBlock['type'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BLOCK_TYPES: BlockType[] = [
  {
    type: 'paragraph',
    label: 'Párrafo',
    description: 'Texto simple',
    icon: DocumentTextIcon
  },
  {
    type: 'heading',
    label: 'Encabezado',
    description: 'Título de sección',
    icon: H1Icon
  },
  {
    type: 'code',
    label: 'Código',
    description: 'Bloque de código con highlighting',
    icon: CodeBracketIcon
  },
  {
    type: 'list',
    label: 'Lista Simple',
    description: 'Lista básica con viñetas',
    icon: ListBulletIcon
  },
  {
    type: 'callout',
    label: 'Callout',
    description: 'Nota destacada',
    icon: ExclamationTriangleIcon
  },
  {
    type: 'image',
    label: 'Imagen',
    description: 'Imagen con caption',
    icon: PhotoIcon
  },
  {
    type: 'divider',
    label: 'Divisor',
    description: 'Línea separadora',
    icon: MinusIcon
  },
  {
    type: 'table',
    label: 'Tabla',
    description: 'Tabla editable avanzada',
    icon: TableCellsIcon
  },
  // ===== NUEVOS BLOQUES MULTIMEDIA =====
  {
    type: 'file',
    label: 'Archivo',
    description: 'Adjuntar cualquier archivo',
    icon: DocumentIcon
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Video con controles',
    icon: VideoCameraIcon
  },
  {
    type: 'audio',
    label: 'Audio',
    description: 'Archivo de audio',
    icon: MusicalNoteIcon
  }
];

export const AddBlockMenu: React.FC<AddBlockMenuProps> = ({
  onAddBlock,
  isVisible,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar tipos de bloques según la búsqueda
  const filteredTypes = BLOCK_TYPES.filter(blockType =>
    blockType.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blockType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de tipo de bloque
  const handleTypeSelect = (type: ContentBlock['type']) => {
    onAddBlock(type);
    onClose();
    setSearchTerm('');
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && filteredTypes.length > 0) {
      handleTypeSelect(filteredTypes[0].type);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
      {/* Encabezado */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Añadir bloque
          </h3>
        </div>
        
        {/* Buscador */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar tipo de bloque..."
          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Lista de tipos de bloques */}
      <div className="max-h-64 overflow-y-auto">
        {filteredTypes.length > 0 ? (
          filteredTypes.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.type}
                onClick={() => handleTypeSelect(blockType.type)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {blockType.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {blockType.description}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No se encontraron bloques que coincidan con "{searchTerm}"
          </div>
        )}
      </div>

      {/* Pie del menú */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Presiona <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> para cerrar
        </div>
      </div>
    </div>
  );
};
