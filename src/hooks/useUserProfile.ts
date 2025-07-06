import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

// Función helper para mapear datos de DB a UserProfile
const mapUserProfileData = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    roleId: data.role_id,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    role: data.role ? {
      id: data.role.id,
      name: data.role.name,
      description: data.role.description,
      isActive: data.role.is_active,
      createdAt: data.role.created_at,
      updatedAt: data.role.updated_at,
      permissions: data.role.role_permissions?.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action,
        isActive: rp.permission.is_active,
        createdAt: rp.permission.created_at,
        updatedAt: rp.permission.updated_at,
      })) || []
    } : undefined
  };
};

// Hook para obtener el perfil del usuario actual con roles y permisos
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile | null> => {
      console.log('🔍 Fetching user profile...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No user found');
        return null;
      }

      console.log('👤 User found:', user.email, 'ID:', user.id);

      // Try the full query with joins since RLS should be fixed now
      let { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles (
            *,
            role_permissions (
              permission:permissions (*)
            )
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        
        // Check if it's still the infinite recursion error
        if (error.code === '42P17' && error.message?.includes('infinite recursion')) {
          console.error('🔄 RLS infinite recursion still detected. Please check the migration was applied correctly.');
          throw error;
        }
        
        throw error;
      }

      if (!data) {
        console.log('❌ No user profile data found, attempting to create one...');
        
        // Try to create a user profile for this user
        const { data: roles } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();
          
        if (roles) {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              role_id: roles.id,
              is_active: true
            })
            .select(`
              *,
              role:roles (
                *,
                role_permissions (
                  permission:permissions (*)
                )
              )
            `)
            .single();
            
          if (createError) {
            console.error('❌ Error creating user profile:', createError);
            throw createError;
          }
          
          console.log('✅ User profile created successfully');
          return mapUserProfileData(newProfile);
        } else {
          console.error('❌ No default user role found');
          return null;
        }
      }

      console.log('✅ User profile fetched:', data.email, 'Role:', data.role?.name);
      return mapUserProfileData(data);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // Don't retry on RLS recursion errors
      if (error?.code === '42P17' && error?.message?.includes('infinite recursion')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook para verificar si el usuario tiene un permiso específico
export const usePermissions = () => {
  const { data: userProfile, error } = useUserProfile();

  // Check for RLS recursion error
  const hasRLSError = error && 'code' in error && error.code === '42P17' && 
                     'message' in error && error.message?.includes('infinite recursion');

  const hasPermission = (resource: string, action: string): boolean => {
    if (hasRLSError || !userProfile?.role?.permissions) return false;
    
    return userProfile.role.permissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action && 
        permission.isActive
    );
  };

  const isAdmin = (): boolean => {
    if (hasRLSError) return false;
    return userProfile?.role?.name === 'admin' || false;
  };

  const isSupervisor = (): boolean => {
    if (hasRLSError) return false;
    return userProfile?.role?.name === 'supervisor' || false;
  };

  const canAccessAdmin = (): boolean => {
    return hasPermission('admin', 'access') || isAdmin() || isSupervisor();
  };

  // Funciones para "ver" secciones (solo lectura)
  const canViewUsers = (): boolean => {
    return hasPermission('users', 'read') || hasPermission('users', 'manage') || isAdmin();
  };

  const canViewRoles = (): boolean => {
    return hasPermission('roles', 'read') || hasPermission('roles', 'manage') || isAdmin();
  };

  const canViewPermissions = (): boolean => {
    return hasPermission('permissions', 'read') || hasPermission('permissions', 'manage') || isAdmin();
  };

  const canViewOrigenes = (): boolean => {
    return hasPermission('origenes', 'read') || hasPermission('origenes', 'manage') || isAdmin();
  };

  const canViewAplicaciones = (): boolean => {
    return hasPermission('aplicaciones', 'read') || hasPermission('aplicaciones', 'manage') || isAdmin();
  };

  // Funciones para "administrar" (crear/editar/eliminar)
  const canManageUsers = (): boolean => {
    return hasPermission('users', 'manage') || isAdmin();
  };

  const canManageRoles = (): boolean => {
    return hasPermission('roles', 'manage') || isAdmin();
  };

  const canManagePermissions = (): boolean => {
    return hasPermission('permissions', 'manage') || isAdmin();
  };

  const canManageOrigenes = (): boolean => {
    return hasPermission('origenes', 'manage') || isAdmin();
  };

  const canManageAplicaciones = (): boolean => {
    return hasPermission('aplicaciones', 'manage') || isAdmin();
  };

  const canViewAllCases = (): boolean => {
    // Verificar directamente por el nombre del permiso completo
    if (hasRLSError || !userProfile?.role?.permissions) return false;
    
    return userProfile.role.permissions.some(
      permission => 
        permission.name === 'cases.read.all' && permission.isActive
    ) || isAdmin();
  };

  return {
    userProfile,
    hasPermission,
    isAdmin,
    isSupervisor,
    canAccessAdmin,
    // Funciones de visualización
    canViewUsers,
    canViewRoles,
    canViewPermissions,
    canViewOrigenes,
    canViewAplicaciones,
    // Funciones de administración
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canManageOrigenes,
    canManageAplicaciones,
    canViewAllCases,
    hasRLSError,
  };
};
