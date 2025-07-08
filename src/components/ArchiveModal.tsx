import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ArchiveActionData } from '../types';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ArchiveActionData) => void;
  item: {
    id: string;
    title: string;
    type: 'case' | 'todo';
  };
  loading?: boolean;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Archivar elemento">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Está seguro que desea archivar el siguiente elemento?
          </p>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="font-medium text-gray-900 dark:text-white">
              {item.type === 'case' ? 'Caso' : 'TODO'}: {item.title}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Razón para archivar (opcional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ingrese la razón para archivar este elemento..."
            className="w-full"
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Advertencia:</strong> Al archivar este elemento, se eliminará de la vista principal 
            pero se conservará toda la información de tiempos y datos. Podrá restaurarlo más tarde 
            si es necesario.
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
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? 'Archivando...' : 'Archivar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
