#!/usr/bin/env node
// Script para actualizar todas las importaciones a la nueva estructura de Screaming Architecture

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapeo de importaciones que necesitan actualizarse
const importMappings = {
  // Hooks por dominio
  '@/hooks/useAuth': '@/shared/hooks/useAuth',
  '@/hooks/useCases': '@/case-management/hooks/useCases',
  '@/hooks/useCaseControl': '@/time-control/hooks/useCaseControl',
  '@/hooks/useCaseControlPermissions': '@/time-control/hooks/useCaseControlPermissions',
  '@/hooks/useActiveTimer': '@/time-control/hooks/useActiveTimer',
  '@/hooks/useTimerCounter': '@/time-control/hooks/useTimerCounter',
  '@/hooks/useTodos': '@/task-management/hooks/useTodos',
  '@/hooks/useTodoControl': '@/task-management/hooks/useTodoControl',
  '@/hooks/useTodoMetrics': '@/task-management/hooks/useTodoMetrics',
  '@/hooks/useTodoPriorities': '@/task-management/hooks/useTodoPriorities',
  '@/hooks/useTodoPermissions': '@/task-management/hooks/useTodoPermissions',
  '@/hooks/useNotes': '@/notes-knowledge/hooks/useNotes',
  '@/hooks/useNotesPermissions': '@/notes-knowledge/hooks/useNotesPermissions',
  '@/hooks/useDisposicionScripts': '@/disposicion-scripts/hooks/useDisposicionScripts',
  '@/hooks/useDisposicionScriptsPermissions': '@/disposicion-scripts/hooks/useDisposicionScriptsPermissions',
  '@/hooks/useDisposicionScriptsYears': '@/disposicion-scripts/hooks/useDisposicionScriptsYears',
  '@/hooks/useArchive': '@/archive-management/hooks/useArchive',
  '@/hooks/useArchivePermissions': '@/archive-management/hooks/useArchivePermissions',
  '@/hooks/usePermanentDelete': '@/archive-management/hooks/usePermanentDelete',
  '@/hooks/useCleanupOrphanedRecords': '@/archive-management/hooks/useCleanupOrphanedRecords',
  '@/hooks/useUsers': '@/user-management/hooks/useUsers',
  '@/hooks/useUserProfile': '@/user-management/hooks/useUserProfile',
  '@/hooks/usePermissions': '@/user-management/hooks/usePermissions',
  '@/hooks/useRoles': '@/user-management/hooks/useRoles',
  '@/hooks/useSystemAccess': '@/user-management/hooks/useSystemAccess',
  '@/hooks/useDashboardMetrics': '@/dashboard-analytics/hooks/useDashboardMetrics',
  '@/hooks/useOrigenesAplicaciones': '@/case-management/hooks/useOrigenesAplicaciones',
  '@/hooks/useCaseStatusControl': '@/case-management/hooks/useCaseStatusControl',
  '@/hooks/useVersionNotification': '@/shared/hooks/useVersionNotification',

  // Componentes por dominio
  '@/components/Button': '@/shared/components/ui/Button',
  '@/components/Input': '@/shared/components/ui/Input',
  '@/components/Select': '@/shared/components/ui/Select',
  '@/components/Modal': '@/shared/components/ui/Modal',
  '@/components/LoadingSpinner': '@/shared/components/ui/LoadingSpinner',
  '@/components/ConfirmationModal': '@/shared/components/ui/ConfirmationModal',
  '@/components/Layout': '@/shared/components/layout/Layout',
  '@/components/PageWrapper': '@/shared/components/layout/PageWrapper',
  '@/components/ThemeToggle': '@/shared/components/layout/ThemeToggle',
  '@/components/ProtectedRoute': '@/shared/components/guards/ProtectedRoute',
  '@/components/AdminOnlyRoute': '@/shared/components/guards/AdminOnlyRoute',
  '@/components/AccessDenied': '@/shared/components/guards/AccessDenied',
  '@/components/ConfigurationRequired': '@/shared/components/guards/ConfigurationRequired',
  '@/components/RLSError': '@/shared/components/guards/RLSError',
  '@/components/NotificationSystem': '@/shared/components/notifications/NotificationSystem',
  '@/components/VersionDisplay': '@/shared/components/version/VersionDisplay',
  '@/components/VersionModal': '@/shared/components/version/VersionModal',
  '@/components/CaseForm': '@/case-management/components/CaseForm',
  '@/components/CaseAssignmentModal': '@/case-management/components/CaseAssignmentModal',
  '@/components/TimerControl': '@/time-control/components/TimerControl',
  '@/components/CaseControlDetailsModal': '@/time-control/components/CaseControlDetailsModal',
  '@/components/TodoForm': '@/task-management/components/TodoForm',
  '@/components/TodoCard': '@/task-management/components/TodoCard',
  '@/components/TodoControlDetailsModal': '@/task-management/components/TodoControlDetailsModal',
  '@/components/NoteCard': '@/notes-knowledge/components/NoteCard',
  '@/components/NoteForm': '@/notes-knowledge/components/NoteForm',
  '@/components/NotesQuickSearch': '@/notes-knowledge/components/NotesQuickSearch',
  '@/components/NotesSearch': '@/notes-knowledge/components/NotesSearch',
  '@/components/CaseNotes': '@/notes-knowledge/components/CaseNotes',
  '@/components/CaseNotesPanel': '@/notes-knowledge/components/CaseNotesPanel',
  '@/components/DisposicionScriptsForm': '@/disposicion-scripts/components/DisposicionScriptsForm',
  '@/components/DisposicionScriptsMensualCard': '@/disposicion-scripts/components/DisposicionScriptsMensualCard',
  '@/components/DisposicionScriptsTable': '@/disposicion-scripts/components/DisposicionScriptsTable',
  '@/components/ArchiveModal': '@/archive-management/components/ArchiveModal',
  '@/components/ArchiveDetailsModal': '@/archive-management/components/ArchiveDetailsModal',
  '@/components/RestoreModal': '@/archive-management/components/RestoreModal',
  '@/components/CleanupModal': '@/archive-management/components/CleanupModal',
  '@/components/AuthForm': '@/user-management/components/AuthForm',

  // Páginas por dominio
  '@/pages/Dashboard': '@/dashboard-analytics/pages/Dashboard',
  '@/pages/ResetPassword': '@/user-management/pages/ResetPassword',
  '@/pages/AuthTestPage': '@/user-management/pages/AuthTestPage',
  '@/pages/DataTestPage': '@/shared/pages/DataTestPage',
  '@/pages/admin/UsersPage': '@/user-management/pages/admin/UsersPage',
  '@/pages/admin/RolesPage': '@/user-management/pages/admin/RolesPage',
  '@/pages/admin/PermissionsPage': '@/user-management/pages/admin/PermissionsPage',
  '@/pages/admin/ConfigurationPage': '@/user-management/pages/admin/ConfigurationPage',
  '@/pages/NotFound': '@/shared/pages/NotFound',
  '@/pages/CaseControl': '@/time-control/pages/CaseControl',
  '@/pages/TodosPage': '@/task-management/pages/TodosPage',
  '@/pages/NotesPage': '@/notes-knowledge/pages/NotesPage',
  '@/pages/ArchivePage': '@/archive-management/pages/ArchivePage',
  '@/pages/DisposicionScriptsPage': '@/disposicion-scripts/pages/DisposicionScriptsPage',

  // Librerías y utilidades
  '@/lib/supabase': '@/shared/lib/supabase',
  '@/lib/validations': '@/shared/lib/validations',

  // Utilidades restantes que faltaron
  '@/utils/caseUtils': '@/shared/utils/caseUtils',
  '@/utils/exportUtils': '@/shared/utils/exportUtils',
  '@/utils/roleUtils': '@/shared/utils/roleUtils',
  '@/utils/versionUtils': '@/shared/utils/versionUtils',
  '@/utils/disposicionScriptsExportUtils': '@/shared/utils/disposicionScriptsExportUtils',
  
  // Importaciones relativas restantes específicas
  '../hooks/useUsers': '@/user-management/hooks/useUsers',
  '../components/Input': '@/shared/components/ui/Input',
  '../components/Select': '@/shared/components/ui/Select',
  './useAuth': '@/shared/hooks/useAuth',
  './useUserProfile': '@/user-management/hooks/useUserProfile',

  // Importaciones relativas comunes
  '../lib/supabase': '@/shared/lib/supabase',
  '../lib/validations': '@/shared/lib/validations',
  './Modal': '@/shared/components/ui/Modal',
  './Button': '@/shared/components/ui/Button',
  './Input': '@/shared/components/ui/Input',
  './Select': '@/shared/components/ui/Select',
  './LoadingSpinner': '@/shared/components/ui/LoadingSpinner',
  './ConfirmationModal': '@/shared/components/ui/ConfirmationModal',
  './NotificationSystem': '@/shared/components/notifications/NotificationSystem',
  './PageWrapper': '@/shared/components/layout/PageWrapper',
  './ProtectedRoute': '@/shared/components/guards/ProtectedRoute',
  './AdminOnlyRoute': '@/shared/components/guards/AdminOnlyRoute',
  './AccessDenied': '@/shared/components/guards/AccessDenied',
  './RLSError': '@/shared/components/guards/RLSError',
  './VersionDisplay': '@/shared/components/version/VersionDisplay',
  './VersionModal': '@/shared/components/version/VersionModal',
  '../types': '@/types',
  '../hooks/useAuth': '@/shared/hooks/useAuth',
  '../hooks/useUserProfile': '@/user-management/hooks/useUserProfile',
  '../hooks/useActiveTimer': '@/time-control/hooks/useActiveTimer',
  '../hooks/useTodoControl': '@/task-management/hooks/useTodoControl',
  '../hooks/useTodos': '@/task-management/hooks/useTodos',
  '../hooks/useTodoPermissions': '@/task-management/hooks/useTodoPermissions',
  '../hooks/useTodoPriorities': '@/task-management/hooks/useTodoPriorities',
  '../hooks/useArchive': '@/archive-management/hooks/useArchive',
  '../utils/caseUtils': '@/shared/utils/caseUtils',
  '../utils/exportUtils': '@/shared/utils/exportUtils',
  '../components/Button': '@/shared/components/ui/Button',
  '../components/Modal': '@/shared/components/ui/Modal',
  '../components/LoadingSpinner': '@/shared/components/ui/LoadingSpinner',
  '../components/PageWrapper': '@/shared/components/layout/PageWrapper',
  '../components/ConfirmationModal': '@/shared/components/ui/ConfirmationModal',
  '../components/ArchiveModal': '@/archive-management/components/ArchiveModal',
  '../components/NotificationSystem': '@/shared/components/notifications/NotificationSystem',
  '../components/TodoCard': '@/task-management/components/TodoCard',
  '../components/TodoForm': '@/task-management/components/TodoForm'
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Aplicar cada mapeo de importaciones
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      // Buscar patrones de importación
      const patterns = [
        new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        new RegExp(`import\\s*\\(['"']${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"']\\)`, 'g')
      ];

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match) => {
            return match.replace(oldImport, newImport);
          });
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
  return false;
}

