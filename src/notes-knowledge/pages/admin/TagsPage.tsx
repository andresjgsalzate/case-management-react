/**
 * =================================================================
 * PÁGINA: ADMINISTRACIÓN DE ETIQUETAS
 * =================================================================
 * Descripción: Página CRUD para gestionar etiquetas del sistema
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useTags } from '@/notes-knowledge/hooks/useTags';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import type { SolutionTag, TagCategory } from '@/notes-knowledge/types';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: SolutionTag;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, tag }) => {
  const { createTag, updateTag } = useTags();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: tag?.name || '',
    description: tag?.description || '',
    category: tag?.category || 'custom' as TagCategory,
    color: tag?.color || '#6B7280',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('El nombre de la etiqueta es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tag) {
        await updateTag.mutateAsync({ 
          id: tag.id, 
          data: formData 
        });
        showSuccess('Etiqueta actualizada correctamente');
      } else {
        await createTag.mutateAsync(formData);
        showSuccess('Etiqueta creada correctamente');
      }
      onClose();
    } catch (error) {
      showError(tag ? 'Error al actualizar la etiqueta' : 'Error al crear la etiqueta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      color: '#6B7280',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={tag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nombre de la etiqueta"
          required
        />
        
        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción opcional"
        />

        <Select
          label="Categoría *"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as TagCategory })}
          required
        >
          <option value="priority">Prioridad</option>
          <option value="technical">Técnico</option>
          <option value="type">Tipo</option>
          <option value="technology">Tecnología</option>
          <option value="module">Módulo</option>
          <option value="custom">Personalizado</option>
        </Select>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <div 
              className="px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: formData.color + '20', color: formData.color }}
            >
              <TagIcon className="h-4 w-4" />
              Vista previa
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (tag ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const TagsPage: React.FC = () => {
  const { tags, isLoading, deleteTag } = useTags();
  const { showSuccess, showError } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<SolutionTag | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<SolutionTag | undefined>();

  // Filtrar etiquetas por búsqueda
  const filteredTags = tags.filter((tag: SolutionTag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tag: SolutionTag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTag(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTag(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag.mutateAsync(tagToDelete.id);
      showSuccess('Etiqueta eliminada correctamente');
      setTagToDelete(undefined);
    } catch (error) {
      showError('Error al eliminar la etiqueta');
    }
  };

  const getCategoryDisplayName = (category: TagCategory) => {
    const names = {
      priority: 'Prioridad',
      technical: 'Técnico',
      type: 'Tipo',
      technology: 'Tecnología',
      module: 'Módulo',
      custom: 'Personalizado',
    };
    return names[category] || category;
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Cargando etiquetas...</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Administración de Etiquetas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona las etiquetas del sistema de documentación
            </p>
          </div>
          <Button onClick={handleCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Etiqueta
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar etiquetas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTags.length} etiqueta{filteredTags.length !== 1 ? 's' : ''} encontrada{filteredTags.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Lista de Etiquetas */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {filteredTags.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No se encontraron etiquetas' : 'No hay etiquetas creadas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Etiqueta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Uso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTags.map((tag: SolutionTag) => (
                    <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            <TagIcon className="h-4 w-4" />
                            {tag.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          {getCategoryDisplayName(tag.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {tag.description || <span className="text-gray-400 italic">Sin descripción</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tag.usage_count || 0} documento{(tag.usage_count || 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar etiqueta"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setTagToDelete(tag)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar etiqueta"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de creación/edición */}
      <TagModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tag={selectedTag}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(undefined)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Etiqueta"
        message={`¿Estás seguro de que deseas eliminar la etiqueta "${tagToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
};
