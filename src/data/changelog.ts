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
    version: "2.9.0",
    date: "2025-01-31",
    changes: [
      {
        type: "feature",
        description: "🎉 Módulo de Disposiciones de Scripts: Sistema completo para gestionar disposiciones de scripts por caso y aplicación"
      },
      {
        type: "feature",
        description: "📊 Gestión Integral de Disposiciones: CRUD completo con formularios inteligentes para crear, editar y eliminar disposiciones de scripts"
      },
      {
        type: "feature",
        description: "📋 Agrupamiento por Mes: Vista organizada de disposiciones agrupadas por mes con tarjetas informativas y resúmenes estadísticos"
      },
      {
        type: "feature",
        description: "📈 Exportación a CSV: Generación de reportes mensuales en formato CSV con codificación BOM UTF-8 para Excel"
      },
      {
        type: "feature",
        description: "🔐 Sistema de Permisos Granular: Control de acceso basado en roles - usuarios no admin solo pueden eliminar sus propias disposiciones"
      },
      {
        type: "feature",
        description: "🎯 Auto-selección de Aplicación: Los formularios auto-seleccionan la aplicación del caso elegido, eliminando redundancia de datos"
      },
      {
        type: "feature",
        description: "📊 Vista de Tabla Optimizada: Formato tabular compacto con columnas Caso | Aplicación | Cantidad para visualización eficiente"
      },
      {
        type: "feature",
        description: "🗂️ Tabla de Gestión Completa: Vista administrativa con búsqueda, filtros, paginación y acciones masivas"
      },
      {
        type: "feature",
        description: "📝 Campos Especializados: Soporte para nombre de script, número de revisión SVN, observaciones y validaciones específicas"
      },
      {
        type: "feature",
        description: "🔍 Búsqueda y Filtros: Sistema de búsqueda por caso, script, aplicación y filtros por fecha para localización rápida"
      },
      {
        type: "improvement",
        description: "💫 UX Mejorada en Formularios: Campo de aplicación se deshabilita automáticamente cuando se selecciona un caso con aplicación asociada"
      },
      {
        type: "improvement",
        description: "🔍 Indicadores Visuales: Texto explicativo '(Seleccionada automáticamente del caso)' para mayor claridad en formularios"
      },
      {
        type: "improvement",
        description: "🌙 Colores Adaptativos: Badges y elementos optimizados para mejor contraste en modo oscuro"
      },
      {
        type: "improvement",
        description: "📱 Responsive Optimizado: Tablas y formularios adaptados para diferentes tamaños de pantalla"
      },
      {
        type: "improvement",
        description: "📊 Estadísticas Dinámicas: Contadores automáticos de casos únicos y total de disposiciones por mes"
      }
    ]
  },
  {
    version: "2.8.0",
    date: "2025-01-17",
    changes: [
      {
        type: "feature",
        description: "📝 Módulo de Notas Completo: Sistema integral de notas con recordatorios, etiquetas y asociación con casos"
      },
      {
        type: "feature",
        description: "🔍 Búsqueda Avanzada de Notas: Componente de búsqueda rápida con autocompletado y resaltado de términos"
      },
      {
        type: "feature",
        description: "⏰ Recordatorios Inteligentes: Sistema de recordatorios con fechas y horas separadas para mejor usabilidad"
      },
      {
        type: "feature",
        description: "🏷️ Sistema de Etiquetas: Gestión de tags para organizar y categorizar notas"
      },
      {
        type: "feature",
        description: "🔗 Asociación con Casos: Vinculación directa de notas con casos específicos del sistema"
      },
      {
        type: "feature",
        description: "📊 Estadísticas de Notas: Métricas detalladas con contadores por tipo (importantes, archivadas, recordatorios)"
      },
      {
        type: "feature",
        description: "🗂️ Archivado de Notas: Sistema de archivado soft-delete con opción de restauración"
      },
      {
        type: "feature",
        description: "🛡️ Permisos Granulares: Control de acceso basado en roles para creación, edición y eliminación de notas"
      },
      {
        type: "improvement",
        description: "🎨 Selector de Casos Mejorado: Campo de búsqueda con autocompletado que muestra solo números de caso"
      },
      {
        type: "improvement",
        description: "📅 Campos de Fecha Separados: Fecha y hora en campos independientes para mejor experiencia de usuario"
      },
      {
        type: "improvement",
        description: "💻 Búsqueda Global: Componente de búsqueda rápida integrado en Dashboard y página de notas"
      },
      {
        type: "improvement",
        description: "🔄 Vistas Múltiples: Pestañas para filtrar notas (todas, propias, asignadas, importantes, archivadas)"
      },
      {
        type: "improvement",
        description: "📱 Interfaz Responsive: Diseño adaptativo optimizado para móvil, tablet y escritorio"
      },
      {
        type: "improvement",
        description: "🎯 Navegación Contextual: Scroll automático a notas específicas desde búsqueda"
      },
      {
        type: "improvement",
        description: "🌙 Modo Oscuro: Soporte completo para tema oscuro en todos los componentes de notas"
      }
    ]
  },
  {
    version: "2.7.10",
    date: "2025-01-15", 
    changes: [
      {
        type: "bugfix",
        description: "🔧 Corrección de Recursión RLS: Solucionada la recursión infinita en las políticas de user_profiles que causaba errores de acceso al sistema"
      },
      {
        type: "improvement",
        description: "🔐 Sistema de Seguridad Optimizado: Migración completa a un modelo de seguridad híbrido que elimina conflictos de RLS y mejora el rendimiento"
      },
      {
        type: "bugfix", 
        description: "� Vista archive_stats Corregida: Solucionado el error 'multiple rows returned' que impedía cargar las estadísticas de archivo"
      },
      {
        type: "bugfix",
        description: "🎯 Vista case_control_detailed Reparada: Agregadas columnas faltantes (case_number, application_name, assigned_user_name, status_color) que causaban errores 400"
      },
      {
        type: "improvement",
        description: "� Módulo Control de Casos Restaurado: Completa funcionalidad del módulo de control con todas las métricas y gráficos operativos"
      },
      {
        type: "improvement",
        description: "🧹 Limpieza de Políticas: Eliminadas políticas RLS huérfanas y duplicadas, reduciendo advertencias de seguridad de ~20 a solo warnings menores"
      },
      {
        type: "feature",
        description: "✅ Validación Funcional Completa: Todos los módulos (Gestión de Casos, Control de Casos, Archivo) verificados y funcionando correctamente"
      },
      {
        type: "improvement",
        description: "🔒 Seguridad RLS: Habilitado Row Level Security (RLS) en todas las tablas públicas para cumplir con estándares de seguridad de Supabase"
      },
      {
        type: "improvement", 
        description: "🛡️ Políticas de Acceso: Implementadas políticas de seguridad granulares basadas en roles de usuario (admin, supervisor, analista)"
      },
      {
        type: "improvement",
        description: "👁️ Vistas Seguras: Recreadas vistas críticas como SECURITY INVOKER para mejorar la seguridad y transparencia de permisos"
      },
      {
        type: "improvement",
        description: "🔧 Compatibilidad Mantenida: Todos los cambios de seguridad preservan la funcionalidad existente sin afectar el comportamiento actual"
      },
      {
        type: "improvement",
        description: "📋 Cumplimiento: Resolución completa de errores críticos de seguridad y funcionalidad del sistema"
      }
    ]
  },
  {
    version: "2.7.9",
    date: "2025-01-14",
    changes: [
      {
        type: "bugfix",
        description: "🔧 Sincronización de Estado de TODOs: Corregido el campo 'is_completed' en la tabla 'todos' que no se actualizaba al completar TODOs desde el control"
      },
      {
        type: "improvement",
        description: "⚡ Métricas de TODOs Precisas: Las métricas de TODOs ahora reflejan correctamente el estado real de completado desde la base de datos"
      },
      {
        type: "feature",
        description: "🔄 Función de Reactivación: Agregada funcionalidad para reactivar TODOs completados, revirtiendo su estado a pendiente"
      },
      {
        type: "improvement",
        description: "🎯 Invalidación Automática de Queries: Mejora en la actualización automática de la interfaz al completar/reactivar TODOs"
      },
      {
        type: "feature",
        description: "🤖 Trigger de Base de Datos: Implementado trigger automático que mantiene sincronizado el estado de completado entre las tablas 'todo_control' y 'todos'"
      }
    ]
  },
  {
    version: "2.7.8",
    date: "2025-01-10",
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
      }
    ]
  },
  {
    version: "2.7.7",
    date: "2025-01-08",
    changes: [
      {
        type: "improvement",
        description: "⏰ Visualización de Tiempo Mejorada: Los tiempos en modales de detalle ahora se muestran como '9h 58m' en lugar de '09:58' para evitar confusión"
      },
      {
        type: "improvement",
        description: "🎯 UX Clarificada: Formato de tiempo más intuitivo que distingue claramente horas y minutos de minutos y segundos"
      },
      {
        type: "improvement",
        description: "📊 Consistencia Visual: Aplicado el nuevo formato en todos los modales de Control de Casos y TODOs"
      }
    ]
  },
  {
    version: "2.7.6",
    date: "2025-01-08",
    changes: [
      {
        type: "improvement",
        description: "🧹 Limpieza de Código: Eliminados todos los console.log innecesarios de desarrollo para optimizar el rendimiento"
      },
      {
        type: "improvement",
        description: "⚡ Performance Mejorada: Código más limpio sin logs de debug que afecten la producción"
      },
      {
        type: "improvement",
        description: "🔧 Mantenimiento: Conservados solo los console.error necesarios para debugging de errores críticos"
      }
    ]
  },
  {
    version: "2.7.5",
    date: "2025-01-08",
    changes: [
      {
        type: "bugfix",
        description: "🔄 Sincronización Cross-Módulo: Corregida invalidación de queries al eliminar casos desde módulo Casos - ahora se actualiza automáticamente en Control de Casos"
      },
      {
        type: "bugfix",
        description: "🗂️ Modal TODO Mejorado: Solucionados problemas de z-index y transparencia - modales ahora aparecen correctamente por encima de todas las tarjetas"
      },
      {
        type: "improvement",
        description: "🎨 Portal DOM: Implementado renderizado de modales en portal para evitar conflictos de stacking context"
      },
      {
        type: "improvement",
        description: "⚡ UX Mejorada: Bloqueo de scroll del body cuando modales están abiertos y fondo con efecto blur"
      }
    ]
  },
  {
    version: "2.7.4",
    date: "2025-07-07",
    changes: [
      {
        type: "bugfix",
        description: "🔄 Recarga Automática: Corregido problema de caché donde los casos archivados seguían apareciendo en Control de Casos"
      },
      {
        type: "improvement",
        description: "📱 UX Mejorada: Los datos se recargan automáticamente después de archivar para evitar confusión en usuarios"
      },
      {
        type: "improvement",
        description: "⚡ Sincronización: Todas las páginas (TODOs, Control de Casos, Archivo) ahora se sincronizan correctamente después de operaciones de archivado"
      }
    ]
  },
  {
    version: "2.7.3",
    date: "2025-07-07",
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
    date: "2025-07-07",
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
    date: "2025-07-07", 
    changes: [
      {
        type: "bugfix",
        description: "🔐 Corrección de Permisos de Archivo: Los analistas ahora pueden restaurar sus propios casos y TODOs archivados"
      },
      {
        type: "improvement",
        description: "🛡️ Políticas RLS Mejoradas: Políticas de actualización refinadas para respetar la jerarquía de permisos estándar del sistema"
      },
      {
        type: "improvement", 
        description: "👥 Verificación Granular: Implementada verificación a nivel de elemento para garantizar que analistas solo restauren contenido propio"
      }
    ]
  },
  {
    version: "2.7.0",
    date: "2025-07-07",
    changes: [
      {
        type: "feature",
        description: "🗄️ Módulo de Archivo Completo: Nuevo sistema integral para archivar y gestionar casos y TODOs terminados"
      },
      {
        type: "feature",
        description: "📦 Archivo Inteligente: Archivado automático que preserva todos los datos originales y métricas de tiempo en formato JSON"
      },
      {
        type: "feature",
        description: "🔄 Sistema de Restauración: Funcionalidad para marcar elementos archivados como restaurados con auditoría completa"
      },
      {
        type: "feature",
        description: "📊 Estadísticas de Archivo: Métricas detalladas con contadores globales y estadísticas mensuales de los últimos 12 meses"
      },
      {
        type: "feature",
        description: "🧹 Limpieza Automática: Función para eliminar registros de control huérfanos y mantener la integridad de la base de datos"
      },
      {
        type: "feature",
        description: "🔐 Seguridad RLS Completa: Políticas granulares que respetan la jerarquía de roles (admin, supervisor, analista) para acceso a archivos"
      },
      {
        type: "feature",
        description: "🎨 Interfaz de Usuario Moderna: Página de archivo con filtros, búsqueda y visualización detallada de elementos archivados"
      },
      {
        type: "improvement",
        description: "🗂️ Consolidación de Migraciones: Unificación de 6 migraciones SQL en una sola migración optimizada para mejor mantenimiento"
      }
    ]
  },
  {
    version: "2.6.0",
    date: "2025-07-07",
    changes: [
      {
        type: "improvement",
        description: "📊 Refactorización de Métricas Dashboard: Eliminadas métricas 'Promedio por Caso' y 'Usuarios Activos'"
      },
      {
        type: "feature",
        description: "⏱️ Métricas de Tiempo Combinadas: 'Tiempo Total' ahora suma tiempo de casos y TODOs"
      },
      {
        type: "feature",
        description: "📈 Nuevas Métricas Específicas: Agregadas tarjetas 'Tiempo Total por Caso' y 'Tiempo Total por TODOs'"
      },
      {
        type: "improvement",
        description: "🎯 Mejora Visual: Reorganización de las métricas de tiempo para mayor claridad y utilidad"
      }
    ]
  },
  {
    version: "2.5.0",
    date: "2025-07-07",
    changes: [
      {
        type: "feature",
        description: "📊 Sistema de Reportes TODO: Implementado generador de reportes Excel para TODOs con métricas completas de tiempo, eficiencia y cumplimiento"
      },
      {
        type: "feature",
        description: "📈 Métricas Avanzadas: Reportes incluyen tiempo estimado vs real, cálculo de eficiencia, estado de cumplimiento y análisis por prioridad"
      },
      {
        type: "improvement",
        description: "🔐 Permisos Respetados: Sistema de reportes respeta las mismas reglas de permisos que Control de Casos"
      },
      {
        type: "improvement",
        description: "📄 Formato Mejorado: Reportes con columnas organizadas, filtros automáticos y formato optimizado para análisis"
      }
    ]
  },
  {
    version: "2.4.0",
    date: "2025-07-07",
    changes: [
      {
        type: "feature",
        description: "📱 Menú Lateral Colapsable: Implementado botón para colapsar/expandir el menú usando el logo como control"
      },
      {
        type: "improvement",
        description: "🎯 UX Mejorada: Transiciones suaves, tooltips en modo colapsado y ajuste automático del contenido principal"
      },
      {
        type: "improvement",
        description: "📐 Responsive Design: Menú adaptativo que se ajusta de 64 píxeles (colapsado) a 256 píxeles (expandido)"
      },
      {
        type: "improvement",
        description: "📐 Iconos Mejorados: Aumentado tamaño de iconos en sidebar colapsado para mejor visibilidad (h-5 → h-6)"
      },
      {
        type: "feature",
        description: "📊 Reportes TODO: Implementado sistema de reportes para TODOs con métricas de tiempo y eficiencia, respetando permisos de usuario"
      },
      {
        type: "improvement",
        description: "🔧 Funcionalidad Inteligente: Auto-cierre de dropdowns y menús al colapsar, preservación del estado activo"
      }
    ]
  },
  {
    version: "2.3.2",
    date: "2025-07-07",
    changes: [
      {
        type: "bugfix",
        description: "🔍 Fix consultas TODOs: Corregido uso de 'created_by_user_id' en lugar de 'created_by' en filtros y métricas"
      }
    ]
  },
  {
    version: "2.3.1",
    date: "2025-07-07",
    changes: [
      {
        type: "bugfix",
        description: "🔐 Fix RLS TODOs: Corregida política de eliminación para que analistas puedan eliminar sus propios TODOs y los asignados"
      }
    ]
  },
  {
    version: "2.3.0",
    date: "2025-07-07",
    changes: [
      {
        type: "feature",
        description: "🎯 Sistema de Notificaciones Centralizado: Reemplazo completo de react-hot-toast por sistema propio unificado"
      },
      {
        type: "improvement",
        description: "🚫 Eliminación Total de Duplicidad de Toasts: Los mensajes de éxito/error ahora aparecen una sola vez, nunca duplicados"
      },
      {
        type: "improvement",
        description: "📍 Posición Consistente: Todas las notificaciones aparecen en esquina inferior derecha con auto-cierre en 3 segundos"
      },
      {
        type: "improvement",
        description: "🔧 Migración Completa de Módulos: Cases, Users, Roles, Permissions, Configuration, TODOs migrados al nuevo sistema"
      },
      {
        type: "improvement",
        description: "📱 Modales Migrados: CaseControlDetailsModal, TodoControlDetailsModal, CaseAssignmentModal actualizados"
      },
      {
        type: "improvement",
        description: "📊 Utilidades de Exportación: exportUtils.ts adaptado para usar callbacks de notificación"
      },
      {
        type: "improvement",
        description: "🏗️ Arquitectura Mejorada: NotificationProvider y hook useNotification() para gestión centralizada"
      },
      {
        type: "bugfix",
        description: "🐛 Hooks Limpios: Eliminados toasts automáticos duplicados de useUsers, useRoles, usePermissions, etc."
      },
      {
        type: "improvement",
        description: "⚡ Mejor UX: Mensajes más consistentes y predecibles en todas las operaciones CRUD"
      }
    ]
  },
  {
    version: "2.2.8",
    date: "2025-07-07",
    changes: [
      {
        type: "bugfix",
        description: "🏷️ Clasificación de Versiones Corregida: Solucionado problema donde todas las versiones se mostraban como 'MAJOR' en el modal de versiones"
      },
      {
        type: "bugfix",
        description: "📊 Lógica de Versionado Semántico: Implementada lógica correcta para determinar MAJOR/MINOR/PATCH basándose en el contenido de los cambios"
      }
    ]
  },
  {
    version: "2.2.7",
    date: "2025-07-07",
    changes: [
      {
        type: "bugfix",
        description: "🔧 Módulo Desarrollo Visible en Producción: Solucionado problema donde administradores no podían ver el módulo Desarrollo en ambiente de producción"
      },
      {
        type: "bugfix",
        description: "🌐 Acceso Consistente: Eliminada restricción de ambiente DEV para que administradores accedan al módulo en cualquier entorno"
      }
    ]
  },
  {
    version: "2.2.6",
    date: "2025-07-06",
    changes: [
      {
        type: "improvement",
        description: "✨ Experiencia de Usuario Mejorada: Reemplazados todos los diálogos nativos (alert/confirm) por modales de confirmación modernos y consistentes"
      },
      {
        type: "improvement", 
        description: "🎨 Interfaz Unificada: Implementación de modales de confirmación personalizados en Cases, Users, Roles, Permissions, Configuration y TODOs"
      },
      {
        type: "improvement",
        description: "🔒 Mejor Feedback Visual: Modales con iconos, colores temáticos y mensajes más descriptivos para acciones de eliminación"
      }
    ]
  },
  {
    version: "2.2.5",
    date: "2025-07-06",
    changes: [
      {
        type: "improvement",
        description: "📅 Formato de Fecha Mejorado: Cambio a formato DD/MM/AAAA para mejor legibilidad"
      },
      {
        type: "improvement",
        description: "🎯 Consistencia Visual: Formato unificado en toda la aplicación (03/07/2025)"
      }
    ]
  },
  {
    version: "2.2.4",
    date: "2025-07-06",
    changes: [
      {
        type: "bugfix",
        description: "🗓️ Corrección Fechas de Casos: Solucionado problema de zona horaria que mostraba fechas con un día de diferencia"
      },
      {
        type: "bugfix",
        description: "📅 Formato de Fecha Consistente: Implementado formatDateLocal para evitar desfases de UTC vs local"
      },
      {
        type: "improvement",
        description: "🔧 Función Utilitaria: Uso de formatDateLocal en todas las visualizaciones de fechas de casos"
      }
    ]
  },
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
      },
      {
        type: "bugfix",
        description: "🔐 Fix RLS TODOs: Corregida política de eliminación para que analistas puedan eliminar sus propios TODOs y los asignados"
      },
      {
        type: "improvement",
        description: "⚡ Mejoras en el rendimiento de consultas y eliminación de datos innecesarios"
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
