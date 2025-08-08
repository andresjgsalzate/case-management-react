import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/shared/hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { EmailVerificationModal } from '@/shared/components/email/EmailVerificationModal';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationType, setVerificationType] = useState<'signup' | 'recovery' | 'email_change' | 'email'>('signup');
  
  const { signIn, signUp } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    console.log('🔑 Iniciando login para:', data.email);
    try {
      await signIn.mutateAsync(data);
      console.log('✅ Login exitoso');
      // No mostramos notificación aquí porque el hook ya lo hace
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      // No mostramos notificación de error aquí porque el hook ya lo hace
    }
  };

  const onSignUpSubmit = async (data: SignUpForm) => {
    console.log('📝 Iniciando registro para:', data.email);
    try {
      await signUp.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      
      console.log('✅ Registro exitoso');
      // No mostramos notificación aquí porque el hook ya lo hace
      
      // Mostrar modal de verificación de email después del registro exitoso
      setVerificationEmail(data.email);
      setVerificationType('signup');
      setShowEmailVerificationModal(true);
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      // No mostramos notificación de error aquí porque el hook ya lo hace
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sistema de Gestión de Casos
          </p>
        </div>

        {isLogin ? (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
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
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={signIn.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {signIn.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="text-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ¿Olvidaste tu contraseña? Contacta al administrador
              </span>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Regístrate
                </button>
              </span>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Nombre
                </label>
                <input
                  {...signUpForm.register('name')}
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre completo"
                />
                {signUpForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  {...signUpForm.register('email')}
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  {...signUpForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
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
                {signUpForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmar Contraseña
                </label>
                <input
                  {...signUpForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmar contraseña"
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={signUp.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {signUp.isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>

            {/* Información sobre confirmación de email */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">📧 Después del registro:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>En <strong>desarrollo</strong>: Podrás iniciar sesión inmediatamente</li>
                  <li>En <strong>producción</strong>: Revisa tu email para confirmar tu cuenta</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Inicia sesión
                </button>
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Modales */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        email={verificationEmail}
        verificationType={verificationType}
      />
    </div>
  );
};
