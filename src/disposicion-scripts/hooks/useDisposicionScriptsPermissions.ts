import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Disposiciones
 * Maneja permisos con scopes: own, team, all
 */
export const useDisposicionScriptsPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER DISPOSICIONES)
      // ================================================================
      canReadOwnDisposiciones: adminPermissions.hasPermission('disposiciones.read_own'),
      canReadTeamDisposiciones: adminPermissions.hasPermission('disposiciones.read_team'),
      canReadAllDisposiciones: adminPermissions.hasPermission('disposiciones.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnDisposiciones: adminPermissions.hasPermission('disposiciones.create_own'),
      canCreateTeamDisposiciones: adminPermissions.hasPermission('disposiciones.create_team'),
      canCreateAllDisposiciones: adminPermissions.hasPermission('disposiciones.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnDisposiciones: adminPermissions.hasPermission('disposiciones.update_own'),
      canUpdateTeamDisposiciones: adminPermissions.hasPermission('disposiciones.update_team'),
      canUpdateAllDisposiciones: adminPermissions.hasPermission('disposiciones.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnDisposiciones: adminPermissions.hasPermission('disposiciones.delete_own'),
      canDeleteTeamDisposiciones: adminPermissions.hasPermission('disposiciones.delete_team'),
      canDeleteAllDisposiciones: adminPermissions.hasPermission('disposiciones.delete_all'),
      
      // ================================================================
      // PERMISOS DE EXPORTACIÓN
      // ================================================================
      canExportOwnDisposiciones: adminPermissions.hasPermission('disposiciones.export_own'),
      canExportTeamDisposiciones: adminPermissions.hasPermission('disposiciones.export_team'),
      canExportAllDisposiciones: adminPermissions.hasPermission('disposiciones.export_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnDisposiciones: adminPermissions.hasPermission('disposiciones.admin_own'),
      canAdminTeamDisposiciones: adminPermissions.hasPermission('disposiciones.admin_team'),
      canAdminAllDisposiciones: adminPermissions.hasPermission('disposiciones.admin_all'),
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        const hasAll = adminPermissions.hasPermission('disposiciones.read_all');
        const hasTeam = adminPermissions.hasPermission('disposiciones.read_team');
        const hasOwn = adminPermissions.hasPermission('disposiciones.read_own');
        
        if (hasAll) {
          return 'all';
        }
        if (hasTeam) {
          return 'team';
        }
        if (hasOwn) {
          return 'own';
        }
        
        return null;
      },
      
      /**
       * Obtiene el scope más alto de creación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('disposiciones.create_all')) return 'all';
        if (adminPermissions.hasPermission('disposiciones.create_team')) return 'team';
        if (adminPermissions.hasPermission('disposiciones.create_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('disposiciones.update_all')) return 'all';
        if (adminPermissions.hasPermission('disposiciones.update_team')) return 'team';
        if (adminPermissions.hasPermission('disposiciones.update_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('disposiciones.delete_all')) return 'all';
        if (adminPermissions.hasPermission('disposiciones.delete_team')) return 'team';
        if (adminPermissions.hasPermission('disposiciones.delete_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de exportación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestExportScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('disposiciones.export_all')) return 'all';
        if (adminPermissions.hasPermission('disposiciones.export_team')) return 'team';
        if (adminPermissions.hasPermission('disposiciones.export_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede leer disposiciones de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canReadScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`disposiciones.read_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede crear disposiciones de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canCreateScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`disposiciones.create_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede actualizar disposiciones de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canUpdateScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`disposiciones.update_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede eliminar disposiciones de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canDeleteScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`disposiciones.delete_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede exportar disposiciones de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canExportScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`disposiciones.export_${scope}`);
      },
      
      /**
       * Verifica si el usuario tiene algún permiso de disposiciones
       */
      hasAnyDisposicionesPermission(): boolean {
        const allPermissions = [
          'disposiciones.read_own', 'disposiciones.read_team', 'disposiciones.read_all',
          'disposiciones.create_own', 'disposiciones.create_team', 'disposiciones.create_all',
          'disposiciones.update_own', 'disposiciones.update_team', 'disposiciones.update_all',
          'disposiciones.delete_own', 'disposiciones.delete_team', 'disposiciones.delete_all',
          'disposiciones.export_own', 'disposiciones.export_team', 'disposiciones.export_all',
          'disposiciones.admin_own', 'disposiciones.admin_team', 'disposiciones.admin_all'
        ];
        
        const hasAnyPermission = allPermissions.some(permission => {
          const hasPermission = adminPermissions.hasPermission(permission);
          return hasPermission;
        });
        
        return hasAnyPermission;
      },
      
      /**
       * Verifica si el usuario puede realizar una acción específica en una disposición
       * @param disposicionUserId - ID del usuario propietario de la disposición
       * @param currentUserId - ID del usuario actual
       * @param action - Acción a verificar ('read', 'create', 'update', 'delete', 'export')
       */
      canPerformActionOnDisposicion(
        disposicionUserId: string, 
        currentUserId: string, 
        action: 'read' | 'create' | 'update' | 'delete' | 'export'
      ): boolean {
        // Si puede realizar la acción sobre todas las disposiciones
        if (adminPermissions.hasPermission(`disposiciones.${action}_all`)) return true;
        
        // Si puede realizar la acción sobre disposiciones del equipo (por ahora tratamos team como all)
        if (adminPermissions.hasPermission(`disposiciones.${action}_team`)) return true;
        
        // Si puede realizar la acción sobre sus propias disposiciones y es el propietario
        if (adminPermissions.hasPermission(`disposiciones.${action}_own`) && disposicionUserId === currentUserId) return true;
        
        return false;
      },

      // ================================================================
      // FUNCIONES DE COMPATIBILIDAD CON EL CÓDIGO EXISTENTE
      // ================================================================
      
      // Métodos legacy para mantener compatibilidad
      canCreateDisposiciones: adminPermissions.hasPermission('disposiciones.create_own') || adminPermissions.hasPermission('disposiciones.create_team') || adminPermissions.hasPermission('disposiciones.create_all'),
      canReadDisposiciones: adminPermissions.hasPermission('disposiciones.read_own') || adminPermissions.hasPermission('disposiciones.read_team') || adminPermissions.hasPermission('disposiciones.read_all'),
      canUpdateDisposiciones: adminPermissions.hasPermission('disposiciones.update_own') || adminPermissions.hasPermission('disposiciones.update_team') || adminPermissions.hasPermission('disposiciones.update_all'),
      canDeleteDisposiciones: adminPermissions.hasPermission('disposiciones.delete_own') || adminPermissions.hasPermission('disposiciones.delete_team') || adminPermissions.hasPermission('disposiciones.delete_all'),
      canExportDisposiciones: adminPermissions.hasPermission('disposiciones.export_own') || adminPermissions.hasPermission('disposiciones.export_team') || adminPermissions.hasPermission('disposiciones.export_all'),
      canViewAllDisposiciones: adminPermissions.hasPermission('disposiciones.read_all'),
      canManageDisposiciones: adminPermissions.hasPermission('disposiciones.admin_own') || adminPermissions.hasPermission('disposiciones.admin_team') || adminPermissions.hasPermission('disposiciones.admin_all'),
      canDeleteSpecificDisposicion: (disposicionUserId: string, currentUserId: string) => {
        if (adminPermissions.hasPermission('disposiciones.delete_all')) return true;
        if (adminPermissions.hasPermission('disposiciones.delete_team')) return true;
        if (adminPermissions.hasPermission('disposiciones.delete_own') && disposicionUserId === currentUserId) return true;
        return false;
      },
      canEditSpecificDisposicion: (disposicionUserId: string, currentUserId: string) => {
        if (adminPermissions.hasPermission('disposiciones.update_all')) return true;
        if (adminPermissions.hasPermission('disposiciones.update_team')) return true;
        if (adminPermissions.hasPermission('disposiciones.update_own') && disposicionUserId === currentUserId) return true;
        return false;
      },
      hasAnyPermission: adminPermissions.hasPermission('disposiciones.read_own') || adminPermissions.hasPermission('disposiciones.read_team') || adminPermissions.hasPermission('disposiciones.read_all'),
      isAdmin: adminPermissions.isAdmin
    };
  }, [adminPermissions]);

  return permissions;
};