console.log('🏗️ Iniciando actualización masiva de importaciones...\n');

// Obtener todos los archivos TypeScript
const allFiles = getAllFiles('./src');
let updatedCount = 0;

// Actualizar importaciones en todos los archivos
allFiles.forEach(filePath => {
  if (updateImportsInFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n🎉 Actualización completada!`);
console.log(`📊 Archivos procesados: ${allFiles.length}`);
console.log(`✅ Archivos actualizados: ${updatedCount}`);

// Verificar que no hay errores de TypeScript
console.log('\n🔍 Verificando errores de TypeScript...');
try {
  execSync('npm run type-check', { stdio: 'pipe' });
  console.log('✅ TypeScript check pasó sin errores!');
} catch (error) {
  console.log('⚠️ Aún hay errores de TypeScript. Revisando...');
  
  // Mostrar un resumen de errores restantes
  try {
    const output = execSync('npm run type-check 2>&1', { encoding: 'utf8' });
    const errorCount = (output.match(/error TS2307/g) || []).length;
    console.log(`📊 Errores de módulos no encontrados restantes: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n🔧 Los siguientes pasos manuales pueden ser necesarios:');
      console.log('1. Verificar archivos que no existen en las nuevas ubicaciones');
      console.log('2. Actualizar importaciones complejas manualmente');
      console.log('3. Crear archivos index.ts para exports centralizados');
    }
  } catch (e) {
    console.log('❌ Error al verificar TypeScript:', e.message);
  }
}

console.log('\n🚀 Script de actualización completado!');
