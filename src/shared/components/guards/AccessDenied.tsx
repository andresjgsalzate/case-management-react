import React from 'react';
import { ExclamationTriangleIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/shared/hooks/useAuth';

interface AccessDeniedProps {
  userEmail?: string;
  userRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ userEmail, userRole }) => {
  const { signOut } = useAuth();
  
  const handleLogout = () => {
    signOut.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Acceso Restringido
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Tu cuenta requiere activación por un administrador
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Información del usuario */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Usuario registrado
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userEmail || 'No disponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado actual */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-6 w-6 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Cuenta Pendiente de Activación
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Tu cuenta ha sido creada exitosamente, pero necesita ser activada por un administrador antes de poder acceder al sistema.
                  </p>
                  {userRole && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Rol actual: <span className="font-medium">{userRole}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                ¿Qué hacer ahora?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-300">1</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Contacta a un administrador</strong> del sistema para solicitar la activación de tu cuenta.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-300">2</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Proporciona tu <strong>email de registro</strong> ({userEmail}) para que puedan ubicar tu cuenta.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-300">3</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Una vez activada, podrás acceder como <strong>Analista</strong> o <strong>Supervisor</strong> según corresponda.
                  </p>
                </div>
              </div>
            </div>

            {/* Roles disponibles */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Roles Disponibles
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">👑 Administrador</span>
                  <span className="text-gray-500">Acceso completo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">👁️ Supervisor</span>
                  <span className="text-gray-500">Ver todo, sin eliminar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">📝 Analista</span>
                  <span className="text-gray-500">Solo sus casos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">🚫 Usuario</span>
                  <span className="text-red-500">Sin acceso</span>
                </div>
              </div>
            </div>

            {/* Botón de cerrar sesión */}
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sistema de Control de Casos - Acceso Restringido
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Este sistema requiere autorización previa para garantizar la seguridad de los datos
        </p>
      </div>
    </div>
  );
};
