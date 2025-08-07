import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo User Management
 * Maneja permisos con scopes: own, team, all
 */
export const useUserPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER USUARIOS)
      // ================================================================
      canReadOwnUser: adminPermissions.hasPermission('users.read_own'),
      canReadTeamUsers: adminPermissions.hasPermission('users.read_team'),
      canReadAllUsers: adminPermissions.hasPermission('users.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnUser: adminPermissions.hasPermission('users.create_own'),
      canCreateTeamUsers: adminPermissions.hasPermission('users.create_team'),
      canCreateAllUsers: adminPermissions.hasPermission('users.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnUser: adminPermissions.hasPermission('users.update_own'),
      canUpdateTeamUsers: adminPermissions.hasPermission('users.update_team'),
      canUpdateAllUsers: adminPermissions.hasPermission('users.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnUser: adminPermissions.hasPermission('users.delete_own'),
      canDeleteTeamUsers: adminPermissions.hasPermission('users.delete_team'),
      canDeleteAllUsers: adminPermissions.hasPermission('users.delete_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnUser: adminPermissions.hasPermission('users.admin_own'),
      canAdminTeamUsers: adminPermissions.hasPermission('users.admin_team'),
      canAdminAllUsers: adminPermissions.hasPermission('users.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Verifica si el usuario puede leer usuarios en general
       */
      canReadUsers(): boolean {
        return adminPermissions.hasPermission('users.read_own') ||
               adminPermissions.hasPermission('users.read_team') ||
               adminPermissions.hasPermission('users.read_all');
      },
      
      /**
       * Verifica si el usuario puede crear usuarios en general
       */
      canCreateUsers(): boolean {
        return adminPermissions.hasPermission('users.create_own') ||
               adminPermissions.hasPermission('users.create_team') ||
               adminPermissions.hasPermission('users.create_all');
      },
      
      /**
       * Verifica si el usuario puede actualizar usuarios en general
       */
      canUpdateUsers(): boolean {
        return adminPermissions.hasPermission('users.update_own') ||
               adminPermissions.hasPermission('users.update_team') ||
               adminPermissions.hasPermission('users.update_all');
      },
      
      /**
       * Verifica si el usuario puede eliminar usuarios en general
       */
      canDeleteUsers(): boolean {
        return adminPermissions.hasPermission('users.delete_own') ||
               adminPermissions.hasPermission('users.delete_team') ||
               adminPermissions.hasPermission('users.delete_all');
      },
      
      /**
       * Verifica si el usuario puede administrar usuarios en general
       */
      canAdminUsers(): boolean {
        return adminPermissions.hasPermission('users.admin_own') ||
               adminPermissions.hasPermission('users.admin_team') ||
               adminPermissions.hasPermission('users.admin_all');
      },
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('users.read_all')) return 'all';
        if (adminPermissions.hasPermission('users.read_team')) return 'team';
        if (adminPermissions.hasPermission('users.read_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de creación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('users.create_all')) return 'all';
        if (adminPermissions.hasPermission('users.create_team')) return 'team';
        if (adminPermissions.hasPermission('users.create_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('users.update_all')) return 'all';
        if (adminPermissions.hasPermission('users.update_team')) return 'team';
        if (adminPermissions.hasPermission('users.update_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('users.delete_all')) return 'all';
        if (adminPermissions.hasPermission('users.delete_team')) return 'team';
        if (adminPermissions.hasPermission('users.delete_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de administración que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestAdminScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('users.admin_all')) return 'all';
        if (adminPermissions.hasPermission('users.admin_team')) return 'team';
        if (adminPermissions.hasPermission('users.admin_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede ver usuarios de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canReadScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('users.read_own');
          case 'team':
            return adminPermissions.hasPermission('users.read_team');
          case 'all':
            return adminPermissions.hasPermission('users.read_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede crear usuarios de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canCreateScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('users.create_own');
          case 'team':
            return adminPermissions.hasPermission('users.create_team');
          case 'all':
            return adminPermissions.hasPermission('users.create_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede actualizar usuarios de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canUpdateScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('users.update_own');
          case 'team':
            return adminPermissions.hasPermission('users.update_team');
          case 'all':
            return adminPermissions.hasPermission('users.update_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede eliminar usuarios de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canDeleteScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('users.delete_own');
          case 'team':
            return adminPermissions.hasPermission('users.delete_team');
          case 'all':
            return adminPermissions.hasPermission('users.delete_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede administrar usuarios de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canAdminScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('users.admin_own');
          case 'team':
            return adminPermissions.hasPermission('users.admin_team');
          case 'all':
            return adminPermissions.hasPermission('users.admin_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede realizar una acción específica en un usuario específico
       * @param targetUserId - ID del usuario objetivo
       * @param currentUserId - ID del usuario actual
       * @param action - 'read', 'create', 'update', 'delete', 'admin'
       * @returns boolean
       */
      canPerformActionOnUser(
        targetUserId: string | null, 
        currentUserId: string, 
        action: 'read' | 'create' | 'update' | 'delete' | 'admin'
      ): boolean {
        if (!targetUserId) return false;
        
        // Si tiene permiso para todos, puede realizar la acción
        if (adminPermissions.hasPermission(`users.${action}_all`)) {
          return true;
        }
        
        // Si es el mismo usuario y tiene permiso para own
        if (targetUserId === currentUserId && adminPermissions.hasPermission(`users.${action}_own`)) {
          return true;
        }
        
        // TODO: Implementar lógica de team cuando se defina la estructura de equipos
        // if (isInSameTeam(targetUserId, currentUserId) && adminPermissions.hasPermission(`users.${action}_team`)) {
        //   return true;
        // }
        
        return false;
      },
      
      // ================================================================
      // FUNCIONES DE COMPATIBILIDAD CON EL CÓDIGO EXISTENTE
      // ================================================================
      
      // Métodos legacy para mantener compatibilidad - CORREGIDOS PARA EVITAR ACCESO NO AUTORIZADO
      
      // ✅ SOLO para módulos administrativos (NO para perfil propio)
      canViewUsers: () => adminPermissions.hasPermission('users.read_all') || adminPermissions.hasPermission('users.admin_all'),
      canManageUsers: () => adminPermissions.hasPermission('users.update_all') || adminPermissions.hasPermission('users.admin_all'),
      
      canViewRoles: () => adminPermissions.hasPermission('roles.read_all') || adminPermissions.hasPermission('roles.admin_all'),
      canManageRoles: () => adminPermissions.hasPermission('roles.update_all') || adminPermissions.hasPermission('roles.admin_all'),
      
      canViewConfig: () => adminPermissions.hasPermission('config.read_all') || adminPermissions.hasPermission('config.admin_all'),
      canManageConfig: () => adminPermissions.hasPermission('config.update_all') || adminPermissions.hasPermission('config.admin_all'),
      
      // ✅ NUEVOS métodos específicos para perfil propio (NO administrativos)
      canViewOwnProfile: () => adminPermissions.hasPermission('profile.read_own') || adminPermissions.hasPermission('users.read_own'),
      canUpdateOwnProfile: () => adminPermissions.hasPermission('profile.update_own') || adminPermissions.hasPermission('users.update_own'),
      canChangePassword: () => adminPermissions.hasPermission('profile.change_password'),
      
      // Para ConfigurationPage - SOLO para admins reales
      canViewOrigenes: () => adminPermissions.hasPermission('config.read_all') || adminPermissions.hasPermission('config.admin_all'),
      canManageOrigenes: () => adminPermissions.hasPermission('config.update_all') || adminPermissions.hasPermission('config.admin_all'),
      canViewAplicaciones: () => adminPermissions.hasPermission('config.read_all') || adminPermissions.hasPermission('config.admin_all'),
      canManageAplicaciones: () => adminPermissions.hasPermission('config.update_all') || adminPermissions.hasPermission('config.admin_all'),
      canViewCaseStatuses: () => adminPermissions.hasPermission('config.read_all') || adminPermissions.hasPermission('config.admin_all'),
      canManageCaseStatuses: () => adminPermissions.hasPermission('config.update_all') || adminPermissions.hasPermission('config.admin_all'),
      canCreateCaseStatuses: () => adminPermissions.hasPermission('config.create_all') || adminPermissions.hasPermission('config.admin_all'),
      
      // ================================================================
      // PROPIEDADES HEREDADAS
      // ================================================================
      isAdmin: adminPermissions.isAdmin,
      hasAnyAdminPermission: adminPermissions.hasAnyAdminPermission,
    };
  }, [adminPermissions]);

  return permissions;
};
