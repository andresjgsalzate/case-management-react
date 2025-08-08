import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailVerification } from '../../hooks/useEmailAuth';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface VerificationResult {
  success: boolean;
  type?: string;
  error?: string;
  data?: any;
}

export const EmailCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { processEmailVerification } = useEmailVerification();
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processVerification = async () => {
      setIsProcessing(true);
      
      try {
        const result = await processEmailVerification(searchParams);
        setVerificationResult(result);
      } catch (error) {
        console.error('Error processing email verification:', error);
        setVerificationResult({
          success: false,
          error: 'Error inesperado durante la verificación'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processVerification();
  }, [searchParams, processEmailVerification]);

  const getRedirectPath = (type?: string) => {
    switch (type) {
      case 'signup':
      case 'email':
        return '/dashboard';
      case 'recovery':
        return '/auth/reset-password';
      case 'email_change':
        return '/profile/settings';
      case 'invite':
        return '/auth/setup-password';
      default:
        return '/dashboard';
    }
  };

  const handleContinue = () => {
    if (verificationResult?.success && verificationResult.type) {
      navigate(getRedirectPath(verificationResult.type));
    } else {
      navigate('/auth/login');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verificando...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Procesando tu solicitud de verificación, por favor espera.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        {verificationResult?.success ? (
          // Verificación exitosa
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {getSuccessTitle(verificationResult.type)}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {getSuccessMessage(verificationResult.type)}
            </p>

            <Button
              onClick={handleContinue}
              className="w-full"
            >
              {getContinueButtonText(verificationResult.type)}
            </Button>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        ) : (
          // Error en la verificación
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error en la verificación
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {verificationResult?.error || 'No se pudo completar la verificación. El enlace puede haber expirado o ser inválido.'}
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Intentar nuevamente
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate('/auth/login')}
                className="w-full"
              >
                Volver al login
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>💡 Consejos:</strong>
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 text-left">
                <li>• Asegúrate de usar el enlace más reciente de tu email</li>
                <li>• Los enlaces expiran después de 24 horas</li>
                <li>• No uses el enlace más de una vez</li>
                <li>• Revisa que no haya espacios extra al copiar el enlace</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getSuccessTitle(type?: string): string {
  switch (type) {
    case 'signup':
    case 'email':
      return '¡Email confirmado!';
    case 'recovery':
      return '¡Verificación exitosa!';
    case 'email_change':
      return '¡Email actualizado!';
    case 'invite':
      return '¡Invitación aceptada!';
    default:
      return '¡Verificación exitosa!';
  }
}

function getSuccessMessage(type?: string): string {
  switch (type) {
    case 'signup':
    case 'email':
      return 'Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.';
    case 'recovery':
      return 'Tu identidad ha sido verificada. Ahora puedes proceder a cambiar tu contraseña.';
    case 'email_change':
      return 'Tu nueva dirección de email ha sido confirmada y actualizada en tu cuenta.';
    case 'invite':
      return 'Has aceptado la invitación exitosamente. Configura tu contraseña para completar el proceso.';
    default:
      return 'La verificación se ha completado exitosamente.';
  }
}

function getContinueButtonText(type?: string): string {
  switch (type) {
    case 'signup':
    case 'email':
      return 'Ir al Dashboard';
    case 'recovery':
      return 'Cambiar contraseña';
    case 'email_change':
      return 'Ir a configuración';
    case 'invite':
      return 'Configurar contraseña';
    default:
      return 'Continuar';
  }
}
