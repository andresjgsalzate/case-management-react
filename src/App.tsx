import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';
import { Layout } from '@/components/Layout';
import { ConfigurationRequired } from '@/components/ConfigurationRequired';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { CasesPage } from '@/pages/Cases';
import { NewCasePage } from '@/pages/NewCase';
import { AuthTestPage } from '@/pages/AuthTestPage';
import { DataTestPage } from '@/pages/DataTestPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { RolesPage } from '@/pages/admin/RolesPage';
import { PermissionsPage } from '@/pages/admin/PermissionsPage';
import { ConfigurationPage } from '@/pages/admin/ConfigurationPage';
import { DebugPage } from '@/pages/DebugPage';
import { NotFoundPage } from '@/pages/NotFound';
import CaseControlPage from '@/pages/CaseControl';

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
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/new" element={<NewCasePage />} />
          <Route path="/cases/edit/:id" element={<NewCasePage />} />
          
          {/* Case Control Module */}
          <Route path="/case-control" element={<CaseControlPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/permissions" element={<PermissionsPage />} />
          <Route path="/admin/config" element={<ConfigurationPage />} />
          
          {/* Test Routes */}
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="/data-test" element={<DataTestPage />} />
          <Route path="/debug" element={<DebugPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </ProtectedRoute>
  );
}

export default App;
