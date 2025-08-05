import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Tags
 * Maneja permisos con scopes: own, team, all
 */
export const useTagsPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER ETIQUETAS)
      // ================================================================
      canReadOwnTags: adminPermissions.hasPermission('tags.read_own'),
      canReadTeamTags: adminPermissions.hasPermission('tags.read_team'),
      canReadAllTags: adminPermissions.hasPermission('tags.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnTags: adminPermissions.hasPermission('tags.create_own'),
      canCreateTeamTags: adminPermissions.hasPermission('tags.create_team'),
      canCreateAllTags: adminPermissions.hasPermission('tags.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnTags: adminPermissions.hasPermission('tags.update_own'),
      canUpdateTeamTags: adminPermissions.hasPermission('tags.update_team'),
      canUpdateAllTags: adminPermissions.hasPermission('tags.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnTags: adminPermissions.hasPermission('tags.delete_own'),
      canDeleteTeamTags: adminPermissions.hasPermission('tags.delete_team'),
      canDeleteAllTags: adminPermissions.hasPermission('tags.delete_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnTags: adminPermissions.hasPermission('tags.admin_own'),
      canAdminTeamTags: adminPermissions.hasPermission('tags.admin_team'),
      canAdminAllTags: adminPermissions.hasPermission('tags.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Verifica si el usuario puede leer etiquetas en general
       */
      canReadTags(): boolean {
        return adminPermissions.hasPermission('tags.read_own') ||
               adminPermissions.hasPermission('tags.read_team') ||
               adminPermissions.hasPermission('tags.read_all');
      },
      
      /**
       * Verifica si el usuario puede crear etiquetas en general
       */
      canCreateTags(): boolean {
        return adminPermissions.hasPermission('tags.create_own') ||
               adminPermissions.hasPermission('tags.create_team') ||
               adminPermissions.hasPermission('tags.create_all');
      },
      
      /**
       * Verifica si el usuario puede actualizar etiquetas en general
       */
      canUpdateTags(): boolean {
        return adminPermissions.hasPermission('tags.update_own') ||
               adminPermissions.hasPermission('tags.update_team') ||
               adminPermissions.hasPermission('tags.update_all');
      },
      
      /**
       * Verifica si el usuario puede eliminar etiquetas en general
       */
      canDeleteTags(): boolean {
        return adminPermissions.hasPermission('tags.delete_own') ||
               adminPermissions.hasPermission('tags.delete_team') ||
               adminPermissions.hasPermission('tags.delete_all');
      },
      
      /**
       * Verifica si el usuario puede administrar etiquetas en general
       */
      canAdminTags(): boolean {
        return adminPermissions.hasPermission('tags.admin_own') ||
               adminPermissions.hasPermission('tags.admin_team') ||
               adminPermissions.hasPermission('tags.admin_all');
      },
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('tags.read_all')) return 'all';
        if (adminPermissions.hasPermission('tags.read_team')) return 'team';
        if (adminPermissions.hasPermission('tags.read_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de creación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('tags.create_all')) return 'all';
        if (adminPermissions.hasPermission('tags.create_team')) return 'team';
        if (adminPermissions.hasPermission('tags.create_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('tags.update_all')) return 'all';
        if (adminPermissions.hasPermission('tags.update_team')) return 'team';
        if (adminPermissions.hasPermission('tags.update_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('tags.delete_all')) return 'all';
        if (adminPermissions.hasPermission('tags.delete_team')) return 'team';
        if (adminPermissions.hasPermission('tags.delete_own')) return 'own';
        return null;
      }
    };
  }, [adminPermissions]);

  return permissions;
};
