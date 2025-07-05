import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useRoles';
import { usePermissions as usePermissionsData } from '@/hooks/usePermissions';
import { usePermissions } from '@/hooks/useUserProfile';
import { Role, RoleFormData } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  isEdit?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, isEdit = false }) => {
  const { data: permissions } = usePermissionsData();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [formData, setFormData] = useState<RoleFormData>({
    name: role?.name || '',
    description: role?.description || '',
    isActive: role?.isActive ?? true,
    permissionIds: role?.permissions?.map(p => p.id) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return; // Simplemente no continuar si falta el nombre
    }

    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({ id: role.id, roleData: formData });
      } else {
        await createRole.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: role?.name || '',
      description: role?.description || '',
      isActive: role?.isActive ?? true,
      permissionIds: role?.permissions?.map(p => p.id) || [],
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, role]);

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  // Agrupar permisos por recurso
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>) || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Rol' : 'Crear Rol'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nombre del Rol *"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
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
              placeholder="Descripción del rol..."
            />
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
              Rol activo
            </label>
          </div>
        </div>

        {/* Permisos */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Permisos
          </h4>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <div key={resource} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                  {resource}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {resourcePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {permission.action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            loading={createRole.isPending || updateRole.isPending}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const RolesPage: React.FC = () => {
  const { canManageRoles } = usePermissions();
  const { data: roles, isLoading, error } = useRoles();
  const deleteRole = useDeleteRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [isEdit, setIsEdit] = useState(false);

  // Verificar permisos
  if (!canManageRoles()) {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para gestionar roles.
        </p>
      </div>
    );
  }

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRole(undefined);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.name}"?`)) {
      try {
        await deleteRole.mutateAsync(role.id);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
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
          Error al cargar roles: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra los roles del sistema y sus permisos
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Permisos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {role.description || 'Sin descripción'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {role.permissions?.length || 0} permisos
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {role.userCount || 0} usuarios
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    role.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {role.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
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

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              No hay roles
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron roles que coincidan con tu búsqueda.' : 'Comienza creando un nuevo rol.'}
            </p>
          </div>
        )}
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
        isEdit={isEdit}
      />
    </div>
  );
};
