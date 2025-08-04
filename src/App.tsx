import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/shared/components/notifications/NotificationSystem';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { Layout } from '@/shared/components/layout/Layout';
import { ConfigurationRequired } from '@/shared/components/guards/ConfigurationRequired';
import { ProtectedRoute } from '@/shared/components/guards/ProtectedRoute';
import { AdminOnlyRoute } from '@/shared/components/guards/AdminOnlyRoute';
import { AccessDenied } from '@/shared/components/guards/AccessDenied';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { useSystemAccess } from '@/user-management/hooks/useSystemAccess';
import { Dashboard } from '@/dashboard-analytics/pages/Dashboard';
import { CasesPage } from '@/case-management/pages/CasesPage';
import { NewCasePage } from '@/case-management/pages/NewCasePage';
import ViewCasePage from '@/case-management/pages/ViewCasePage';
import { ResetPasswordPage } from '@/user-management/pages/ResetPassword';
import { AuthTestPage } from '@/user-management/pages/AuthTestPage';
import DataTestPage from '@/user-management/pages/DataTestPage';
import { UsersPage } from '@/user-management/pages/admin/UsersPage';
import { RolesPage } from '@/user-management/pages/admin/RolesPage';
import { PermissionsPage } from '@/user-management/pages/admin/PermissionsPage';
import { ConfigurationPage } from '@/user-management/pages/admin/ConfigurationPage';
import { TagsPage } from '@/notes-knowledge/pages/admin/TagsPage';
import CaseControlPage from '@/time-control/pages/CaseControl';
import TodosPage from '@/task-management/pages/TodosPage';
import { NotesPage } from '@/notes-knowledge/pages/NotesPage';
import { DocumentationPage } from '@/notes-knowledge/pages/DocumentationPage';
import { DocumentEditPage } from '@/notes-knowledge/pages/DocumentEditPage';
import { TestDocumentationPage } from '@/notes-knowledge/pages/TestDocumentationPage';
import { ArchivePage } from '@/archive-management/pages/ArchivePage';
import { DisposicionScriptsPage } from '@/disposicion-scripts/pages/DisposicionScriptsPage';

function App() {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Verificar configuración de Supabase
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const isConfigured = 
      supabaseUrl && 
      supabaseAnonKey && 
      supabaseUrl !== 'https://your-project.supabase.co' && 
      supabaseAnonKey !== 'your_anon_key_here' &&
      supabaseUrl.startsWith('https://');

    setIsSupabaseConfigured(!!isConfigured);
  }, []);

  // Mostrar pantalla de configuración si Supabase no está configurado
  if (!isSupabaseConfigured) {
    return <ConfigurationRequired />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </ThemeProvider>
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
        <Route path="/cases/view/:id" element={<ViewCasePage />} />
        
        {/* TODO Module */}
        <Route path="/todos" element={<TodosPage />} />
        
        {/* Notes Module */}
        <Route path="/notes" element={<NotesPage />} />
        
        {/* Documentation Module */}
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/documentation/:id/edit" element={<DocumentEditPage />} />
        <Route path="/documentation/:id/view" element={<DocumentEditPage />} />
        
        {/* Test Documentation - SOLO PARA DESARROLLO */}
        <Route path="/test-documentation" element={<TestDocumentationPage />} />
        
        {/* Case Control Module */}
        <Route path="/case-control" element={<CaseControlPage />} />
        
        {/* Archive Module */}
        <Route path="/archive" element={<ArchivePage />} />
        
        {/* Disposicion Scripts Module */}
        <Route path="/disposiciones" element={<DisposicionScriptsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/permissions" element={<PermissionsPage />} />
        <Route path="/admin/config" element={<ConfigurationPage />} />
        <Route path="/admin/tags" element={<TagsPage />} />
        
        {/* Test Routes - SOLO PARA ADMINS */}
        <Route path="/auth-test" element={<AdminOnlyRoute><AuthTestPage /></AdminOnlyRoute>} />
        <Route path="/data-test" element={<AdminOnlyRoute><DataTestPage /></AdminOnlyRoute>} />
        
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </Layout>
  );
}

export default App;
