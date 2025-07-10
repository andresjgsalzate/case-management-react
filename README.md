# 🚀 Sistema de Gestión de Casos - React v2.7.5

Una aplicación moderna para la gestión integral de casos con control de tiempo, basada en React, TypeScript y Supabase.

## 🌐 Acceso al Sistema

**🚀 Aplicación en Producción**: https://case-management-ctl.netlify.app

### URLs del Proyecto:
- **Producción**: https://case-management-ctl.netlify.app
- **Admin Panel**: https://app.netlify.com/projects/case-management-ctl
- **Repositorio**: https://github.com/andresjgsalzate/case-management-react

## ✨ Características Principales

### � **Sincronización Cross-Módulo (v2.7.5)**
- **Invalidación Automática**: Los cambios en un módulo se reflejan instantáneamente en otros
- **Eliminación Sincronizada**: Eliminar casos desde Casos actualiza Control de Casos automáticamente
- **Archivo Bidireccional**: Archivar desde Control de Casos actualiza la vista de Casos
- **UX Sin Interrupciones**: No más necesidad de recargar páginas manualmente

### 🎨 **Modales Mejorados (v2.7.5)**
- **Portal DOM**: Renderizado en nivel superior para evitar conflictos de z-index
- **Visualización Perfecta**: Modales siempre aparecen por encima de cualquier elemento
- **Fondo Mejorado**: Efecto blur y opacidad optimizada para mejor UX
- **Bloqueo de Scroll**: El body se bloquea cuando hay modales abiertos

### 🗄️ **Sistema de Archivo Completo (v2.7.0-2.7.4)**
- **Restauración con Historial**: Los casos y TODOs restaurados mantienen todo el historial de tiempos
- **Archivo Inteligente**: Preserva datos originales y métricas en formato JSON
- **Eliminación Permanente**: Solo administradores pueden eliminar permanentemente
- **Auditoría Completa**: Registro de todas las operaciones de archivo y restauración

### �📊 **Dashboard Mejorado (v2.6.0)**
- **Métricas de Tiempo Combinadas**: Tiempo total que suma casos y TODOs
- **Métricas Específicas**: Tiempo separado por casos y TODOs
- **Visualización Optimizada**: Eliminación de métricas redundantes
- **Análisis Integral**: Vista unificada del trabajo realizado

### 📈 **Sistema de Reportes Completo (v2.5.0)**
- **Reportes de Control de Casos**: Exportación Excel con métricas detalladas de tiempo por caso y día
- **Reportes de TODOs**: Sistema completo de reportes para TODOs con análisis de eficiencia y cumplimiento
- **Métricas Avanzadas**: Tiempo estimado vs real, cálculo de eficiencia, estado de cumplimiento
- **Respeto de Permisos**: Ambos sistemas respetan las reglas de permisos de usuario

### �📱 **Interfaz Mejorada (v2.4.0)**
- **Menú lateral colapsable** con logo como botón de toggle
- **Iconos optimizados** para mejor visibilidad en modo colapsado
- **Transiciones suaves** y tooltips informativos
- **Responsive design** adaptativo

### 🎯 **Gestión de TODOs (v2.3.0+)**
- **CRUD completo** de tareas con prioridades y etiquetas
- **Control de tiempo** integrado con timer automático
- **Estimación de tiempo** y seguimiento de cumplimiento
- **Estados y asignación** de usuarios
- **Reportes de eficiencia** con métricas detalladas

### 📝 **Gestión de Casos**
- **CRUD completo** de casos con validación robusta
- **Clasificación automática** basada en puntuación (Baja/Media/Alta complejidad)
- **Filtros avanzados** y búsqueda en tiempo real
- **Exportación** a Excel/CSV

### ⏱️ **Control de Casos y Tiempo**
- **Sistema de Control de Casos**: Asignación y seguimiento del tiempo de trabajo
- **Timer Integrado**: Cronómetro en tiempo real con inicio, pausa y detención
- **Registro de Tiempo Manual**: Adición de tiempo trabajado con descripción y fecha
- **Estados de Control**: Seguimiento del progreso (Pendiente, En Curso, Escalada, Terminada)
- **Reportes Detallados**: Exportación Excel con datos agrupados por caso y día
- **Gestión de Permisos**: Control granular de acceso a funcionalidades

