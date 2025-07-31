import { usePermissions, useUserProfile } from '@/hooks/useUserProfile';
import { DisposicionScripts } from '@/types';

export const useDisposicionScriptsPermissions = () => {
  const { hasPermission, isAdmin } = usePermissions();
  const { data: userProfile } = useUserProfile();

  // Permisos básicos usando la nomenclatura de dos puntos que existe en la BD
  const canCreateDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'create');
  const canReadDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'read');
  const canUpdateDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'update');
  const canDeleteDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'delete');
  const canExportDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'export');

  // Permisos administrativos (ver/editar/eliminar TODAS las disposiciones)
  const canReadAllDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'read_all');
  const canUpdateAllDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'update_all');
  const canDeleteAllDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'delete_all');
  const canViewAllDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'view_all');
  const canManageDisposiciones = isAdmin() || hasPermission('disposiciones_scripts', 'manage');

  // Función para verificar si puede eliminar una disposición específica
  const canDeleteSpecificDisposicion = (disposicion: DisposicionScripts): boolean => {
    // Los admins o usuarios con permiso delete_all pueden eliminar cualquier disposición
    if (isAdmin() || canDeleteAllDisposiciones) {
      return true;
    }
    
    // Los usuarios con permiso básico solo pueden eliminar sus propias disposiciones
    if (canDeleteDisposiciones && userProfile) {
      return disposicion.userId === userProfile.id;
    }
    
    return false;
  };

  // Función para verificar si puede editar una disposición específica
  const canEditSpecificDisposicion = (disposicion: DisposicionScripts): boolean => {
    // Los admins o usuarios con permiso update_all pueden editar cualquier disposición
    if (isAdmin() || canUpdateAllDisposiciones) {
      return true;
    }
    
    // Los usuarios con permiso básico solo pueden editar sus propias disposiciones
    if (canUpdateDisposiciones && userProfile) {
      return disposicion.userId === userProfile.id;
    }
    
    return false;
  };

  return {
    // Permisos básicos (propias disposiciones)
    canCreateDisposiciones,
    canReadDisposiciones,
    canUpdateDisposiciones,
    canDeleteDisposiciones,
    canExportDisposiciones,
    
    // Permisos administrativos (todas las disposiciones)
    canReadAllDisposiciones,
    canUpdateAllDisposiciones,
    canDeleteAllDisposiciones,
    canViewAllDisposiciones,
    canManageDisposiciones,
    
    // Funciones de validación específica
    canDeleteSpecificDisposicion,
    canEditSpecificDisposicion,
    
    // Información adicional
    hasAnyPermission: canCreateDisposiciones || canReadDisposiciones || canUpdateDisposiciones || canDeleteDisposiciones,
    isAdmin: isAdmin(),
    currentUserId: userProfile?.id,
  };
};
