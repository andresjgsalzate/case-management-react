// ================================================================
// EXPORTS DE HOOKS DE PERMISOS - SISTEMA COMPLETO
// ================================================================

// ================================================================
// HOOKS BASE Y ADMINISTRATIVOS
// ================================================================
export { useAdminPermissions } from './useAdminPermissions';
export { useAdminRoutePermissions } from './useAdminRoutePermissions';
export { useConfigPermissions } from './useConfigPermissions';
export { useTagsPermissions } from './useTagsPermissions';
export { useDocumentTypesPermissions } from './useDocumentTypesPermissions';

// ================================================================
// HOOKS ESPECÍFICOS POR MÓDULO
// ================================================================

// User Management
export { useUserPermissions } from '../../user-management/hooks/useUserPermissions';

// Case Management  
export { useCasesPermissions } from '../../case-management/hooks/useCasesPermissions';

// Task Management (TODOs)
export { useTodoPermissions } from '../../task-management/hooks/useTodoPermissions';

// Time Control
export { useCaseControlPermissions } from '../../time-control/hooks/useCaseControlPermissions';

// Dashboard Analytics
export { useDashboardPermissions } from '../../dashboard-analytics/hooks/useDashboardPermissions';

// Notes & Knowledge
export { useNotesPermissions } from '../../notes-knowledge/hooks/useNotesPermissions';
export { useDocumentationPermissions } from '../../notes-knowledge/hooks/useDocumentationPermissions';

// Disposiciones
export { useDisposicionScriptsPermissions } from '../../disposicion-scripts/hooks/useDisposicionScriptsPermissions';

// Archive Management
export { useArchivePermissions } from '../../archive-management/hooks/useArchivePermissions';

// ================================================================
// TIPOS Y INTERFACES
// ================================================================
export type { AdminPermissions } from './useAdminPermissions';

// ================================================================
// UTILIDADES DE PERMISOS
// ================================================================

/**
 * Mapa de recursos y sus hooks correspondientes
 * Útil para importar dinámicamente hooks según el contexto
 */
export const PERMISSION_HOOKS = {
  // Administrativos
  admin: 'useAdminPermissions',
  config: 'useConfigPermissions',
  tags: 'useTagsPermissions',
  document_types: 'useDocumentTypesPermissions',
  
  // Por módulo
  users: 'useUserPermissions',
  cases: 'useCasesPermissions',
  todos: 'useTodoPermissions',
  case_control: 'useCaseControlPermissions',
  dashboard: 'useDashboardPermissions',
  notes: 'useNotesPermissions',
  documentation: 'useDocumentationPermissions',
  disposiciones: 'useDisposicionScriptsPermissions',
  archive: 'useArchivePermissions'
} as const;

/**
 * Lista de todos los recursos disponibles
 */
export const AVAILABLE_RESOURCES = [
  'users',
  'roles', 
  'permissions',
  'role_permissions',
  'config',
  'tags',
  'document_types',
  'dashboard',
  'cases',
  'case_control',
  'disposiciones',
  'todos',
  'notes',
  'documentation',
  'archive'
] as const;

/**
 * Lista de todas las acciones disponibles
 */
export const AVAILABLE_ACTIONS = [
  'read',
  'create', 
  'update',
  'delete',
  'admin',
  'export',
  'assign',
  'control',
  'timer',
  'manual_time',
  'reports',
  'update_status',
  'archive',
  'restore',
  'publish',
  'template',
  'category',
  'feedback',
  'analytics',
  'manage_tags',
  'associate_cases'
] as const;

/**
 * Lista de todos los scopes disponibles
 */
export const AVAILABLE_SCOPES = ['own', 'team', 'all'] as const;

/**
 * Tipo para los recursos
 */
export type Resource = typeof AVAILABLE_RESOURCES[number];

/**
 * Tipo para las acciones
 */
export type Action = typeof AVAILABLE_ACTIONS[number];

/**
 * Tipo para los scopes
 */
export type Scope = typeof AVAILABLE_SCOPES[number];

/**
 * Tipo para los nombres de permisos completos
 */
export type PermissionName = `${Resource}.${Action}_${Scope}`;

/**
 * Utilidad para construir nombres de permisos
 */
export const buildPermissionName = (resource: Resource, action: Action, scope: Scope): PermissionName => {
  return `${resource}.${action}_${scope}`;
};

/**
 * Utilidad para parsear nombres de permisos
 */
export const parsePermissionName = (permissionName: string): { resource: string; action: string; scope: string } | null => {
  const parts = permissionName.split('.');
  if (parts.length !== 2) return null;
  
  const [resource, actionScope] = parts;
  const lastUnderscoreIndex = actionScope.lastIndexOf('_');
  
  if (lastUnderscoreIndex === -1) return null;
  
  const action = actionScope.substring(0, lastUnderscoreIndex);
  const scope = actionScope.substring(lastUnderscoreIndex + 1);
  
  return { resource, action, scope };
};
