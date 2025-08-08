import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { UserPlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: (email: string) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInviteSent
}) => {
  const [email, setEmail] = useState('');
  const [inviterName, setInviterName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');

  const { inviteUserByEmail, getRedirectURL } = useEmailAuth();

  const handleInvite = async () => {
    if (!email.trim()) return;

    try {
      await inviteUserByEmail.mutateAsync({
        email: email.trim(),
        options: {
          redirectTo: getRedirectURL('/auth/callback'),
          data: {
            inviter_name: inviterName.trim() || undefined,
            team_name: teamName.trim() || undefined,
            custom_message: message.trim() || undefined
          }
        }
      });

      onInviteSent?.(email);
      handleClose();
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  const handleClose = () => {
    setEmail('');
    setInviterName('');
    setTeamName('');
    setMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invitar Usuario" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <UserPlusIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Invita a un nuevo usuario a unirse al sistema. Se enviará un email con las instrucciones para crear su cuenta.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email del invitado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email del usuario *
            </label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="pl-10"
                required
              />
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Nombre del invitador (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu nombre (opcional)
            </label>
            <Input
              type="text"
              value={inviterName}
              onChange={(e) => setInviterName(e.target.value)}
              placeholder="Tu nombre completo"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Se mostrará en el email de invitación como la persona que invita
            </p>
          </div>

          {/* Equipo (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipo o departamento (opcional)
            </label>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Nombre del equipo"
            />
          </div>

          {/* Mensaje personalizado (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje personalizado (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensaje adicional para incluir en la invitación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {message.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Vista previa del email */}
        {email && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              📧 Vista previa de la invitación:
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Para:</strong> {email}</p>
              <p><strong>Asunto:</strong> Invitación al sistema - Sistema de Gestión de Casos</p>
              {inviterName && <p><strong>Invitado por:</strong> {inviterName}</p>}
              {teamName && <p><strong>Equipo:</strong> {teamName}</p>}
              {message && <p><strong>Mensaje:</strong> {message}</p>}
            </div>
          </div>
        )}

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
            onClick={handleInvite}
            disabled={!email.trim() || inviteUserByEmail.isPending}
            className="flex-1"
          >
            {inviteUserByEmail.isPending ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </div>

        {/* Info adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Información:</strong> La invitación será válida por 7 días. 
            El usuario recibirá un email con un enlace para crear su cuenta y configurar su contraseña.
          </p>
        </div>
      </div>
    </Modal>
  );
};
