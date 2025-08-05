// ================================================================
// HOOKS PARA PERMISOS DE ADMINISTRACIÓN
// ================================================================

import { useUserProfile } from '../../user-management/hooks/useUserProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface AdminPermissions {
  // Usuarios
  canReadUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canAdminUsers: boolean;

  // Roles
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canUpdateRoles: boolean;
  canDeleteRoles: boolean;
  canAdminRoles: boolean;

  // Permisos
  canReadPermissions: boolean;
  canCreatePermissions: boolean;
  canUpdatePermissions: boolean;
  canDeletePermissions: boolean;
  canAdminPermissions: boolean;

  // Asignación de permisos
  canReadRolePermissions: boolean;
  canCreateRolePermissions: boolean;
  canUpdateRolePermissions: boolean;
  canDeleteRolePermissions: boolean;
  canAdminRolePermissions: boolean;

  // Configuración
  canReadConfig: boolean;
  canCreateConfig: boolean;
  canUpdateConfig: boolean;
  canDeleteConfig: boolean;
  canAdminConfig: boolean;

  // Etiquetas
  canReadTags: boolean;
  canCreateTags: boolean;
  canUpdateTags: boolean;
  canDeleteTags: boolean;
  canAdminTags: boolean;

  // Tipos de documentos
  canReadDocumentTypes: boolean;
  canCreateDocumentTypes: boolean;
  canUpdateDocumentTypes: boolean;
  canDeleteDocumentTypes: boolean;
  canAdminDocumentTypes: boolean;

  // Helper functions
  isAdmin: boolean;
  hasAnyAdminPermission: boolean;
}

