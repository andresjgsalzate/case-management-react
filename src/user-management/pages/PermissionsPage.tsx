// ================================================================
// PÁGINA DE GESTIÓN DE PERMISOS
// ================================================================

import React, { useState } from 'react';
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission, useResources, useActions } from '../../shared/hooks/usePermissions';
import { Button, Input, Modal, LoadingSpinner, Select } from '../../shared';
import type { Permission, CreatePermissionData, UpdatePermissionData } from '../../shared/types/permissions';

export function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Hooks
  const { data: permissionsData, isLoading, error } = usePermissions({ 
    search: searchTerm,
    resource: filterResource || undefined,
    action: filterAction || undefined,
    is_active: true 
  });
  const { data: resources } = useResources();
  const { data: actions } = useActions();
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  // Handlers
  const handleCreatePermission = async (data: CreatePermissionData) => {
    try {
      await createPermissionMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  const handleUpdatePermission = async (data: UpdatePermissionData) => {
    try {
      await updatePermissionMutation.mutateAsync(data);
      setIsEditModalOpen(false);
      setSelectedPermission(null);
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este permiso?')) {
      try {
        await deletePermissionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Permisos</h1>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Permisos</h1>
        <div className="text-red-600 text-center">
          Error al cargar los permisos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Permisos</h1>
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="w-full"
          >
            <option value="">Todos los recursos</option>
            {resources?.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full"
          >
            <option value="">Todas las acciones</option>
            {actions?.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            + Crear Permiso
          </Button>
        </div>
      </div>

      {/* Lista de permisos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {permissionsData?.permissions.map((permission) => (
            <li key={permission.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {permission.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {permission.resource}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {permission.action}
                    </span>
                    {permission.scope && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {permission.scope}
                      </span>
                    )}
                    {permission.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {permission.description && (
                    <p className="mt-1 text-sm text-gray-600">{permission.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Creado: {new Date(permission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditModal(permission)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeletePermission(permission.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                    disabled={deletePermissionMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {(!permissionsData?.permissions || permissionsData.permissions.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron permisos
          </div>
        )}
      </div>

      {/* Modal Crear Permiso */}
      <CreatePermissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePermission}
        isLoading={createPermissionMutation.isPending}
      />

      {/* Modal Editar Permiso */}
      <EditPermissionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPermission(null);
        }}
        onSubmit={handleUpdatePermission}
        isLoading={updatePermissionMutation.isPending}
        permission={selectedPermission}
      />
    </div>
  );
}

// ================================================================
// MODAL CREAR PERMISO
// ================================================================
interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePermissionData) => void;
  isLoading: boolean;
}

function CreatePermissionModal({ isOpen, onClose, onSubmit, isLoading }: CreatePermissionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    scope: '' as '' | 'own' | 'team' | 'all',
    is_active: true
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        resource: '',
        action: '',
        scope: '',
        is_active: true
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      scope: formData.scope || undefined
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Permiso">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Permiso *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej: users.read, cases.create"
            required
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurso *
            </label>
            <Input
              type="text"
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              placeholder="ej: users, cases, notes"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción *
            </label>
            <Input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="ej: read, create, update, delete"
              required
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alcance
          </label>
          <Select
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
            className="w-full"
          >
            <option value="">Sin alcance específico</option>
            <option value="own">Solo propio</option>
            <option value="team">Equipo</option>
            <option value="all">Todos</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del permiso..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Permiso activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Creando...' : 'Crear Permiso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ================================================================
// MODAL EDITAR PERMISO
// ================================================================
interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePermissionData) => void;
  isLoading: boolean;
  permission: Permission | null;
}

function EditPermissionModal({ isOpen, onClose, onSubmit, isLoading, permission }: EditPermissionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    scope: '' as '' | 'own' | 'team' | 'all',
    is_active: true
  });

  React.useEffect(() => {
    if (permission && isOpen) {
      setFormData({
        name: permission.name || '',
        description: permission.description || '',
        resource: permission.resource || '',
        action: permission.action || '',
        scope: permission.scope || '',
        is_active: permission.is_active ?? true
      });
    }
  }, [permission, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permission) {
      onSubmit({
        id: permission.id,
        ...formData,
        scope: formData.scope || undefined
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Permiso">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Permiso *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej: users.read, cases.create"
            required
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurso *
            </label>
            <Input
              type="text"
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              placeholder="ej: users, cases, notes"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción *
            </label>
            <Input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="ej: read, create, update, delete"
              required
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alcance
          </label>
          <Select
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
            className="w-full"
          >
            <option value="">Sin alcance específico</option>
            <option value="own">Solo propio</option>
            <option value="team">Equipo</option>
            <option value="all">Todos</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del permiso..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="edit_is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-900">
            Permiso activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Permiso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