### 📋 **Gestión de TODOs Avanzada**
- **Control de Tiempo Completo**: Timer automático y registro manual para tareas
- **Análisis de Eficiencia**: Comparación tiempo estimado vs tiempo real
- **Estados de Cumplimiento**: Clasificación automática del rendimiento
- **Reportes Especializados**: Excel con métricas específicas para TODOs
- **Gestión de Prioridades**: Sistema de niveles con análisis por importancia
- **Etiquetas y Categorización**: Organización flexible de tareas

### 👥 **Gestión de Usuarios Simplificada** (RENOVADO en v2.0.0)
- **Registro Directo**: Usuarios se registran por su cuenta en el sistema
- **Activación por Admin**: Administradores activan usuarios registrados
- **Control de Roles**: Asignación y cambio de roles por administradores
- **Activación Rápida**: Botones para promover usuarios pendientes
- **Flujo Ultra-Simple**: Registro → Activación → Acceso (solo 3 pasos)
- **Sin Dependencias**: No requiere configuración de email ni SMTP
- **Mayor Confiabilidad**: Eliminación completa de sistemas de invitación complejos

### 📊 **Dashboard Optimizado** (RENOVADO en v1.6.0)
- **Layout 100% Ancho**: Aprovechamiento total del espacio horizontal disponible
- **Métricas en Tiempo Real**: Dashboard completamente reescrito con datos precisos
- **Vista Unificada**: Uso exclusivo de `case_control_detailed` para consistencia
- **Performance Mejorada**: Consultas optimizadas y carga más rápida

### 🔐 **Seguridad y Autenticación**
- **Autenticación segura** con Supabase Auth
- **Sistema de roles y permisos** granular
- **RLS (Row Level Security)** implementado
- **Validaciones en tiempo real**