// ================================================================
// OBTENER PERMISOS DEL USUARIO ACTUAL
// ================================================================
const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    console.log('🔍 [AdminPermissions] Obteniendo permisos para usuario:', userId);
    
    // Obtener el role_id del usuario
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('role_id')
      .eq('id', userId)
      .single();

    if (userError || !userProfile?.role_id) {
      console.error('❌ [AdminPermissions] Error fetching user profile:', userError);
      console.log('📄 [AdminPermissions] User profile data:', userProfile);
      return [];
    }

    console.log('👤 [AdminPermissions] Usuario encontrado:', {
      userId,
      roleId: userProfile.role_id
    });

    // Obtener información del rol
    const { data: roleInfo, error: roleError } = await supabase
      .from('roles')
      .select('name, description, is_active')
      .eq('id', userProfile.role_id)
      .single();

    if (roleError) {
      console.error('❌ [AdminPermissions] Error fetching role info:', roleError);
    } else {
      console.log('🏷️ [AdminPermissions] Información del rol:', {
        roleId: userProfile.role_id,
        roleName: roleInfo.name,
        roleDescription: roleInfo.description,
        isActive: roleInfo.is_active
      });
    }

    // Obtener los permisos del rol
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name,
          description,
          resource,
          action,
          scope
        )
      `)
      .eq('role_id', userProfile.role_id);

    if (permissionsError) {
      console.error('❌ [AdminPermissions] Error fetching role permissions:', permissionsError);
      return [];
    }

    console.log('📋 [AdminPermissions] Permisos del rol encontrados:', rolePermissions?.length || 0);

    // Extraer los nombres de permisos
    const permissions: string[] = [];
    if (rolePermissions) {
      rolePermissions.forEach((rp: any) => {
        if (rp.permissions?.name) {
          permissions.push(rp.permissions.name);
        }
      });
    }

    console.log('🎯 [AdminPermissions] Total permisos extraídos:', permissions.length);

    return permissions;
  } catch (error) {
    console.error('💥 [AdminPermissions] Error in getUserPermissions:', error);
    return [];
  }
};

// Variable para controlar logs únicos
let hasLoggedUserProfile = false;

// ================================================================
// HOOK PRINCIPAL PARA PERMISOS DE ADMINISTRACIÓN
// ================================================================
export const useAdminPermissions = (): AdminPermissions => {
  const { data: userProfile } = useUserProfile();

  // Log única vez cuando hay datos de userProfile
  if (userProfile?.id && !hasLoggedUserProfile) {
    console.log('✅ [AdminPermissions] UserProfile recibido:', {
      userId: userProfile.id,
      email: userProfile.email,
      roleName: userProfile.roleName,
      isActive: userProfile.isActive
    });
    hasLoggedUserProfile = true;
  }

  // Obtener permisos del usuario
  const { data: userPermissions = [], isLoading, error } = useQuery({
    queryKey: ['userPermissions', userProfile?.id],
    queryFn: () => getUserPermissions(userProfile!.id),
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Solo log cuando hay cambios importantes
  if (userProfile && userPermissions.length === 0 && !isLoading) {
    console.log('⚠️ [AdminPermissions] Usuario con ID pero sin permisos:', {
      userId: userProfile.id,
      userEmail: userProfile.email,
      permissionsCount: userPermissions.length,
      isLoading,
      error: error?.message
    });
  }

  // Helper para verificar permisos
  const hasPermission = (permissionName: string): boolean => {
    return userPermissions.includes(permissionName);
  };

  // Helper para verificar permisos con scope
  const hasPermissionWithScope = (resource: string, action: string, scopes: string[] = ['own', 'team', 'all']): boolean => {
    return scopes.some(scope => hasPermission(`${resource}.${action}_${scope}`));
  };

  // Calcular permisos específicos
  const permissions: AdminPermissions = {
    // Usuarios
    canReadUsers: hasPermissionWithScope('users', 'read') || hasPermission('users.admin_all'),
    canCreateUsers: hasPermissionWithScope('users', 'create') || hasPermission('users.admin_all'),
    canUpdateUsers: hasPermissionWithScope('users', 'update') || hasPermission('users.admin_all'),
    canDeleteUsers: hasPermissionWithScope('users', 'delete') || hasPermission('users.admin_all'),
    canAdminUsers: hasPermission('users.admin_all') || hasPermission('users.admin_team'),

    // Roles
    canReadRoles: hasPermissionWithScope('roles', 'read') || hasPermission('roles.admin_all'),
    canCreateRoles: hasPermissionWithScope('roles', 'create') || hasPermission('roles.admin_all'),
    canUpdateRoles: hasPermissionWithScope('roles', 'update') || hasPermission('roles.admin_all'),
    canDeleteRoles: hasPermissionWithScope('roles', 'delete') || hasPermission('roles.admin_all'),
    canAdminRoles: hasPermission('roles.admin_all') || hasPermission('roles.admin_team'),

    // Permisos
    canReadPermissions: hasPermissionWithScope('permissions', 'read') || hasPermission('permissions.admin_all'),
    canCreatePermissions: hasPermissionWithScope('permissions', 'create') || hasPermission('permissions.admin_all'),
    canUpdatePermissions: hasPermissionWithScope('permissions', 'update') || hasPermission('permissions.admin_all'),
    canDeletePermissions: hasPermissionWithScope('permissions', 'delete') || hasPermission('permissions.admin_all'),
    canAdminPermissions: hasPermission('permissions.admin_all') || hasPermission('permissions.admin_team'),

    // Asignación de permisos
    canReadRolePermissions: hasPermissionWithScope('role_permissions', 'read') || hasPermission('role_permissions.admin_all'),
    canCreateRolePermissions: hasPermissionWithScope('role_permissions', 'create') || hasPermission('role_permissions.admin_all'),
    canUpdateRolePermissions: hasPermissionWithScope('role_permissions', 'update') || hasPermission('role_permissions.admin_all'),
    canDeleteRolePermissions: hasPermissionWithScope('role_permissions', 'delete') || hasPermission('role_permissions.admin_all'),
    canAdminRolePermissions: hasPermission('role_permissions.admin_all') || hasPermission('role_permissions.admin_team'),

    // Configuración
    canReadConfig: hasPermissionWithScope('config', 'read') || hasPermission('config.admin_all'),
    canCreateConfig: hasPermissionWithScope('config', 'create') || hasPermission('config.admin_all'),
    canUpdateConfig: hasPermissionWithScope('config', 'update') || hasPermission('config.admin_all'),
    canDeleteConfig: hasPermissionWithScope('config', 'delete') || hasPermission('config.admin_all'),
    canAdminConfig: hasPermission('config.admin_all') || hasPermission('config.admin_team'),

    // Etiquetas
    canReadTags: hasPermissionWithScope('tags', 'read') || hasPermission('tags.admin_all'),
    canCreateTags: hasPermissionWithScope('tags', 'create') || hasPermission('tags.admin_all'),
    canUpdateTags: hasPermissionWithScope('tags', 'update') || hasPermission('tags.admin_all'),
    canDeleteTags: hasPermissionWithScope('tags', 'delete') || hasPermission('tags.admin_all'),
    canAdminTags: hasPermission('tags.admin_all') || hasPermission('tags.admin_team'),

    // Tipos de documentos
    canReadDocumentTypes: hasPermissionWithScope('document_types', 'read') || hasPermission('document_types.admin_all'),
    canCreateDocumentTypes: hasPermissionWithScope('document_types', 'create') || hasPermission('document_types.admin_all'),
    canUpdateDocumentTypes: hasPermissionWithScope('document_types', 'update') || hasPermission('document_types.admin_all'),
    canDeleteDocumentTypes: hasPermissionWithScope('document_types', 'delete') || hasPermission('document_types.admin_all'),
    canAdminDocumentTypes: hasPermission('document_types.admin_all') || hasPermission('document_types.admin_team'),

    // Helper functions
    isAdmin: hasPermission('users.admin_all') || hasPermission('roles.admin_all') || hasPermission('permissions.admin_all'),
    hasAnyAdminPermission: userPermissions.some(p => 
      p.includes('admin_') || 
      p.includes('users.') || 
      p.includes('roles.') || 
      p.includes('permissions.') ||
      p.includes('config.') ||
      p.includes('tags.') ||
      p.includes('document_types.')
    )
  };

  return permissions;
};
