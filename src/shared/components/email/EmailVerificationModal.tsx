import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  verificationType: 'signup' | 'recovery' | 'email_change' | 'email';
  title?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  verificationType,
  title
}) => {
  const [otp, setOtp] = useState('');
  const [useOTP, setUseOTP] = useState(false);
  const { verifyOTP, sendConfirmationEmail } = useEmailAuth();

  const getModalTitle = () => {
    if (title) return title;
    
    switch (verificationType) {
      case 'signup':
        return 'Confirmar registro';
      case 'recovery':
        return 'Verificar recuperación';
      case 'email_change':
        return 'Confirmar cambio de email';
      default:
        return 'Verificar email';
    }
  };

  const getDescription = () => {
    switch (verificationType) {
      case 'signup':
        return 'Hemos enviado un email de confirmación a tu dirección. Haz clic en el enlace del email o introduce el código de 6 dígitos.';
      case 'recovery':
        return 'Hemos enviado un enlace de recuperación a tu email. Haz clic en el enlace o introduce el código de 6 dígitos.';
      case 'email_change':
        return 'Hemos enviado un enlace de confirmación a tu nueva dirección de email. Haz clic en el enlace o introduce el código.';
      default:
        return 'Revisa tu email para completar la verificación.';
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;

    try {
      await verifyOTP.mutateAsync({
        email,
        token: otp,
        type: verificationType
      });
      setOtp('');
      onClose();
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  const handleResendEmail = async () => {
    try {
      if (verificationType === 'signup') {
        await sendConfirmationEmail.mutateAsync({ email });
      }
    } catch (error) {
      console.error('Error resending email:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="md">
      <div className="space-y-6">
        {/* Descripción */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <EnvelopeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getDescription()}
          </p>
        </div>

        {/* Email enviado a */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Email enviado a:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{email}</span>
          </div>
        </div>

        {/* Toggle entre enlace y OTP */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setUseOTP(false)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              !useOTP 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Usar enlace del email
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => setUseOTP(true)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              useOTP 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Usar código OTP
          </button>
        </div>

        {/* Sección de OTP si está habilitada */}
        {useOTP && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de verificación (6 dígitos)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest pl-10"
                  maxLength={6}
                />
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || verifyOTP.isPending}
              className="w-full"
            >
              {verifyOTP.isPending ? 'Verificando...' : 'Verificar código'}
            </Button>
          </div>
        )}

        {/* Instrucciones para el enlace */}
        {!useOTP && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Haz clic en el enlace del email para completar la verificación.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              El enlace es válido por 24 horas. Si no ves el email, revisa tu carpeta de spam.
            </p>
          </div>
        )}

        {/* Acciones adicionales */}
        <div className="border-t dark:border-gray-700 pt-4 space-y-3">
          {verificationType === 'signup' && (
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={sendConfirmationEmail.isPending}
              className="w-full"
            >
              {sendConfirmationEmail.isPending ? 'Enviando...' : 'Reenviar email de confirmación'}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
