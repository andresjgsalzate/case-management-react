// Hook temporal vacío - TODOS los permisos permitidos
export const useTodoPermissions = () => {
  return {
    canViewTodos: true,
    canCreateTodos: true,
    canEditTodos: true,
    canDeleteTodos: true,
    canManageTodos: true,
    canViewAllTodos: true,
    canControlTodos: true,
    canAccessTodoModule: true
  };
};
