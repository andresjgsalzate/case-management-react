import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'destructive';
      case 'info':
        return 'primary';
      default:
        return 'destructive';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <ExclamationTriangleIcon className={`h-6 w-6 ${getIconColor()}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex space-x-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
