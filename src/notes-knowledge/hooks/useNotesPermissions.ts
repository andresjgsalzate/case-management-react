// Hook temporal vacío - TODOS los permisos permitidos
export const useNotesPermissions = () => {
  return {
    canViewNotes: true,
    canViewAllNotes: true,
    canCreateNotes: true,
    canEditNotes: true,
    canEditAllNotes: true,
    canDeleteNotes: true,
    canDeleteAllNotes: true,
    canAssignNotes: true,
    canArchiveNotes: true,
    canManageTags: true,
    canAssociateCases: true,
    canViewTeamNotes: true,
    canExportNotes: true,
    canAccessNotesModule: true
  };
};
