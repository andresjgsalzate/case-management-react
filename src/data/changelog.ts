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
