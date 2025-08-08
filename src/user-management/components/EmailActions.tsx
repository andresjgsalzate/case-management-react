import React, { useState } from 'react';
import {
  EnvelopeIcon,
  KeyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useSendEmail } from '@/shared/hooks/useSendEmail';
import { UserProfile } from '@/types';

interface EmailActionsProps {
  user: UserProfile;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'magic_link' | 'password_reset';
  user?: UserProfile;
  defaultEmail?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  type, 
  user, 
  defaultEmail 
}) => {
  const [email, setEmail] = useState(defaultEmail || user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  const { sendMagicLink, sendCustomEmail } = useSendEmail();

  const handleSend = async () => {
    if (!email.trim()) {
      showError('Error', 'El email es requerido');
      return;
    }

    setIsLoading(true);
    try {
      switch (type) {
        case 'magic_link':
          await sendMagicLink.mutateAsync({
            email_type: 'magic_link',
            recipient_email: email,
            template_variables: {
              userName: user?.fullName || email.split('@')[0],
              magicLinkUrl: `${window.location.origin}/auth/magic-link?token=MAGIC_TOKEN_PLACEHOLDER`,
              expirationHours: 1
            }
          });
          break;

        case 'password_reset':
          await sendCustomEmail.mutateAsync({
            to: email,
            subject: 'Restablecer Contraseña - Case Management',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Restablecer Contraseña</h2>
                <p>Hola <strong>${user?.fullName || email.split('@')[0]}</strong>,</p>
                <p>Has recibido este email porque un administrador ha solicitado restablecer tu contraseña.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/reset-password?token=RESET_TOKEN_PLACEHOLDER" 
                     style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Restablecer Contraseña
                  </a>
                </div>
                <p><strong>Este enlace expirará en 24 horas.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">Case Management System</p>
              </div>
            `,
            variables: {
              userName: user?.fullName || email.split('@')[0],
              resetUrl: `${window.location.origin}/reset-password?token=RESET_TOKEN_PLACEHOLDER`,
              expirationHours: 24
            }
          });
          break;

        default:
          throw new Error('Tipo de email no válido');
      }

      showSuccess(
        'Email enviado', 
        `${title} enviado exitosamente a ${email}`
      );
      
      onClose();
      setEmail(defaultEmail || '');
    } catch (error) {
      console.error('Error sending email:', error);
      showError(
        'Error al enviar email',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setEmail(defaultEmail || '');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Input
            label="Email del destinatario"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            disabled={isLoading}
            required
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Información del email
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                {type === 'magic_link' && (
                  <p>Se enviará un enlace de acceso directo que permitirá al usuario iniciar sesión sin contraseña. Válido por 1 hora.</p>
                )}
                {type === 'password_reset' && (
                  <p>Se enviará un enlace para restablecer la contraseña. El enlace será válido por 24 horas.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              'Enviando...'
            ) : (
              <>
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Enviar Email
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const EmailActions: React.FC<EmailActionsProps> = ({ user }) => {
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    type: 'magic_link' | 'password_reset' | null;
  }>({
    isOpen: false,
    type: null,
  });

  const openModal = (type: 'magic_link' | 'password_reset') => {
    setActiveModal({ isOpen: true, type });
  };

  const closeModal = () => {
    setActiveModal({ isOpen: false, type: null });
  };

  const getModalTitle = () => {
    switch (activeModal.type) {
      case 'magic_link':
        return 'Enviar Magic Link';
      case 'password_reset':
        return 'Restablecer Contraseña';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-1">
        <button
          onClick={() => openModal('magic_link')}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
          title="Enviar magic link para acceso directo"
        >
          <KeyIcon className="h-3 w-3 mr-1" />
          Magic Link
        </button>
        
        <button
          onClick={() => openModal('password_reset')}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 transition-colors"
          title="Enviar enlace para restablecer contraseña"
        >
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Reset Pass
        </button>
      </div>

      {activeModal.isOpen && activeModal.type && (
        <EmailModal
          isOpen={activeModal.isOpen}
          onClose={closeModal}
          title={getModalTitle()}
          type={activeModal.type}
          user={user}
        />
      )}
    </>
  );
};
