import React from 'react';
import { TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useCleanupOrphanedRecords } from '../hooks/useCleanupOrphanedRecords';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

export const CleanupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { cleanupOrphanedRecords, isLoading } = useCleanupOrphanedRecords();
  const { showSuccess, showError } = useNotification();

  const handleCleanup = async () => {
    try {
      const result = await cleanupOrphanedRecords();
      
      if (result.success) {
        showSuccess(`Limpieza completada. Se eliminaron ${result.deletedCount} registros huérfanos`);
        onClose();
      } else {
        showError('Error en la limpieza', result.error || 'Error desconocido');
      }
    } catch (error) {
      showError('Error en la limpieza', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <TrashIcon className="w-8 h-8 text-orange-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Limpieza Automática de Registros
          </h2>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">¿Qué hace la limpieza automática?</p>
              <ul className="space-y-1 text-sm">
                <li>• Elimina registros de control de casos que ya no tienen un caso asociado</li>
                <li>• Elimina registros de control de TODOs que ya no tienen un TODO asociado</li>
                <li>• Mantiene la integridad referencial de la base de datos</li>
                <li>• Es segura y no afecta datos importantes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Función SQL Ejecutada
          </h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <code className="text-sm text-gray-800 dark:text-gray-200">
              {`-- Elimina registros huérfanos de case_control
DELETE FROM case_control 
WHERE case_id NOT IN (SELECT id FROM cases);

-- Elimina registros huérfanos de todo_control  
DELETE FROM todo_control 
WHERE todo_id NOT IN (SELECT id FROM todos);

-- Retorna el total de registros eliminados`}
            </code>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCleanup}
            variant="destructive"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{isLoading ? 'Limpiando...' : 'Ejecutar Limpieza'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
