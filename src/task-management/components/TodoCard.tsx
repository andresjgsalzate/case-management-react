import { TodoItem } from '@/types';
import { useTodoPriorities } from '@/task-management/hooks/useTodoPriorities';
import { useRealTimeTimer } from '@/time-control/hooks/useActiveTimer';
import { useTodoControl } from '@/task-management/hooks/useTodoControl';
import { TodoControlDetailsModal } from './TodoControlDetailsModal';
import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface TodoCardProps {
  todo: TodoItem;
  onStartTimer?: (todoId: string) => void;
  onPauseTimer?: (controlId: string) => void;
  onComplete?: (controlId: string) => void;
  onEdit?: (todo: TodoItem) => void;
  onDelete?: (todoId: string) => void;
  onArchive?: (todo: TodoItem) => void;
  showActions?: boolean;
}

export function TodoCard({ 
  todo, 
  onStartTimer, 
  onPauseTimer, 
  onComplete, 
  onEdit, 
  onDelete,
  onArchive,
  showActions = true 
}: TodoCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [realTotalTime, setRealTotalTime] = useState(todo.control?.totalTimeMinutes || 0);
  const { getPriorityColor, getPriorityName } = useTodoPriorities();
  const { getTimeEntries, getManualTimeEntries } = useTodoControl();

  // Hook para el contador en tiempo real
  const realTimeDisplay = useRealTimeTimer({
    isActive: todo.control?.isTimerActive || false,
    startedAt: todo.control?.timerStartAt
  });

  // Función para calcular el tiempo total real (automático + manual)
  const calculateRealTotalTime = async () => {
    if (!todo.control?.id) {
      setRealTotalTime(0);
      return;
    }

    try {
      const [timeEntries, manualTimeEntries] = await Promise.all([
        getTimeEntries(todo.control.id),
        getManualTimeEntries(todo.control.id)
      ]);

      const totalAutoMinutes = timeEntries.reduce((sum: number, entry: any) => {
        return sum + (entry.duration_minutes || 0);
      }, 0);
      
      const totalManualMinutes = manualTimeEntries.reduce((sum: number, entry: any) => {
        return sum + (entry.duration_minutes || 0);
      }, 0);

      const totalMinutes = totalAutoMinutes + totalManualMinutes;
      setRealTotalTime(totalMinutes);
    } catch (error) {
      console.error('Error calculating real total time:', error);
      // En caso de error, usar el valor de la base de datos
      setRealTotalTime(todo.control?.totalTimeMinutes || 0);
    }
  };

  // Cargar el tiempo real cuando el componente se monta o cuando cambia el control
  useEffect(() => {
    calculateRealTotalTime();
  }, [todo.control?.id, todo.control?.totalTimeMinutes]);

  const priorityColor = getPriorityColor(todo.priorityId);
  const priorityName = getPriorityName(todo.priorityId);
  
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && 
                   todo.control?.status?.name !== 'TERMINADA';
  
  const isInProgress = todo.control?.status?.name === 'EN CURSO';
  const isCompleted = todo.control?.status?.name === 'TERMINADA';
  const isTimerActive = todo.control?.isTimerActive;

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow
      ${isCompleted ? 'opacity-75' : ''}
      ${isOverdue ? 'border-l-red-500' : ''}
      ${isInProgress ? 'border-l-yellow-500' : ''}
      ${isCompleted ? 'border-l-green-500' : ''}
      ${!isCompleted && !isInProgress && !isOverdue ? `border-l-[${priorityColor}]` : ''}
    `}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
                {todo.title}
              </h3>
              {isTimerActive && (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                  <span className="font-mono text-xs">{realTimeDisplay}</span>
                </div>
              )}
            </div>
            {todo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {todo.description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
            ${isInProgress ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
            ${!isCompleted && !isInProgress ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
          `}>
            {todo.control?.status?.name || 'Sin asignar'}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {/* Prioridad */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: priorityColor }}
            />
            <span>{priorityName}</span>
            {todo.priority?.level && (
              <span className="ml-1 text-xs">
                (Nivel {todo.priority.level})
              </span>
            )}
          </div>

          {/* Usuario asignado */}
          {todo.assignedUser && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <UserIcon className="w-4 h-4 mr-2" />
              <span>{todo.assignedUser.fullName || todo.assignedUser.email}</span>
            </div>
          )}

          {/* Fecha límite */}
          {todo.dueDate && (
            <div className={`flex items-center text-sm ${
              isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>{formatDate(todo.dueDate)}</span>
              {isOverdue && (
                <ExclamationTriangleIcon className="w-4 h-4 ml-1 text-red-500" />
              )}
            </div>
          )}

          {/* Tiempo */}
          {todo.control && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4 mr-2" />
              <span>
                {formatTime(realTotalTime)}
                {todo.estimatedMinutes && (
                  <span className="text-xs ml-1">
                    / {formatTime(todo.estimatedMinutes)} estimado
                  </span>
                )}
              </span>
              {isTimerActive && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                  <span className="font-mono font-semibold">+{realTimeDisplay}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {/* Timer Controls */}
              {todo.control && !isCompleted && (
                <>
                  {isTimerActive ? (
                    <button
                      onClick={() => onPauseTimer?.(todo.control!.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 
                               rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 
                               bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <PauseIcon className="w-4 h-4 mr-1" />
                      Pausar
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartTimer?.(todo.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 
                               rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 
                               bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Iniciar
                    </button>
                  )}
                </>
              )}

              {/* Complete Button */}
              {todo.control && !isCompleted && (
                <button
                  onClick={() => onComplete?.(todo.control!.id)}
                  className="inline-flex items-center px-2 py-1 border border-green-500 
                           rounded-md text-sm font-medium text-green-700 dark:text-green-200 
                           bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Completar
                </button>
              )}

              {/* Create Control Button */}
              {!todo.control && (
                <button
                  onClick={() => {
                    if (!onStartTimer) {
                      console.warn('⚠️ onStartTimer no está disponible - problema de permisos');
                      return;
                    }
                    onStartTimer(todo.id);
                  }}
                  className="inline-flex items-center px-2 py-1 border border-blue-500 
                           rounded-md text-sm font-medium text-blue-700 dark:text-blue-200 
                           bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  disabled={!onStartTimer}
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Comenzar
                </button>
              )}
            </div>

            {/* Menu Actions */}
            <div className="flex space-x-1">
              {/* Botón para ver detalles de tiempo */}
              {todo.control && (
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                  title="Ver detalles de tiempo"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(todo)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                  title="Editar TODO"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {onDelete && !isCompleted && (
                <button
                  onClick={() => onDelete(todo.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                  title="Eliminar TODO"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Archive Button - solo para TODOs completados */}
              {onArchive && isCompleted && (
                <button
                  onClick={() => onArchive(todo)}
                  className="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 p-1"
                  title="Archivar TODO"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {todo.control && (
        <TodoControlDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => {
            setShowDetailsModal(false);
            // Recalcular el tiempo real cuando se cierre el modal
            calculateRealTotalTime();
          }} 
          todoControl={todo.control}
        />
      )}
    </div>
  );
}
