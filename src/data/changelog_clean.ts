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
    version: "2.7.8",
    date: "2025-01-08",
    changes: [
      {
        type: "feature",
        description: "✨ Tarjeta de Vista Previa en Formulario de Caso: Agregada tarjeta interactiva que muestra en tiempo real la puntuación y clasificación de complejidad mientras se seleccionan los criterios"
      },
      {
        type: "improvement",
        description: "📊 Visualización de Desglose de Puntuación: La tarjeta incluye una barra de progreso visual y el desglose detallado de cada criterio de calificación"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz Mejorada: Diseño elegante con gradientes y colores dinámicos que cambian según la clasificación de complejidad"
      },
      {
        type: "improvement",
        description: "📱 Layout Optimizado: La tarjeta de vista previa es compacta y se ubica al lado derecho del campo 'Causa del fallo' en pantallas grandes, apilándose verticalmente en móviles"
      },
      {
        type: "improvement",
        description: "🎯 Diseño Refinado: Tarjeta optimizada para el espacio disponible con elementos visuales simplificados y mejor responsividad"
      },
      {
        type: "improvement",
        description: "⏰ Visualización de Tiempo Mejorada: Los tiempos en modales de detalle ahora se muestran como '9h 58m' en lugar de '09:58' para mayor claridad"
      },
      {
        type: "improvement",
        description: "🧹 Limpieza de Código: Eliminados todos los console.log innecesarios de desarrollo para optimizar el rendimiento"
      },
      {
        type: "improvement",
        description: "🔄 Sincronización Cross-Módulo Mejorada: Corregida invalidación de queries para sincronización automática entre módulos al archivar, restaurar o eliminar"
      }
    ]
  },
  {
    version: "2.7.3",
    date: "2025-01-07",
    changes: [
      {
        type: "feature",
        description: "🗑️ Eliminación Permanente: Los administradores ahora pueden eliminar permanentemente casos y TODOs desde el archivo"
      },
      {
        type: "feature",
        description: "📋 Modal de Confirmación: Implementado modal de confirmación estándar para eliminación permanente con mensaje claro de advertencia"
      },
      {
        type: "improvement",
        description: "🛡️ Seguridad Reforzada: Solo administradores pueden eliminar permanentemente, con validación en backend y frontend"
      },
      {
        type: "improvement",
        description: "📊 Log de Eliminaciones: Registro automático de todas las eliminaciones permanentes con fecha, usuario y razón"
      }
    ]
  },
  {
    version: "2.7.2",
    date: "2025-01-07",
    changes: [
      {
        type: "bugfix",
        description: "🔄 Restauración Completa: Los casos y TODOs restaurados ahora recrean los registros originales en estado 'pendiente' para poder trabajarse nuevamente"
      },
      {
        type: "bugfix", 
        description: "🗃️ Archivado Verificado: Confirmado que el archivado elimina correctamente los registros originales de casos y control"
      },
      {
        type: "improvement",
        description: "⚡ Flujo Optimizado: Restaurar → Estado Pendiente → Listo para trabajar, eliminando pasos manuales adicionales"
      }
    ]
  },
  {
    version: "2.7.1",
    date: "2025-01-07", 
    changes: [
      {
        type: "bugfix",
        description: "🔐 Corrección de Permisos de Archivo: Los analistas ahora pueden restaurar sus propios casos y TODOs archivados"
      },
      {
        type: "improvement",
        description: "📊 Aplicación de RLS: Implementado Row Level Security en las funciones de restauración para mayor seguridad"
      },
      {
        type: "improvement",
        description: "🔧 Funciones Mejoradas: Optimizadas las funciones SQL para un mejor rendimiento en operaciones de archivo"
      }
    ]
  },
  {
    version: "2.7.0",
    date: "2025-01-07",
    changes: [
      {
        type: "feature",
        description: "🗃️ Sistema de Archivo Completo: Implementado módulo completo de archivo con funcionalidad de archivar y restaurar casos y TODOs"
      },
      {
        type: "feature",
        description: "📋 Gestión de Archivo: Interfaz dedicada para visualizar, filtrar y gestionar elementos archivados"
      },
      {
        type: "feature",
        description: "🔄 Restauración Inteligente: Capacidad de restaurar casos y TODOs archivados a su estado funcional original"
      },
      {
        type: "improvement",
        description: "🛡️ Seguridad por Roles: Solo administradores pueden acceder al módulo de archivo completo"
      },
      {
        type: "improvement",
        description: "📊 Métricas de Archivo: Estadísticas y contadores de elementos archivados en el dashboard"
      }
    ]
  },
  {
    version: "2.6.9",
    date: "2025-01-06",
    changes: [
      {
        type: "feature",
        description: "🗂️ Funcionalidad de Archivado: Implementada capacidad de archivar casos completados desde Control de Casos"
      },
      {
        type: "feature",
        description: "📁 Modal de Archivo: Nuevo modal para confirmar archivado con selección de motivo"
      },
      {
        type: "improvement",
        description: "⏱️ Preservación de Tiempo: El tiempo trabajado se mantiene al archivar un caso"
      },
      {
        type: "improvement",
        description: "🔄 Actualización Automática: La lista se actualiza automáticamente después de archivar"
      }
    ]
  },
  {
    version: "2.6.8",
    date: "2025-01-06",
    changes: [
      {
        type: "improvement",
        description: "⏱️ Persistencia de Timer: Los timers ahora se mantienen activos entre recargas de página y navegación"
      },
      {
        type: "improvement",
        description: "🔄 Recuperación Automática: Los timers se restauran automáticamente al volver a la aplicación"
      },
      {
        type: "improvement",
        description: "📊 Estado Sincronizado: El estado del timer se sincroniza correctamente entre todos los componentes"
      },
      {
        type: "bugfix",
        description: "🐛 Corrección de Timer: Solucionado problema donde los timers se reiniciaban al cambiar de página"
      }
    ]
  },
  {
    version: "2.6.7",
    date: "2025-01-06",
    changes: [
      {
        type: "improvement",
        description: "🎨 Mejoras Visuales en Control de Casos: Mejor organización visual y espaciado en las tarjetas"
      },
      {
        type: "improvement",
        description: "⏱️ Timer Mejorado: Mejor visualización del tiempo transcurrido con formato más claro"
      },
      {
        type: "improvement",
        description: "📱 Responsividad: Mejor adaptación a diferentes tamaños de pantalla"
      },
      {
        type: "improvement",
        description: "🎯 UX Optimizada: Botones y controles más intuitivos y accesibles"
      }
    ]
  },
  {
    version: "2.6.6",
    date: "2025-01-06",
    changes: [
      {
        type: "feature",
        description: "⏱️ Control de Tiempo por Caso: Implementado sistema de timer individual para cada caso en Control de Casos"
      },
      {
        type: "feature",
        description: "▶️ Timer Interactivo: Botones de play/pause para controlar el tiempo de trabajo en cada caso"
      },
      {
        type: "improvement",
        description: "📊 Visualización de Tiempo: Tiempo transcurrido visible en tiempo real en cada tarjeta de caso"
      },
      {
        type: "improvement",
        description: "💾 Persistencia: El tiempo trabajado se guarda automáticamente en la base de datos"
      }
    ]
  },
  {
    version: "2.6.5",
    date: "2025-01-06",
    changes: [
      {
        type: "feature",
        description: "📋 Control de Casos: Nuevo módulo para gestionar casos asignados al usuario actual"
      },
      {
        type: "feature",
        description: "👤 Casos Personales: Vista filtrada que muestra solo los casos asignados al usuario logueado"
      },
      {
        type: "improvement",
        description: "🎯 UX Mejorada: Interfaz dedicada para el trabajo diario del analista"
      },
      {
        type: "improvement",
        description: "📊 Estado Visual: Indicadores claros del estado de cada caso asignado"
      }
    ]
  },
  {
    version: "2.6.4",
    date: "2025-01-05",
    changes: [
      {
        type: "improvement",
        description: "🎨 Mejoras Visuales: Refinamientos en el diseño de tarjetas y espaciado general"
      },
      {
        type: "improvement",
        description: "📱 Responsividad Mejorada: Better adaptation to different screen sizes"
      },
      {
        type: "improvement",
        description: "🎯 UX Optimizada: Mejores indicadores visuales y feedback al usuario"
      }
    ]
  },
  {
    version: "2.6.3",
    date: "2025-01-05",
    changes: [
      {
        type: "improvement",
        description: "📊 Dashboard Mejorado: Nuevas métricas y visualizaciones para mejor comprensión de los datos"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz Refinada: Mejores colores y espaciado para una experiencia más profesional"
      },
      {
        type: "improvement",
        description: "⚡ Performance: Optimizaciones en las consultas y renderizado de componentes"
      }
    ]
  },
  {
    version: "2.6.2",
    date: "2025-01-05",
    changes: [
      {
        type: "improvement",
        description: "🔧 Configuración Mejorada: Mejor manejo de configuración inicial y validaciones"
      },
      {
        type: "improvement",
        description: "🛡️ Seguridad: Mejoras en el manejo de permisos y autenticación"
      },
      {
        type: "bugfix",
        description: "🐛 Correcciones: Varios bugs menores corregidos para mayor estabilidad"
      }
    ]
  },
  {
    version: "2.6.1",
    date: "2025-01-04",
    changes: [
      {
        type: "feature",
        description: "📊 Dashboard Avanzado: Nuevo dashboard con métricas comprehensivas y visualizaciones mejoradas"
      },
      {
        type: "feature",
        description: "📈 Métricas de TODOs: Estadísticas detalladas por prioridad, estado y usuario asignado"
      },
      {
        type: "feature",
        description: "📊 Análisis de Casos: Métricas de casos por complejidad, estado y tiempo de resolución"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz Renovada: Diseño moderno con mejor jerarquía visual y colores profesionales"
      }
    ]
  },
  {
    version: "2.6.0",
    date: "2025-01-04",
    changes: [
      {
        type: "feature",
        description: "🔐 Sistema de Permisos Granular: Implementado control de acceso basado en roles para cada funcionalidad"
      },
      {
        type: "feature",
        description: "👥 Gestión de Roles: Administradores pueden asignar roles específicos (admin, supervisor, analista)"
      },
      {
        type: "feature",
        description: "🛡️ Protección de Rutas: Acceso controlado a módulos según permisos del usuario"
      },
      {
        type: "improvement",
        description: "🔧 Configuración Automática: Setup inicial simplificado para nuevas instalaciones"
      }
    ]
  },
  {
    version: "2.5.8",
    date: "2025-01-03",
    changes: [
      {
        type: "improvement",
        description: "🎨 Mejoras Visuales: Refinamiento del diseño y mejor consistencia visual en toda la aplicación"
      },
      {
        type: "improvement",
        description: "📱 Responsividad: Mejor adaptación a dispositivos móviles y tablets"
      },
      {
        type: "improvement",
        description: "⚡ Performance: Optimizaciones en la carga y renderizado de componentes"
      }
    ]
  },
  {
    version: "2.5.7",
    date: "2025-01-03",
    changes: [
      {
        type: "feature",
        description: "👤 Gestión de Usuarios Completa: Implementado módulo completo para administrar usuarios del sistema"
      },
      {
        type: "feature",
        description: "✏️ Edición de Perfiles: Capacidad de editar información de usuarios incluyendo roles y permisos"
      },
      {
        type: "feature",
        description: "🔍 Búsqueda de Usuarios: Filtrado y búsqueda avanzada en la lista de usuarios"
      },
      {
        type: "improvement",
        description: "🛡️ Seguridad Mejorada: Validaciones adicionales para cambios en perfiles de usuario"
      }
    ]
  },
  {
    version: "2.5.6",
    date: "2025-01-02",
    changes: [
      {
        type: "feature",
        description: "🏷️ Sistema de Prioridades: Implementado sistema completo de gestión de prioridades para TODOs"
      },
      {
        type: "feature",
        description: "✏️ Edición de Prioridades: Administradores pueden crear, editar y eliminar niveles de prioridad"
      },
      {
        type: "feature",
        description: "🎨 Colores Personalizados: Cada prioridad tiene su color distintivo para mejor visualización"
      },
      {
        type: "improvement",
        description: "📊 Organización Mejorada: TODOs ahora se pueden organizar y filtrar por prioridad"
      }
    ]
  },
  {
    version: "2.5.5",
    date: "2025-01-02",
    changes: [
      {
        type: "feature",
        description: "📋 Gestión Completa de TODOs: Implementado sistema integral para crear, editar y gestionar tareas"
      },
      {
        type: "feature",
        description: "👤 Asignación de TODOs: Capacidad de asignar tareas a usuarios específicos del sistema"
      },
      {
        type: "feature",
        description: "📊 Estados de TODO: Sistema de estados (pendiente, en progreso, completado) para seguimiento"
      },
      {
        type: "improvement",
        description: "🎯 Interfaz Optimizada: Diseño intuitivo para gestión eficiente de tareas"
      }
    ]
  },
  {
    version: "2.5.4",
    date: "2025-01-01",
    changes: [
      {
        type: "improvement",
        description: "🎨 Refinamientos de UI: Mejoras en el diseño visual y experiencia de usuario"
      },
      {
        type: "improvement",
        description: "📱 Mejor Responsividad: Optimización para dispositivos móviles y tablets"
      },
      {
        type: "improvement",
        description: "⚡ Optimizaciones: Mejoras en rendimiento y tiempos de carga"
      }
    ]
  },
  {
    version: "2.5.3",
    date: "2024-12-31",
    changes: [
      {
        type: "feature",
        description: "🎯 Asignación de Casos: Implementada funcionalidad para asignar casos específicos a usuarios del sistema"
      },
      {
        type: "feature",
        description: "📊 Dashboard de Asignaciones: Vista consolidada de casos asignados por usuario"
      },
      {
        type: "improvement",
        description: "👥 Gestión de Workload: Mejor distribución y seguimiento de la carga de trabajo"
      },
      {
        type: "improvement",
        description: "🔔 Notificaciones: Sistema de notificaciones para nuevas asignaciones"
      }
    ]
  },
  {
    version: "2.5.2",
    date: "2024-12-30",
    changes: [
      {
        type: "improvement",
        description: "🎨 Mejoras Visuales: Refinamiento del diseño general y mejor consistencia visual"
      },
      {
        type: "improvement",
        description: "📊 Optimización de Formularios: Mejor experiencia en la creación y edición de casos"
      },
      {
        type: "bugfix",
        description: "🐛 Correcciones de Estabilidad: Varios bugs menores corregidos"
      }
    ]
  },
  {
    version: "2.5.1",
    date: "2024-12-29",
    changes: [
      {
        type: "feature",
        description: "🏢 Gestión de Orígenes/Destinos: Sistema completo para administrar orígenes y destinos de aplicaciones"
      },
      {
        type: "feature",
        description: "✏️ Edición Inline: Capacidad de editar orígenes/destinos directamente desde la lista"
      },
      {
        type: "improvement",
        description: "🔧 Admin Interface: Interface administrativa más intuitive para gestión de catálogos"
      }
    ]
  },
  {
    version: "2.5.0",
    date: "2024-12-28",
    changes: [
      {
        type: "feature",
        description: "📊 Sistema de Puntuación de Casos: Implementado algoritmo de scoring automático basado en criterios de complejidad"
      },
      {
        type: "feature",
        description: "🎯 Clasificación Automática: Los casos se clasifican automáticamente como Bajo, Medio, Alto o Crítico según su puntuación"
      },
      {
        type: "feature",
        description: "⚖️ Criterios Ponderados: Sistema de pesos para cada criterio de evaluación"
      },
      {
        type: "improvement",
        description: "📈 Métricas Mejoradas: Dashboard actualizado con análisis de complejidad de casos"
      }
    ]
  },
  {
    version: "2.4.3",
    date: "2024-12-27",
    changes: [
      {
        type: "improvement",
        description: "🎨 Mejoras de Interfaz: Refinamientos en el diseño y mejor experiencia de usuario"
      },
      {
        type: "improvement",
        description: "📊 Visualización de Datos: Mejores gráficos y representación de métricas"
      },
      {
        type: "improvement",
        description: "⚡ Performance: Optimizaciones en consultas y renderizado"
      }
    ]
  },
  {
    version: "2.4.2",
    date: "2024-12-26",
    changes: [
      {
        type: "feature",
        description: "🔍 Búsqueda Avanzada: Sistema de filtros mejorado con múltiples criterios de búsqueda"
      },
      {
        type: "feature",
        description: "📅 Filtros Temporales: Capacidad de filtrar casos por rangos de fechas"
      },
      {
        type: "improvement",
        description: "🎯 UX Mejorada: Interface más intuitiva para encontrar casos específicos"
      }
    ]
  },
  {
    version: "2.4.1",
    date: "2024-12-25",
    changes: [
      {
        type: "improvement",
        description: "🎨 Polish Visual: Mejoras en el diseño general y consistencia visual"
      },
      {
        type: "improvement",
        description: "📱 Mobile Optimization: Mejor experiencia en dispositivos móviles"
      },
      {
        type: "bugfix",
        description: "🐛 Bug Fixes: Corrección de varios problemas menores de estabilidad"
      }
    ]
  },
  {
    version: "2.4.0",
    date: "2024-12-24",
    changes: [
      {
        type: "feature",
        description: "📊 Dashboard Completo: Implementado dashboard comprehensivo con métricas clave del sistema"
      },
      {
        type: "feature",
        description: "📈 Métricas en Tiempo Real: Estadísticas actualizadas de casos activos, completados y pendientes"
      },
      {
        type: "feature",
        description: "🎯 KPIs Visuales: Indicadores clave de rendimiento con representación gráfica"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz Renovada: Diseño moderno y profesional para el dashboard principal"
      }
    ]
  },
  {
    version: "2.3.2",
    date: "2024-12-23",
    changes: [
      {
        type: "improvement",
        description: "🎨 UI/UX Improvements: Enhanced visual design and user experience"
      },
      {
        type: "improvement",
        description: "📊 Better Data Visualization: Improved charts and metrics display"
      },
      {
        type: "improvement",
        description: "⚡ Performance Optimizations: Faster loading and better responsiveness"
      }
    ]
  },
  {
    version: "2.3.1",
    date: "2024-12-22",
    changes: [
      {
        type: "feature",
        description: "✏️ Edición de Casos: Capacidad completa para editar casos existentes"
      },
      {
        type: "feature",
        description: "📝 Actualización de Estados: Modificación de estado y detalles de casos"
      },
      {
        type: "improvement",
        description: "🔄 Sincronización: Actualización automática de listas después de editar"
      }
    ]
  },
  {
    version: "2.3.0",
    date: "2024-12-21",
    changes: [
      {
        type: "feature",
        description: "🗑️ Eliminación de Casos: Implementada funcionalidad para eliminar casos del sistema"
      },
      {
        type: "feature",
        description: "⚠️ Confirmación de Eliminación: Modal de confirmación para prevenir eliminaciones accidentales"
      },
      {
        type: "improvement",
        description: "🛡️ Validaciones de Seguridad: Verificaciones adicionales antes de eliminar"
      }
    ]
  },
  {
    version: "2.2.1",
    date: "2024-12-20",
    changes: [
      {
        type: "improvement",
        description: "🎨 Refinamientos Visuales: Mejoras en el diseño general de la aplicación"
      },
      {
        type: "improvement",
        description: "📱 Responsividad Mejorada: Better mobile and tablet experience"
      },
      {
        type: "bugfix",
        description: "🐛 Correcciones Menores: Fixed various small bugs and stability issues"
      }
    ]
  },
  {
    version: "2.2.0",
    date: "2024-12-19",
    changes: [
      {
        type: "feature",
        description: "📋 Gestión Completa de Casos: Sistema integral para crear, visualizar y gestionar casos"
      },
      {
        type: "feature",
        description: "🔍 Vista Detallada: Modal con información completa de cada caso"
      },
      {
        type: "feature",
        description: "📊 Estados de Caso: Sistema de estados (abierto, en progreso, cerrado) para seguimiento"
      },
      {
        type: "improvement",
        description: "🎯 Interfaz Intuitiva: Diseño optimizado para workflow de gestión de casos"
      }
    ]
  },
  {
    version: "2.1.0",
    date: "2024-12-18",
    changes: [
      {
        type: "feature",
        description: "🔐 Sistema de Autenticación: Implementado login/logout completo con Supabase Auth"
      },
      {
        type: "feature",
        description: "👤 Gestión de Usuarios: Registro y administración de usuarios del sistema"
      },
      {
        type: "feature",
        description: "🛡️ Rutas Protegidas: Acceso controlado a funcionalidades según autenticación"
      },
      {
        type: "improvement",
        description: "🎨 Interfaz de Login: Diseño profesional y user-friendly para autenticación"
      }
    ]
  },
  {
    version: "2.0.0",
    date: "2024-12-17",
    changes: [
      {
        type: "breaking",
        description: "🚀 Migración Completa a Supabase: Transición total desde arquitectura local a Supabase como backend"
      },
      {
        type: "feature",
        description: "☁️ Backend en la Nube: Toda la lógica de datos ahora reside en Supabase"
      },
      {
        type: "feature",
        description: "🔄 Sincronización en Tiempo Real: Actualizaciones automáticas entre usuarios"
      },
      {
        type: "improvement",
        description: "⚡ Performance Mejorada: Consultas optimizadas y mejor tiempo de respuesta"
      },
      {
        type: "improvement",
        description: "🛡️ Seguridad Enterprise: Row Level Security y validaciones robustas"
      }
    ]
  }
];
