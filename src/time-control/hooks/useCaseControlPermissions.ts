import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Case Control
 * Maneja permisos con scopes: own, team, all
 */
export const useCaseControlPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER CONTROL DE CASOS)
      // ================================================================
      canReadOwnCaseControl: adminPermissions.hasPermission('case_control.read_own'),
      canReadTeamCaseControl: adminPermissions.hasPermission('case_control.read_team'),
      canReadAllCaseControl: adminPermissions.hasPermission('case_control.read_all'),
      
      // ================================================================
      // PERMISOS DE ASIGNACIÓN DE CASOS AL CONTROL
      // ================================================================
      canAssignOwnCases: adminPermissions.hasPermission('case_control.assign_own'),
      canAssignTeamCases: adminPermissions.hasPermission('case_control.assign_team'),
      canAssignAllCases: adminPermissions.hasPermission('case_control.assign_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN DE ESTADO
      // ================================================================
      canUpdateStatusOwn: adminPermissions.hasPermission('case_control.update_status_own'),
      canUpdateStatusTeam: adminPermissions.hasPermission('case_control.update_status_team'),
      canUpdateStatusAll: adminPermissions.hasPermission('case_control.update_status_all'),
      
      // ================================================================
      // PERMISOS DE CONTROL DE TIEMPO (TIMER)
      // ================================================================
      canControlTimerOwn: adminPermissions.hasPermission('case_control.timer_own'),
      canControlTimerTeam: adminPermissions.hasPermission('case_control.timer_team'),
      canControlTimerAll: adminPermissions.hasPermission('case_control.timer_all'),
      
      // ================================================================
      // PERMISOS DE TIEMPO MANUAL
      // ================================================================
      canManageManualTimeOwn: adminPermissions.hasPermission('case_control.manual_time_own'),
      canManageManualTimeTeam: adminPermissions.hasPermission('case_control.manual_time_team'),
      canManageManualTimeAll: adminPermissions.hasPermission('case_control.manual_time_all'),
      
      // ================================================================
      // PERMISOS DE REPORTES
      // ================================================================
      canViewReportsOwn: adminPermissions.hasPermission('case_control.reports_own'),
      canViewReportsTeam: adminPermissions.hasPermission('case_control.reports_team'),
      canViewReportsAll: adminPermissions.hasPermission('case_control.reports_all'),
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.read_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.read_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.read_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de asignación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestAssignScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.assign_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.assign_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.assign_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización de estado que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateStatusScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.update_status_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.update_status_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.update_status_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de control de timer que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestTimerScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.timer_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.timer_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.timer_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de tiempo manual que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestManualTimeScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.manual_time_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.manual_time_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.manual_time_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de reportes que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReportsScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('case_control.reports_all')) return 'all';
        if (adminPermissions.hasPermission('case_control.reports_team')) return 'team';
        if (adminPermissions.hasPermission('case_control.reports_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede leer controles de casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canReadScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.read_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede asignar casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canAssignScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.assign_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede actualizar estado de casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canUpdateStatusScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.update_status_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede controlar timer de casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canControlTimerScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.timer_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede gestionar tiempo manual de casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canManageManualTimeScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.manual_time_${scope}`);
      },
      
      /**
       * Verifica si el usuario puede ver reportes de casos de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canViewReportsScope(scope: 'own' | 'team' | 'all'): boolean {
        return adminPermissions.hasPermission(`case_control.reports_${scope}`);
      },
      
      /**
       * Verifica si el usuario tiene algún permiso de case control
       */
      hasAnyCaseControlPermission(): boolean {
        const allPermissions = [
          'case_control.read_own', 'case_control.read_team', 'case_control.read_all',
          'case_control.assign_own', 'case_control.assign_team', 'case_control.assign_all',
          'case_control.update_status_own', 'case_control.update_status_team', 'case_control.update_status_all',
          'case_control.timer_own', 'case_control.timer_team', 'case_control.timer_all',
          'case_control.manual_time_own', 'case_control.manual_time_team', 'case_control.manual_time_all',
          'case_control.reports_own', 'case_control.reports_team', 'case_control.reports_all'
        ];
        return allPermissions.some(permission => adminPermissions.hasPermission(permission));
      },
      
      /**
       * Verifica si el usuario puede realizar una acción específica en un control de caso
       * @param caseControlUserId - ID del usuario propietario del control de caso
       * @param currentUserId - ID del usuario actual
       * @param action - Acción a verificar ('read', 'assign', 'update_status', 'timer', 'manual_time', 'reports')
       */
      canPerformActionOnCaseControl(
        caseControlUserId: string, 
        currentUserId: string, 
        action: 'read' | 'assign' | 'update_status' | 'timer' | 'manual_time' | 'reports'
      ): boolean {
        // Si puede realizar la acción sobre todos los casos
        if (adminPermissions.hasPermission(`case_control.${action}_all`)) return true;
        
        // Si puede realizar la acción sobre casos del equipo (por ahora tratamos team como all)
        if (adminPermissions.hasPermission(`case_control.${action}_team`)) return true;
        
        // Si puede realizar la acción sobre sus propios casos y es el propietario
        if (adminPermissions.hasPermission(`case_control.${action}_own`) && caseControlUserId === currentUserId) return true;
        
        return false;
      },

      // ================================================================
      // FUNCIONES DE COMPATIBILIDAD CON EL CÓDIGO EXISTENTE
      // ================================================================
      
      // Métodos legacy para mantener compatibilidad
      canViewCaseControl: () => adminPermissions.hasPermission('case_control.read_own') || adminPermissions.hasPermission('case_control.read_team') || adminPermissions.hasPermission('case_control.read_all'),
      canViewAllCaseControls: () => adminPermissions.hasPermission('case_control.read_all'),
      canViewOwnCaseControls: () => adminPermissions.hasPermission('case_control.read_own'),
      canManageStatus: () => adminPermissions.hasPermission('case_control.update_status_own') || adminPermissions.hasPermission('case_control.update_status_team') || adminPermissions.hasPermission('case_control.update_status_all'),
      canUpdateStatus: () => adminPermissions.hasPermission('case_control.update_status_own') || adminPermissions.hasPermission('case_control.update_status_team') || adminPermissions.hasPermission('case_control.update_status_all'),
      canStartTimer: () => adminPermissions.hasPermission('case_control.timer_own') || adminPermissions.hasPermission('case_control.timer_team') || adminPermissions.hasPermission('case_control.timer_all'),
      canAddManualTime: () => adminPermissions.hasPermission('case_control.manual_time_own') || adminPermissions.hasPermission('case_control.manual_time_team') || adminPermissions.hasPermission('case_control.manual_time_all'),
      canEditTime: () => adminPermissions.hasPermission('case_control.manual_time_own') || adminPermissions.hasPermission('case_control.manual_time_team') || adminPermissions.hasPermission('case_control.manual_time_all'),
      canDeleteTime: () => adminPermissions.hasPermission('case_control.manual_time_own') || adminPermissions.hasPermission('case_control.manual_time_team') || adminPermissions.hasPermission('case_control.manual_time_all'),
      canAssignCases: () => adminPermissions.hasPermission('case_control.assign_own') || adminPermissions.hasPermission('case_control.assign_team') || adminPermissions.hasPermission('case_control.assign_all'),
      canReassignCases: () => adminPermissions.hasPermission('case_control.assign_own') || adminPermissions.hasPermission('case_control.assign_team') || adminPermissions.hasPermission('case_control.assign_all'),
      canViewReports: () => adminPermissions.hasPermission('case_control.reports_own') || adminPermissions.hasPermission('case_control.reports_team') || adminPermissions.hasPermission('case_control.reports_all'),
      canExportReports: () => adminPermissions.hasPermission('case_control.reports_own') || adminPermissions.hasPermission('case_control.reports_team') || adminPermissions.hasPermission('case_control.reports_all'),
      canViewTeamReports: () => adminPermissions.hasPermission('case_control.reports_team') || adminPermissions.hasPermission('case_control.reports_all'),
      canViewDashboard: () => adminPermissions.hasPermission('case_control.read_own') || adminPermissions.hasPermission('case_control.read_team') || adminPermissions.hasPermission('case_control.read_all'),
      canViewTeamStats: () => adminPermissions.hasPermission('case_control.reports_team') || adminPermissions.hasPermission('case_control.reports_all'),
      canAccessModule: () => adminPermissions.hasPermission('case_control.read_own') || adminPermissions.hasPermission('case_control.read_team') || adminPermissions.hasPermission('case_control.read_all'),
      canManageCaseControl: () => adminPermissions.hasPermission('case_control.assign_own') || adminPermissions.hasPermission('case_control.assign_team') || adminPermissions.hasPermission('case_control.assign_all'),
      canEditCaseControl: () => adminPermissions.hasPermission('case_control.update_status_own') || adminPermissions.hasPermission('case_control.update_status_team') || adminPermissions.hasPermission('case_control.update_status_all'),
      canViewTimeEntries: () => adminPermissions.hasPermission('case_control.read_own') || adminPermissions.hasPermission('case_control.read_team') || adminPermissions.hasPermission('case_control.read_all'),
      canManageTimeEntries: () => adminPermissions.hasPermission('case_control.manual_time_own') || adminPermissions.hasPermission('case_control.manual_time_team') || adminPermissions.hasPermission('case_control.manual_time_all'),
      isAdmin: adminPermissions.isAdmin
    };
  }, [adminPermissions]);

  return permissions;
};
