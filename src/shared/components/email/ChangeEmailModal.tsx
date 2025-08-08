import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onEmailChangeRequested?: (newEmail: string) => void;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onEmailChangeRequested
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { requestEmailChange, getRedirectURL } = useEmailAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newEmail.trim()) {
      newErrors.newEmail = 'El nuevo email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      newErrors.newEmail = 'Formato de email inválido';
    } else if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      newErrors.newEmail = 'El nuevo email debe ser diferente al actual';
    }

    if (!confirmEmail.trim()) {
      newErrors.confirmEmail = 'Confirma el nuevo email';
    } else if (newEmail !== confirmEmail) {
      newErrors.confirmEmail = 'Los emails no coinciden';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña actual es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangeEmail = async () => {
    if (!validateForm()) return;

    try {
      await requestEmailChange.mutateAsync({
        newEmail: newEmail.trim(),
        options: {
          redirectTo: getRedirectURL('/auth/callback?type=email_change')
        }
      });

      onEmailChangeRequested?.(newEmail);
      handleClose();
    } catch (error) {
      console.error('Error requesting email change:', error);
      setErrors({ general: 'Error al solicitar cambio de email. Verifica tu contraseña.' });
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setConfirmEmail('');
    setPassword('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cambiar dirección de email" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
            <AtSymbolIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Para cambiar tu dirección de email, necesitarás verificar tu nueva dirección mediante un enlace de confirmación.
          </p>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        {/* Email actual */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AtSymbolIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Email actual:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{currentEmail}</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nuevo email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nuevo email *
            </label>
            <div className="relative">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@ejemplo.com"
                className="pl-10"
                error={errors.newEmail}
              />
              <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.newEmail && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newEmail}</p>
            )}
          </div>

          {/* Confirmar nuevo email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar nuevo email *
            </label>
            <div className="relative">
              <Input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="nuevo@ejemplo.com"
                className="pl-10"
                error={errors.confirmEmail}
              />
              <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.confirmEmail && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmEmail}</p>
            )}
          </div>

          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña actual *
            </label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                className="pl-10"
                error={errors.password}
              />
              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Necesaria para confirmar tu identidad
            </p>
          </div>
        </div>

        {/* Información del proceso */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            📧 Proceso de cambio:
          </h4>
          <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Se enviará un email de confirmación a <strong>{newEmail || 'tu nuevo email'}</strong></li>
            <li>Haz clic en el enlace del email para confirmar el cambio</li>
            <li>Tu email se actualizará automáticamente después de la confirmación</li>
            <li>Recibirás una notificación en ambas direcciones de email</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChangeEmail}
            disabled={!newEmail || !confirmEmail || !password || requestEmailChange.isPending}
            className="flex-1"
          >
            {requestEmailChange.isPending ? 'Procesando...' : 'Solicitar cambio'}
          </Button>
        </div>

        {/* Advertencia de seguridad */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Importante:</strong> Después del cambio, usa tu nueva dirección de email para iniciar sesión. 
            Tu sesión actual permanecerá activa hasta que cierres sesión.
          </p>
        </div>
      </div>
    </Modal>
  );
};
