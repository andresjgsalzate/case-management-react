// ================================================================
// PÁGINA DE ASIGNACIÓN DE PERMISOS A ROLES
// ================================================================

import React, { useState } from 'react';
import { useRoles, useRole, useUpdateRolePermissions } from '../../shared/hooks/useRoles';
import { usePermissionsGroupedByResource } from '../../shared/hooks/usePermissions';
import { useNotification } from '../../shared/components/notifications/NotificationSystem';
import { Button, LoadingSpinner, Select, Input } from '../../shared';
import type { Permission } from '../../shared/types/permissions';
import { PermissionsGuide } from '../components/PermissionsGuide';

export function RolePermissionsPage() {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterScope, setFilterScope] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Mapeo de nombres técnicos a nombres amigables
  const moduleDisplayNames: Record<string, string> = {
    'users': '👥 Gestión de Usuarios',
    'cases': '📋 Gestión de Casos',
    'todos': '✅ Tareas y TODOs',
    'notes': '📝 Notas y Anotaciones',
    'config': '⚙️ Configuración del Sistema',
    'archive': '📦 Módulo de Archivo',
    'documentation': '📚 Documentación',
    'roles': '🔑 Gestión de Roles',
    'permissions': '🛡️ Gestión de Permisos',
    'audit': '📊 Auditoría y Logs',
    'reports': '📈 Reportes y Estadísticas',
    'notifications': '🔔 Notificaciones',
    'settings': '⚙️ Configuraciones',
    'dashboard': '🏠 Dashboard',
    'profile': '👤 Perfil de Usuario',
    'teams': '👥 Gestión de Equipos',
    'calendar': '📅 Calendario',
    'files': '📁 Gestión de Archivos',
    'backup': '💾 Respaldos',
    'security': '🔒 Seguridad',
    'system': '🖥️ Sistema'
  };

  // Mapeo de acciones técnicas a nombres amigables
  const actionDisplayNames: Record<string, string> = {
    'read': '👁️ Ver/Leer',
    'create': '➕ Crear',
    'update': '✏️ Actualizar/Editar',
    'delete': '🗑️ Eliminar',
    'admin': '⚡ Administrar',
    'export': '📤 Exportar',
    'import': '📥 Importar',
    'assign': '👉 Asignar',
    'control': '🎮 Controlar',
    'approve': '✅ Aprobar',
    'reject': '❌ Rechazar',
    'archive': '📦 Archivar',
    'publish': '📢 Publicar',
    'analytics': '📊 Analíticas',
    'manage_tags': '🏷️ Gestionar Etiquetas',
    'view': '👀 Visualizar',
    'download': '⬇️ Descargar',
    'upload': '⬆️ Subir',
    'backup': '💾 Respaldar',
    'restore': '🔄 Restaurar'
  };

  // Mapeo de scopes técnicos a nombres amigables
  const scopeDisplayNames: Record<string, string> = {
    'own': '👤 Solo Propios',
    'team': '👥 Del Equipo',
    'all': '🌐 Todos/Sistema Completo'
  };

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

  // Obtener opciones únicas para los filtros con nombres amigables
  const getUniqueResources = () => {
    if (!permissionsGrouped) return [];
    return Object.keys(permissionsGrouped)
      .sort()
      .map(resource => ({
        value: resource,
        label: moduleDisplayNames[resource] || `📄 ${resource.charAt(0).toUpperCase() + resource.slice(1)}`
      }));
  };

  const getUniqueActions = () => {
    if (!permissionsGrouped) return [];
    const actions = new Set<string>();
    Object.values(permissionsGrouped).forEach(permissions => {
      permissions.forEach(p => actions.add(p.action));
    });
    return Array.from(actions)
      .sort()
      .map(action => ({
        value: action,
        label: actionDisplayNames[action] || `🔧 ${action.charAt(0).toUpperCase() + action.slice(1)}`
      }));
  };

  const getUniqueScopes = () => {
    if (!permissionsGrouped) return [];
    const scopes = new Set<string>();
    Object.values(permissionsGrouped).forEach(permissions => {
      permissions.forEach(p => {
        if (p.scope) scopes.add(p.scope);
      });
    });
    return Array.from(scopes)
      .sort()
      .map(scope => ({
        value: scope,
        label: scopeDisplayNames[scope] || `🔍 ${scope.charAt(0).toUpperCase() + scope.slice(1)}`
      }));
  };

  // Función para formatear el nombre del permiso de manera más legible
  const formatPermissionName = (permission: Permission) => {
    const resourceName = moduleDisplayNames[permission.resource] || permission.resource;
    const actionName = actionDisplayNames[permission.action] || permission.action;
    const scopeName = permission.scope ? (scopeDisplayNames[permission.scope] || permission.scope) : '';
    
    return {
      resource: resourceName,
      action: actionName,
      scope: scopeName,
      display: `${actionName}${scopeName ? ` (${scopeName})` : ''}`
    };
  };

  // Función para contar permisos filtrados
  const getFilteredPermissionsCount = () => {
    if (!permissionsGrouped) return { total: 0, filtered: 0 };
    
    let total = 0;
    let filtered = 0;
    
    Object.values(permissionsGrouped).forEach(permissions => {
      total += permissions.length;
      filtered += filterPermissions(permissions).length;
    });
    
    return { total, filtered };
  };

  const isLoading = rolesLoading || roleLoading || permissionsLoading;

  return (
    <div className="p-6">
      {/* Header con título y botón de guía */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asignar Permisos a Roles</h1>
        
        <Button
          onClick={() => setShowGuide(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Guía de Permisos</span>
        </Button>
      </div>
      
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
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Permisos seleccionados: <span className="font-semibold">{selectedPermissions.size}</span>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Mostrando: <span className="font-semibold">{getFilteredPermissionsCount().filtered}</span> de <span className="font-semibold">{getFilteredPermissionsCount().total}</span> permisos
              </p>
            </div>
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
                    <option key={resource.value} value={resource.value}>
                      {resource.label}
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
                    <option key={action.value} value={action.value}>
                      {action.label}
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
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
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
                👁️ Solo Lectura
              </Button>
              <Button
                onClick={() => setFilterAction('create')}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
              >
                ➕ Solo Creación
              </Button>
              <Button
                onClick={() => setFilterAction('update')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
              >
                ✏️ Solo Edición
              </Button>
              <Button
                onClick={() => setFilterAction('delete')}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
              >
                🗑️ Solo Eliminación
              </Button>
              
              {/* Separador visual */}
              <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
              
              {/* Filtros por scope */}
              <Button
                onClick={() => setFilterScope('own')}
                className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1"
              >
                👤 Solo Propios
              </Button>
              <Button
                onClick={() => setFilterScope('team')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1"
              >
                👥 Solo Equipo
              </Button>
              <Button
                onClick={() => setFilterScope('all')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1"
              >
                🌐 Solo Sistema Completo
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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {moduleDisplayNames[resource] || `📄 ${resource.charAt(0).toUpperCase() + resource.slice(1)}`}
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
                      {filteredPermissions.map((permission) => {
                        const formattedPermission = formatPermissionName(permission);
                        return (
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
                                {formattedPermission.display}
                              </span>
                            </div>
                            {permission.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {permission.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                              {permission.name}
                            </p>
                          </div>
                        </label>
                        );
                      })}
                  </div>
                </div>
                );
              })}
              
              {/* Mensaje cuando no hay permisos filtrados */}
              {getFilteredPermissionsCount().filtered === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontraron permisos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Los filtros aplicados no coinciden con ningún permiso disponible.
                  </p>
                  <Button
                    onClick={() => {
                      setFilterModule('');
                      setFilterAction('');
                      setFilterScope('');
                      setSearchTerm('');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              )}
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

      {/* Guía de permisos */}
      {showGuide && <PermissionsGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
