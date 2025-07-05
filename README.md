# 🚀 Sistema de Gestión de Casos - React v1.6.0

Una aplicación moderna para la gestión integral de casos con control de tiempo, basada en React, TypeScript y Supabase.

## ✨ Características Principales

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
│   ├── CaseControl.tsx     # Control de casos (NUEVO)
│   └── admin/              # Páginas de administración
├── hooks/                  # Hooks personalizados
│   ├── useCases.ts         # Gestión de casos
│   ├── useCaseControl.ts   # Control de casos (NUEVO)
│   ├── useTimerCounter.ts  # Contador de timer (NUEVO)
│   └── useAuth.ts          # Autenticación
├── lib/                    # Configuraciones
│   ├── supabase.ts         # Cliente de Supabase
│   └── validations.ts  # Esquemas de validación
├── stores/             # Estado global
│   └── themeStore.ts   # Estado del tema
├── types/              # Tipos TypeScript
│   └── index.ts        # Tipos principales
├── utils/              # Utilidades
│   └── caseUtils.ts    # Utilidades de casos
└── hooks/              # Custom hooks
```

## 🎯 Funcionalidades Principales

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

- **Validación**: Esquemas Zod para validación robusta
- **Estado**: React Query para datos del servidor, Zustand para estado local
- **Tipos**: TypeScript estricto con tipos personalizados
- **Performance**: Lazy loading, memoización, optimizaciones de bundle
- **Accesibilidad**: Componentes accesibles con ARIA labels
- **SEO**: Meta tags y estructura semántica

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
