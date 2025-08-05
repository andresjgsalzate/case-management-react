// ================================================================
// PÁGINA DE ASIGNACIÓN DE PERMISOS A ROLES
// ================================================================

import React, { useState } from 'react';
import { useRoles, useRole, useUpdateRolePermissions } from '../../shared/hooks/useRoles';
import { usePermissionsGroupedByResource } from '../../shared/hooks/usePermissions';
import { useNotification } from '../../shared/components/notifications/NotificationSystem';
import { Button, LoadingSpinner, Select, Input } from '../../shared';
import type { Permission } from '../../shared/types/permissions';

export function RolePermissionsPage() {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterScope, setFilterScope] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { showSuccess, showError } = useNotification();
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
      showSuccess('Permisos actualizados exitosamente');
    } catch (error) {
      console.error('Error updating role permissions:', error);
      showError('Error al actualizar los permisos', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  // Función para filtrar permisos
  const filterPermissions = (permissions: Permission[]) => {
    return permissions.filter(permission => {
      // Filtro por búsqueda de texto
      const matchesSearch = searchTerm === '' || 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.scope?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por módulo/recurso
      const matchesModule = filterModule === '' || permission.resource === filterModule;

      // Filtro por acción
      const matchesAction = filterAction === '' || permission.action === filterAction;

      // Filtro por scope
      const matchesScope = filterScope === '' || permission.scope === filterScope;

      return matchesSearch && matchesModule && matchesAction && matchesScope;
    });
  };

  // Obtener opciones únicas para los filtros
  const getUniqueResources = () => {
    if (!permissionsGrouped) return [];
    return Object.keys(permissionsGrouped).sort();
  };

  const getUniqueActions = () => {
    if (!permissionsGrouped) return [];
    const actions = new Set<string>();
    Object.values(permissionsGrouped).forEach(permissions => {
      permissions.forEach(p => actions.add(p.action));
    });
    return Array.from(actions).sort();
  };

  const getUniqueScopes = () => {
    if (!permissionsGrouped) return [];
    const scopes = new Set<string>();
    Object.values(permissionsGrouped).forEach(permissions => {
      permissions.forEach(p => {
        if (p.scope) scopes.add(p.scope);
      });
    });
    return Array.from(scopes).sort();
  };

  const isLoading = rolesLoading || roleLoading || permissionsLoading;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Asignar Permisos a Roles</h1>
      
      {/* Selector de rol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Configurando permisos para: {roleData.name}
            </h2>
            {roleData.description && (
              <p className="text-blue-700 dark:text-blue-300">{roleData.description}</p>
            )}
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Total de permisos seleccionados: {selectedPermissions.size}
            </p>
          </div>

          {/* Filtros de permisos */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filtros de Permisos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <Input
                  type="text"
                  placeholder="Buscar permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Módulo/Recurso
                </label>
                <Select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full"
                >
                  <option value="">Todos los módulos</option>
                  {getUniqueResources().map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Acción
                </label>
                <Select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full"
                >
                  <option value="">Todas las acciones</option>
                  {getUniqueActions().map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scope
                </label>
                <Select
                  value={filterScope}
                  onChange={(e) => setFilterScope(e.target.value)}
                  className="w-full"
                >
                  <option value="">Todos los scopes</option>
                  {getUniqueScopes().map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Botones de filtro rápido */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterModule('');
                  setFilterAction('');
                  setFilterScope('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1"
              >
                Limpiar Filtros
              </Button>
              <Button
                onClick={() => setFilterAction('read')}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1"
              >
                Solo Lectura
              </Button>
              <Button
                onClick={() => setFilterAction('write')}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
              >
                Solo Escritura
              </Button>
              <Button
                onClick={() => setFilterAction('delete')}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
              >
                Solo Eliminación
              </Button>
            </div>
          </div>

          {/* Lista de permisos agrupados por recurso */}
          {permissionsGrouped && (
            <div className="space-y-4">
              {Object.entries(permissionsGrouped).map(([resource, permissions]) => {
                const filteredPermissions = filterPermissions(permissions);
                
                // Solo mostrar el recurso si tiene permisos después del filtrado
                if (filteredPermissions.length === 0) return null;
                
                return (
                  <div key={resource} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                          {resource}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {filteredPermissions.length} permisos
                        </span>
                      </div>
                      <Button
                        onClick={() => handleSelectAllForResource(filteredPermissions)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        {filteredPermissions.every(p => selectedPermissions.has(p.id)) 
                          ? 'Deseleccionar todos' 
                          : 'Seleccionar todos'
                        }
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {permission.action}
                            </span>
                            {permission.scope && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                {permission.scope}
                              </span>
                            )}
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {permission.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {permission.name}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setSelectedRoleId('')}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No se pudo cargar la información del rol
        </div>
      )}

      {!isLoading && !selectedRoleId && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Seleccione un rol para configurar sus permisos
        </div>
      )}
    </div>
  );
}
