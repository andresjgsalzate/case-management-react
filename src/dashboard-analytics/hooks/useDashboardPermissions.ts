import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Dashboard
 * Maneja permisos con scopes: own, team, all
 */
export const useDashboardPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER MÉTRICAS)
      // ================================================================
      canReadOwnMetrics: adminPermissions.hasPermission('dashboard.read_own'),
      canReadTeamMetrics: adminPermissions.hasPermission('dashboard.read_team'),
      canReadAllMetrics: adminPermissions.hasPermission('dashboard.read_all'),
      
      // ================================================================
      // PERMISOS DE EXPORTACIÓN
      // ================================================================
      canExportOwnData: adminPermissions.hasPermission('dashboard.export_own'),
      canExportTeamData: adminPermissions.hasPermission('dashboard.export_team'),
      canExportAllData: adminPermissions.hasPermission('dashboard.export_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnDashboard: adminPermissions.hasPermission('dashboard.admin_own'),
      canAdminTeamDashboard: adminPermissions.hasPermission('dashboard.admin_team'),
      canAdminAllDashboard: adminPermissions.hasPermission('dashboard.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Determina el scope más alto de lectura que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('dashboard.read_all')) return 'all';
        if (adminPermissions.hasPermission('dashboard.read_team')) return 'team';
        if (adminPermissions.hasPermission('dashboard.read_own')) return 'own';
        return null;
      },
      
      /**
       * Determina el scope más alto de exportación que tiene el usuario
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestExportScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('dashboard.export_all')) return 'all';
        if (adminPermissions.hasPermission('dashboard.export_team')) return 'team';
        if (adminPermissions.hasPermission('dashboard.export_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede ver métricas de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canReadScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('dashboard.read_own');
          case 'team':
            return adminPermissions.hasPermission('dashboard.read_team');
          case 'all':
            return adminPermissions.hasPermission('dashboard.read_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede exportar datos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canExportScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('dashboard.export_own');
          case 'team':
            return adminPermissions.hasPermission('dashboard.export_team');
          case 'all':
            return adminPermissions.hasPermission('dashboard.export_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario tiene algún permiso de dashboard
       */
      hasAnyDashboardPermission(): boolean {
        return adminPermissions.hasPermission('dashboard.read_own') ||
               adminPermissions.hasPermission('dashboard.read_team') ||
               adminPermissions.hasPermission('dashboard.read_all') ||
               adminPermissions.hasPermission('dashboard.export_own') ||
               adminPermissions.hasPermission('dashboard.export_team') ||
               adminPermissions.hasPermission('dashboard.export_all') ||
               adminPermissions.hasPermission('dashboard.admin_own') ||
               adminPermissions.hasPermission('dashboard.admin_team') ||
               adminPermissions.hasPermission('dashboard.admin_all');
      }
    };
  }, [adminPermissions]);

  return permissions;
};

export default useDashboardPermissions;
