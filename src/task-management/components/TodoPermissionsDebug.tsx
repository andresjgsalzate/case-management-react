import React from 'react';
import { useTodoPermissions } from '../hooks/useTodoPermissions';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

interface TodoPermissionsDebugProps {
  compact?: boolean;
}

export const TodoPermissionsDebug: React.FC<TodoPermissionsDebugProps> = ({ compact = false }) => {
  const { hasPermission } = useAdminPermissions();
  const todoPermissions = useTodoPermissions();

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded text-xs opacity-75 z-50">
        <div className="font-bold mb-1">Permisos TODOs</div>
        <div className={`${todoPermissions.hasAnyTodosPermission ? 'text-green-400' : 'text-red-400'}`}>
          {todoPermissions.hasAnyTodosPermission ? '✅ Tiene permisos' : '❌ Sin permisos'}
        </div>
        {todoPermissions.hasAnyTodosPermission && (
          <div className="text-gray-300 mt-1">
            Lectura: {todoPermissions.getHighestReadScope() || 'none'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border m-4">
      <h3 className="text-lg font-bold mb-4">🔍 Debug - Permisos de TODOs</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Estado General</h4>
          <div className={`p-2 rounded ${todoPermissions.hasAnyTodosPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {todoPermissions.hasAnyTodosPermission ? '✅ Tiene acceso a TODOs' : '❌ Sin acceso a TODOs'}
          </div>
          
          <div className="mt-2 text-sm">
            <strong>Scope de lectura más alto:</strong> {todoPermissions.getHighestReadScope() || 'ninguno'}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Permisos Específicos</h4>
          <div className="space-y-1 text-sm">
            <div className={todoPermissions.canReadAllTodos ? 'text-green-600' : 'text-gray-400'}>
              📖 Leer todos: {todoPermissions.canReadAllTodos ? 'Sí' : 'No'}
            </div>
            <div className={todoPermissions.canCreateAllTodos ? 'text-green-600' : 'text-gray-400'}>
              ➕ Crear todos: {todoPermissions.canCreateAllTodos ? 'Sí' : 'No'}
            </div>
            <div className={todoPermissions.canControlAllTodos ? 'text-green-600' : 'text-gray-400'}>
              🎮 Controlar todos: {todoPermissions.canControlAllTodos ? 'Sí' : 'No'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <h4 className="font-semibold mb-2">Verificación Individual</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-1 rounded text-xs ${hasPermission('todos.read_all') ? 'bg-green-200' : 'bg-red-200'}`}>
            todos.read_all: {hasPermission('todos.read_all') ? '✅' : '❌'}
          </div>
          <div className={`p-1 rounded text-xs ${hasPermission('todos.read_own') ? 'bg-green-200' : 'bg-red-200'}`}>
            todos.read_own: {hasPermission('todos.read_own') ? '✅' : '❌'}
          </div>
          <div className={`p-1 rounded text-xs ${hasPermission('todos.create_all') ? 'bg-green-200' : 'bg-red-200'}`}>
            todos.create_all: {hasPermission('todos.create_all') ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};
