import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { SparklesIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface MagicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onMagicLinkSent?: (email: string) => void;
}

export const MagicLinkModal: React.FC<MagicLinkModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onMagicLinkSent
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState('');

  const { sendMagicLink, getRedirectURL } = useEmailAuth();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Formato de email inválido');
      return;
    }

    setError('');

    try {
      await sendMagicLink.mutateAsync({
        email: email.trim(),
        options: {
          redirectTo: getRedirectURL('/auth/callback?type=magic_link'),
          data: {
            login_type: 'magic_link',
            redirect_to: '/dashboard'
          }
        }
      });

      onMagicLinkSent?.(email);
      handleClose();
    } catch (error) {
      console.error('Error sending magic link:', error);
      setError('Error al enviar el enlace mágico. Verifica que el email esté registrado.');
    }
  };

  const handleClose = () => {
    setEmail(defaultEmail);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Acceso con Enlace Mágico" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
            <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ✨ Acceso sin contraseña
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu email y te enviaremos un enlace seguro para acceder a tu cuenta sin necesidad de contraseña.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección de email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="tu@ejemplo.com"
                className="pl-10"
                error={error}
              />
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Información sobre Magic Link */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🔐 ¿Cómo funciona?
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Te enviaremos un enlace único y seguro a tu email</li>
            <li>Haz clic en el enlace para acceder automáticamente</li>
            <li>No necesitas recordar tu contraseña</li>
            <li>El enlace es válido por 1 hora y solo funciona una vez</li>
          </ul>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <p className="text-xs font-medium text-green-800 dark:text-green-200">Más Seguro</p>
            <p className="text-xs text-green-600 dark:text-green-300">Sin contraseñas que recordar</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Más Rápido</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">Acceso con un solo clic</p>
          </div>
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
            onClick={handleSendMagicLink}
            disabled={!email.trim() || sendMagicLink.isPending}
            className="flex-1"
          >
            {sendMagicLink.isPending ? 'Enviando...' : '✨ Enviar enlace mágico'}
          </Button>
        </div>

        {/* Alternativa */}
        <div className="text-center pt-2 border-t dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ¿Prefieres usar tu contraseña? Puedes cerrar esta ventana y usar el login tradicional.
          </p>
        </div>
      </div>
    </Modal>
  );
};
