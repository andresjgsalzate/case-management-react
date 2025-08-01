# 🏗️ Reorganización del Proyecto - Screaming Architecture

## 📑 **Información del Documento**

| Campo | Valor |
|-------|-------|
| **Documento** | Reorganización - Screaming Architecture |
| **Versión** | 1.0 |
| **Fecha** | 1 de Agosto, 2025 |
| **Proyecto** | Sistema de Gestión de Casos - case-management-react |
| **Estado** | Propuesta de Refactoring |

---

## 🎯 **¿Qué es Screaming Architecture?**

**Screaming Architecture** es un concepto introducido por Robert C. Martin que establece que **la arquitectura de un proyecto debe "gritar" su propósito**. Al mirar la estructura de carpetas, debería ser inmediatamente obvio de qué trata el sistema y cuáles son sus funcionalidades principales.

### **Principios Clave:**
- 📢 **La estructura grita el dominio**: Las carpetas reflejan las funcionalidades del negocio
- 🏛️ **Frameworks son detalles**: No organizamos por tecnología sino por dominio
- 🎯 **Casos de uso visibles**: Las operaciones principales son evidentes
- 🔗 **Cohesión alta**: Elementos relacionados están juntos

---

## 📊 **Análisis de la Estructura Actual**

### **Estructura Actual (Organizada por Tipo Técnico)**
```
src/
├── components/          # 🔧 Organizado por tipo técnico
├── hooks/              # 🔧 Organizado por tipo técnico
├── pages/              # 🔧 Organizado por tipo técnico
├── types/              # 🔧 Organizado por tipo técnico
├── utils/              # 🔧 Organizado por tipo técnico
├── stores/             # 🔧 Organizado por tipo técnico
└── lib/                # 🔧 Organizado por tipo técnico
```

### **Problemas Identificados:**
- ❌ **No es obvio qué hace el sistema** al ver la estructura
- ❌ **Funcionalidades dispersas** en múltiples carpetas técnicas
- ❌ **Difícil encontrar todo relacionado** a una funcionalidad específica
- ❌ **Acoplamiento implícito** entre módulos no es evidente

---

## 🏗️ **Nueva Estructura Propuesta (Screaming Architecture)**

