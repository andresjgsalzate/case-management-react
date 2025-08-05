// ================================================================
// HOOKS PARA GESTIÓN DE PERMISOS
// ================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionsService } from '../services/PermissionsService';
import type { 
  CreatePermissionData, 
  UpdatePermissionData, 
  PermissionFilters 
} from '../types/permissions';

// ================================================================
// OBTENER LISTA DE PERMISOS
// ================================================================
export const usePermissions = (filters: PermissionFilters = {}) => {
  return useQuery({
    queryKey: ['permissions', filters],
    queryFn: () => PermissionsService.getPermissions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ================================================================
// OBTENER PERMISO POR ID
// ================================================================
export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: () => PermissionsService.getPermissionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ================================================================
// CREAR PERMISO
// ================================================================
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionData: CreatePermissionData) => PermissionsService.createPermission(permissionData),
    onSuccess: () => {
      // Invalidar cache de permisos
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
    onError: (error) => {
      console.error('Error creating permission:', error);
    },
  });
};

// ================================================================
// ACTUALIZAR PERMISO
// ================================================================
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionData: UpdatePermissionData) => PermissionsService.updatePermission(permissionData),
    onSuccess: (_, variables) => {
      // Invalidar cache de permisos
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      // Invalidar cache del permiso específico
      queryClient.invalidateQueries({ queryKey: ['permission', variables.id] });
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
    },
  });
};

// ================================================================
// ELIMINAR PERMISO
// ================================================================
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PermissionsService.deletePermission(id),
    onSuccess: () => {
      // Invalidar cache de permisos
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      // Invalidar cache de roles (por si tenían este permiso)
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      console.error('Error deleting permission:', error);
    },
  });
};

// ================================================================
// OBTENER RECURSOS
// ================================================================
export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => PermissionsService.getResources(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// ================================================================
// OBTENER ACCIONES
// ================================================================
export const useActions = () => {
  return useQuery({
    queryKey: ['actions'],
    queryFn: () => PermissionsService.getActions(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// ================================================================
// OBTENER PERMISOS AGRUPADOS POR RECURSO
// ================================================================
export const usePermissionsGroupedByResource = () => {
  return useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: () => PermissionsService.getPermissionsGroupedByResource(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
