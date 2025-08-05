# 🚀 Sistema de Gestión de Casos - v2.10.0

> **Una aplicación moderna y completa para la gestión integral de casos, control de tiempo, documentación y administración de tareas empresariales.**

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify)](https://case-management-ctl.netlify.app)

**🌐 [Ver Aplicación en Vivo](https://case-management-ctl.netlify.app)**

</div>

---

## 🎯 **¿Qué es este sistema?**

Una plataforma integral que centraliza la gestión de casos, control de tiempo, documentación técnica y administración de tareas. Diseñada para equipos que necesitan:

- ✅ **Gestionar casos** con clasificación automática de complejidad
- ⏱️ **Controlar tiempo** con timers automáticos y registro manual  
- 📚 **Documentar conocimiento** con base de datos inteligente
- 📋 **Administrar tareas** con seguimiento y métricas
- 👥 **Gestionar usuarios** con roles y permisos granulares
- 📊 **Generar reportes** detallados en Excel/CSV

---

## ✨ **Características Principales**

### 🔥 **Gestión de Casos Inteligente**
- **Clasificación Automática**: Sistema de puntuación que evalúa complejidad (Baja/Media/Alta)
- **CRUD Completo**: Crear, editar, eliminar y ver casos con validaciones robustas
- **Filtros Avanzados**: Búsqueda por fecha, estado, complejidad, aplicación
- **Vista Detallada**: Visualización completa sin edición para consulta rápida
- **Exportación**: Reportes Excel/CSV con métricas detalladas

### ⏱️ **Control de Tiempo Profesional**
- **Timer en Tiempo Real**: Cronómetro automático con inicio, pausa y detención
- **Registro Manual**: Adición de tiempo trabajado con descripción y fecha
- **Estados de Control**: Seguimiento de progreso (Pendiente, En Curso, Escalada, Terminada)
- **Métricas Avanzadas**: Tiempo total, promedio por caso, eficiencia
- **Sincronización**: Actualizaciones automáticas entre módulos

### 📚 **Base de Conocimiento Avanzada**
- **Editor Potente**: Sistema de documentación con editor rico y avanzado
- **Etiquetas Inteligentes**: Creación instantánea con Enter y colores automáticos
- **Categorización Automática**: Clasificación por palabras clave (Priority, Technology, Technical, Module)
- **Algoritmo Anti-Repetición**: Evita colores duplicados en etiquetas recientes
- **Búsqueda Avanzada**: Localización rápida de documentos por contenido y etiquetas
- **🆕 Exportación PDF**: Generación profesional de documentos con @react-pdf/renderer

### 📋 **Gestión de TODOs Empresarial**
- **CRUD Completo**: Crear, asignar, seguir y completar tareas
- **Prioridades**: Sistema de niveles (Alta, Media, Baja) con indicadores visuales
- **Control de Tiempo**: Timer integrado y estimación vs tiempo real
- **Estados Dinámicos**: Seguimiento automático del progreso
- **Análisis de Eficiencia**: Métricas de cumplimiento y rendimiento

### 🗄️ **Sistema de Archivo Inteligente**
- **Archivo Temporal**: Preserva datos para restauración posterior
- **Eliminación Permanente**: Solo administradores con confirmación doble
- **Auditoría Completa**: Registro de todas las operaciones con timestamps
- **Restauración**: Recuperación completa con historial de tiempo intacto

### 👥 **Administración de Usuarios**
- **Flujo Simplificado**: Registro directo → Activación admin → Acceso
- **Roles Granulares**: Admin, Supervisor, Analista, Usuario con permisos específicos
- **Gestión Centralizada**: Panel único para administrar todos los usuarios
- **Sin Dependencias**: No requiere configuración SMTP ni emails

### 📊 **Reportes y Analytics**
- **Reportes Excel**: Generación automática con formato profesional
- **Métricas de Tiempo**: Análisis detallado por usuario, caso y período
- **Estadísticas Visuales**: Dashboard con gráficos y métricas en tiempo real
- **Exportación CSV**: Para análisis externos y bases de datos

---

## 🛠️ **Stack Tecnológico**

<div align="center">

| **Frontend** | **Backend** | **Base de Datos** | **Herramientas** |
|-------------|-------------|-------------------|------------------|
| React 18 | Supabase | PostgreSQL | Vite |
| TypeScript | Auth & Storage | Row Level Security | TanStack Query |
| Tailwind CSS | Real-time APIs | Automated Backups | React Hook Form |
| Heroicons | Edge Functions | Migration System | Zod Validation |

</div>

---

## 🚀 **Inicio Rápido**

### **Prerrequisitos**
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### **Instalación Local**

```bash
# 1. Clonar repositorio
git clone https://github.com/andresjgsalzate/case-management-react.git
cd case-management-react

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

### **Configuración de Supabase**

```env
# .env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### **Configuración de Base de Datos**

1. **Crear proyecto en Supabase**
2. **Ejecutar migraciones**:
   - Ve a SQL Editor en Supabase
   - Ejecuta archivos en orden: `supabase/migrations/001_initial.sql` → `030_latest.sql`
3. **Configurar autenticación**:
   - Habilitar provider de email
   - Configurar URLs de redirección

### **Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador en http://localhost:5173
```

---

## 📁 **Arquitectura del Proyecto**

```
src/
├── 📚 notes-knowledge/          # Módulo de documentación
│   ├── components/             # TagSelector, DocumentEditor
│   ├── pages/                  # DocumentationPage, TagsPage
│   └── hooks/                  # useTags, useDocuments
├── 📋 case-management/         # Gestión de casos
│   ├── components/             # CaseForm, CaseList
│   ├── pages/                  # CasesPage, ViewCasePage
│   └── services/               # caseService
├── ⏱️ time-control/            # Control de tiempo
│   ├── components/             # TimerControl, TimeEntry
│   ├── pages/                  # CaseControl
│   └── hooks/                  # useCaseControl, useTimer
├── 📝 task-management/         # TODOs
│   ├── components/             # TodoCard, TodoForm
│   ├── pages/                  # TodosPage
│   └── hooks/                  # useTodos, useTodoControl
├── 👥 user-management/         # Usuarios
│   ├── components/             # UserForm, RoleSelector
│   ├── pages/                  # UsersPage, RolesPage
│   └── hooks/                  # useUsers, useRoles
├── 🗄️ archive-management/      # Sistema de archivo
├── 📊 dashboard-analytics/     # Dashboard y métricas
├── 🔧 shared/                  # Componentes compartidos
│   ├── components/             # Layout, Modals, Forms
│   ├── hooks/                  # useAuth, usePermissions
│   ├── lib/                    # supabase, validations
│   └── utils/                  # helpers, formatters
└── 📄 disposicion-scripts/     # Disposiciones
```

---

## 🎯 **Funcionalidades Detalladas**

### **💼 Gestión de Casos**

**Clasificación Automática Inteligente:**
- Evaluación por 5 criterios: Historial, Conocimiento, Manipulación de datos, Claridad, Causa
- Puntuación 1-3 por criterio (Total: 5-15 puntos)
- Clasificación: Baja (5), Media (6-11), Alta (12-15)

**Características:**
- ✅ CRUD completo con validaciones robustas
- ✅ Filtros por fecha, complejidad, estado, aplicación  
- ✅ Búsqueda en tiempo real con highlight
- ✅ Vista detallada de solo lectura
- ✅ Exportación Excel con métricas

### **⏰ Control de Tiempo**

**Timer Profesional:**
- Cronómetro en tiempo real con persistencia
- Inicio/pausa/detención automática
- Sincronización entre pestañas del navegador

**Registro Manual:**
- Adición de tiempo por día con descripción
- Validaciones de fechas y rangos
- Historial completo por caso

**Estados de Control:**
- 🟡 Pendiente → 🔵 En Curso → 🔴 Escalada → ✅ Terminada
- Transiciones automáticas basadas en actividad
- Colores dinámicos configurables

### **📚 Base de Conocimiento**

**Editor Avanzado:**
- Sistema de documentación rico con múltiples formatos
- Soporte para código, tablas, listas, enlaces
- Auto-guardado y versionado

**Sistema de Etiquetas:**
- Creación instantánea presionando Enter
- 12 colores predefinidos con algoritmo anti-repetición
- Categorización automática por palabras clave
- Gestión administrativa completa

**🆕 Exportación PDF Profesional:**
- **Librería**: @react-pdf/renderer para generación nativa
- **Formatos Completos**: Soporte para todos los tipos de bloques BlockNote
- **Estilos Profesionales**: Tipografía mejorada y diseño empresarial
- **Metadatos Automáticos**: Información del documento, autor, fechas
- **Preservación de Formato**: Emojis, negrita, cursiva, checkboxes
- **Descarga Directa**: Generación y descarga automática del archivo PDF

### **📋 Gestión de TODOs**

**Características Avanzadas:**
- Prioridades visuales con colores distintivos
- Estimación vs tiempo real con % de eficiencia
- Estados automáticos de cumplimiento
- Asignación entre usuarios del equipo

**Métricas y Análisis:**
- Eficiencia por tarea y usuario
- Reportes Excel especializados
- Dashboard con indicadores clave

### **🗄️ Sistema de Archivo**

**Archivo Inteligente:**
- Preservación de datos en formato JSON
- Mantiene relaciones y historial de tiempo
- Razones de archivado con auditoría

**Restauración:**
- Recuperación completa del estado original
- Recreación de registros en tablas principales
- Validaciones de integridad de datos

---

## 🔐 **Seguridad y Permisos**

### **Autenticación**
- Supabase Auth con email/contraseña
- Sesiones seguras con tokens JWT
- Logout automático por inactividad

### **Autorización (RLS)**
- Row Level Security en todas las tablas
- Políticas granulares por operación
- Filtrado automático por usuario

### **Roles y Permisos**
- **Admin**: Acceso total al sistema
- **Supervisor**: Lectura global, gestión limitada
- **Analista**: Acceso a casos asignados + propios
- **Usuario**: Solo casos y tareas propias

---

## 📊 **Dashboard y Métricas**

### **Métricas Principales**
- 📈 **Tiempo Total**: Suma de casos + TODOs
- 📋 **Casos Activos**: En progreso por usuario
- ✅ **TODOs Completados**: % de cumplimiento
- 👥 **Usuarios Activos**: Actividad reciente

### **Análisis Avanzado**
- Tiempo promedio por complejidad de caso
- Eficiencia por usuario y período
- Tendencias de productividad
- Top casos por tiempo invertido

### **Reportes Exportables**
- **Excel**: Formato profesional con gráficos
- **CSV**: Para análisis externos
- **Filtros**: Por fecha, usuario, estado
- **Agrupación**: Por caso, día, usuario

---

## 🎨 **Experiencia de Usuario**

### **Interfaz Moderna**
- Diseño limpio y profesional
- Modo oscuro/claro automático
- Responsive design para todos los dispositivos
- Iconografía consistente con Heroicons

### **Navegación Intuitiva**
- Menú lateral colapsable
- Breadcrumbs contextuales
- Shortcuts de teclado
- Tooltips informativos

### **Performance Optimizada**
- Lazy loading de componentes
- Caché inteligente con React Query
- Optimizaciones de bundle con Vite
- Tiempo de carga < 2 segundos

---

## 🚀 **Despliegue**

### **Producción (Netlify)**
```bash
# Build automático desde GitHub
npm run build

# Configurar variables de entorno en Netlify:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### **Otras Plataformas**

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🤝 **Contribuir**

### **Workflow de Desarrollo**
1. **Fork** del repositorio
2. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar** con tests incluidos
4. **Commit**: `git commit -m "feat: nueva funcionalidad"`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **Pull Request** con descripción detallada

### **Estándares de Código**
- **ESLint + Prettier** para formato consistente
- **Conventional Commits** para mensajes
- **TypeScript strict** mode habilitado
- **Zod** para validación de esquemas

---

## 📞 **Soporte y Comunidad**

### **Enlaces Útiles**
- 🌐 **Aplicación**: https://case-management-ctl.netlify.app
- 💻 **Repositorio**: https://github.com/andresjgsalzate/case-management-react
- 📧 **Contacto**: [Crear Issue](https://github.com/andresjgsalzate/case-management-react/issues)

### **Documentación**
- 📖 **API Reference**: Ver `docs/api.md`
- 🔧 **Configuration**: Ver `docs/config.md`  
- 🚀 **Deployment**: Ver `docs/deployment.md`

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

<div align="center">

**🚀 Desarrollado con ❤️ para la gestión eficiente de casos empresariales**

[![GitHub stars](https://img.shields.io/github/stars/andresjgsalzate/case-management-react?style=social)](https://github.com/andresjgsalzate/case-management-react)
[![GitHub forks](https://img.shields.io/github/forks/andresjgsalzate/case-management-react?style=social)](https://github.com/andresjgsalzate/case-management-react)

</div>