### **Estructura Reorganizada (Por Dominio del Negocio)**
```
src/
├── 📋 case-management/           # 🎯 DOMINIO: Gestión de Casos
│   ├── components/              
│   │   ├── CaseForm.tsx
│   │   ├── CaseCard.tsx
│   │   ├── CaseFilters.tsx
│   │   └── CaseClassification.tsx
│   ├── hooks/
│   │   ├── useCases.ts
│   │   ├── useCaseStatusControl.ts
│   │   └── useOrigenesAplicaciones.ts
│   ├── pages/
│   │   ├── CasesPage.tsx
│   │   ├── NewCasePage.tsx
│   │   └── CaseDetailsPage.tsx
│   ├── services/
│   │   └── caseService.ts
│   ├── types/
│   │   └── case.types.ts
│   └── utils/
│       └── caseUtils.ts
│
├── ⏱️ time-control/             # 🎯 DOMINIO: Control de Tiempo
│   ├── components/
│   │   ├── TimerControl.tsx
│   │   ├── CaseControlDetailsModal.tsx
│   │   ├── CaseAssignmentModal.tsx
│   │   └── TimeRegistration.tsx
│   ├── hooks/
│   │   ├── useCaseControl.ts
│   │   ├── useActiveTimer.ts
│   │   ├── useTimerCounter.ts
│   │   └── useCaseControlPermissions.ts
│   ├── pages/
│   │   └── CaseControlPage.tsx
│   ├── services/
│   │   └── timeControlService.ts
│   ├── types/
│   │   └── timeControl.types.ts
│   └── utils/
│       └── timeUtils.ts
│
├── ✅ task-management/          # 🎯 DOMINIO: Gestión de Tareas (TODOs)
│   ├── components/
│   │   ├── TodoForm.tsx
│   │   ├── TodoCard.tsx
│   │   ├── TodoControlDetailsModal.tsx
│   │   └── TodoPriorityBadge.tsx
│   ├── hooks/
│   │   ├── useTodos.ts
│   │   ├── useTodoControl.ts
│   │   ├── useTodoMetrics.ts
│   │   ├── useTodoPriorities.ts
│   │   └── useTodoPermissions.ts
│   ├── pages/
│   │   └── TodosPage.tsx
│   ├── services/
│   │   └── todoService.ts
│   ├── types/
│   │   └── todo.types.ts
│   └── utils/
│       └── todoUtils.ts
│
├── 📝 notes-knowledge/          # 🎯 DOMINIO: Notas y Conocimiento
│   ├── components/
│   │   ├── CaseNotes.tsx
│   │   ├── CaseNotesPanel.tsx
│   │   ├── NoteCard.tsx
│   │   ├── NoteForm.tsx
│   │   ├── NotesQuickSearch.tsx
│   │   └── NotesSearch.tsx
│   ├── hooks/
│   │   ├── useNotes.ts
│   │   └── useNotesPermissions.ts
│   ├── pages/
│   │   └── NotesPage.tsx
│   ├── services/
│   │   └── notesService.ts
│   ├── types/
│   │   └── notes.types.ts
│   └── utils/
│       └── notesUtils.ts
│
├── 📊 disposicion-scripts/      # 🎯 DOMINIO: Disposición de Scripts
│   ├── components/
│   │   ├── DisposicionScriptsForm.tsx
│   │   ├── DisposicionScriptsMensualCard.tsx
│   │   └── DisposicionScriptsTable.tsx
│   ├── hooks/
│   │   ├── useDisposicionScripts.ts
│   │   ├── useDisposicionScriptsPermissions.ts
│   │   └── useDisposicionScriptsYears.ts
│   ├── pages/
│   │   └── DisposicionScriptsPage.tsx
│   ├── services/
│   │   └── disposicionService.ts
│   ├── types/
│   │   └── disposicion.types.ts
│   └── utils/
│       └── disposicionUtils.ts
│
├── 🗄️ archive-management/       # 🎯 DOMINIO: Gestión de Archivo
│   ├── components/
│   │   ├── ArchiveModal.tsx
│   │   ├── ArchiveDetailsModal.tsx
│   │   ├── RestoreModal.tsx
│   │   └── CleanupModal.tsx
│   ├── hooks/
│   │   ├── useArchive.ts
│   │   ├── useArchivePermissions.ts
│   │   ├── usePermanentDelete.ts
│   │   └── useCleanupOrphanedRecords.ts
│   ├── pages/
│   │   └── ArchivePage.tsx
│   ├── services/
│   │   └── archiveService.ts
│   ├── types/
│   │   └── archive.types.ts
│   └── utils/
│       └── archiveUtils.ts
│
├── 👥 user-management/          # 🎯 DOMINIO: Gestión de Usuarios
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   ├── UserProfile.tsx
│   │   └── RoleAssignment.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useRoles.ts
│   │   ├── usePermissions.ts
│   │   ├── useUserProfile.ts
│   │   └── useSystemAccess.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── UsersPage.tsx
│   │   │   ├── RolesPage.tsx
│   │   │   └── PermissionsPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── types/
│   │   └── user.types.ts
│   └── utils/
│       └── authUtils.ts
│
├── 📈 dashboard-analytics/      # 🎯 DOMINIO: Dashboard y Analíticas
│   ├── components/
│   │   ├── DashboardWidgets/
│   │   │   ├── CaseMetricsWidget.tsx
│   │   │   ├── TimeMetricsWidget.tsx
│   │   │   ├── TodoMetricsWidget.tsx
│   │   │   └── UserActivityWidget.tsx
│   │   └── Charts/
│   │       ├── CaseChart.tsx
│   │       └── TimeChart.tsx
│   ├── hooks/
│   │   └── useDashboardMetrics.ts
│   ├── pages/
│   │   └── DashboardPage.tsx
│   ├── services/
│   │   └── analyticsService.ts
│   ├── types/
│   │   └── analytics.types.ts
│   └── utils/
│       └── chartUtils.ts
│
├── 🛠️ shared/                  # 🎯 ELEMENTOS COMPARTIDOS
│   ├── components/              # Componentes UI genéricos
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── PageWrapper.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── guards/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AdminOnlyRoute.tsx
│   │   │   └── AccessDenied.tsx
│   │   ├── notifications/
│   │   │   └── NotificationSystem.tsx
│   │   └── version/
│   │       ├── VersionDisplay.tsx
│   │       └── VersionModal.tsx
│   ├── hooks/
│   │   └── useVersionNotification.ts
│   ├── services/
│   │   └── baseService.ts
│   ├── types/
│   │   ├── common.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── lib/
│       ├── supabase.ts
│       └── validations.ts
│
├── 🏪 stores/                   # 🎯 ESTADO GLOBAL
│   ├── authStore.ts
│   ├── themeStore.ts
│   ├── notificationStore.ts
│   └── index.ts
│
├── 🧪 __tests__/               # 🎯 TESTS ORGANIZADOS POR DOMINIO
│   ├── case-management/
│   ├── time-control/
│   ├── task-management/
│   ├── notes-knowledge/
│   ├── shared/
│   └── setup.ts
│
├── 📋 pages/                   # 🎯 PÁGINAS DE NIVEL SUPERIOR
│   ├── NotFoundPage.tsx
│   ├── AuthTestPage.tsx
│   ├── DataTestPage.tsx
│   └── ConfigurationRequired.tsx
│
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

---

## 🔄 **Plan de Migración**

### **Fase 1: Preparación (1 semana)**
1. **Crear nueva estructura de carpetas**
2. **Configurar imports absolutos** para nuevas rutas
3. **Crear archivos índice** para cada dominio
4. **Documentar el plan de migración**

### **Fase 2: Migración por Dominio (3-4 semanas)**

#### **Semana 1: Shared y User Management**
```bash
# Mover componentes compartidos
mkdir -p src/shared/components/ui
mkdir -p src/shared/components/layout
mkdir -p src/shared/components/guards

