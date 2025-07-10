import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verificar si hay tokens de reset password en la URL
  useEffect(() => {
    const checkResetTokens = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

if (type === 'recovery' && accessToken && refreshToken) {
        try {
          // Establecer la sesión con los tokens de recovery
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ Error al establecer sesión de recovery:', error);
            setIsTokenValid(false);
            toast.error('El enlace de recuperación es inválido o ha expirado');
            return;
          }

          if (data.user) {
setIsTokenValid(true);
          } else {
            setIsTokenValid(false);
            toast.error('No se pudo establecer la sesión de recuperación');
          }
        } catch (error) {
          console.error('❌ Error procesando tokens de recovery:', error);
          setIsTokenValid(false);
          toast.error('Error al procesar el enlace de recuperación');
        }
      } else {
setIsTokenValid(false);
        toast.error('Enlace de recuperación inválido');
      }
    };

    checkResetTokens();
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!isTokenValid) {
      toast.error('Sesión de recuperación inválida');
      return;
    }

    try {
      await updatePassword.mutateAsync(data.password);
      setIsSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  // Pantalla de carga mientras se verifican los tokens
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Verificando enlace de recuperación...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Por favor espera mientras validamos tu solicitud
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de error si el token no es válido
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Enlace Inválido
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              El enlace de recuperación es inválido o ha expirado.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Solicita un nuevo enlace de recuperación desde la página de inicio de sesión.
            </p>
            
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              Volver al Inicio de Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de éxito después de cambiar la contraseña
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              ¡Contraseña Actualizada!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              Ir al Inicio de Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal para cambiar contraseña
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña para completar la recuperación
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Nueva Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              loading={updatePassword.isPending}
              className="w-full"
            >
              {updatePassword.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </form>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Requisitos de contraseña:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mínimo 6 caracteres</li>
              <li>Se recomienda usar una combinación de letras, números y símbolos</li>
              <li>Evita usar información personal fácil de adivinar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
