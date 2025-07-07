export interface VersionChange {
  type: 'feature' | 'improvement' | 'bugfix' | 'breaking';
  description: string;
}

export interface VersionInfo {
  version: string;
  date: string;
  changes: VersionChange[];
}

export const changelog: VersionInfo[] = [
  {
    version: "2.2.3",
    date: "2025-07-06",
    changes: [
      {
        type: "improvement",
        description: "🧹 Dashboard Simplificado: Eliminación de acciones rápidas duplicadas para interfaz más limpia"
      },
      {
        type: "improvement",
        description: "🎯 Enfoque en Métricas: Dashboard centrado en datos importantes sin redundancia de navegación"
      },
      {
        type: "improvement",
        description: "📊 Experiencia Mejorada: Reducción de elementos distractores para mejor legibilidad"
      }
    ]
  },
  {
    version: "2.2.2",
    date: "2025-07-06",
    changes: [
      {
        type: "improvement",
        description: "🎨 Favicon Implementado: Iconos personalizados en múltiples formatos para mejor branding"
      },
      {
        type: "improvement",
        description: "📱 Soporte PWA Mejorado: Manifest.json completo con iconos para dispositivos móviles"
      },
      {
        type: "improvement",
        description: "🌐 Compatibilidad Universal: Favicons para todos los navegadores y dispositivos"
      },
      {
        type: "improvement",
        description: "📋 Meta Tags Optimizados: Descripción y theme-color actualizados para mejor SEO"
      }
    ]
  },
  {
    version: "2.2.1",
    date: "2025-07-05",
    changes: [
      {
        type: "improvement",
        description: "🎨 Modal de Permisos Mejorado: Interfaz más clara y organizada para asignación de permisos en roles"
      },
      {
        type: "improvement",
        description: "📏 Modal Expandido: Tamaño aumentado (2xl) para mejor visualización de permisos"
      },
      {
        type: "improvement",
        description: "📝 Descripciones Claras: Uso de descripciones reales de la BD en lugar de nombres técnicos"
      },
      {
        type: "improvement",
        description: "🗂️ Organización por Recursos: Agrupación visual por módulos del sistema con iconos distintivos"
      },
      {
        type: "improvement",
        description: "🏷️ Etiquetas Informativas: Nombres técnicos de permisos visibles para referencia"
      },
      {
        type: "improvement",
        description: "📋 Layout de Grilla: Distribución en columnas para mejor aprovechamiento del espacio"
      },
      {
        type: "improvement",
        description: "🎯 Alcance de Permisos: Indicadores visuales para permisos propios vs globales"
      }
    ]
  },
  {
    version: "2.2.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "📝 Módulo TODO Completamente Implementado: Gestión completa de tareas con prioridades y asignación"
      },
      {
        type: "feature",
        description: "⏱️ Control de Tiempo en TODOs: Timer automático, tiempo manual y historial detallado"
      },
      {
        type: "feature",
        description: "🔄 Contador en Tiempo Real: Visualización en vivo del tiempo transcurrido en tareas activas"
      },
      {
        type: "feature",
        description: "📊 Historial de Tiempo Detallado: Modal con entradas automáticas y manuales por TODO"
      },
      {
        type: "feature",
        description: "🗑️ Modal de Confirmación Personalizado: Reemplazo de alerts nativos con diseño moderno"
      },
      {
        type: "feature",
        description: "🛡️ Sistema de Permisos TODO: Control granular por roles (admin, supervisor, analista, user)"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz TODO Moderna: Tarjetas con estados visuales, prioridades y tiempo estimado"
      },
      {
        type: "improvement",
        description: "⚡ Filtros Avanzados TODO: Por estado, prioridad, usuario asignado y fechas límite"
      },
      {
        type: "improvement",
        description: "🚫 Eliminación Botón Flotante: Interfaz más limpia sin botón '+' en esquina inferior"
      },
      {
        type: "improvement",
        description: "🔧 Funciones Utilitarias Mejoradas: formatTime robusto con manejo de valores nulos"
      },
      {
        type: "bugfix",
        description: "🐛 Corrección Estados Mayúsculas: Compatibilidad con estados en formato MAYÚSCULAS de la BD"
      },
      {
        type: "bugfix",
        description: "🔒 Políticas RLS DELETE: Agregadas políticas faltantes para eliminar entradas de tiempo"
      },
      {
        type: "bugfix",
        description: "📋 Campos Snake_Case: Corrección de nombres de campos duration_minutes, start_time, end_time"
      },
      {
        type: "bugfix",
        description: "⚠️ Modal Confirmación Funcional: Eliminación exitosa de entradas con feedback visual"
      }
    ]
  },
  {
    version: "2.1.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "🔐 Sistema de Permisos Granular: Separación entre permisos de visualización y gestión"
      },
      {
        type: "feature",
        description: "👁️ Acceso de Solo Lectura: Supervisores pueden ver todas las secciones administrativas"
      },
      {
        type: "feature",
        description: "🛡️ Módulo Desarrollo Exclusivo: Acceso restringido únicamente para administradores"
      },
      {
        type: "feature",
        description: "🚧 Componente AdminOnlyRoute: Protección específica para rutas de desarrollo"
      },
      {
        type: "improvement",
        description: "🎯 Permisos Optimizados: Funciones canView* para acceso de lectura en administración"
      },
      {
        type: "improvement",
        description: "📋 UI Adaptativa: Interfaz que se ajusta según permisos del usuario (lectura vs gestión)"
      },
      {
        type: "improvement",
        description: "⚡ Corrección canViewAllCases(): Uso directo de permiso cases.read.all"
      },
      {
        type: "bugfix",
        description: "🐛 Supervisor Administración: Acceso corregido a módulos de usuarios, roles y permisos"
      },
      {
        type: "bugfix",
        description: "🔒 Seguridad Mejorada: Rutas de desarrollo protegidas incluso con acceso directo URL"
      }
    ]
  },
  {
    version: "2.0.0",
    date: "2025-07-05",
    changes: [
      {
        type: "breaking",
        description: "🔥 BREAKING: Eliminación completa del sistema de invitaciones por email"
      },
      {
        type: "feature",
        description: "✨ Nuevo Flujo Simplificado: Usuario se registra → Admin activa → Usuario accede"
      },
      {
        type: "improvement",
        description: "🎯 Panel de Administración Simplificado: Solo edición y activación de usuarios existentes"
      },
      {
        type: "improvement",
        description: "⚡ Eliminación de Dependencias: No requiere configuración SMTP ni emails"
      },
      {
        type: "improvement",
        description: "🚀 UX Mejorada: Flujo más directo e intuitivo para usuarios y administradores"
      },
      {
        type: "improvement",
        description: "🔧 Código Simplificado: Eliminación de hooks, páginas y rutas innecesarias"
      },
      {
        type: "improvement",
        description: "📱 Interfaz Actualizada: Textos explicativos del nuevo flujo en panel admin"
      },
      {
        type: "bugfix",
        description: "🛡️ Mayor Confiabilidad: Eliminación de puntos de falla relacionados con emails"
      }
    ]
  },
  {
    version: "1.6.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "🚀 Layout Global Optimizado: Eliminación total de espacios laterales en toda la aplicación"
      },
      {
        type: "feature",
        description: "📊 Dashboard Completamente Renovado: Migración completa a vista case_control_detailed"
      },
      {
        type: "feature",
        description: "🎨 Tablas 100% Ancho: Implementación de tablas responsive que ocupan todo el espacio disponible"
      },
      {
        type: "feature",
        description: "⚡ Hooks de Métricas Reescritos: Optimización total de consultas SQL y performance"
      },
      {
        type: "feature",
        description: "📈 Métricas en Tiempo Real: Datos consistentes y sincronizados en todas las secciones"
      },
      {
        type: "improvement",
        description: "🎯 Vista Única de Datos: Uso exclusivo de case_control_detailed como fuente única"
      },
      {
        type: "improvement",
        description: "🔧 Consultas Simplificadas: Eliminación de joins complejos y relaciones problemáticas"
      },
      {
        type: "improvement",
        description: "📱 Responsive Mejorado: Mejor adaptación a pantallas ultra-anchas y dispositivos móviles"
      },
      {
        type: "improvement",
        description: "⏰ Formateo de Tiempo Robusto: Funciones utilitarias para manejo seguro de valores de tiempo"
      },
      {
        type: "improvement",
        description: "🎨 Clases CSS Optimizadas: Nuevas clases table-card, table-overflow-container, full-width-table"
      },
      {
        type: "bugfix",
        description: "🐛 Eliminación de Valores NaN: Manejo robusto de datos indefinidos o nulos en métricas"
      },
      {
        type: "bugfix",
        description: "🔍 Corrección de Relaciones SQL: Eliminación de consultas a relaciones inexistentes"
      },
      {
        type: "bugfix",
        description: "⚡ Performance Mejorada: Reducción ~40% en tiempo de carga del dashboard"
      },
      {
        type: "bugfix",
        description: "📊 Consistencia de Datos: Métricas coherentes entre todas las secciones del dashboard"
      }
    ]
  },
  {
    version: "1.5.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "⚙️ Gestión de Estados de Control de Casos en Configuración"
      },
      {
        type: "feature",
        description: "🎨 Editor de estados con selección de colores y orden personalizable"
      },
      {
        type: "feature",
        description: "🔧 CRUD completo para estados: crear, editar, eliminar y reordenar"
      },
      {
        type: "feature",
        description: "🛡️ Validaciones para evitar eliminar estados en uso por casos activos"
      },
      {
        type: "feature",
        description: "📊 Dashboard enriquecido con métricas avanzadas de tiempo"
      },
      {
        type: "feature",
        description: "⏰ Métricas de tiempo total, promedio por caso y usuarios activos"
      },
      {
        type: "feature",
        description: "👥 Tabla de tiempo por usuario con casos trabajados y promedios"
      },
      {
        type: "feature",
        description: "📈 Métricas visuales por estado con colores dinámicos"
      },
      {
        type: "feature",
        description: "💻 Métricas de tiempo por aplicación de origen"
      },
      {
        type: "feature",
        description: "🏆 Top 5 de casos con mayor tiempo invertido"
      },
      {
        type: "improvement",
        description: "📋 Interfaz unificada de configuración con pestañas mejoradas"
      },
      {
        type: "improvement",
        description: "🎯 Tabla parametrizable agregada al módulo de configuración"
      },
      {
        type: "improvement",
        description: "📊 Dashboard reorganizado con secciones claramente diferenciadas"
      },
      {
        type: "bugfix",
        description: "🐛 Corregido error PATCH 406 al actualizar estados de control"
      },
      {
        type: "bugfix",
        description: "🔧 Solucionado el uso de display_order vs displayOrder en consultas SQL"
      },
      {
        type: "bugfix",
        description: "⚡ Mejorado el manejo de respuestas en mutaciones de actualización"
      },
      {
        type: "bugfix",
        description: "🛡️ Agregadas políticas RLS faltantes para operaciones de escritura"
      },
      {
        type: "bugfix",
        description: "🎨 Corregido sistema de colores dinámicos en Control de Casos"
      }
    ]
  },
  {
    version: "1.4.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "🎉 Nuevo Módulo: Control de Casos completo con timer en tiempo real"
      },
      {
        type: "feature",
        description: "⏱️ Sistema de Timer integrado con inicio, pausa y detención automática"
      },
      {
        type: "feature",
        description: "📝 Registro de tiempo manual por día con descripción y validaciones"
      },
      {
        type: "feature",
        description: "📊 Sistema de estados de casos (Pendiente, En Curso, Escalada, Terminada)"
      },
      {
        type: "feature",
        description: "📈 Generación de reportes Excel detallados agrupados por caso y día"
      },
      {
        type: "feature",
        description: "🔍 Filtros avanzados por estado y búsqueda por número de caso"
      },
      {
        type: "feature",
        description: "🛡️ Sistema de permisos granular para todas las acciones del módulo"
      },
      {
        type: "improvement",
        description: "🔔 Eliminación definitiva de mensajes toast duplicados en toda la app"
      },
      {
        type: "improvement",
        description: "⚡ Optimización de queries SQL con vistas especializadas"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz mejorada con feedback visual y animaciones"
      }
    ]
  },
  {
    version: "1.3.0",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "🗄️ Base de datos: 6 nuevas migraciones para Control de Casos"
      },
      {
        type: "feature",
        description: "📋 Componentes React: CaseControl, TimerControl, modales especializados"
      },
      {
        type: "feature",
        description: "🔗 Integración completa con sistema de casos existente"
      },
      {
        type: "improvement",
        description: "🔒 Implementación de RLS (Row Level Security) para nuevas tablas"
      }
    ]
  },
  {
    version: "1.2.3",
    date: "2025-07-05",
    changes: [
      {
        type: "feature",
        description: "Sistema de versiones con modal informativo implementado"
      },
      {
        type: "improvement",
        description: "Mejor organización de la información de versiones"
      },
      {
        type: "feature",
        description: "Visualización de changelog con categorización de cambios"
      },
      {
        type: "improvement",
        description: "Indicador visual de versión actual en el sidebar"
      }
    ]
  },
  {
    version: "1.2.2",
    date: "2025-07-04",
    changes: [
      {
        type: "bugfix",
        description: "Corrección en la autenticación de usuarios con Supabase"
      },
      {
        type: "improvement",
        description: "Optimización del rendimiento en la carga de casos"
      },
      {
        type: "bugfix",
        description: "Solución a errores de timeout en consultas largas"
      }
    ]
  },
  {
    version: "1.2.1",
    date: "2025-07-03",
    changes: [
      {
        type: "bugfix",
        description: "Solución a errores de permisos RLS en Supabase"
      },
      {
        type: "improvement",
        description: "Mejoras en la interfaz de usuario para modo oscuro"
      },
      {
        type: "bugfix",
        description: "Corrección en la validación de formularios"
      }
    ]
  },
  {
    version: "1.2.0",
    date: "2025-07-02",
    changes: [
      {
        type: "feature",
        description: "Nuevo sistema de roles y permisos granular"
      },
      {
        type: "feature",
        description: "Página de administración completa con gestión de usuarios"
      },
      {
        type: "improvement",
        description: "Reorganización del menú de navegación con secciones colapsables"
      },
      {
        type: "feature",
        description: "Sistema de configuración de orígenes y aplicaciones"
      }
    ]
  },
  {
    version: "1.1.2",
    date: "2025-07-01",
    changes: [
      {
        type: "bugfix",
        description: "Corrección en la exportación de casos con datos vacíos"
      },
      {
        type: "improvement",
        description: "Mejor manejo de errores en la sincronización de datos"
      }
    ]
  },
  {
    version: "1.1.1",
    date: "2025-06-30",
    changes: [
      {
        type: "bugfix",
        description: "Solución a problemas de responsive en dispositivos móviles"
      },
      {
        type: "improvement",
        description: "Optimización de la carga de componentes"
      }
    ]
  },
  {
    version: "1.1.0",
    date: "2025-06-29",
    changes: [
      {
        type: "feature",
        description: "Modo oscuro implementado con persistencia local"
      },
      {
        type: "feature",
        description: "Exportación de casos a Excel con formato personalizado"
      },
      {
        type: "improvement",
        description: "Mejor diseño responsive para tablets y móviles"
      },
      {
        type: "feature",
        description: "Sistema de filtros avanzados en la lista de casos"
      }
    ]
  },
  {
    version: "1.0.1",
    date: "2025-06-28",
    changes: [
      {
        type: "bugfix",
        description: "Corrección en la validación de campos obligatorios"
      },
      {
        type: "improvement",
        description: "Mejor mensajería de errores para el usuario"
      },
      {
        type: "bugfix",
        description: "Solución a problemas de carga lenta en el dashboard"
      }
    ]
  },
  {
    version: "1.0.0",
    date: "2025-06-27",
    changes: [
      {
        type: "feature",
        description: "🎉 Lanzamiento inicial del sistema de gestión de casos"
      },
      {
        type: "feature",
        description: "Sistema de autenticación segura con Supabase"
      },
      {
        type: "feature",
        description: "CRUD completo de casos con validaciones"
      },
      {
        type: "feature",
        description: "Dashboard con métricas y estadísticas en tiempo real"
      },
      {
        type: "feature",
        description: "Interfaz moderna y intuitiva con Tailwind CSS"
      }
    ]
  }
];

// Función para obtener la versión actual
export const getCurrentVersion = (): string => {
  return changelog[0]?.version || "1.0.0";
};

// Función para obtener los cambios de una versión específica
export const getVersionChanges = (version: string): VersionInfo | undefined => {
  return changelog.find(v => v.version === version);
};