# Mover componentes de UI
mv src/components/Button.tsx src/shared/components/ui/
mv src/components/Input.tsx src/shared/components/ui/
mv src/components/Select.tsx src/shared/components/ui/
mv src/components/Modal.tsx src/shared/components/ui/

# Mover componentes de layout
mv src/components/Layout.tsx src/shared/components/layout/
mv src/components/PageWrapper.tsx src/shared/components/layout/
mv src/components/ThemeToggle.tsx src/shared/components/layout/
```

#### **Semana 2: Case Management**
```bash
# Crear estructura de case management
mkdir -p src/case-management/{components,hooks,pages,services,types,utils}

# Mover archivos relacionados a casos
mv src/components/CaseForm.tsx src/case-management/components/
mv src/hooks/useCases.ts src/case-management/hooks/
mv src/pages/Cases.tsx src/case-management/pages/CasesPage.tsx
mv src/pages/NewCase.tsx src/case-management/pages/NewCasePage.tsx
```

#### **Semana 3: Time Control y Task Management**
```bash
# Time Control
mkdir -p src/time-control/{components,hooks,pages,services,types,utils}
mv src/components/TimerControl.tsx src/time-control/components/
mv src/hooks/useCaseControl.ts src/time-control/hooks/
mv src/pages/CaseControl.tsx src/time-control/pages/CaseControlPage.tsx

# Task Management
mkdir -p src/task-management/{components,hooks,pages,services,types,utils}
mv src/components/TodoForm.tsx src/task-management/components/
mv src/hooks/useTodos.ts src/task-management/hooks/
mv src/pages/TodosPage.tsx src/task-management/pages/
```

#### **Semana 4: Dominios Restantes**
```bash
# Notes Knowledge
mkdir -p src/notes-knowledge/{components,hooks,pages,services,types,utils}

