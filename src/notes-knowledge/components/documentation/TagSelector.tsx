/**
 * =================================================================
 * COMPONENTE: SELECTOR DE ETIQUETAS
 * =================================================================
 * Descripción: Componente para seleccionar etiquetas reutilizables
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useMemo } from 'react';
import { X, Tag, Search } from 'lucide-react';
import { useTags } from '../../hooks/useDocumentation';
import type { SolutionTag, TagCategory } from '../../types';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

// Paleta de colores predefinidos para etiquetas
const TAG_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange  
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#84CC16', // Lime
  '#F472B6', // Pink-400
  '#A78BFA', // Violet-400
];

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsChange,
  className = '',
}) => {
  const { tags, isLoading, createTag } = useTags();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTags = tags.filter((tag: any) => selectedTagIds.includes(tag.id));
  
  // Filtrar etiquetas disponibles por búsqueda
  const filteredAvailableTags = useMemo(() => {
    const available = tags.filter((tag: any) => !selectedTagIds.includes(tag.id));
    if (!searchQuery.trim()) return available;
    
    return available.filter((tag: any) => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, selectedTagIds, searchQuery]);

  // Verificar si la búsqueda actual coincide exactamente con una etiqueta existente
  const exactMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return tags.find((tag: any) => 
      tag.name.toLowerCase() === searchQuery.toLowerCase().trim()
    );
  }, [tags, searchQuery]);

  const handleAddTag = (tagId: string) => {
    onTagsChange([...selectedTagIds, tagId]);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  // Crear etiqueta automáticamente al presionar Enter
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && !exactMatch) {
      e.preventDefault();
      
      // Obtener los últimos 3 colores usados para evitar repeticiones
      const recentTags = tags
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      const recentColors = recentTags.map((tag: any) => tag.color);
      
      // Filtrar colores disponibles (excluir los últimos 3 usados)
      const availableColors = TAG_COLORS.filter(color => !recentColors.includes(color));
      
      // Si todos los colores fueron usados recientemente, usar todos los colores
      const colorPool = availableColors.length > 0 ? availableColors : TAG_COLORS;
      
      // Seleccionar un color aleatorio del pool filtrado
      const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];
      
      // Determinar categoría automática basada en palabras clave
      const query = searchQuery.toLowerCase().trim();
      let category: TagCategory = 'custom';
      
      if (query.includes('bug') || query.includes('error') || query.includes('fix')) {
        category = 'priority';
      } else if (query.includes('react') || query.includes('js') || query.includes('css') || query.includes('html')) {
        category = 'technology';
      } else if (query.includes('backend') || query.includes('frontend') || query.includes('api') || query.includes('database')) {
        category = 'technical';
      } else if (query.includes('user') || query.includes('admin') || query.includes('auth')) {
        category = 'module';
      }

      try {
        const newTag = await createTag({
          name: searchQuery.trim(),
          description: `Etiqueta creada automáticamente`,
          color: randomColor,
          category: category
        });

        if (newTag) {
          onTagsChange([...selectedTagIds, newTag.id]);
          setSearchQuery(''); // Limpiar búsqueda después de crear
        }
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    }
  };

  const TagBadge: React.FC<{ tag: SolutionTag; onRemove?: () => void; onClick?: () => void }> = ({
    tag,
    onRemove,
    onClick,
  }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
        onClick ? 'hover:opacity-80 hover:scale-105' : ''
      } ${onRemove ? 'hover:shadow-md' : ''}`}
      style={{ backgroundColor: tag.color + '20', color: tag.color }}
      onClick={onClick}
      title={tag.description || tag.name} // Tooltip con descripción
    >
      <Tag className="h-3 w-3" />
      <span className="max-w-24 truncate">{tag.name}</span>
      {tag.category && (
        <span className="text-xs opacity-70 ml-1">({tag.category})</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
          title="Eliminar etiqueta"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Etiquetas seleccionadas */}
        {selectedTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiquetas Seleccionadas ({selectedTags.length})
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              {selectedTags.map((tag: any) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => handleRemoveTag(tag.id)}
                />
              ))}
              <button
                onClick={() => onTagsChange([])}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline ml-2"
              >
                Limpiar todas
              </button>
            </div>
          </div>
        )}

        {/* Etiquetas disponibles con búsqueda y creación instantánea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Etiquetas Disponibles
          </label>
          
          {/* Campo de búsqueda con creación instantánea */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Buscar etiquetas${searchQuery.trim() && !exactMatch ? ' o presiona Enter para crear nueva...' : '...'}`}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery.trim() && !exactMatch && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Enter para crear
                </span>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-sm text-gray-500">Cargando etiquetas...</div>
          ) : filteredAvailableTags.length === 0 && searchQuery.trim() ? (
            <div className="text-sm text-gray-500 italic p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              {exactMatch ? 
                `La etiqueta "${searchQuery}" ya existe` : 
                `Presiona Enter para crear la etiqueta "${searchQuery}"`
              }
            </div>
          ) : (
            <>
              {filteredAvailableTags.length > 0 && (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    {filteredAvailableTags.length} etiqueta{filteredAvailableTags.length !== 1 ? 's' : ''} encontrada{filteredAvailableTags.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                    {filteredAvailableTags.map((tag: any) => (
                      <TagBadge
                        key={tag.id}
                        tag={tag}
                        onClick={() => handleAddTag(tag.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Instrucciones de uso */}
        {!searchQuery.trim() && filteredAvailableTags.length === 0 && !isLoading && (
          <div className="text-sm text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
            💡 <strong>Consejo:</strong> Escribe el nombre de una etiqueta y presiona Enter para crearla automáticamente
          </div>
        )}
      </div>
    </div>
  );
};
