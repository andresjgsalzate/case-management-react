import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Cases
 * Maneja permisos con scopes: own, team, all
 */
export const useCasesPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER CASOS)
      // ================================================================
      canReadOwnCases: adminPermissions.hasPermission('cases.read_own'),
      canReadTeamCases: adminPermissions.hasPermission('cases.read_team'),
      canReadAllCases: adminPermissions.hasPermission('cases.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnCases: adminPermissions.hasPermission('cases.create_own'),
      canCreateTeamCases: adminPermissions.hasPermission('cases.create_team'),
      canCreateAllCases: adminPermissions.hasPermission('cases.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnCases: adminPermissions.hasPermission('cases.update_own'),
      canUpdateTeamCases: adminPermissions.hasPermission('cases.update_team'),
      canUpdateAllCases: adminPermissions.hasPermission('cases.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnCases: adminPermissions.hasPermission('cases.delete_own'),
      canDeleteTeamCases: adminPermissions.hasPermission('cases.delete_team'),
      canDeleteAllCases: adminPermissions.hasPermission('cases.delete_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnCases: adminPermissions.hasPermission('cases.admin_own'),
      canAdminTeamCases: adminPermissions.hasPermission('cases.admin_team'),
      canAdminAllCases: adminPermissions.hasPermission('cases.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Determina el scope más alto de lectura que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('cases.read_all')) return 'all';
        if (adminPermissions.hasPermission('cases.read_team')) return 'team';
        if (adminPermissions.hasPermission('cases.read_own')) return 'own';
        return null;
      },
      
      /**
       * Determina el scope más alto de creación que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('cases.create_all')) return 'all';
        if (adminPermissions.hasPermission('cases.create_team')) return 'team';
        if (adminPermissions.hasPermission('cases.create_own')) return 'own';
        return null;
      },
      
      /**
       * Determina el scope más alto de actualización que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('cases.update_all')) return 'all';
        if (adminPermissions.hasPermission('cases.update_team')) return 'team';
        if (adminPermissions.hasPermission('cases.update_own')) return 'own';
        return null;
      },
      
      /**
       * Determina el scope más alto de eliminación que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('cases.delete_all')) return 'all';
        if (adminPermissions.hasPermission('cases.delete_team')) return 'team';
        if (adminPermissions.hasPermission('cases.delete_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede leer casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canReadScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('cases.read_own');
          case 'team':
            return adminPermissions.hasPermission('cases.read_team');
          case 'all':
            return adminPermissions.hasPermission('cases.read_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede crear casos en un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canCreateScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('cases.create_own');
          case 'team':
            return adminPermissions.hasPermission('cases.create_team');
          case 'all':
            return adminPermissions.hasPermission('cases.create_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede actualizar casos en un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canUpdateScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('cases.update_own');
          case 'team':
            return adminPermissions.hasPermission('cases.update_team');
          case 'all':
            return adminPermissions.hasPermission('cases.update_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede eliminar casos en un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canDeleteScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('cases.delete_own');
          case 'team':
            return adminPermissions.hasPermission('cases.delete_team');
          case 'all':
            return adminPermissions.hasPermission('cases.delete_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede realizar una acción específica sobre un caso
       * @param caseOwnerId - ID del propietario del caso
       * @param currentUserId - ID del usuario actual
       * @param action - 'read', 'update', 'delete'
       */
      canPerformActionOnCase(
        caseOwnerId: string, 
        currentUserId: string, 
        action: 'read' | 'update' | 'delete'
      ): boolean {
        // Verificar permisos 'all' primero
        switch (action) {
          case 'read':
            if (adminPermissions.hasPermission('cases.read_all')) return true;
            if (adminPermissions.hasPermission('cases.read_team')) return true; // TODO: Implementar lógica de equipo
            if (adminPermissions.hasPermission('cases.read_own') && caseOwnerId === currentUserId) return true;
            break;
          case 'update':
            if (adminPermissions.hasPermission('cases.update_all')) return true;
            if (adminPermissions.hasPermission('cases.update_team')) return true; // TODO: Implementar lógica de equipo
            if (adminPermissions.hasPermission('cases.update_own') && caseOwnerId === currentUserId) return true;
            break;
          case 'delete':
            if (adminPermissions.hasPermission('cases.delete_all')) return true;
            if (adminPermissions.hasPermission('cases.delete_team')) return true; // TODO: Implementar lógica de equipo
            if (adminPermissions.hasPermission('cases.delete_own') && caseOwnerId === currentUserId) return true;
            break;
        }
        
        return false;
      },
      
      /**
       * Verifica si el usuario tiene algún permiso de cases
       */
      hasAnyCasesPermission(): boolean {
        return adminPermissions.hasPermission('cases.read_own') ||
               adminPermissions.hasPermission('cases.read_team') ||
               adminPermissions.hasPermission('cases.read_all') ||
               adminPermissions.hasPermission('cases.create_own') ||
               adminPermissions.hasPermission('cases.create_team') ||
               adminPermissions.hasPermission('cases.create_all') ||
               adminPermissions.hasPermission('cases.update_own') ||
               adminPermissions.hasPermission('cases.update_team') ||
               adminPermissions.hasPermission('cases.update_all') ||
               adminPermissions.hasPermission('cases.delete_own') ||
               adminPermissions.hasPermission('cases.delete_team') ||
               adminPermissions.hasPermission('cases.delete_all') ||
               adminPermissions.hasPermission('cases.admin_own') ||
               adminPermissions.hasPermission('cases.admin_team') ||
               adminPermissions.hasPermission('cases.admin_all');
      }
    };
  }, [adminPermissions]);

  return permissions;
};

export default useCasesPermissions;
