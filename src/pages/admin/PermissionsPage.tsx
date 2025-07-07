import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { usePermissions as usePermissionsData, useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/usePermissions';
import { usePermissions } from '@/hooks/useUserProfile';
import { Permission, PermissionFormData } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { PageWrapper } from '@/components/PageWrapper';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useNotification } from '@/components/NotificationSystem';

// Opciones predefinidas para recursos y acciones
const RESOURCE_OPTIONS = [
  'users',
  'roles',
  'permissions',
  'cases',
  'origenes',
  'aplicaciones',
  'admin',
];

const ACTION_OPTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'manage',
  'view_all',
  'access',
];

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission?: Permission;
  isEdit?: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, permission, isEdit = false }) => {
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<PermissionFormData>({
    name: permission?.name || '',
    description: permission?.description || '',
    resource: permission?.resource || '',
    action: permission?.action || '',
    isActive: permission?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.resource || !formData.action) {
      return; // Simplemente no continuar si faltan campos requeridos
    }

    try {
      if (isEdit && permission) {
        await updatePermission.mutateAsync({ id: permission.id, permissionData: formData });
        showSuccess('Permiso actualizado exitosamente');
      } else {
        await createPermission.mutateAsync(formData);
        showSuccess('Permiso creado exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
      showError('Error al guardar permiso', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const resetForm = () => {
    setFormData({
      name: permission?.name || '',
      description: permission?.description || '',
      resource: permission?.resource || '',
      action: permission?.action || '',
      isActive: permission?.isActive ?? true,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, permission]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Permiso' : 'Crear Permiso'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Permiso *"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="ej. Gestionar usuarios"
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="Descripción del permiso..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Recurso *"
            value={formData.resource}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, resource: e.target.value })}
            required
          >
            <option value="">Seleccionar recurso...</option>
            {RESOURCE_OPTIONS.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </Select>

          <Select
            label="Acción *"
            value={formData.action}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, action: e.target.value })}
            required
          >
            <option value="">Seleccionar acción...</option>
            {ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Permiso activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={createPermission.isPending || updatePermission.isPending}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const PermissionsPage: React.FC = () => {
  const { canManagePermissions, canViewPermissions } = usePermissions();
  const { data: permissions, isLoading, error } = usePermissionsData();
  const deletePermission = useDeletePermission();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  
  // Estado para modal de confirmación de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    permission: Permission | null;
  }>({
    isOpen: false,
    permission: null
  });

  // Verificar permisos
  if (!canViewPermissions() && !canManagePermissions()) {
    return (
      <div className="text-center py-12">
        <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para ver permisos.
        </p>
      </div>
    );
  }

  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = resourceFilter === '' || permission.resource === resourceFilter;
    
    return matchesSearch && matchesResource;
  }) || [];

  // Obtener recursos únicos para el filtro
  const uniqueResources = [...new Set(permissions?.map(p => p.resource) || [])].sort();

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPermission(undefined);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setDeleteModal({
      isOpen: true,
      permission: permission
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.permission) {
      try {
        await deletePermission.mutateAsync(deleteModal.permission.id);
        showSuccess('Permiso eliminado exitosamente');
        setDeleteModal({ isOpen: false, permission: null });
      } catch (error) {
        console.error('Error deleting permission:', error);
        showError('Error al eliminar permiso', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, permission: null });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar permisos: {error.message}
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Permisos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra los permisos del sistema
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
        <div className="search-container">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={resourceFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setResourceFilter(e.target.value)}
        >
          <option value="">Todos los recursos</option>
          {uniqueResources.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </Select>
      </div>

      {/* Permissions Table */}
      <div className="table-card">
        <div className="table-overflow-container">
          <table className="full-width-table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Permiso
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Recurso
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acción
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPermissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <KeyIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {permission.description || 'Sin descripción'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {permission.resource}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {permission.action}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    permission.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {permission.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(permission)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(permission)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredPermissions.length === 0 && (
          <div className="text-center py-12">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              No hay permisos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || resourceFilter ? 'No se encontraron permisos que coincidan con los filtros.' : 'Comienza creando un nuevo permiso.'}
            </p>
          </div>
        )}
      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        permission={selectedPermission}
        isEdit={isEdit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el permiso "${deleteModal.permission?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
      />
    </PageWrapper>
  );
};
