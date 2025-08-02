/**
 * =================================================================
 * BLOQUE: LISTA
 * =================================================================
 * Descripción: Bloque de lista con viñetas o numeración
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';

interface ListBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

interface ListItem {
  id: string;
  content: string;
  level: number;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const listType = block.metadata?.listType || 'bullet';
  const items: ListItem[] = block.metadata?.items || [{ id: '1', content: '', level: 0 }];

  // Generar ID único para nuevos elementos
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Actualizar elementos de la lista
  const updateItems = (newItems: ListItem[]) => {
    onUpdate({
      metadata: {
        ...block.metadata,
        items: newItems
      }
    });
  };

  // Cambiar tipo de lista
  const handleListTypeChange = (newType: 'bullet' | 'numbered') => {
    onUpdate({
      metadata: {
        ...block.metadata,
        listType: newType
      }
    });
  };

  // Actualizar contenido de un elemento
  const updateItemContent = (itemId: string, content: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, content } : item
    );
    updateItems(newItems);
  };

  // Añadir nuevo elemento
  const addItem = (afterId?: string, level: number = 0) => {
    const newItem: ListItem = {
      id: generateId(),
      content: '',
      level
    };

    let newItems: ListItem[];
    if (afterId) {
      const index = items.findIndex(item => item.id === afterId);
      newItems = [
        ...items.slice(0, index + 1),
        newItem,
        ...items.slice(index + 1)
      ];
    } else {
      newItems = [...items, newItem];
    }

    updateItems(newItems);
    setEditingItemId(newItem.id);
  };

  // Eliminar elemento
  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    if (newItems.length === 0) {
      onDelete();
    } else {
      updateItems(newItems);
    }
  };

  // Aumentar nivel de indentación
  const indentItem = (itemId: string) => {
    const newItems = items.map(item =>
      item.id === itemId && item.level < 3
        ? { ...item, level: item.level + 1 }
        : item
    );
    updateItems(newItems);
  };

  // Disminuir nivel de indentación
  const outdentItem = (itemId: string) => {
    const newItems = items.map(item =>
      item.id === itemId && item.level > 0
        ? { ...item, level: item.level - 1 }
        : item
    );
    updateItems(newItems);
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Enter: crear nuevo elemento
    if (e.key === 'Enter') {
      e.preventDefault();
      if (item.content.trim() === '') {
        // Si el elemento está vacío, salir de la lista
        onAddAfter('paragraph');
        setEditingItemId(null);
      } else {
        addItem(itemId, item.level);
      }
    }

    // Tab: aumentar indentación
    if (e.key === 'Tab') {
      e.preventDefault();
      indentItem(itemId);
    }

    // Shift + Tab: disminuir indentación
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      outdentItem(itemId);
    }

    // Backspace en elemento vacío: eliminar o disminuir indentación
    if (e.key === 'Backspace' && item.content === '') {
      e.preventDefault();
      if (item.level > 0) {
        outdentItem(itemId);
      } else {
        removeItem(itemId);
      }
    }

    // Escape: salir del modo edición
    if (e.key === 'Escape') {
      setEditingItemId(null);
    }
  };

  // Obtener marcador de lista según el tipo y nivel
  const getListMarker = (type: string, level: number, index: number) => {
    if (type === 'numbered') {
      return `${index + 1}.`;
    } else {
      const markers = ['•', '◦', '▪'];
      return markers[level % markers.length];
    }
  };

  // Obtener padding según el nivel
  const getLevelPadding = (level: number) => {
    return `${level * 24}px`;
  };

  // Enfocar elemento cuando entre en modo edición
  useEffect(() => {
    if (editingItemId && inputRefs.current[editingItemId]) {
      const input = inputRefs.current[editingItemId];
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    }
  }, [editingItemId]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !editingItemId) {
      const firstItem = items[0];
      if (firstItem) {
        setEditingItemId(firstItem.id);
      }
    }
  }, [isActive, readOnly, editingItemId, items]);

  // Selector de tipo de lista
  const ListTypeSelector = () => (
    <div className="absolute -left-20 top-0 flex items-center space-x-1">
      <button
        onClick={() => handleListTypeChange('bullet')}
        className={`px-2 py-1 text-xs rounded ${
          listType === 'bullet' 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title="Lista con viñetas"
      >
        •
      </button>
      <button
        onClick={() => handleListTypeChange('numbered')}
        className={`px-2 py-1 text-xs rounded ${
          listType === 'numbered' 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title="Lista numerada"
      >
        1.
      </button>
    </div>
  );

  return (
    <div className={`block-list ${isActive ? 'active' : ''} relative group`}>
      {/* Selector de tipo de lista */}
      {!readOnly && (
        <div className="absolute -left-24 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ListTypeSelector />
        </div>
      )}

      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start"
            style={{ paddingLeft: getLevelPadding(item.level) }}
          >
            {/* Marcador de lista */}
            <div className="flex-shrink-0 w-6 text-gray-600 dark:text-gray-400 text-sm mt-1">
              {getListMarker(listType, item.level, index)}
            </div>

            {/* Contenido del elemento */}
            <div className="flex-1 min-w-0">
              {editingItemId === item.id && !readOnly ? (
                <input
                  ref={(el) => (inputRefs.current[item.id] = el)}
                  type="text"
                  value={item.content}
                  onChange={(e) => updateItemContent(item.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  onBlur={() => setEditingItemId(null)}
                  placeholder="Escribe un elemento de lista..."
                  className="w-full border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              ) : (
                <div
                  className={`py-1 ${readOnly ? '' : 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 transition-colors'} ${
                    item.content 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  onClick={() => !readOnly && setEditingItemId(item.id)}
                >
                  {item.content || 'Escribe un elemento de lista...'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para añadir elemento (solo visible en hover y no readonly) */}
      {!readOnly && (
        <button
          onClick={() => addItem()}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          + Añadir elemento
        </button>
      )}
    </div>
  );
};
