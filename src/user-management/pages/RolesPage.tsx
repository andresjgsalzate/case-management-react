// ================================================================
// PÁGINA DE GESTIÓN DE ROLES
// ================================================================

import React, { useState } from 'react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, useAllRolesStats } from '../../shared/hooks/useRoles';
import { Button, Input, Modal, LoadingSpinner } from '../../shared';
import { ConfirmationModal } from '../../shared/components/ui/ConfirmationModal';
import { useNotification } from '../../shared/components/notifications/NotificationSystem';
import type { Role, CreateRoleData, UpdateRoleData } from '../../shared/types/permissions';

export function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({
    isOpen: false,
    role: null
  });

  // Hooks
  const { showSuccess, showError } = useNotification();
  const { data: rolesData, isLoading, error } = useRoles({ 
    search: searchTerm,
    is_active: true 
  });
  const { data: rolesStats, isLoading: isLoadingStats } = useAllRolesStats();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // Handlers
  const handleCreateRole = async (data: CreateRoleData) => {
    try {
      await createRoleMutation.mutateAsync(data);
      showSuccess('Rol creado exitosamente');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating role:', error);
      showError('Error al crear rol', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleUpdateRole = async (data: UpdateRoleData) => {
    try {
      await updateRoleMutation.mutateAsync(data);
      showSuccess('Rol actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Error al actualizar rol', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModal({
      isOpen: true,
      role: role
    });
  };

  const confirmDeleteRole = async () => {
    if (deleteModal.role) {
      try {
        await deleteRoleMutation.mutateAsync(deleteModal.role.id);
        showSuccess('Rol eliminado exitosamente');
        setDeleteModal({ isOpen: false, role: null });
      } catch (error) {
        console.error('Error deleting role:', error);
        showError('Error al eliminar rol', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const cancelDeleteRole = () => {
    setDeleteModal({ isOpen: false, role: null });
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>
        <div className="text-red-600 text-center">
          Error al cargar los roles: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>
      
      {/* Resumen estadístico */}
      {rolesData && rolesStats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.196M7 20v-2m5-8a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-semibold text-gray-900">{rolesData.roles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios Asignados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingStats ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    Object.values(rolesStats || {}).reduce((sum, stats) => sum + stats.userCount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Permisos Asignados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingStats ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    Object.values(rolesStats || {}).reduce((sum, stats) => sum + stats.permissionCount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header con búsqueda y botón crear */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Crear Rol
        </Button>
      </div>

      {/* Lista de roles */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rolesData?.roles.map((role) => (
            <li key={role.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {role.name}
                    </h3>
                    {role.is_active ? (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                  )}
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {isLoadingStats ? (
                        <>
                          <div className="inline-block w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="inline-block w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rolesStats?.[role.id]?.permissionCount || 0} Permisos
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {rolesStats?.[role.id]?.userCount || 0} Usuarios
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Creado: {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditModal(role)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteRole(role)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                    disabled={deleteRoleMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {(!rolesData?.roles || rolesData.roles.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron roles
          </div>
        )}
      </div>

      {/* Modal Crear Rol */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRole}
        isLoading={createRoleMutation.isPending}
      />

      {/* Modal Editar Rol */}
      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRole(null);
        }}
        onSubmit={handleUpdateRole}
        isLoading={updateRoleMutation.isPending}
        role={selectedRole}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar el rol "${deleteModal.role?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteRole}
        onClose={cancelDeleteRole}
        type="danger"
      />
    </div>
  );
}

// ================================================================
// MODAL CREAR ROL
// ================================================================
interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleData) => void;
  isLoading: boolean;
}

function CreateRoleModal({ isOpen, onClose, onSubmit, isLoading }: CreateRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Rol">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Rol *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej: supervisor, analyst"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del rol..."
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
            Rol activo
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
            {isLoading ? 'Creando...' : 'Crear Rol'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ================================================================
// MODAL EDITAR ROL
// ================================================================
interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateRoleData) => void;
  isLoading: boolean;
  role: Role | null;
}

function EditRoleModal({ isOpen, onClose, onSubmit, isLoading, role }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  React.useEffect(() => {
    if (role && isOpen) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        is_active: role.is_active ?? true
      });
    }
  }, [role, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      onSubmit({
        id: role.id,
        ...formData
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Rol">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Rol *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej: supervisor, analyst"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del rol..."
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
            Rol activo
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
            {isLoading ? 'Actualizando...' : 'Actualizar Rol'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
