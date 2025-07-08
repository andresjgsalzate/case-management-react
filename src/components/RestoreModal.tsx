import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { RestoreActionData } from '../types';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RestoreActionData) => void;
  item: {
    id: string;
    title: string;
    type: 'case' | 'todo';
  };
  loading?: boolean;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  loading = false
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm({
      id: item.id,
      type: item.type,
      reason: reason.trim() || undefined
    });
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Restaurar elemento">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Está seguro que desea restaurar el siguiente elemento?
          </p>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="font-medium text-gray-900 dark:text-white">
              {item.type === 'case' ? 'Caso' : 'TODO'}: {item.title}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Razón para restaurar (opcional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ingrese la razón para restaurar este elemento..."
            className="w-full"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Información:</strong> Al restaurar este elemento, se marcará como restaurado 
            en el archivo pero no se volverá a crear en el sistema principal. Esta acción 
            es principalmente para fines de auditoría.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Restaurando...' : 'Restaurar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
