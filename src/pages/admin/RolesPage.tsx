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
import { PageWrapper } from '@/components/PageWrapper';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useNotification } from '@/components/NotificationSystem';

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
  const { showSuccess, showError } = useNotification();

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
        showSuccess('Rol actualizado exitosamente');
      } else {
        await createRole.mutateAsync(formData);
        showSuccess('Rol creado exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      showError('Error al guardar rol', error instanceof Error ? error.message : 'Error desconocido');
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

  // Mejorar la organización y presentación de permisos
  const getResourceDisplayName = (resource: string): string => {
    const resourceNames: Record<string, string> = {
      'admin': '👑 Panel de Administración',
      'users': '👥 Gestión de Usuarios',
      'roles': '🛡️ Gestión de Roles',
      'permissions': '🔐 Gestión de Permisos',
      'cases': '📋 Gestión de Casos',
      'case_control': '⏱️ Control de Tiempo de Casos',
      'aplicaciones': '📱 Gestión de Aplicaciones',
      'origenes': '🔗 Gestión de Orígenes',
      'todos': '✅ Gestión de TODOs',
      'todo_priorities': '⚡ Prioridades de TODO',
      'todo_control': '⏰ Control de Tiempo TODO',
      'notes': '📝 Gestión de Notas',
      'system': '🔧 Sistema'
    };
    return resourceNames[resource] || `📁 ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
  };

  const getActionDisplayName = (action: string): string => {
    const actionNames: Record<string, string> = {
      'access': '� Acceso',
      'read': '👁️ Lectura',
      'view': '👁️ Visualización',
      'view_all': '👁️ Ver Todos',
      'view_own': '👁️ Ver Propios',
      'create': '➕ Crear',
      'edit': '✏️ Editar',
      'edit_all': '✏️ Editar Todos',
      'update': '✏️ Actualizar',
      'delete': '🗑️ Eliminar',
      'delete_all': '🗑️ Eliminar Todos',
      'manage': '⚙️ Gestionar',
      'assign': '👤 Asignar',
      'archive': '📦 Archivar',
      'export': '📤 Exportar',
      'associate_cases': '🔗 Asociar Casos',
      'manage_tags': '🏷️ Gestionar Etiquetas',
      'view_team': '👥 Ver Equipo',
      'time_tracking': '⏱️ Control de Tiempo'
    };
    return actionNames[action] || `🔧 ${action.charAt(0).toUpperCase() + action.slice(1)}`;
  };

  // Función para obtener el alcance del permiso (own/all)
  const getPermissionScope = (permission: any): string => {
    if (permission.name.includes('.own')) return ' (Propios)';
    if (permission.name.includes('.all')) return ' (Todos)';
    if (permission.name.includes('view_all')) return ' (Global)';
    if (permission.name.includes('view_own')) return ' (Propios)';
    return '';
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
      size="2xl"
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

        {/* Permisos Mejorados */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              🔐 Permisos del Rol
            </h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formData.permissionIds.length} permisos seleccionados
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <div key={resource} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-base">
                    {getResourceDisplayName(resource)}
                  </h5>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full font-medium">
                    {resourcePermissions.length} permisos
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {resourcePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-100 dark:border-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getActionDisplayName(permission.action)}{getPermissionScope(permission)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {permission.description || `Permiso para ${permission.action} en ${permission.resource}`}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono">
                            {permission.name}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedPermissions).length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay permisos disponibles
                  </p>
                </div>
              </div>
            )}
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
  const { canManageRoles, canViewRoles } = usePermissions();
  const { data: roles, isLoading, error } = useRoles();
  const deleteRole = useDeleteRole();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  
  // Estado para modal de confirmación de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({
    isOpen: false,
    role: null
  });

  // Verificar permisos
  if (!canViewRoles() && !canManageRoles()) {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para ver roles.
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

  const handleDelete = (role: Role) => {
    setDeleteModal({
      isOpen: true,
      role: role
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.role) {
      try {
        await deleteRole.mutateAsync(deleteModal.role.id);
        showSuccess('Rol eliminado exitosamente');
        setDeleteModal({ isOpen: false, role: null });
      } catch (error) {
        console.error('Error deleting role:', error);
        showError('Error al eliminar rol', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, role: null });
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
    <PageWrapper>
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
      <div className="relative max-w-md">
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
      <div className="table-card">
        <div className="table-overflow-container">
          <table className="full-width-table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Permisos
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuarios
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
            {filteredRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
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
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {role.permissions?.length || 0} permisos
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {role.userCount || 0} usuarios
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    role.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {role.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
        </div>

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

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el rol "${deleteModal.role?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
      />
    </PageWrapper>
  );
};
