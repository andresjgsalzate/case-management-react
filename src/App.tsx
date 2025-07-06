import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';
import { Layout } from '@/components/Layout';
import { ConfigurationRequired } from '@/components/ConfigurationRequired';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminOnlyRoute } from '@/components/AdminOnlyRoute';
import { AccessDenied } from '@/components/AccessDenied';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSystemAccess } from '@/hooks/useSystemAccess';
import { Dashboard } from '@/pages/Dashboard';
import { CasesPage } from '@/pages/Cases';
import { NewCasePage } from '@/pages/NewCase';
import { ResetPasswordPage } from '@/pages/ResetPassword';
import { AuthTestPage } from '@/pages/AuthTestPage';
import { DataTestPage } from '@/pages/DataTestPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { RolesPage } from '@/pages/admin/RolesPage';
import { PermissionsPage } from '@/pages/admin/PermissionsPage';
import { ConfigurationPage } from '@/pages/admin/ConfigurationPage';
import { DebugPage } from '@/pages/DebugPage';
import { NotFoundPage } from '@/pages/NotFound';
import CaseControlPage from '@/pages/CaseControl';
import TodosPage from '@/pages/TodosPage';

function App() {
  const { isDarkMode } = useThemeStore();
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Verificar configuración de Supabase
  useEffect(() => {
    console.log('🔍 Verificando configuración de Supabase...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('📊 Variables de entorno:', {
      url: supabaseUrl,
      keyLength: supabaseAnonKey?.length || 0,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });

    const isConfigured = 
      supabaseUrl && 
      supabaseAnonKey && 
      supabaseUrl !== 'https://your-project.supabase.co' && 
      supabaseAnonKey !== 'your_anon_key_here' &&
      supabaseUrl.startsWith('https://');

    console.log('✅ Configuración válida:', isConfigured);
    setIsSupabaseConfigured(!!isConfigured);
  }, []);

  // Aplicar tema al cargar la app
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mostrar pantalla de configuración si Supabase no está configurado
  if (!isSupabaseConfigured) {
    return <ConfigurationRequired />;
  }

  return (
    <>
      <Routes>
        {/* Rutas públicas (sin autenticación) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        } />
      </Routes>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </>
  );
}

// Componente separado para manejar el contenido principal después de la autenticación
function AppContent() {
  const { hasAccess, userRole, userEmail, isLoading, error } = useSystemAccess();

  // Mostrar spinner mientras se verifica el acceso
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mostrar error si hay problemas al verificar el acceso
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Error al verificar acceso
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Ocurrió un error inesperado'}
          </p>
        </div>
      </div>
    );
  }

  // Si no tiene acceso, mostrar la pantalla de acceso denegado
  if (!hasAccess) {
    return <AccessDenied userEmail={userEmail || undefined} userRole={userRole || undefined} />;
  }

  // Si tiene acceso, mostrar la aplicación normal
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/edit/:id" element={<NewCasePage />} />
        
        {/* TODO Module */}
        <Route path="/todos" element={<TodosPage />} />
        
        {/* Case Control Module */}
        <Route path="/case-control" element={<CaseControlPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/permissions" element={<PermissionsPage />} />
        <Route path="/admin/config" element={<ConfigurationPage />} />
        
        {/* Test Routes - SOLO PARA ADMINS */}
        <Route path="/auth-test" element={<AdminOnlyRoute><AuthTestPage /></AdminOnlyRoute>} />
        <Route path="/data-test" element={<AdminOnlyRoute><DataTestPage /></AdminOnlyRoute>} />
        <Route path="/debug" element={<AdminOnlyRoute><DebugPage /></AdminOnlyRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
