/**
 * =================================================================
 * COMPONENTE: ADMINISTRACIÓN DE TIPOS DE DOCUMENTOS
 * =================================================================
 * Descripción: Panel administrativo para gestionar tipos de documentos
 * Versión: 1.0
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { useDocumentTypes } from '../../hooks/useDocumentTypes';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import type { CreateDocumentTypeRequest, UpdateDocumentTypeRequest, DocumentType } from '../../services/documentTypesService';

interface DocumentTypeFormData {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
}

const ICON_OPTIONS = [
  { value: '📋', label: '📋 Procedimiento' },
  { value: '✅', label: '✅ Solución' },
  { value: '📚', label: '📚 Guía' },
  { value: '❓', label: '❓ FAQ' },
  { value: '📄', label: '📄 Plantilla' },
  { value: '⚠️', label: '⚠️ Alerta' },
  { value: '🔧', label: '🔧 Configuración' },
  { value: '📖', label: '📖 Manual' },
  { value: '🚨', label: '🚨 Crítico' },
  { value: '📝', label: '📝 Documentación' },
  { value: '🔄', label: '🔄 Proceso' },
  { value: '📊', label: '📊 Reporte' },
  { value: '🎯', label: '🎯 Objetivo' },
  { value: '💡', label: '💡 Tip' },
  { value: '🔒', label: '🔒 Seguridad' },
];

const COLOR_OPTIONS = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const DocumentTypesAdmin: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  const {
    allTypes,
    isLoadingAll,
    allTypesError,
    createType,
    updateType,
    activateType,
    deactivateType,
    deleteType,
    updateDisplayOrder,
    checkCodeAvailability,
    isCreating,
    isUpdating,
    refetchAll
  } = useDocumentTypes();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentTypeFormData>({
    code: '',
    name: '',
    description: '',
    icon: '📄',
    color: '#6B7280',
    display_order: 0,
  });
  const [isReordering, setIsReordering] = useState(false);
  const [reorderData, setReorderData] = useState<Array<{ id: string; display_order: number }>>([]);

  // Estados para modales de confirmación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: DocumentType | null;
  }>({
    isOpen: false,
    type: null
  });

  const [toggleModal, setToggleModal] = useState<{
    isOpen: boolean;
    type: DocumentType | null;
    action: 'activate' | 'deactivate';
  }>({
    isOpen: false,
    type: null,
    action: 'activate'
  });

  // ===== HANDLERS =====

  const handleCreate = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      icon: '📄',
      color: '#6B7280',
      display_order: Math.max(...allTypes.map(t => t.display_order), 0) + 1,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (typeId: string) => {
    const type = allTypes.find(t => t.id === typeId);
    if (type) {
      setFormData({
        code: type.code,
        name: type.name,
        description: type.description || '',
        icon: type.icon || '📄',
        color: type.color,
        display_order: type.display_order,
      });
      setEditingType(typeId);
      setShowCreateModal(true);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validar código disponible
      if (editingType) {
        const isAvailable = await checkCodeAvailability({ 
          code: formData.code, 
          excludeId: editingType 
        });
        if (!isAvailable) {
          alert('El código ya está en uso por otro tipo de documento');
          return;
        }
      } else {
        const isAvailable = await checkCodeAvailability({ code: formData.code });
        if (!isAvailable) {
          alert('El código ya está en uso');
          return;
        }
      }

      if (editingType) {
        // Actualizar
        updateType({
          id: editingType,
          updates: formData as UpdateDocumentTypeRequest
        });
      } else {
        // Crear
        createType(formData as CreateDocumentTypeRequest);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar tipo de documento:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingType(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      icon: '📄',
      color: '#6B7280',
      display_order: 0,
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    const type = allTypes.find(t => t.id === id);
    if (type) {
      setToggleModal({
        isOpen: true,
        type: type,
        action: isActive ? 'deactivate' : 'activate'
      });
    }
  };

  const confirmToggleActive = async () => {
    if (toggleModal.type) {
      try {
        if (toggleModal.action === 'deactivate') {
          await deactivateType(toggleModal.type.id);
        } else {
          await activateType(toggleModal.type.id);
        }
        setToggleModal({ isOpen: false, type: null, action: 'activate' });
      } catch (error) {
        console.error('Error toggling type status:', error);
      }
    }
  };

  const cancelToggleActive = () => {
    setToggleModal({ isOpen: false, type: null, action: 'activate' });
  };

  const handleDelete = (id: string) => {
    const type = allTypes.find(t => t.id === id);
    if (type) {
      setDeleteModal({
        isOpen: true,
        type: type
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.type) {
      try {
        await deleteType(deleteModal.type.id);
        showSuccess('Tipo de documento eliminado exitosamente');
        setDeleteModal({ isOpen: false, type: null });
      } catch (error) {
        console.error('Error deleting type:', error);
        showError('Error al eliminar tipo de documento', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, type: null });
  };

  const handleStartReorder = () => {
    setIsReordering(true);
    setReorderData(allTypes.map(type => ({
      id: type.id,
      display_order: type.display_order
    })));
  };

  const handleSaveOrder = () => {
    updateDisplayOrder(reorderData);
    setIsReordering(false);
    setReorderData([]);
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setReorderData([]);
  };

  const moveTypeUp = (index: number) => {
    if (index > 0) {
      const newData = [...reorderData];
      [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
      // Actualizar display_order
      newData.forEach((item, idx) => {
        item.display_order = idx + 1;
      });
      setReorderData(newData);
    }
  };

  const moveTypeDown = (index: number) => {
    if (index < reorderData.length - 1) {
      const newData = [...reorderData];
      [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
      // Actualizar display_order
      newData.forEach((item, idx) => {
        item.display_order = idx + 1;
      });
      setReorderData(newData);
    }
  };

  // ===== RENDER =====

  if (isLoadingAll) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-sm text-gray-500">Cargando tipos de documentos...</span>
      </div>
    );
  }

  if (allTypesError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
        <p className="text-sm text-red-800 dark:text-red-200">
          Error al cargar tipos de documentos: {allTypesError.message}
        </p>
        <Button variant="outline" onClick={() => refetchAll()} className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tipos de Documentos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona los tipos de documentos disponibles en el sistema
          </p>
        </div>
        <div className="flex space-x-2">
          {!isReordering ? (
            <>
              <Button
                variant="outline"
                onClick={handleStartReorder}
                disabled={allTypes.length < 2}
              >
                🔄 Reordenar
              </Button>
              <Button onClick={handleCreate}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Tipo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelReorder}>
                ❌ Cancelar
              </Button>
              <Button onClick={handleSaveOrder}>
                💾 Guardar Orden
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lista de tipos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {(isReordering ? reorderData.map(item => allTypes.find(t => t.id === item.id)!).filter(Boolean) : allTypes)
                .map((type, index) => (
                <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg mr-3"
                        style={{ backgroundColor: type.color }}
                      >
                        {type.icon || '📄'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {type.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      type.is_active 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {type.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {isReordering ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveTypeUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <span>{index + 1}</span>
                        <button
                          onClick={() => moveTypeDown(index)}
                          disabled={index === reorderData.length - 1}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    ) : (
                      type.display_order
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!isReordering && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(type.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(type.id, type.is_active)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          {type.is_active ? "👁️‍🗨️" : "👁️"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de creación/edición */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title={editingType ? 'Editar Tipo de Documento' : 'Crear Tipo de Documento'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: solution, guide, faq"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: Solución, Guía, FAQ"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del tipo de documento"
            />
          </div>

          {/* Ícono y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ícono
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isCreating || isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.code || !formData.name || isCreating || isUpdating}
            >
              {editingType ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación de Cambio de Estado */}
      <ConfirmationModal
        isOpen={toggleModal.isOpen}
        title={`Confirmar ${toggleModal.action === 'activate' ? 'activación' : 'desactivación'}`}
        message={`¿Estás seguro de que quieres ${toggleModal.action === 'activate' ? 'activar' : 'desactivar'} el tipo "${toggleModal.type?.name}"?`}
        confirmText={toggleModal.action === 'activate' ? 'Activar' : 'Desactivar'}
        cancelText="Cancelar"
        onConfirm={confirmToggleActive}
        onClose={cancelToggleActive}
        type={toggleModal.action === 'activate' ? 'info' : 'warning'}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar permanentemente el tipo "${deleteModal.type?.name}"? Esta acción no se puede deshacer y solo es posible si no hay documentos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
      />
    </div>
  );
};