# Archive Management
mkdir -p src/archive-management/{components,hooks,pages,services,types,utils}

# Disposicion Scripts
mkdir -p src/disposicion-scripts/{components,hooks,pages,services,types,utils}

# Dashboard Analytics
mkdir -p src/dashboard-analytics/{components,hooks,pages,services,types,utils}
```

### **Fase 3: Configuración y Optimización (1 semana)**
1. **Actualizar imports** en todos los archivos
2. **Configurar path mapping** en TypeScript
3. **Actualizar configuración de bundler**
4. **Ejecutar tests** y corregir errores
5. **Optimizar imports** y exports

---

## ⚙️ **Configuración Necesaria**

### **1. TypeScript Path Mapping (tsconfig.json)**
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/case-management/*": ["case-management/*"],
      "@/time-control/*": ["time-control/*"],
      "@/task-management/*": ["task-management/*"],
      "@/notes-knowledge/*": ["notes-knowledge/*"],
      "@/disposicion-scripts/*": ["disposicion-scripts/*"],
      "@/archive-management/*": ["archive-management/*"],
      "@/user-management/*": ["user-management/*"],
      "@/dashboard-analytics/*": ["dashboard-analytics/*"],
      "@/shared/*": ["shared/*"],
      "@/stores/*": ["stores/*"]
    }
  }
}
```

### **2. Vite Configuration (vite.config.ts)**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/case-management': path.resolve(__dirname, './src/case-management'),
      '@/time-control': path.resolve(__dirname, './src/time-control'),
      '@/task-management': path.resolve(__dirname, './src/task-management'),
      '@/notes-knowledge': path.resolve(__dirname, './src/notes-knowledge'),
      '@/disposicion-scripts': path.resolve(__dirname, './src/disposicion-scripts'),
      '@/archive-management': path.resolve(__dirname, './src/archive-management'),
      '@/user-management': path.resolve(__dirname, './src/user-management'),
      '@/dashboard-analytics': path.resolve(__dirname, './src/dashboard-analytics'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/stores': path.resolve(__dirname, './src/stores')
    }
  }
});
```

### **3. Archivos Índice por Dominio**

#### **case-management/index.ts**
```typescript
// Exportar todos los elementos públicos del dominio
export * from './components/CaseForm';
export * from './components/CaseCard';
export * from './hooks/useCases';
export * from './pages/CasesPage';
export * from './types/case.types';
export * from './utils/caseUtils';
```

#### **shared/index.ts**
```typescript
// Componentes UI
export * from './components/ui/Button';
export * from './components/ui/Input';
export * from './components/ui/Select';
export * from './components/ui/Modal';

// Layout
export * from './components/layout/Layout';
export * from './components/layout/PageWrapper';

// Guards
export * from './components/guards/ProtectedRoute';
export * from './components/guards/AdminOnlyRoute';

// Types
export * from './types/common.types';
export * from './types/api.types';

// Utils
export * from './utils/formatters';
export * from './utils/validators';
```

---

## 📋 **Archivos de Migración**

### **Script de Migración Automática**
```bash
#!/bin/bash
# migrate-to-screaming-architecture.sh

echo "🏗️ Iniciando migración a Screaming Architecture..."

# Crear estructura base
echo "📁 Creando estructura de carpetas..."
mkdir -p src/{case-management,time-control,task-management,notes-knowledge,disposicion-scripts,archive-management,user-management,dashboard-analytics,shared}/{components,hooks,pages,services,types,utils}

mkdir -p src/shared/components/{ui,layout,guards,notifications,version}
mkdir -p src/shared/lib
mkdir -p src/__tests__/{case-management,time-control,task-management,notes-knowledge,shared}

