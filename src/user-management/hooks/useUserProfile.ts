import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

// Tipo simplificado para UserProfile sin permisos complejos
interface SimpleUserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
  roleDescription: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Hook principal para obtener el perfil del usuario logueado
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<SimpleUserProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles (
            id,
            name,
            description,
            is_active
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        // Auto-crear perfil para nuevos usuarios
        // Buscar el role_id del rol 'user' por defecto
        const { data: userRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role_id: userRole?.id || null,  // Usar role_id en lugar de solo role_name
            role_name: 'user',  // Mantener role_name para compatibilidad
            is_active: false  // ⚠️ CORREGIDO: Nuevos usuarios inactivos por defecto
          })
          .select(`
            *,
            role:roles (
              id,
              name,
              description,
              is_active
            )
          `)
          .single();
          
        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }
        
        return {
          id: newProfile.id,
          email: newProfile.email,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url,
          isActive: newProfile.is_active,
          roleId: newProfile.role_id,
          roleName: newProfile.role?.name || newProfile.role_name,
          roleDescription: newProfile.role?.description,
          createdAt: newProfile.created_at,
          updatedAt: newProfile.updated_at,
        };
      }

      // Mapear de snake_case a camelCase
      const userProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        isActive: data.is_active,
        roleId: data.role_id,
        roleName: data.role?.name || data.role_name,  // Priorizar la relación role
        roleDescription: data.role?.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return userProfile;
    },
    enabled: true,
    staleTime: 1000 * 60 * 1, // Cache por 1 minuto
  });
};

// Hook simplificado para funciones básicas (SIN PERMISOS COMPLEJOS)
export const usePermissions = () => {
  const { data: userProfile } = useUserProfile();

  // Solo usuarios logueados y activos
  const isActiveUser = (): boolean => {
    return !!userProfile && userProfile.isActive;
  };

  // ================================================================
  // PERMISOS BASADOS EN SISTEMA GRANULAR
  // ================================================================
  
  // Helper: Import del hook de permisos granulares
  const { data: userPermissions = [] } = useQuery({
    queryKey: ['userPermissions', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      try {
        const { data: rolePermissions, error } = await supabase
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
          .eq('role_id', userProfile.roleId);

        if (error) {
          console.error('Error fetching role permissions:', error);
          return [];
        }

        const permissions: string[] = [];
        if (rolePermissions) {
          rolePermissions.forEach((rp: any) => {
            if (rp.permissions?.name) {
              permissions.push(rp.permissions.name);
            }
          });
        }

        return permissions;
      } catch (error) {
        console.error('Error in getUserPermissions:', error);
        return [];
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Helper para verificar permisos granulares
  const hasPermission = (permissionName: string): boolean => {
    return userPermissions.includes(permissionName);
  };

  // Helper para verificar permisos con scope
  const hasPermissionWithScope = (resource: string, action: string, scopes: string[] = ['own', 'team', 'all']): boolean => {
    return scopes.some(scope => hasPermission(`${resource}.${action}_${scope}`));
  };

  // ================================================================
  // FUNCIONES DE COMPATIBILIDAD (usando permisos granulares)
  // ================================================================
  
  const isAdmin = (): boolean => {
    // Un usuario es "admin" si tiene permisos administrativos globales
    return hasPermission('users.admin_all') || 
           hasPermission('roles.admin_all') || 
           hasPermission('permissions.admin_all');
  };

  const isSupervisor = (): boolean => {
    // Un usuario es "supervisor" si tiene permisos de equipo
    return hasPermissionWithScope('users', 'admin', ['team']) ||
           hasPermissionWithScope('cases', 'admin', ['team']) ||
           hasPermissionWithScope('todos', 'control', ['team']);
  };

  const isAuditor = (): boolean => {
    // Un usuario es "auditor" si tiene permisos de lectura amplios
    return hasPermissionWithScope('cases', 'read', ['all', 'team']) ||
           hasPermissionWithScope('documentation', 'read', ['all', 'team']);
  };

  // ================================================================
  // PERMISOS ESPECÍFICOS USANDO SISTEMA GRANULAR
  // ================================================================
  
  const canAccessAdmin = (): boolean => {
    return hasPermissionWithScope('users', 'read') || 
           hasPermissionWithScope('roles', 'read') ||
           hasPermissionWithScope('permissions', 'read');
  };

  const canViewUsers = (): boolean => {
    return hasPermissionWithScope('users', 'read');
  };

  const canViewRoles = (): boolean => {
    return hasPermissionWithScope('roles', 'read');
  };

  const canViewPermissions = (): boolean => {
    return hasPermissionWithScope('permissions', 'read');
  };

  const canViewOrigenes = (): boolean => {
    return hasPermissionWithScope('config', 'read');
  };

  const canViewAplicaciones = (): boolean => {
    return hasPermissionWithScope('config', 'read');
  };

  const canViewCaseStatuses = (): boolean => {
    return hasPermissionWithScope('config', 'read');
  };

  const canManageUsers = (): boolean => {
    return hasPermissionWithScope('users', 'update') || 
           hasPermissionWithScope('users', 'create') ||
           hasPermissionWithScope('users', 'delete');
  };

  const canManageRoles = (): boolean => {
    return hasPermissionWithScope('roles', 'update') || 
           hasPermissionWithScope('roles', 'create') ||
           hasPermissionWithScope('roles', 'delete');
  };

  const canManagePermissions = (): boolean => {
    return hasPermissionWithScope('permissions', 'update') || 
           hasPermissionWithScope('permissions', 'create') ||
           hasPermissionWithScope('permissions', 'delete');
  };

  const canManageOrigenes = (): boolean => {
    return hasPermissionWithScope('config', 'update') || hasPermissionWithScope('config', 'admin');
  };

  const canManageAplicaciones = (): boolean => {
    return hasPermissionWithScope('config', 'update') || hasPermissionWithScope('config', 'admin');
  };

  const canCreateCaseStatuses = (): boolean => {
    return hasPermissionWithScope('config', 'create');
  };

  const canUpdateCaseStatuses = (): boolean => {
    return hasPermissionWithScope('config', 'update');
  };

  const canDeleteCaseStatuses = (): boolean => {
    return hasPermissionWithScope('config', 'delete');
  };

  const canManageCaseStatuses = (): boolean => {
    return hasPermissionWithScope('config', 'admin') || canCreateCaseStatuses() || canUpdateCaseStatuses() || canDeleteCaseStatuses();
  };

  const canViewAllCases = (): boolean => {
    return hasPermission('cases.read_all');
  };

  return {
    userProfile,
    hasPermission,
    hasPermissionWithScope,
    userPermissions,
    isAdmin,
    isSupervisor,
    isAuditor,
    isActiveUser,
    canAccessAdmin,
    // Funciones de visualización
    canViewUsers,
    canViewRoles,
    canViewPermissions,
    canViewOrigenes,
    canViewAplicaciones,
    canViewCaseStatuses,
    // Funciones de administración
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canManageOrigenes,
    canManageAplicaciones,
    canCreateCaseStatuses,
    canUpdateCaseStatuses,
    canDeleteCaseStatuses,
    canManageCaseStatuses,
    // Funciones específicas
    canViewAllCases,
  };
};
