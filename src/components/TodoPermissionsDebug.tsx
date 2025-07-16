// SCRIPT DE DEPURACIÓN: Agregar a cualquier componente para debug
// Temporal - Solo para diagnosticar el problema

import { useTodoPermissions } from '../hooks/useTodoPermissions';
import { usePermissions } from '../hooks/useUserProfile';

export function TodoPermissionsDebug() {
  const { userProfile } = usePermissions();
  const todoPerms = useTodoPermissions();

  console.log('=== DEBUG TODO PERMISSIONS ===');
  console.log('userProfile:', userProfile);
  console.log('userProfile.role:', userProfile?.role);
  console.log('userProfile.role.permissions:', userProfile?.role?.permissions);
  
  if (userProfile?.role?.permissions) {
    const todoPermissions = userProfile.role.permissions
      .filter(p => p.name.includes('todo'))
      .map(p => p.name);
    console.log('Todo permissions found:', todoPermissions);
  }
  
  console.log('canAccessTodoModule:', todoPerms.canAccessTodoModule);
  console.log('canViewTodos:', todoPerms.canViewTodos);
  console.log('canCreateTodos:', todoPerms.canCreateTodos);
  console.log('All todo perms:', todoPerms);
  console.log('=== END DEBUG ===');

  return null; // No renderiza nada
}

// Para usar: <TodoPermissionsDebug />