# Migrar shared components
echo "🔧 Migrando componentes compartidos..."
mv src/components/Button.tsx src/shared/components/ui/ 2>/dev/null
mv src/components/Input.tsx src/shared/components/ui/ 2>/dev/null
mv src/components/Select.tsx src/shared/components/ui/ 2>/dev/null
mv src/components/Modal.tsx src/shared/components/ui/ 2>/dev/null
mv src/components/LoadingSpinner.tsx src/shared/components/ui/ 2>/dev/null

mv src/components/Layout.tsx src/shared/components/layout/ 2>/dev/null
mv src/components/PageWrapper.tsx src/shared/components/layout/ 2>/dev/null
mv src/components/ThemeToggle.tsx src/shared/components/layout/ 2>/dev/null

mv src/components/ProtectedRoute.tsx src/shared/components/guards/ 2>/dev/null
mv src/components/AdminOnlyRoute.tsx src/shared/components/guards/ 2>/dev/null
mv src/components/AccessDenied.tsx src/shared/components/guards/ 2>/dev/null

# Migrar case management
echo "📋 Migrando Case Management..."
mv src/components/CaseForm.tsx src/case-management/components/ 2>/dev/null
mv src/components/CaseAssignmentModal.tsx src/case-management/components/ 2>/dev/null

mv src/hooks/useCases.ts src/case-management/hooks/ 2>/dev/null
mv src/hooks/useCaseStatusControl.ts src/case-management/hooks/ 2>/dev/null
mv src/hooks/useOrigenesAplicaciones.ts src/case-management/hooks/ 2>/dev/null

mv src/pages/Cases.tsx src/case-management/pages/CasesPage.tsx 2>/dev/null
mv src/pages/NewCase.tsx src/case-management/pages/NewCasePage.tsx 2>/dev/null

# Migrar time control
echo "⏱️ Migrando Time Control..."
mv src/components/TimerControl.tsx src/time-control/components/ 2>/dev/null
mv src/components/CaseControlDetailsModal.tsx src/time-control/components/ 2>/dev/null

mv src/hooks/useCaseControl.ts src/time-control/hooks/ 2>/dev/null
mv src/hooks/useActiveTimer.ts src/time-control/hooks/ 2>/dev/null
mv src/hooks/useTimerCounter.ts src/time-control/hooks/ 2>/dev/null
mv src/hooks/useCaseControlPermissions.ts src/time-control/hooks/ 2>/dev/null

mv src/pages/CaseControl.tsx src/time-control/pages/CaseControlPage.tsx 2>/dev/null

# Migrar task management
echo "✅ Migrando Task Management..."
mv src/components/TodoForm.tsx src/task-management/components/ 2>/dev/null
mv src/components/TodoCard.tsx src/task-management/components/ 2>/dev/null
mv src/components/TodoControlDetailsModal.tsx src/task-management/components/ 2>/dev/null

mv src/hooks/useTodos.ts src/task-management/hooks/ 2>/dev/null
mv src/hooks/useTodoControl.ts src/task-management/hooks/ 2>/dev/null
mv src/hooks/useTodoMetrics.ts src/task-management/hooks/ 2>/dev/null
mv src/hooks/useTodoPriorities.ts src/task-management/hooks/ 2>/dev/null
mv src/hooks/useTodoPermissions.ts src/task-management/hooks/ 2>/dev/null

mv src/pages/TodosPage.tsx src/task-management/pages/ 2>/dev/null

# Continuar con otros dominios...

echo "✅ Migración completada!"
echo "🔧 Ejecutar: npm run update-imports para actualizar las importaciones"
```

### **Script para Actualizar Imports**
```javascript
// update-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const importMappings = {
  // Shared components
  '../components/Button': '@/shared/components/ui/Button',
  '../components/Input': '@/shared/components/ui/Input',
  '../components/Layout': '@/shared/components/layout/Layout',
  
  // Case management
  '../hooks/useCases': '@/case-management/hooks/useCases',
  '../components/CaseForm': '@/case-management/components/CaseForm',
  
  // Time control
  '../hooks/useCaseControl': '@/time-control/hooks/useCaseControl',
  '../components/TimerControl': '@/time-control/components/TimerControl',
  
  // Task management
  '../hooks/useTodos': '@/task-management/hooks/useTodos',
  '../components/TodoForm': '@/task-management/components/TodoForm'
};

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  Object.entries(importMappings).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newPath);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
}

