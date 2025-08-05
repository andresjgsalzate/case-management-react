// ================================================================
// PÁGINA DE ASIGNACIÓN DE PERMISOS A ROLES
// ================================================================

import React, { useState } from 'react';
import { useRoles, useRole, useUpdateRolePermissions } from '../../shared/hooks/useRoles';
import { usePermissionsGroupedByResource } from '../../shared/hooks/usePermissions';
import { Button, LoadingSpinner, Select } from '../../shared';
import type { Permission } from '../../shared/types/permissions';

export function RolePermissionsPage() {
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Hooks
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ is_active: true });
  const { data: roleData, isLoading: roleLoading } = useRole(selectedRoleId);
  const { data: permissionsGrouped, isLoading: permissionsLoading } = usePermissionsGroupedByResource();
  const updateRolePermissionsMutation = useUpdateRolePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // Actualizar permisos seleccionados cuando cambia el rol
  React.useEffect(() => {
    if (roleData?.permissions) {
      setSelectedPermissions(new Set(roleData.permissions.map(p => p.id)));
    } else {
      setSelectedPermissions(new Set());
    }
  }, [roleData]);

  const handlePermissionToggle = (permissionId: string) => {
    const newSelectedPermissions = new Set(selectedPermissions);
    if (newSelectedPermissions.has(permissionId)) {
      newSelectedPermissions.delete(permissionId);
    } else {
      newSelectedPermissions.add(permissionId);
    }
    setSelectedPermissions(newSelectedPermissions);
  };

  const handleSelectAllForResource = (permissions: Permission[]) => {
    const newSelectedPermissions = new Set(selectedPermissions);
    const allSelected = permissions.every(p => newSelectedPermissions.has(p.id));
    
    if (allSelected) {
      // Deseleccionar todos los permisos de este recurso
      permissions.forEach(p => newSelectedPermissions.delete(p.id));
    } else {
      // Seleccionar todos los permisos de este recurso
      permissions.forEach(p => newSelectedPermissions.add(p.id));
    }
    
    setSelectedPermissions(newSelectedPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;

    try {
      await updateRolePermissionsMutation.mutateAsync({
        roleId: selectedRoleId,
        permissionIds: Array.from(selectedPermissions)
      });
      alert('Permisos actualizados exitosamente');
    } catch (error) {
      console.error('Error updating role permissions:', error);
      alert('Error al actualizar los permisos');
    }
  };

  const isLoading = rolesLoading || roleLoading || permissionsLoading;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Asignar Permisos a Roles</h1>
      
      {/* Selector de rol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Rol
        </label>
        <Select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="w-full max-w-md"
        >
          <option value="">Seleccione un rol...</option>
          {rolesData?.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} - {role.description || 'Sin descripción'}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && selectedRoleId && roleData && (
        <div className="space-y-6">
          {/* Información del rol */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Configurando permisos para: {roleData.name}
            </h2>
            {roleData.description && (
              <p className="text-blue-700">{roleData.description}</p>
            )}
            <p className="text-sm text-blue-600 mt-1">
              Total de permisos seleccionados: {selectedPermissions.size}
            </p>
          </div>

          {/* Lista de permisos agrupados por recurso */}
          {permissionsGrouped && (
            <div className="space-y-4">
              {Object.entries(permissionsGrouped).map(([resource, permissions]) => (
                <div key={resource} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {resource}
                    </h3>
                    <Button
                      onClick={() => handleSelectAllForResource(permissions)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {permissions.every(p => selectedPermissions.has(p.id)) 
                        ? 'Deseleccionar todos' 
                        : 'Seleccionar todos'
                      }
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {permission.action}
                            </span>
                            {permission.scope && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {permission.scope}
                              </span>
                            )}
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {permission.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {permission.name}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              onClick={() => setSelectedRoleId('')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updateRolePermissionsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateRolePermissionsMutation.isPending ? 'Guardando...' : 'Guardar Permisos'}
            </Button>
          </div>
        </div>
      )}

      {!isLoading && selectedRoleId && !roleData && (
        <div className="text-center py-8 text-gray-500">
          No se pudo cargar la información del rol
        </div>
      )}

      {!isLoading && !selectedRoleId && (
        <div className="text-center py-8 text-gray-500">
          Seleccione un rol para configurar sus permisos
        </div>
      )}
    </div>
  );
}
