// ================================================================
// HOOKS PARA GESTIÓN DE ROLES
// ================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RolesService } from '../services/RolesService';
import type { 
  CreateRoleData, 
  UpdateRoleData, 
  RoleFilters 
} from '../types/permissions';

// ================================================================
// OBTENER LISTA DE ROLES
// ================================================================
export const useRoles = (filters: RoleFilters = {}) => {
  return useQuery({
    queryKey: ['roles', filters],
    queryFn: () => RolesService.getRoles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ================================================================
// OBTENER ROL POR ID
// ================================================================
export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => RolesService.getRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ================================================================
// CREAR ROL
// ================================================================
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: CreateRoleData) => RolesService.createRole(roleData),
    onSuccess: () => {
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidar contadores
      queryClient.invalidateQueries({ queryKey: ['roleStats'] });
    },
    onError: (error) => {
      console.error('Error creating role:', error);
    },
  });
};

// ================================================================
// ACTUALIZAR ROL
// ================================================================
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: UpdateRoleData) => RolesService.updateRole(roleData),
    onSuccess: (_, variables) => {
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidar cache del rol específico
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      // Invalidar contadores
      queryClient.invalidateQueries({ queryKey: ['roleStats'] });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
    },
  });
};

// ================================================================
// ELIMINAR ROL
// ================================================================
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RolesService.deleteRole(id),
    onSuccess: () => {
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidar contadores
      queryClient.invalidateQueries({ queryKey: ['roleStats'] });
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
    },
  });
};

// ================================================================
// ASIGNAR PERMISO A ROL
// ================================================================
export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      RolesService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      // Invalidar cache del rol específico
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      console.error('Error assigning permission to role:', error);
    },
  });
};

// ================================================================
// QUITAR PERMISO DE ROL
// ================================================================
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      RolesService.removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      // Invalidar cache del rol específico
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      console.error('Error removing permission from role:', error);
    },
  });
};

// ================================================================
// ACTUALIZAR PERMISOS DE ROL
// ================================================================
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => 
      RolesService.updateRolePermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      // Invalidar cache del rol específico
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidar contadores
      queryClient.invalidateQueries({ queryKey: ['roleStats'] });
    },
    onError: (error) => {
      console.error('Error updating role permissions:', error);
    },
  });
};

// ================================================================
// OBTENER CONTADORES DE UN ROL ESPECÍFICO
// ================================================================
export const useRoleStats = (roleId: string) => {
  return useQuery({
    queryKey: ['roleStats', roleId],
    queryFn: () => RolesService.getRoleStats(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// ================================================================
// OBTENER CONTADORES DE TODOS LOS ROLES
// ================================================================
export const useAllRolesStats = () => {
  return useQuery({
    queryKey: ['roleStats', 'all'],
    queryFn: () => RolesService.getAllRolesStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
