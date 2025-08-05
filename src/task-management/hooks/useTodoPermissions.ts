import { useMemo, useRef } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

// Cache global para throttling de logs
let lastLogTime = 0;
const LOG_THROTTLE_MS = 3000; // Solo log cada 3 segundos
let hasLoggedSuccess = false; // Flag para evitar logs de éxito repetidos

export const useTodoPermissions = () => {
  const { hasPermission } = useAdminPermissions();
  const lastPermissionState = useRef<boolean | null>(null);

  return useMemo(() => {
    // Función auxiliar para verificar múltiples permisos con logging optimizado
    const hasAnyPermission = (permissions: string[]): boolean => {
      const result = permissions.some(permission => {
        const hasIt = hasPermission(permission);
        if (hasIt) {
          // Solo log una vez cuando encuentra un permiso exitoso
          if (!hasLoggedSuccess) {
            console.log(`✅ [TodoPermissions] Usuario tiene permiso: ${permission}`);
            hasLoggedSuccess = true;
            // Reset después de 10 segundos
            setTimeout(() => { hasLoggedSuccess = false; }, 10000);
          }
        }
        return hasIt;
      });
      
      // Solo log de fallos si hay cambio de estado y no se ha loggeado recientemente
      const now = Date.now();
      if (!result && lastPermissionState.current !== false && (now - lastLogTime > LOG_THROTTLE_MS)) {
        lastLogTime = now;
        lastPermissionState.current = false;
        console.group('❌ [TodoPermissions] Sin permisos de TODOs');
        console.log('Permisos verificados:', permissions.length);
        console.log('Muestra de permisos:', {
          'todos.read_all': hasPermission('todos.read_all'),
          'todos.read_own': hasPermission('todos.read_own'),
          'todos.create_all': hasPermission('todos.create_all')
        });
        console.groupEnd();
      } else if (result && lastPermissionState.current !== true) {
        lastPermissionState.current = true;
      }
      
      return result;
    };

    // ===== PERMISOS DE LECTURA =====
    const canReadOwnTodos = hasPermission('todos.read_own');
    const canReadTeamTodos = hasPermission('todos.read_team');
    const canReadAllTodos = hasPermission('todos.read_all');

    // ===== PERMISOS DE CREACIÓN =====
    const canCreateOwnTodos = hasPermission('todos.create_own');
    const canCreateTeamTodos = hasPermission('todos.create_team');
    const canCreateAllTodos = hasPermission('todos.create_all');

    // ===== PERMISOS DE ACTUALIZACIÓN =====
    const canUpdateOwnTodos = hasPermission('todos.update_own');
    const canUpdateTeamTodos = hasPermission('todos.update_team');
    const canUpdateAllTodos = hasPermission('todos.update_all');

    // ===== PERMISOS DE ELIMINACIÓN =====
    const canDeleteOwnTodos = hasPermission('todos.delete_own');
    const canDeleteTeamTodos = hasPermission('todos.delete_team');
    const canDeleteAllTodos = hasPermission('todos.delete_all');

    // ===== PERMISOS DE CONTROL =====
    const canControlOwnTodos = hasPermission('todos.control_own');
    const canControlTeamTodos = hasPermission('todos.control_team');
    const canControlAllTodos = hasPermission('todos.control_all');

    // ===== PERMISOS DE ASIGNACIÓN =====
    const canAssignOwnTodos = hasPermission('todos.assign_own');
    const canAssignTeamTodos = hasPermission('todos.assign_team');
    const canAssignAllTodos = hasPermission('todos.assign_all');

    // ===== FUNCIONES DE VERIFICACIÓN DE SCOPE =====
    const getHighestReadScope = (): 'own' | 'team' | 'all' | null => {
      if (canReadAllTodos) return 'all';
      if (canReadTeamTodos) return 'team';
      if (canReadOwnTodos) return 'own';
      return null;
    };

    const canReadScope = (scope: 'own' | 'team' | 'all'): boolean => {
      switch (scope) {
        case 'own': return canReadOwnTodos || canReadTeamTodos || canReadAllTodos;
        case 'team': return canReadTeamTodos || canReadAllTodos;
        case 'all': return canReadAllTodos;
        default: return false;
      }
    };

    // ===== VERIFICACIÓN DE ACCIONES EN TODO ESPECÍFICO =====
    const canPerformActionOnTodo = (
      todoOwnerId: string | null,
      currentUserId: string,
      action: 'update' | 'delete' | 'control' | 'assign'
    ): boolean => {
      // Si no hay owner o usuario actual, denegar acceso
      if (!todoOwnerId || !currentUserId) return false;

      const isOwner = todoOwnerId === currentUserId;
      const isAssigned = todoOwnerId === currentUserId; // Para TODOs, consideramos both creator and assigned

      switch (action) {
        case 'update':
          return (isOwner && canUpdateOwnTodos) || 
                 canUpdateTeamTodos || 
                 canUpdateAllTodos;
        case 'delete':
          return (isOwner && canDeleteOwnTodos) || 
                 canDeleteTeamTodos || 
                 canDeleteAllTodos;
        case 'control':
          return (isAssigned && canControlOwnTodos) || 
                 canControlTeamTodos || 
                 canControlAllTodos;
        case 'assign':
          return (isOwner && canAssignOwnTodos) || 
                 canAssignTeamTodos || 
                 canAssignAllTodos;
        default:
          return false;
      }
    };

    // ===== VERIFICACIONES GENERALES =====
    const hasAnyTodosPermission = hasAnyPermission([
      'todos.read_own', 'todos.read_team', 'todos.read_all',
      'todos.create_own', 'todos.create_team', 'todos.create_all',
      'todos.update_own', 'todos.update_team', 'todos.update_all',
      'todos.delete_own', 'todos.delete_team', 'todos.delete_all',
      'todos.control_own', 'todos.control_team', 'todos.control_all',
      'todos.assign_own', 'todos.assign_team', 'todos.assign_all'
    ]);

    const canAccessTodoModule = hasAnyTodosPermission;

    return {
      // Permisos de lectura
      canReadOwnTodos,
      canReadTeamTodos,
      canReadAllTodos,
      
      // Permisos de creación
      canCreateOwnTodos,
      canCreateTeamTodos,
      canCreateAllTodos,
      
      // Permisos de actualización
      canUpdateOwnTodos,
      canUpdateTeamTodos,
      canUpdateAllTodos,
      
      // Permisos de eliminación
      canDeleteOwnTodos,
      canDeleteTeamTodos,
      canDeleteAllTodos,
      
      // Permisos de control
      canControlOwnTodos,
      canControlTeamTodos,
      canControlAllTodos,
      
      // Permisos de asignación
      canAssignOwnTodos,
      canAssignTeamTodos,
      canAssignAllTodos,

      // Funciones de utilidad
      getHighestReadScope,
      canReadScope,
      canPerformActionOnTodo,
      hasAnyTodosPermission,
      canAccessTodoModule,

      // Backwards compatibility (legacy names)
      canViewTodos: hasAnyTodosPermission,
      canCreateTodos: canCreateOwnTodos || canCreateTeamTodos || canCreateAllTodos,
      canEditTodos: canUpdateOwnTodos || canUpdateTeamTodos || canUpdateAllTodos,
      canDeleteTodos: canDeleteOwnTodos || canDeleteTeamTodos || canDeleteAllTodos,
      canManageTodos: hasAnyTodosPermission,
      canViewAllTodos: canReadAllTodos,
      canControlTodos: canControlOwnTodos || canControlTeamTodos || canControlAllTodos
    };
  }, [hasPermission]);
};
