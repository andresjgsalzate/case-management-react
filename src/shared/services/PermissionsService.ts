// ================================================================
// SERVICIO DE GESTIÓN DE PERMISOS
// ================================================================

import { supabase } from '../lib/supabase';
import type { 
  Permission, 
  PermissionWithRoles,
  CreatePermissionData, 
  UpdatePermissionData, 
  PermissionFilters,
  PermissionListResponse 
} from '../types/permissions';

export class PermissionsService {
  // ================================================================
  // OBTENER TODOS LOS PERMISOS
  // ================================================================
  static async getPermissions(filters: PermissionFilters = {}): Promise<PermissionListResponse> {
    try {
      let query = supabase
        .from('permissions')
        .select('*');

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.scope) {
        query = query.eq('scope', filters.scope);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Ordenar por recurso y acción
      query = query.order('resource', { ascending: true })
                   .order('action', { ascending: true });

      // Paginación
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching permissions:', error);
        throw new Error('Error al obtener los permisos');
      }

      return {
        permissions: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getPermissions:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER PERMISO POR ID CON ROLES
  // ================================================================
  static async getPermissionById(id: string): Promise<PermissionWithRoles | null> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select(`
          *,
          role_permissions (
            role_id,
            roles (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching permission:', error);
        throw new Error('Error al obtener el permiso');
      }

      if (!data) return null;

      // Transformar los datos para incluir los roles
      const permissionWithRoles: PermissionWithRoles = {
        ...data,
        roles: data.role_permissions?.map((rp: any) => rp.roles) || []
      };

      return permissionWithRoles;
    } catch (error) {
      console.error('Error in getPermissionById:', error);
      throw error;
    }
  }

  // ================================================================
  // CREAR NUEVO PERMISO
  // ================================================================
  static async createPermission(permissionData: CreatePermissionData): Promise<Permission> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .insert([{
          name: permissionData.name,
          description: permissionData.description || null,
          resource: permissionData.resource,
          action: permissionData.action,
          scope: permissionData.scope || null,
          is_active: permissionData.is_active ?? true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating permission:', error);
        throw new Error('Error al crear el permiso');
      }

      return data;
    } catch (error) {
      console.error('Error in createPermission:', error);
      throw error;
    }
  }

  // ================================================================
  // ACTUALIZAR PERMISO
  // ================================================================
  static async updatePermission(permissionData: UpdatePermissionData): Promise<Permission> {
    try {
      const updateData: any = {};
      
      if (permissionData.name !== undefined) updateData.name = permissionData.name;
      if (permissionData.description !== undefined) updateData.description = permissionData.description;
      if (permissionData.resource !== undefined) updateData.resource = permissionData.resource;
      if (permissionData.action !== undefined) updateData.action = permissionData.action;
      if (permissionData.scope !== undefined) updateData.scope = permissionData.scope;
      if (permissionData.is_active !== undefined) updateData.is_active = permissionData.is_active;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('permissions')
        .update(updateData)
        .eq('id', permissionData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating permission:', error);
        throw new Error('Error al actualizar el permiso');
      }

      return data;
    } catch (error) {
      console.error('Error in updatePermission:', error);
      throw error;
    }
  }

  // ================================================================
  // ELIMINAR PERMISO
  // ================================================================
  static async deletePermission(id: string): Promise<void> {
    try {
      // Primero eliminar las relaciones con roles
      const { error: rolesError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('permission_id', id);

      if (rolesError) {
        console.error('Error deleting permission roles:', rolesError);
        throw new Error('Error al eliminar las relaciones del permiso');
      }

      // Luego eliminar el permiso
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting permission:', error);
        throw new Error('Error al eliminar el permiso');
      }
    } catch (error) {
      console.error('Error in deletePermission:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER RECURSOS ÚNICOS
  // ================================================================
  static async getResources(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('resource')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching resources:', error);
        throw new Error('Error al obtener los recursos');
      }

      // Obtener valores únicos
      const uniqueResources = [...new Set(data?.map(p => p.resource) || [])];
      return uniqueResources.sort();
    } catch (error) {
      console.error('Error in getResources:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER ACCIONES ÚNICAS
  // ================================================================
  static async getActions(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('action')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching actions:', error);
        throw new Error('Error al obtener las acciones');
      }

      // Obtener valores únicos
      const uniqueActions = [...new Set(data?.map(p => p.action) || [])];
      return uniqueActions.sort();
    } catch (error) {
      console.error('Error in getActions:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER PERMISOS AGRUPADOS POR RECURSO
  // ================================================================
  static async getPermissionsGroupedByResource(): Promise<Record<string, Permission[]>> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('resource')
        .order('action');

      if (error) {
        console.error('Error fetching grouped permissions:', error);
        throw new Error('Error al obtener los permisos agrupados');
      }

      // Agrupar por recurso
      const grouped = (data || []).reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>);

      return grouped;
    } catch (error) {
      console.error('Error in getPermissionsGroupedByResource:', error);
      throw error;
    }
  }
}
