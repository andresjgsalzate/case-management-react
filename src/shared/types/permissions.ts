// ================================================================
// TIPOS DEL SISTEMA DE PERMISOS
// ================================================================

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  scope: 'own' | 'team' | 'all' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface PermissionWithRoles extends Permission {
  roles: Role[];
}

// Formularios
export interface CreateRoleData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  id: string;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
  resource: string;
  action: string;
  scope?: 'own' | 'team' | 'all';
  is_active?: boolean;
}

export interface UpdatePermissionData extends Partial<CreatePermissionData> {
  id: string;
}

export interface AssignPermissionToRoleData {
  role_id: string;
  permission_id: string;
}

// Respuestas de API
export interface RoleListResponse {
  roles: Role[];
  total: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total: number;
}

// Filtros de búsqueda
export interface RoleFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PermissionFilters {
  search?: string;
  resource?: string;
  action?: string;
  scope?: 'own' | 'team' | 'all';
  is_active?: boolean;
  page?: number;
  limit?: number;
}