### 🎨 **Experiencia de Usuario**
- **Dashboard** con métricas y estadísticas
- **Modo oscuro/claro**
- **Diseño responsivo**
- **Notificaciones optimizadas** (sin duplicados)
- **Performance optimizada** con React Query

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: TanStack Query + Zustand
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **Routing**: React Router DOM
- **Iconos**: Heroicons
- **Notificaciones**: React Hot Toast

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd case-management-react
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Configura Supabase**
   - Ejecuta las migraciones en `supabase/migrations/001_initial.sql`
   - Configura la autenticación en tu proyecto de Supabase

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── CaseForm.tsx        # Formulario de casos
│   ├── CaseControlDetailsModal.tsx  # Modal de detalles de control
│   ├── CaseAssignmentModal.tsx      # Modal de asignación de casos
│   ├── TimerControl.tsx    # Control de timer
│   ├── Layout.tsx          # Layout principal
│   └── ThemeToggle.tsx     # Toggle de tema
├── pages/                  # Páginas principales
│   ├── Dashboard.tsx       # Panel principal
│   ├── Cases.tsx           # Lista de casos
│   ├── NewCase.tsx         # Crear/editar caso
│   ├── CaseControl.tsx     # Control de casos
│   ├── TodosPage.tsx       # Gestión de TODOs (NUEVO)
│   └── admin/              # Páginas de administración
├── hooks/                  # Hooks personalizados
│   ├── useCases.ts         # Gestión de casos
│   ├── useCaseControl.ts   # Control de casos
│   ├── useTodos.ts         # Gestión de TODOs (NUEVO)
│   ├── useTodoControl.ts   # Control de TODOs (NUEVO)
│   ├── useTimerCounter.ts  # Contador de timer
│   └── useAuth.ts          # Autenticación
├── lib/                    # Configuraciones
│   ├── supabase.ts         # Cliente de Supabase
│   └── validations.ts      # Esquemas de validación
├── stores/                 # Estado global
│   └── themeStore.ts       # Estado del tema
├── types/                  # Tipos TypeScript
│   └── index.ts            # Tipos principales (actualizado)
├── utils/                  # Utilidades
│   ├── caseUtils.ts        # Utilidades de casos
│   └── exportUtils.ts      # Exportación de reportes (mejorado)
└── components/             # Componentes reutilizables
```

## 🎯 Funcionalidades Principales

### 📊 Sistema de Reportes Avanzado

El sistema incluye **reportes especializados** para ambos módulos:

#### **Reportes de Control de Casos:**
- **Datos por Caso y Día**: Agrupación inteligente de tiempo trabajado
- **Tiempo Automático y Manual**: Registro completo de actividades
- **Información Contextual**: Usuario, estado, aplicación, fechas
- **Formato Excel**: Exportación con columnas optimizadas

#### **Reportes de TODOs:**
- **Análisis de Eficiencia**: Comparación tiempo estimado vs real
- **Estado de Cumplimiento**: Clasificación automática del rendimiento
- **Métricas por Prioridad**: Análisis ordenado por importancia
- **Gestión de Etiquetas**: Categorización y organización
- **Formato Especializado**: Columnas específicas para gestión de tareas

#### **Características Comunes:**
- **Respeto de Permisos**: Acceso controlado según roles
- **Generación Automática**: Un clic para obtener reportes completos
- **Formato Profesional**: Excel con anchos de columna optimizados
- **Ordenamiento Inteligente**: Datos organizados por relevancia

### 🎯 Gestión de TODOs Completa

El sistema incluye un **módulo completo de gestión de tareas**:

#### **Funcionalidades de TODOs:**
- **Crear y Gestionar**: CRUD completo de tareas
- **Prioridades**: Sistema de niveles (Alta, Media, Baja)
- **Estimación de Tiempo**: Planificación de tareas
- **Control de Tiempo**: Timer integrado y registro manual
- **Estados**: Seguimiento del progreso de tareas
- **Asignación**: Distribución de tareas entre usuarios
- **Etiquetas**: Categorización flexible
- **Fechas de Vencimiento**: Control de plazos

#### **Métricas y Análisis:**
- **Eficiencia**: Porcentaje de cumplimiento temporal
- **Cumplimiento**: Estado automático basado en tiempos
- **Reportes Detallados**: Análisis completo en Excel
- **Dashboard**: Métricas en tiempo real

### Gestión de Usuarios Simplificada

El sistema incluye un **flujo directo de registro y activación**:

#### **Para Usuarios:**
- **Registro Directo**: Creación de cuenta con email y contraseña
- **Acceso Condicional**: Acceso al sistema solo después de activación por admin
- **Roles Asignados**: Permisos definidos por el administrador

#### **Para Administradores:**
- **Panel de Gestión**: Vista completa de usuarios registrados
- **Activación Simple**: Botones de activación rápida por rol
- **Control Total**: Edición de datos, roles y estados
- **Sin Complicaciones**: No requiere configuración de email

#### **Flujo de Usuario:**
```
Usuario se Registra → Admin Activa → Usuario Accede
```

### Clasificación de Casos

El sistema clasifica automáticamente los casos basándose en 5 criterios:

1. **Historial del caso** (1-3 puntos)
2. **Conocimiento del módulo** (1-3 puntos)
3. **Manipulación de datos** (1-3 puntos)
4. **Claridad de la descripción** (1-3 puntos)
5. **Causa del fallo** (1-3 puntos)

**Clasificación final:**
- **Baja Complejidad**: 5-5 puntos
- **Media Complejidad**: 6-11 puntos
- **Alta Complejidad**: 12-15 puntos

### Dashboard

- Resumen de estadísticas
- Casos recientes
- Acciones rápidas
- Métricas por complejidad

### Gestión de Casos

- Crear nuevos casos
- Editar casos existentes
- Filtrar por fecha, clasificación
- Búsqueda en tiempo real
- Exportar a Excel

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint
```

## 🌐 Configuración de Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén tu URL y clave anónima

### 2. Ejecutar Migraciones
Ejecuta el SQL en `supabase/migrations/001_initial.sql` en el SQL Editor de Supabase.

### 3. Configurar Autenticación
- Habilita el proveedor de email en Authentication > Settings
- Configura las URLs de redirección si es necesario

## 🎨 Personalización

