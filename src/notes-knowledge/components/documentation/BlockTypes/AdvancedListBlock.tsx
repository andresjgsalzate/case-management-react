/**
 * =================================================================
 * BLOQUE: LISTA AVANZADA
 * =================================================================
 * Descripción: Bloque de lista con soporte para todos los tipos de BlockNote
 * Incluye: bullet, numbered, check list, toggle list
 * Versión: 2.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface AdvancedListBlockProps {
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
  checked?: boolean;
  collapsed?: boolean;
  children?: ListItem[];
}

type ListType = 'bullet' | 'numbered' | 'checklist' | 'toggle';

export const AdvancedListBlock: React.FC<AdvancedListBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete
}) => {
  const [listType, setListType] = useState<ListType>(
    (block.metadata?.listType as ListType) || 'bullet'
  );
  const [items, setItems] = useState<ListItem[]>(
    block.metadata?.items?.map(item => ({
      ...item,
      checked: item.checked || false,
      collapsed: item.collapsed || false,
      children: item.children || []
    })) || [{ id: Date.now().toString(), content: '', level: 0, checked: false }]
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Actualizar datos cuando cambie el bloque
  useEffect(() => {
    if (block.metadata?.items && block.metadata.items.length > 0) {
      setItems(block.metadata.items.map(item => ({
        ...item,
        checked: item.checked || false,
        collapsed: item.collapsed || false,
        children: item.children || []
      })));
    }
  }, [block.metadata?.items]);

  // Guardar cambios
  const saveChanges = () => {
    onUpdate({
      content: items.map(item => item.content).join(', '),
      metadata: {
        ...block.metadata,
        listType,
        items: items.map(item => ({
          id: item.id,
          content: item.content,
          level: item.level,
          checked: item.checked,
          collapsed: item.collapsed,
          children: item.children
        }))
      }
    });
  };

  // Agregar nuevo item
  const addItem = (afterId?: string) => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      content: '',
      level: 0,
      checked: false,
      collapsed: false,
      children: []
    };

    if (afterId) {
      const index = items.findIndex(item => item.id === afterId);
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }
    
    setEditingItem(newItem.id);
    setTimeout(() => {
      inputRefs.current[newItem.id]?.focus();
    }, 0);
  };

  // Eliminar item
  const deleteItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      saveChanges();
    }
  };

  // Actualizar contenido del item
  const updateItemContent = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  // Toggle check
  const toggleCheck = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
    saveChanges();
  };

  // Toggle collapse (para toggle lists)
  const toggleCollapse = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, collapsed: !item.collapsed } : item
    ));
    saveChanges();
  };

  // Manejar Enter
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(id);
      saveChanges();
    } else if (e.key === 'Backspace' && items.find(item => item.id === id)?.content === '') {
      e.preventDefault();
      deleteItem(id);
    }
  };

  // Manejar blur
  const handleBlur = () => {
    setEditingItem(null);
    saveChanges();
  };

  // Cambiar tipo de lista
  const changeListType = (newType: ListType) => {
    setListType(newType);
    // Si cambio a checklist, inicializar checked
    if (newType === 'checklist') {
      setItems(items.map(item => ({ ...item, checked: item.checked || false })));
    }
    setTimeout(saveChanges, 0);
  };

  // Renderizar icono de lista
  const renderListIcon = (item: ListItem, index: number) => {
    switch (listType) {
      case 'bullet':
        return <span className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full flex-shrink-0 mt-2"></span>;
      
      case 'numbered':
        return <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0 w-6">{index + 1}.</span>;
      
      case 'checklist':
        return (
          <button
            onClick={() => toggleCheck(item.id)}
            disabled={readOnly}
            className={`
              w-4 h-4 border-2 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
              ${item.checked 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }
              ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {item.checked && <CheckIcon className="w-3 h-3" />}
          </button>
        );
      
      case 'toggle':
        return (
          <button
            onClick={() => toggleCollapse(item.id)}
            disabled={readOnly}
            className="flex-shrink-0 p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {item.collapsed ? 
              <ChevronRightIcon className="w-4 h-4" /> : 
              <ChevronDownIcon className="w-4 h-4" />
            }
          </button>
        );
      
      default:
        return <span className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full flex-shrink-0 mt-2"></span>;
    }
  };

  return (
    <div className={`
      relative group transition-all duration-200
      ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg p-2' : ''}
    `}>
      {/* Controles */}
      {isActive && !readOnly && (
        <div className="absolute -top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            value={listType}
            onChange={(e) => changeListType(e.target.value as ListType)}
            className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="bullet">Bullet List</option>
            <option value="numbered">Numbered List</option>
            <option value="checklist">Check List</option>
            <option value="toggle">Toggle List</option>
          </select>
          <button
            onClick={() => addItem()}
            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-start space-x-3 group/item">
            {/* Icono de lista */}
            {renderListIcon(item, index)}

            {/* Contenido */}
            <div className="flex-1">
              <input
                ref={el => inputRefs.current[item.id] = el}
                type="text"
                value={item.content}
                onChange={(e) => updateItemContent(item.id, e.target.value)}
                onFocus={() => setEditingItem(item.id)}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                readOnly={readOnly}
                className={`
                  w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100
                  ${item.checked && listType === 'checklist' ? 'line-through text-gray-500 dark:text-gray-400' : ''}
                  ${readOnly ? 'cursor-default' : 'cursor-text'}
                `}
                placeholder={readOnly ? '' : 'Type here...'}
              />

              {/* Contenido colapsado en toggle lists */}
              {listType === 'toggle' && !item.collapsed && item.children && item.children.length > 0 && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <div key={child.id} className="text-sm text-gray-600 dark:text-gray-400">
                      • {child.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controles de item */}
            {!readOnly && editingItem === item.id && (
              <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button
                  onClick={() => addItem(item.id)}
                  className="p-1 text-gray-500 hover:text-green-500 transition-colors"
                  title="Add item below"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
                {items.length > 1 && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete item"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agregar nuevo item al final */}
      {!readOnly && (
        <button
          onClick={() => addItem()}
          className="mt-2 text-sm text-gray-500 hover:text-blue-500 transition-colors flex items-center space-x-1"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add item</span>
        </button>
      )}
    </div>
  );
};

export default AdvancedListBlock;
