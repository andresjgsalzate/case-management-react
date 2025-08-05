import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Config
 * Maneja permisos con scopes: own, team, all
 */
export const useConfigPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER CONFIGURACIONES)
      // ================================================================
      canReadOwnConfig: adminPermissions.hasPermission('config.read_own'),
      canReadTeamConfig: adminPermissions.hasPermission('config.read_team'),
      canReadAllConfig: adminPermissions.hasPermission('config.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnConfig: adminPermissions.hasPermission('config.create_own'),
      canCreateTeamConfig: adminPermissions.hasPermission('config.create_team'),
      canCreateAllConfig: adminPermissions.hasPermission('config.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnConfig: adminPermissions.hasPermission('config.update_own'),
      canUpdateTeamConfig: adminPermissions.hasPermission('config.update_team'),
      canUpdateAllConfig: adminPermissions.hasPermission('config.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnConfig: adminPermissions.hasPermission('config.delete_own'),
      canDeleteTeamConfig: adminPermissions.hasPermission('config.delete_team'),
      canDeleteAllConfig: adminPermissions.hasPermission('config.delete_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnConfig: adminPermissions.hasPermission('config.admin_own'),
      canAdminTeamConfig: adminPermissions.hasPermission('config.admin_team'),
      canAdminAllConfig: adminPermissions.hasPermission('config.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Verifica si el usuario puede leer configuraciones en general
       */
      canReadConfig(): boolean {
        return adminPermissions.hasPermission('config.read_own') ||
               adminPermissions.hasPermission('config.read_team') ||
               adminPermissions.hasPermission('config.read_all');
      },
      
      /**
       * Verifica si el usuario puede crear configuraciones en general
       */
      canCreateConfig(): boolean {
        return adminPermissions.hasPermission('config.create_own') ||
               adminPermissions.hasPermission('config.create_team') ||
               adminPermissions.hasPermission('config.create_all');
      },
      
      /**
       * Verifica si el usuario puede actualizar configuraciones en general
       */
      canUpdateConfig(): boolean {
        return adminPermissions.hasPermission('config.update_own') ||
               adminPermissions.hasPermission('config.update_team') ||
               adminPermissions.hasPermission('config.update_all');
      },
      
      /**
       * Verifica si el usuario puede eliminar configuraciones en general
       */
      canDeleteConfig(): boolean {
        return adminPermissions.hasPermission('config.delete_own') ||
               adminPermissions.hasPermission('config.delete_team') ||
               adminPermissions.hasPermission('config.delete_all');
      },
      
      /**
       * Verifica si el usuario puede administrar configuraciones en general
       */
      canAdminConfig(): boolean {
        return adminPermissions.hasPermission('config.admin_own') ||
               adminPermissions.hasPermission('config.admin_team') ||
               adminPermissions.hasPermission('config.admin_all');
      },
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('config.read_all')) return 'all';
        if (adminPermissions.hasPermission('config.read_team')) return 'team';
        if (adminPermissions.hasPermission('config.read_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de creación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('config.create_all')) return 'all';
        if (adminPermissions.hasPermission('config.create_team')) return 'team';
        if (adminPermissions.hasPermission('config.create_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('config.update_all')) return 'all';
        if (adminPermissions.hasPermission('config.update_team')) return 'team';
        if (adminPermissions.hasPermission('config.update_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('config.delete_all')) return 'all';
        if (adminPermissions.hasPermission('config.delete_team')) return 'team';
        if (adminPermissions.hasPermission('config.delete_own')) return 'own';
        return null;
      },

      // ================================================================
      // FUNCIONES DE COMPATIBILIDAD CON HOOKS LEGACY
      // ================================================================
      
      /**
       * Función de compatibilidad para verificar si puede gestionar estados de casos
       * Esta función mantiene compatibilidad con el código existente
       */
      canManageCaseStatuses(): boolean {
        return this.canUpdateConfig() || this.canAdminConfig();
      },
      
      /**
       * Función de compatibilidad para verificar si puede gestionar configuraciones del sistema
       */
      canManageSystemConfig(): boolean {
        return this.canUpdateConfig() || this.canAdminConfig();
      }
    };
  }, [adminPermissions]);

  return permissions;
};