### Colores
Los colores se pueden personalizar en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      // Colores de complejidad personalizables
    },
  },
}
```

### Tema Oscuro
El tema oscuro se maneja automáticamente con Tailwind CSS y Zustand.

## 📊 Características Técnicas

### 🔧 Tecnologías Principales
- **Validación**: Esquemas Zod para validación robusta
- **Estado**: React Query para datos del servidor, Zustand para estado local
- **Tipos**: TypeScript estricto con tipos personalizados
- **Performance**: Lazy loading, memoización, optimizaciones de bundle
- **Accesibilidad**: Componentes accesibles con ARIA labels
- **SEO**: Meta tags y estructura semántica

### 📊 Sistema de Reportes
- **Exportación Excel**: Generación automática con XLSX
- **Filtrado de Datos**: Respeto de permisos de usuario
- **Formato Optimizado**: Anchos de columna y ordenamiento inteligente
- **Múltiples Módulos**: Reportes para Casos y TODOs
- **Métricas Avanzadas**: Análisis de tiempo y eficiencia

### 🎯 Gestión de Permisos
- **Control Granular**: Permisos específicos por funcionalidad
- **Seguridad RLS**: Row Level Security en Supabase
- **Roles Dinámicos**: Asignación flexible de permisos
- **Consistencia**: Mismo sistema para todos los módulos

## 🆕 Novedades Recientes

### 🎉 **Versión 2.7.5 - Sincronización y Modales Mejorados**
- **🔄 Sincronización Cross-Módulo**: Invalidación automática de queries entre módulos
- **🗂️ Modales Perfeccionados**: Solucionados problemas de z-index y transparencia
- **🎨 Portal DOM**: Renderizado mejorado para evitar conflictos visuales
- **⚡ UX Optimizada**: Bloqueo de scroll y efectos visuales mejorados

### 🎉 **Versión 2.7.4 - Sistema de Archivo Completo**
- **🔄 Recarga Automática**: Casos archivados desaparecen automáticamente de Control de Casos
- **📱 UX Mejorada**: Sincronización automática después de operaciones de archivado
- **⚡ Páginas Sincronizadas**: TODOs, Control de Casos y Archivo completamente coordinados

### 🎉 **Versión 2.7.0-2.7.3 - Módulo de Archivo**
- **🗄️ Sistema Integral**: Archivado y gestión completa de casos y TODOs terminados
- **🔄 Restauración Completa**: Mantiene historial de tiempos al restaurar elementos
- **🗑️ Eliminación Permanente**: Solo administradores con confirmación y auditoría
- **📊 Estadísticas**: Métricas detalladas con contadores y datos mensuales

### 🎉 **Versión 2.6.0 - Dashboard Mejorado**
- **📊 Métricas Combinadas**: Tiempo total que suma casos y TODOs
- **📈 Métricas Específicas**: Tiempo separado por casos y TODOs
- **🎯 Visualización Optimizada**: Eliminación de métricas redundantes
- **🔄 Análisis Integral**: Vista unificada del trabajo realizado

### 🎉 **Versión 2.5.0 - Sistema de Reportes TODO**
- **📊 Reportes Completos**: Generación de reportes Excel para TODOs con métricas avanzadas
- **📈 Análisis de Eficiencia**: Comparación tiempo estimado vs tiempo real
- **🎯 Estado de Cumplimiento**: Clasificación automática del rendimiento
- **🔐 Permisos Respetados**: Mismo sistema de seguridad que Control de Casos

### 🎉 **Versión 2.4.0 - Menú Colapsable**
- **📱 Sidebar Responsive**: Menú lateral colapsable con logo como toggle
- **🎯 UX Mejorada**: Transiciones suaves y tooltips informativos
- **📐 Iconos Optimizados**: Mejor visibilidad en modo colapsado
- **🔧 Navegación Corregida**: Enlaces de configuración funcionales

### 🎉 **Versión 2.3.0 - Módulo de TODOs**
- **📋 Gestión Completa**: CRUD de tareas con prioridades y etiquetas
- **⏱️ Control de Tiempo**: Timer integrado y registro manual
- **🎯 Estimación**: Planificación y seguimiento de tiempos
- **📊 Dashboard**: Métricas y estadísticas en tiempo real

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Sube la carpeta dist/
```

### Variables de Entorno en Producción
Asegúrate de configurar:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles específicos

---

**¡Hecho con ❤️ para la gestión eficiente de casos!**
