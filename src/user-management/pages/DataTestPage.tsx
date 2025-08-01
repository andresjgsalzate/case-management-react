import React, { useState } from 'react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { supabase } from '@/shared/lib/supabase';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CircleStackIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface DatabaseTest {
  name: string;
  description: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message?: string;
  count?: number;
  data?: any;
}

const DataTestPage: React.FC = () => {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const databaseTests: Omit<DatabaseTest, 'status' | 'message' | 'count' | 'data'>[] = [
    {
      name: 'Conexión a Base de Datos',
      description: 'Verifica que la conexión a Supabase esté funcionando correctamente'
    },
    {
      name: 'Tabla de Casos',
      description: 'Verifica la estructura y datos de la tabla cases'
    },
    {
      name: 'Tabla de Usuarios',
      description: 'Verifica la estructura y datos de la tabla user_profiles'
    },
    {
      name: 'Tabla de TODOs',
      description: 'Verifica la estructura y datos de la tabla todos'
    },
    {
      name: 'Tabla de Notas',
      description: 'Verifica la estructura y datos de la tabla case_notes'
    }
  ];

  const runTest = async (testName: string): Promise<DatabaseTest> => {
    try {
      switch (testName) {
        case 'Conexión a Base de Datos':
          const { error } = await supabase.from('cases').select('count', { count: 'exact', head: true });
          if (error) throw error;
          return {
            name: testName,
            description: 'Verifica que la conexión a Supabase esté funcionando correctamente',
            status: 'success',
            message: 'Conexión exitosa a Supabase'
          };

        case 'Tabla de Casos':
          const { data: cases, error: casesError, count: casesCount } = await supabase
            .from('cases')
            .select('*', { count: 'exact' })
            .limit(3);
          if (casesError) throw casesError;
          return {
            name: testName,
            description: 'Verifica la estructura y datos de la tabla cases',
            status: 'success',
            message: `Tabla accesible. ${casesCount} registros encontrados`,
            count: casesCount || 0,
            data: cases?.slice(0, 2)
          };

        case 'Tabla de Usuarios':
          const { data: users, error: usersError, count: usersCount } = await supabase
            .from('user_profiles')
            .select('id, email, role, created_at', { count: 'exact' })
            .limit(3);
          if (usersError) throw usersError;
          return {
            name: testName,
            description: 'Verifica la estructura y datos de la tabla user_profiles',
            status: 'success',
            message: `Tabla accesible. ${usersCount} perfiles encontrados`,
            count: usersCount || 0,
            data: users?.slice(0, 2)
          };

        case 'Tabla de TODOs':
          const { data: todos, error: todosError, count: todosCount } = await supabase
            .from('todos')
            .select('id, title, status, created_at', { count: 'exact' })
            .limit(3);
          if (todosError) throw todosError;
          return {
            name: testName,
            description: 'Verifica la estructura y datos de la tabla todos',
            status: 'success',
            message: `Tabla accesible. ${todosCount} TODOs encontrados`,
            count: todosCount || 0,
            data: todos?.slice(0, 2)
          };

        case 'Tabla de Notas':
          const { data: notes, error: notesError, count: notesCount } = await supabase
            .from('case_notes')
            .select('id, case_id, content, created_at', { count: 'exact' })
            .limit(3);
          if (notesError) throw notesError;
          return {
            name: testName,
            description: 'Verifica la estructura y datos de la tabla case_notes',
            status: 'success',
            message: `Tabla accesible. ${notesCount} notas encontradas`,
            count: notesCount || 0,
            data: notes?.slice(0, 2)
          };

        default:
          throw new Error('Test no implementado');
      }
    } catch (error: any) {
      return {
        name: testName,
        description: databaseTests.find(t => t.name === testName)?.description || '',
        status: 'error',
        message: error.message || 'Error desconocido'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests(databaseTests.map(test => ({ ...test, status: 'pending' as const })));

    for (let i = 0; i < databaseTests.length; i++) {
      const result = await runTest(databaseTests[i].name);
      
      setTests(prevTests => 
        prevTests.map((test, index) => 
          index === i ? result : test
        )
      );

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DatabaseTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />;
    }
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('Usuarios')) {
      return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
    }
    if (testName.includes('Casos')) {
      return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
    }
    if (testName.includes('TODO')) {
      return <ClockIcon className="h-5 w-5 text-purple-500" />;
    }
    if (testName.includes('Nota')) {
      return <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />;
    }
    return <CircleStackIcon className="h-5 w-5 text-blue-500" />;
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Test de Base de Datos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Verifica la conectividad y estructura de las tablas del sistema
            </p>
          </div>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <LoadingSpinner size="sm" />
            ) : (
              <CircleStackIcon className="h-5 w-5" />
            )}
            <span>{isRunning ? 'Ejecutando Tests...' : 'Ejecutar Tests'}</span>
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTestIcon(test.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {test.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {test.count !== undefined && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            {test.count} registros
                          </span>
                        )}
                        {getStatusIcon(test.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {test.description}
                    </p>
                    {test.message && (
                      <p className={`text-sm mt-2 ${
                        test.status === 'success' ? 'text-green-600 dark:text-green-400' :
                        test.status === 'error' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {test.message}
                      </p>
                    )}
                    {test.data && test.data.length > 0 && (
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Ver datos de muestra ({test.data.length} registros)
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border text-xs overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tests.length === 0 && !isRunning && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <CircleStackIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Test de Base de Datos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Haz clic en "Ejecutar Tests" para verificar las tablas del sistema
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default DataTestPage;