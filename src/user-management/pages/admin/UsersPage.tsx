import React, { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useUsers, useUpdateUser, useDeleteUser } from '@/user-management/hooks/useUsers';
import { useRoles } from '@/user-management/hooks/useRoles';
import { mapRoleToDisplayName } from '@/shared/utils/roleUtils';
import { usePermissions } from '@/user-management/hooks/useUserProfile';
import { UserProfile, UserFormData } from '@/types';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const { data: roles } = useRoles();
  const updateUser = useUpdateUser();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    fullName: user?.fullName || '',
    roleId: user?.roleId || '',
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.roleId) {
      return; // Simplemente no continuar si faltan campos requeridos
    }

    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, userData: formData });
        showSuccess('Usuario actualizado exitosamente');
        onClose();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Error al actualizar usuario', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const resetForm = () => {
    setFormData({
      email: user?.email || '',
      fullName: user?.fullName || '',
      roleId: user?.roleId || '',
      isActive: user?.isActive ?? true,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, user]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={true} // No permitir cambiar email en edición
        />

        <Input
          label="Nombre Completo"
          value={formData.fullName || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })}
        />

        <Select
          label="Rol *"
          value={formData.roleId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, roleId: e.target.value })}
          required
        >
          <option value="">Seleccionar rol...</option>
          {roles?.filter(role => role.isActive).map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Usuario activo
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
            loading={updateUser.isPending}
          >
            Actualizar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const UsersPage: React.FC = () => {
  const { canManageUsers, canViewUsers } = usePermissions();
  const { data: users, isLoading, error } = useUsers();
  const { data: roles } = useRoles();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | undefined>();
  
  // Estado para modal de confirmación de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: UserProfile | null;
  }>({
    isOpen: false,
    user: null
  });

  // Función para activar usuario rápidamente (cambiar de 'user' a otro rol)
  const handleQuickActivate = async (user: UserProfile, newRoleName: string) => {
    const targetRole = roles?.find(role => role.name === newRoleName);
    if (!targetRole) {
      showError('Error', `No se encontró el rol ${newRoleName}`);
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: user.id,
        userData: {
          email: user.email,
          fullName: user.fullName,
          roleId: targetRole.id,
          isActive: true
        }
      });
      showSuccess('Usuario activado', `Usuario activado como ${newRoleName}`);
    } catch (error) {
      console.error('Error activating user:', error);
      showError('Error al activar usuario');
    }
  };

  // Verificar permisos
  if (!canViewUsers() && !canManageUsers()) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para ver usuarios.
        </p>
      </div>
    );
  }

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: UserProfile) => {
    setDeleteModal({
      isOpen: true,
      user: user
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.user) {
      try {
        await deleteUser.mutateAsync(deleteModal.user.id);
        showSuccess('Usuario eliminado exitosamente');
        setDeleteModal({ isOpen: false, user: null });
      } catch (error) {
        console.error('Error deleting user:', error);
        showError('Error al eliminar usuario', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, user: null });
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
          Error al cargar usuarios: {error.message}
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
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra los usuarios registrados y sus roles. Los usuarios se registran por su cuenta y tú los activas.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="table-overflow-container">
          <table className="full-width-table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Activación
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.fullName || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.role?.name === 'user' && (
                      <ClockIcon className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role?.name === 'user' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : user.role?.name === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : user.role?.name === 'supervisor'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : user.role?.name === 'analista'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {user.role?.name === 'user' ? 'Pendiente' : mapRoleToDisplayName(user.role?.name) || 'Sin rol'}
                    </span>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  {user.role?.name === 'user' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickActivate(user, 'analista')}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                        disabled={updateUser.isPending}
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Analista
                      </button>
                      <button
                        onClick={() => handleQuickActivate(user, 'supervisor')}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                        disabled={updateUser.isPending}
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Supervisor
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Activado
                    </div>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {canManageUsers() && (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {!canManageUsers() && canViewUsers() && (
                      <span className="text-gray-400 text-sm">Solo lectura</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              No hay usuarios registrados
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron usuarios que coincidan con tu búsqueda.' : 'Los usuarios deben registrarse por su cuenta y luego tú los activarás.'}
            </p>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar al usuario ${deleteModal.user?.email}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
      />
    </PageWrapper>
  );
};
