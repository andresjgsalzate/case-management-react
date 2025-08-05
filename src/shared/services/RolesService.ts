// ================================================================
// SERVICIO DE GESTIÓN DE ROLES
// ================================================================

import { supabase } from '../lib/supabase';
import type { 
  Role, 
  RoleWithPermissions,
  CreateRoleData, 
  UpdateRoleData, 
  RoleFilters,
  RoleListResponse 
} from '../types/permissions';

export class RolesService {
  // ================================================================
  // OBTENER TODOS LOS ROLES
  // ================================================================
  static async getRoles(filters: RoleFilters = {}): Promise<RoleListResponse> {
    try {
      let query = supabase
        .from('roles')
        .select('*');

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Ordenar por nombre
      query = query.order('name', { ascending: true });

      // Paginación
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching roles:', error);
        throw new Error('Error al obtener los roles');
      }

      return {
        roles: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getRoles:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER ROL POR ID CON PERMISOS
  // ================================================================
  static async getRoleById(id: string): Promise<RoleWithPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permission_id,
            permissions (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        throw new Error('Error al obtener el rol');
      }

      if (!data) return null;

      // Transformar los datos para incluir los permisos
      const roleWithPermissions: RoleWithPermissions = {
        ...data,
        permissions: data.role_permissions?.map((rp: any) => rp.permissions) || []
      };

      return roleWithPermissions;
    } catch (error) {
      console.error('Error in getRoleById:', error);
      throw error;
    }
  }

  // ================================================================
  // CREAR NUEVO ROL
  // ================================================================
  static async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name: roleData.name,
          description: roleData.description || null,
          is_active: roleData.is_active ?? true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating role:', error);
        throw new Error('Error al crear el rol');
      }

      return data;
    } catch (error) {
      console.error('Error in createRole:', error);
      throw error;
    }
  }

  // ================================================================
  // ACTUALIZAR ROL
  // ================================================================
  static async updateRole(roleData: UpdateRoleData): Promise<Role> {
    try {
      const updateData: any = {};
      
      if (roleData.name !== undefined) updateData.name = roleData.name;
      if (roleData.description !== undefined) updateData.description = roleData.description;
      if (roleData.is_active !== undefined) updateData.is_active = roleData.is_active;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('roles')
        .update(updateData)
        .eq('id', roleData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating role:', error);
        throw new Error('Error al actualizar el rol');
      }

      return data;
    } catch (error) {
      console.error('Error in updateRole:', error);
      throw error;
    }
  }

  // ================================================================
  // ELIMINAR ROL
  // ================================================================
  static async deleteRole(id: string): Promise<void> {
    try {
      // Primero eliminar las relaciones de permisos
      const { error: permissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      if (permissionsError) {
        console.error('Error deleting role permissions:', permissionsError);
        throw new Error('Error al eliminar los permisos del rol');
      }

      // Luego eliminar el rol
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting role:', error);
        throw new Error('Error al eliminar el rol');
      }
    } catch (error) {
      console.error('Error in deleteRole:', error);
      throw error;
    }
  }

  // ================================================================
  // ASIGNAR PERMISO A ROL
  // ================================================================
  static async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .insert([{
          role_id: roleId,
          permission_id: permissionId
        }]);

      if (error) {
        console.error('Error assigning permission to role:', error);
        throw new Error('Error al asignar el permiso al rol');
      }
    } catch (error) {
      console.error('Error in assignPermissionToRole:', error);
      throw error;
    }
  }

  // ================================================================
  // QUITAR PERMISO DE ROL
  // ================================================================
  static async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);

      if (error) {
        console.error('Error removing permission from role:', error);
        throw new Error('Error al quitar el permiso del rol');
      }
    } catch (error) {
      console.error('Error in removePermissionFromRole:', error);
      throw error;
    }
  }

  // ================================================================
  // ACTUALIZAR PERMISOS DE ROL (REEMPLAZAR TODOS)
  // ================================================================
  static async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      // Primero eliminar todos los permisos existentes
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error('Error al eliminar los permisos existentes');
      }

      // Luego insertar los nuevos permisos
      if (permissionIds.length > 0) {
        const newPermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(newPermissions);

        if (insertError) {
          console.error('Error inserting new permissions:', insertError);
          throw new Error('Error al asignar los nuevos permisos');
        }
      }
    } catch (error) {
      console.error('Error in updateRolePermissions:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER CONTADORES DE ROL
  // ================================================================
  static async getRoleStats(roleId: string): Promise<{
    permissionCount: number;
    userCount: number;
  }> {
    try {
      // Contar permisos asignados al rol
      const { count: permissionCount, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', roleId);

      if (permissionsError) {
        console.error('Error counting permissions:', permissionsError);
        throw new Error('Error al contar permisos del rol');
      }

      // Contar usuarios que tienen este rol
      const { count: userCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', roleId);

      if (usersError) {
        console.error('Error counting users:', usersError);
        throw new Error('Error al contar usuarios del rol');
      }

      return {
        permissionCount: permissionCount || 0,
        userCount: userCount || 0
      };
    } catch (error) {
      console.error('Error in getRoleStats:', error);
      throw error;
    }
  }

  // ================================================================
  // OBTENER CONTADORES DE TODOS LOS ROLES
  // ================================================================
  static async getAllRolesStats(): Promise<Record<string, {
    permissionCount: number;
    userCount: number;
  }>> {
    try {
      // Obtener contadores de permisos para todos los roles
      const { data: permissionCounts, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('role_id')
        .then(({ data, error }) => {
          if (error) return { data: null, error };
          
          const counts: Record<string, number> = {};
          data?.forEach(item => {
            counts[item.role_id] = (counts[item.role_id] || 0) + 1;
          });
          
          return { data: counts, error: null };
        });

      if (permissionsError) {
        console.error('Error counting all permissions:', permissionsError);
        throw new Error('Error al contar permisos de roles');
      }

      // Obtener contadores de usuarios para todos los roles
      const { data: userCounts, error: usersError } = await supabase
        .from('user_profiles')
        .select('role_id')
        .then(({ data, error }) => {
          if (error) return { data: null, error };
          
          const counts: Record<string, number> = {};
          data?.forEach(item => {
            if (item.role_id) {
              counts[item.role_id] = (counts[item.role_id] || 0) + 1;
            }
          });
          
          return { data: counts, error: null };
        });

      if (usersError) {
        console.error('Error counting all users:', usersError);
        throw new Error('Error al contar usuarios de roles');
      }

      // Combinar los resultados
      const result: Record<string, { permissionCount: number; userCount: number }> = {};
      
      // Primero agregar todos los roles con contadores de permisos
      Object.keys(permissionCounts || {}).forEach(roleId => {
        result[roleId] = {
          permissionCount: permissionCounts![roleId],
          userCount: userCounts?.[roleId] || 0
        };
      });

      // Luego agregar roles que solo tienen usuarios pero no permisos
      Object.keys(userCounts || {}).forEach(roleId => {
        if (!result[roleId]) {
          result[roleId] = {
            permissionCount: 0,
            userCount: userCounts![roleId]
          };
        }
      });

      return result;
    } catch (error) {
      console.error('Error in getAllRolesStats:', error);
      throw error;
    }
  }
}
