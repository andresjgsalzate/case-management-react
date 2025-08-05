import React from 'react';
import { ArchivedCase, ArchivedTodo } from '@/types';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface ArchiveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ArchivedCase | ArchivedTodo | null;
  type: 'case' | 'todo';
}

export const ArchiveDetailsModal: React.FC<ArchiveDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  type
}) => {
  if (!isOpen || !item) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Detalles del ${type === 'case' ? 'Caso' : 'TODO'} Archivado`}
      size="3xl"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === 'case' ? 'Número de Caso' : 'Título'}
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {type === 'case' ? (item as ArchivedCase).caseNumber : (item as ArchivedTodo).title}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === 'case' ? 'Clasificación' : 'Prioridad'}
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {type === 'case' ? (item as ArchivedCase).classification : (item as ArchivedTodo).priority}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiempo Total
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatTime(item.totalTimeMinutes)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Completado
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDate(item.completedAt)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Archivado
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDate(item.archivedAt)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Archivado por
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {item.archivedByUser?.fullName || item.archivedByUser?.email || 'Usuario desconocido'}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
            <p className="text-sm text-gray-900 dark:text-white">
              {item.description || 'Sin descripción'}
            </p>
          </div>
        </div>

        {/* Estado de restauración */}
        {item.isRestored && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Elemento restaurado
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Restaurado el {formatDate(item.restoredAt!)} por {item.restoredByUser?.fullName || item.restoredByUser?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Datos originales */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Datos Originales
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(item.originalData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Datos de control */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Datos de Control y Tiempo
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(item.controlData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
