import { useState } from 'react';
import { TodoCard } from '../components/TodoCard';
import { TodoForm } from '../components/TodoForm';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageWrapper } from '../components/PageWrapper';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useTodos } from '../hooks/useTodos';
import { useTodoControl } from '../hooks/useTodoControl';
import { useTodoPriorities } from '../hooks/useTodoPriorities';
import { useTodoPermissions } from '../hooks/useTodoPermissions';
import { CreateTodoData, UpdateTodoData, TodoItem, TodoFilters } from '../types';
import { 
  PlusIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TodosPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [filters, setFilters] = useState<TodoFilters>({});
  const [loading, setLoading] = useState(false);
  
  // Estado para modal de confirmación de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    todo: TodoItem | null;
  }>({
    isOpen: false,
    todo: null
  });

  // Permisos
  const {
    canCreateTodos,
    canEditTodos,
    canDeleteTodos,
    canControlTodos,
    canAccessTodoModule
  } = useTodoPermissions();

  // Debug: log de permisos
  console.log('🔐 TODO Permisos:', {
    canCreateTodos,
    canEditTodos,
    canDeleteTodos,
    canControlTodos,
    canAccessTodoModule
  });

  const { 
    todos, 
    loading: todosLoading, 
    error: todosError,
    fetchTodos,
    createTodo, 
    updateTodo, 
    deleteTodo,
    getOverdueTodos
  } = useTodos();

  const {
    createControl,
    startTimer,
    pauseTimer,
    completeTodo
  } = useTodoControl();

  const { priorities } = useTodoPriorities();

  // Verificar acceso al módulo
  if (!canAccessTodoModule) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Sin permisos para acceder a TODOs
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No tienes permisos para ver este módulo. Contacta a tu administrador.
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Aplicar filtros
  const filteredTodos = todos.filter(todo => {
    if (filters.priorityId && todo.priorityId !== filters.priorityId) return false;
    if (filters.assignedUserId && todo.assignedUserId !== filters.assignedUserId) return false;
    if (filters.statusId && todo.control?.statusId !== filters.statusId) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return todo.title.toLowerCase().includes(searchTerm) ||
             todo.description?.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  // Crear TODO
  const handleCreateTodo = async (data: CreateTodoData) => {
    setLoading(true);
    try {
      const newTodo = await createTodo(data);
      if (newTodo) {
        toast.success('TODO creado exitosamente');
        setShowCreateModal(false);
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error al crear TODO:', error);
      toast.error('Error al crear TODO');
    } finally {
      setLoading(false);
    }
  };

  // Editar TODO
  const handleEditTodo = async (data: CreateTodoData) => {
    if (!editingTodo) return;
    
    setLoading(true);
    try {
      const updateData: UpdateTodoData = {
        id: editingTodo.id,
        ...data
      };
      
      const success = await updateTodo(updateData);
      if (success) {
        toast.success('TODO actualizado exitosamente');
        setShowEditModal(false);
        setEditingTodo(null);
        await fetchTodos();
      }
    } catch (error) {
      console.error('Error al actualizar TODO:', error);
      toast.error('Error al actualizar TODO');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar/crear control y timer
  const handleStartTimer = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      let controlId = todo.control?.id;

      // Si no tiene control, crearlo primero
      if (!todo.control) {
        const newControl = await createControl(todoId);
        if (!newControl) {
          toast.error('Error al crear control de TODO');
          return;
        }
        controlId = newControl.id;
        // Refrescar la lista de TODOs para obtener el control actualizado
        await fetchTodos();
      }

      // Iniciar timer
      const success = await startTimer(controlId!);
      if (success) {
        toast.success('Timer iniciado');
        // Refrescar para ver el estado actualizado
        await fetchTodos();
      } else {
        toast.error('Error al iniciar timer');
      }
    } catch (error) {
      console.error('Error al iniciar timer:', error);
      toast.error('Error al iniciar timer');
    }
  };

  // Pausar timer
  const handlePauseTimer = async (controlId: string) => {
    try {
      const success = await pauseTimer(controlId);
      if (success) {
        toast.success('Timer pausado');
        await fetchTodos();
      } else {
        toast.error('Error al pausar timer');
      }
    } catch (error) {
      console.error('Error al pausar timer:', error);
      toast.error('Error al pausar timer');
    }
  };

  // Completar TODO
  const handleCompleteTodo = async (controlId: string) => {
    try {
      const success = await completeTodo(controlId);
      if (success) {
        toast.success('TODO completado');
        await fetchTodos();
      } else {
        toast.error('Error al completar TODO');
      }
    } catch (error) {
      console.error('Error al completar TODO:', error);
      toast.error('Error al completar TODO');
    }
  };

  // Eliminar TODO
  const handleDeleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      setDeleteModal({
        isOpen: true,
        todo: todo
      });
    }
  };

  const confirmDeleteTodo = async () => {
    if (deleteModal.todo) {
      try {
        const success = await deleteTodo(deleteModal.todo.id);
        if (success) {
          toast.success('TODO eliminado');
          await fetchTodos();
        } else {
          toast.error('Error al eliminar TODO');
        }
      } catch (error) {
        console.error('Error al eliminar TODO:', error);
        toast.error('Error al eliminar TODO');
      }
    }
  };

  const cancelDeleteTodo = () => {
    setDeleteModal({ isOpen: false, todo: null });
  };

  // Abrir modal de edición
  const handleEditClick = (todo: TodoItem) => {
    setEditingTodo(todo);
    setShowEditModal(true);
  };

  // Estadísticas rápidas
  const overdueTodos = getOverdueTodos();
  const completedTodos = filteredTodos.filter(t => t.control?.status?.name === 'Terminada');
  const inProgressTodos = filteredTodos.filter(t => t.control?.status?.name === 'En Curso');

  if (todosLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (todosError) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error: {todosError}</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de TODOs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organiza y gestiona tus tareas con control de tiempo
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          {canCreateTodos && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo TODO
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ListBulletIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total TODOs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredTodos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressTodos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedTodos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overdueTodos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                value={filters.priorityId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priorityId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                         dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas las prioridades</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Búsqueda
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                placeholder="Buscar en título o descripción..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                         dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de TODOs */}
      {filteredTodos.length === 0 ? (
        <div className="text-center py-12">
          <ListBulletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay TODOs
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comienza creando tu primer TODO para organizar tu trabajo.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Crear primer TODO
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onStartTimer={canControlTodos ? handleStartTimer : undefined}
              onPauseTimer={canControlTodos ? handlePauseTimer : undefined}
              onComplete={canControlTodos ? handleCompleteTodo : undefined}
              onEdit={canEditTodos ? handleEditClick : undefined}
              onDelete={canDeleteTodos ? handleDeleteTodo : undefined}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {canCreateTodos && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg 
                     transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Modal Crear TODO */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo TODO"
        size="lg"
      >
        <TodoForm
          onSubmit={handleCreateTodo}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Modal Editar TODO */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTodo(null);
        }}
        title="Editar TODO"
        size="lg"
      >
        {editingTodo && (
          <TodoForm
            onSubmit={handleEditTodo}
            onCancel={() => {
              setShowEditModal(false);
              setEditingTodo(null);
            }}
            loading={loading}
            initialData={{
              title: editingTodo.title,
              description: editingTodo.description,
              priorityId: editingTodo.priorityId,
              assignedUserId: editingTodo.assignedUserId,
              estimatedMinutes: editingTodo.estimatedMinutes,
              dueDate: editingTodo.dueDate
            }}
          />
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el TODO "${deleteModal.todo?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteTodo}
        onClose={cancelDeleteTodo}
        type="danger"
      />
      </div>
    </PageWrapper>
  );
}
