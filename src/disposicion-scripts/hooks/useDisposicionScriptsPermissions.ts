// Hook temporal vacío - TODOS los permisos permitidos
export const useDisposicionScriptsPermissions = () => {
  return {
    canCreateDisposiciones: true,
    canReadDisposiciones: true,
    canUpdateDisposiciones: true,
    canDeleteDisposiciones: true,
    canExportDisposiciones: true,
    canReadAllDisposiciones: true,
    canUpdateAllDisposiciones: true,
    canDeleteAllDisposiciones: true,
    canViewAllDisposiciones: true,
    canManageDisposiciones: true,
    canDeleteSpecificDisposicion: () => true,
    canEditSpecificDisposicion: () => true,
    hasAnyPermission: true,
    isAdmin: false,
    currentUserId: null
  };
};