// Encontrar todos los archivos TypeScript/TSX
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
files.forEach(updateImports);

console.log('🎉 Import updates completed!');
```

---

## 📈 **Beneficios de la Reorganización**

### **Para el Desarrollo**
- ✅ **Navegación Intuitiva**: Fácil encontrar archivos relacionados
- ✅ **Cohesión Alta**: Todo lo relacionado está junto
- ✅ **Acoplamiento Bajo**: Dependencias claras entre dominios
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades

### **Para el Equipo**
- ✅ **Onboarding Rápido**: Nuevos desarrolladores entienden la estructura
- ✅ **Mantenimiento Eficiente**: Cambios localizados por dominio
- ✅ **Testing Organizado**: Tests cerca del código que prueban
- ✅ **Colaboración Mejorada**: Menos conflictos en merge requests

### **Para la Arquitectura**
- ✅ **Dominio Evidente**: La estructura grita las funcionalidades
- ✅ **Responsabilidades Claras**: Cada dominio tiene su propósito
- ✅ **Dependencias Explícitas**: Imports muestran relaciones
- ✅ **Preparado para Microservicios**: Fácil extraer dominios

---

## 🎯 **Validación de la Migración**

### **Checklist de Validación**
- [ ] ✅ Todos los archivos migrados correctamente
- [ ] ✅ Imports actualizados sin errores
- [ ] ✅ Build exitoso sin warnings
- [ ] ✅ Tests pasando en nueva estructura
- [ ] ✅ Hot reload funcionando
- [ ] ✅ Documentación actualizada

### **Comandos de Verificación**
```bash
# Verificar build
npm run build

# Verificar types
npm run type-check

# Verificar tests
npm run test

# Verificar linting
npm run lint

# Verificar que no hay imports relativos largos
grep -r "../../" src/ || echo "✅ No relative imports found"
```

---

## 🔮 **Extensibilidad Futura**

### **Nuevos Dominios Preparados**
Con esta estructura, agregar nuevas funcionalidades como:

```
📚 documentation/           # Módulo Notion documentación
├── components/
├── hooks/
├── pages/
├── services/
├── types/
└── utils/

🎫 helpdesk/               # Módulo HELPDESK
├── components/
├── hooks/
├── pages/
├── services/
├── types/
└── utils/

📊 reporting/              # Módulo de Reportes Avanzados
├── components/
├── hooks/
├── pages/
├── services/
├── types/
└── utils/
```

### **Patrón de Agregación**
Cada dominio puede tener sub-dominios:
```
case-management/
├── classification/        # Sub-dominio clasificación
├── workflow/             # Sub-dominio flujo de trabajo
└── integration/          # Sub-dominio integraciones
```

---

## 📝 **Conclusión**

La reorganización a **Screaming Architecture** transformará el proyecto de:

**❌ "Es una aplicación React con componentes"**

A:

**✅ "Es un sistema de gestión de casos con control de tiempo, gestión de tareas, archivo, notas y administración de usuarios"**

Esta estructura hará que:
1. **Los nuevos desarrolladores** entiendan inmediatamente qué hace el sistema
2. **Las funcionalidades** sean fáciles de encontrar y mantener
3. **El crecimiento futuro** sea ordenado y escalable
4. **La arquitectura** refleje el dominio del negocio

La migración es **incremental y segura**, permitiendo validar cada paso antes de continuar al siguiente dominio.

---

**Documento generado el 1 de Agosto, 2025**  
**Versión 1.0 - Propuesta de Reorganización Arquitectónica**
