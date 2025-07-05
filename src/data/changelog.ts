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
        type: "improvement",
        description: "📋 Interfaz unificada de configuración con pestañas mejoradas"
      },
      {
        type: "improvement",
        description: "🎯 Tabla parametrizable agregada al módulo de configuración"
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
