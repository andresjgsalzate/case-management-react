// Hook temporal vacío - TODOS los permisos permitidos
export const useCaseControlPermissions = () => {
  return {
    canViewCaseControl: () => true,
    canViewAllCaseControls: () => true,
    canViewOwnCaseControls: () => true,
    canManageStatus: () => true,
    canUpdateStatus: () => true,
    canStartTimer: () => true,
    canAddManualTime: () => true,
    canEditTime: () => true,
    canDeleteTime: () => true,
    canAssignCases: () => true,
    canReassignCases: () => true,
    canViewReports: () => true,
    canExportReports: () => true,
    canViewTeamReports: () => true,
    canViewDashboard: () => true,
    canViewTeamStats: () => true,
    canAccessModule: () => true,
    canManageCaseControl: () => true,
    canEditCaseControl: () => true,
    canViewTimeEntries: () => true,
    canManageTimeEntries: () => true,
    userProfile: null,
    isAdmin: false
  };
};
