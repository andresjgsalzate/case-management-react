import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '@/components/PageWrapper';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

export const AuthTestPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const { user, signOut } = useAuth();

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('cases').select('count').limit(1);
      setConnectionStatus(!error);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Nota: En producción, esto requeriría permisos de admin
      // Por ahora solo mostramos el usuario actual
      if (user) {
        setUsers([{
          id: user.id,
          email: user.email || 'N/A',
          created_at: user.created_at || new Date().toISOString(),
          last_sign_in_at: user.last_sign_in_at
        }]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    fetchUsers();
  }, [user]);

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="h-5 w-5 bg-yellow-500 rounded-full animate-pulse" />;
    return status ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          Test de Autenticación y Usuarios
        </h1>

        {/* Estado de Conexión */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <StatusIcon status={connectionStatus} />
            Estado de Conexión a Supabase
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {connectionStatus === null && "Verificando conexión..."}
            {connectionStatus === true && "✅ Conectado correctamente a Supabase"}
            {connectionStatus === false && "❌ Error de conexión a Supabase"}
          </p>
        </div>

        {/* Usuario Actual */}
        {user && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              👤 Usuario Autenticado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
                <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Creado:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Último acceso:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => signOut.mutate()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        {/* Lista de Usuarios */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📋 Datos de Usuario
            </h2>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Último Acceso
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No hay usuarios para mostrar
                      </td>
                    </tr>
                  ) : (
                    users.map((userData) => (
                      <tr key={userData.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {userData.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(userData.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {userData.last_sign_in_at 
                            ? new Date(userData.last_sign_in_at).toLocaleDateString('es-ES')
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
