import { useMemo } from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

export function useTodoPermissions() {
  const { userProfile, isAuditor } = usePermissions();

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
    const canCreateTodos = permissions.includes('create_todos') && !isAuditor();
    const canEditTodos = permissions.includes('edit_todos') && !isAuditor();
    const canDeleteTodos = permissions.includes('delete_todos') && !isAuditor();
    const canManageTodos = permissions.includes('manage_todos') && !isAuditor();
    const canViewAllTodos = permissions.includes('view_all_todos') || isAuditor();
    const canControlTodos = permissions.includes('todo_time_tracking') && !isAuditor();

    // Acceso al módulo si tiene cualquier permiso de TODO
    // CORREGIDO: El acceso al módulo NO debe depender de view_all_todos
    const canAccessTodoModule = canViewTodos || canCreateTodos || canEditTodos || 
                               canDeleteTodos || canManageTodos || 
                               canControlTodos || isAuditor();

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
  }, [userProfile, isAuditor]);
}
