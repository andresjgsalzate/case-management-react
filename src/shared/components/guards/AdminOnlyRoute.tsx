import React from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

export const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Acceso Restringido
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Esta sección es exclusiva para administradores del sistema.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
