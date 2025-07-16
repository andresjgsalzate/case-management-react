import { useMemo } from 'react';
import { usePermissions } from './useUserProfile';

export function useTodoPermissions() {
  const { userProfile } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewTodos: false,
        canCreateTodos: false,
        canEditTodos: false,
        canDeleteTodos: false,
        canManageTodos: false,
        canViewAllTodos: false,
        canControlTodos: false,
        canAccessTodoModule: false
      };
    }

    const permissions = userProfile.role.permissions.map(p => p.name);

    const canViewTodos = permissions.includes('view_todos');
    const canCreateTodos = permissions.includes('create_todos');
    const canEditTodos = permissions.includes('edit_todos');
    const canDeleteTodos = permissions.includes('delete_todos');
    const canManageTodos = permissions.includes('manage_todos');
    const canViewAllTodos = permissions.includes('view_all_todos');
    const canControlTodos = permissions.includes('todo_time_tracking'); // Permiso correcto

    // Acceso al módulo si tiene cualquier permiso de TODO
    // CORREGIDO: El acceso al módulo NO debe depender de view_all_todos
    const canAccessTodoModule = canViewTodos || canCreateTodos || canEditTodos || 
                               canDeleteTodos || canManageTodos || 
                               canControlTodos;

    return {
      canViewTodos,
      canCreateTodos,
      canEditTodos,
      canDeleteTodos,
      canManageTodos,
      canViewAllTodos,
      canControlTodos,
      canAccessTodoModule
    };
  }, [userProfile]);
}
