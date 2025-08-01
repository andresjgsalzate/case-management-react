import { usePermissions } from '@/user-management/hooks/useUserProfile';

/**
 * Hook para manejar permisos específicos del módulo Control de Casos
 */
export const useCaseControlPermissions = () => {
  const { userProfile, isAdmin } = usePermissions();

  // Función helper para verificar permisos por nombre completo
  const hasModulePermission = (permissionName: string): boolean => {
    if (!userProfile?.role?.permissions) return false;
    return userProfile.role.permissions.some(
      permission => permission.name === permissionName && permission.isActive
    );
  };

  // Permisos generales del módulo
  const canViewCaseControl = () => hasModulePermission('case_control.view');
  const canViewAllCaseControls = () => hasModulePermission('case_control.view_all') || isAdmin();
  const canViewOwnCaseControls = () => hasModulePermission('case_control.view_own');

  // Permisos de gestión de estados
  const canManageStatus = () => hasModulePermission('case_control.manage_status') || isAdmin();
  const canUpdateStatus = () => hasModulePermission('case_control.update_status');

  // Permisos de tiempo
  const canStartTimer = () => hasModulePermission('case_control.start_timer');
  const canAddManualTime = () => hasModulePermission('case_control.add_manual_time');
  const canEditTime = () => hasModulePermission('case_control.edit_time');
  const canDeleteTime = () => hasModulePermission('case_control.delete_time');

  // Permisos de asignación
  const canAssignCases = () => hasModulePermission('case_control.assign_cases') || isAdmin();
  const canReassignCases = () => hasModulePermission('case_control.reassign_cases') || isAdmin();

  // Permisos de reportes
  const canViewReports = () => hasModulePermission('case_control.view_reports');
  const canExportReports = () => hasModulePermission('case_control.export_reports');
  const canViewTeamReports = () => hasModulePermission('case_control.view_team_reports') || isAdmin();

  // Permisos de dashboard
  const canViewDashboard = () => hasModulePermission('case_control.view_dashboard');
  const canViewTeamStats = () => hasModulePermission('case_control.view_team_stats') || isAdmin();

  // Funciones de utilidad
  const canAccessModule = () => {
    return canViewCaseControl() && (canViewAllCaseControls() || canViewOwnCaseControls());
  };

  const canManageCaseControl = (caseControlUserId?: string) => {
    if (!caseControlUserId) return false;
    
    // Admin puede gestionar todos
    if (canViewAllCaseControls()) return true;
    
    // Usuario solo puede gestionar los suyos
    return canViewOwnCaseControls() && caseControlUserId === userProfile?.id;
  };

  const canEditCaseControl = (caseControlUserId?: string) => {
    if (!caseControlUserId) return false;
    
    // Admin puede editar todos
    if (canReassignCases() && canViewAllCaseControls()) return true;
    
    // Usuario solo puede editar los suyos si tiene permisos
    return (canUpdateStatus() || canStartTimer()) && caseControlUserId === userProfile?.id;
  };

  const canViewTimeEntries = (caseControlUserId?: string) => {
    if (!caseControlUserId) return false;
    
    // Admin puede ver todos
    if (canViewAllCaseControls()) return true;
    
    // Usuario solo puede ver los suyos
    return canViewOwnCaseControls() && caseControlUserId === userProfile?.id;
  };

  const canManageTimeEntries = (entryUserId?: string) => {
    if (!entryUserId) return false;
    
    // Admin puede gestionar todos si tiene permisos
    if (canViewAllCaseControls() && (canEditTime() || canDeleteTime())) return true;
    
    // Usuario solo puede gestionar sus propias entradas
    return (canEditTime() || canDeleteTime()) && entryUserId === userProfile?.id;
  };

  return {
    // Estado
    userProfile,
    isAdmin,
    
    // Permisos generales
    canViewCaseControl,
    canViewAllCaseControls,
    canViewOwnCaseControls,
    canAccessModule,
    
    // Gestión de estados
    canManageStatus,
    canUpdateStatus,
    
    // Tiempo
    canStartTimer,
    canAddManualTime,
    canEditTime,
    canDeleteTime,
    
    // Asignación
    canAssignCases,
    canReassignCases,
    
    // Reportes
    canViewReports,
    canExportReports,
    canViewTeamReports,
    
    // Dashboard
    canViewDashboard,
    canViewTeamStats,
    
    // Funciones de utilidad
    canManageCaseControl,
    canEditCaseControl,
    canViewTimeEntries,
    canManageTimeEntries
  };
};
