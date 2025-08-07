// ================================================================
// ACTUALIZACIÓN FRONTEND - NUEVOS PERMISOS ESPECÍFICOS
// ================================================================
// 
// Este archivo documenta los cambios necesarios en el frontend
// para usar los nuevos permisos específicos y evitar mostrar
// módulos administrativos a usuarios no autorizados
// ================================================================

/**
 * CAMBIOS NECESARIOS EN EL FRONTEND:
 * 
 * 1. Layout.tsx - Condicionar menú administrativo
 * 2. useUserPermissions.ts - Usar nuevos permisos
 * 3. useAdminPermissions.ts - Verificar permisos admin específicos
 * 4. Rutas administrativas - Proteger con permisos correctos
 */

// ================================================================
// 1. LAYOUT.TSX - CONDICIONAR MENÚ ADMINISTRATIVO
// ================================================================

/**
 * ANTES (PROBLEMÁTICO):
 * if (userPermissions.canViewUsers() || userPermissions.canManageUsers()) {
 *   // Mostraba módulo para cualquiera con users.read_own
 * }
 * 
 * DESPUÉS (CORRECTO):
 * if (adminPermissions.hasPermission('admin.users.view_module')) {
 *   // Solo muestra para usuarios con permiso administrativo específico
 * }
 */

const adminSectionsFixed = React.useMemo(() => {
  const sections = [];

  // ✅ SECCIÓN DE USUARIOS Y ROLES - SOLO PARA ADMINS
  const userManagement = [];
  
  // Solo mostrar si tiene permiso administrativo específico
  if (adminPermissions.hasPermission('admin.users.view_module')) {
    userManagement.push({ 
      name: 'Gestionar Usuarios', 
      href: '/admin/users', 
      icon: UsersIcon 
    });
  }

  if (adminPermissions.hasPermission('admin.roles.view_module')) {
    userManagement.push({
      name: 'Gestionar Roles', 
      href: '/admin/roles', 
      icon: UserIcon 
    });
  }

  if (adminPermissions.canReadPermissions) {
    userManagement.push({
      name: 'Gestionar Permisos', 
      href: '/admin/permissions', 
      icon: CogIcon 
    });
  }

  if (adminPermissions.canReadRolePermissions) {
    userManagement.push({
      name: 'Asignar Permisos', 
      href: '/admin/role-permissions', 
      icon: WrenchScrewdriverIcon 
    });
  }

  // Solo agregar sección si tiene al menos un permiso administrativo
  if (userManagement.length > 0) {
    sections.push({
      id: 'user-management',
      title: 'Usuarios y Roles',
      icon: UsersIcon,
      items: userManagement
    });
  }

  // ✅ SECCIÓN DE CONFIGURACIÓN - SOLO PARA ADMINS
  const systemConfig = [];
  
  if (adminPermissions.hasPermission('admin.config.view_module')) {
    systemConfig.push({ 
      name: 'Configuración', 
      href: '/admin/config', 
      icon: CogIcon 
    });
  }

  if (adminPermissions.canReadTags) {
    systemConfig.push({ 
      name: 'Etiquetas', 
      href: '/admin/tags', 
      icon: TagIcon 
    });
  }

  if (adminPermissions.canReadDocumentTypes) {
    systemConfig.push({ 
      name: 'Tipos de Documentos', 
      href: '/admin/document-types', 
      icon: DocumentTextIcon 
    });
  }

  if (systemConfig.length > 0) {
    sections.push({
      id: 'system-config',
      title: 'Configuración',
      icon: CogIcon,
      items: systemConfig
    });
  }

  return sections;
}, [adminPermissions]);

// ✅ NAVEGACIÓN DE DESARROLLO - SOLO PARA ADMINS
const devSectionFixed = React.useMemo(() => {
  // Usar permiso específico en lugar de hasAnyAdminPermission
  if (!adminPermissions.hasPermission('admin.development.access')) return null;
  
  return {
    id: 'development',
    title: 'Desarrollo',
    icon: WrenchScrewdriverIcon,
    items: [
      { name: 'Test Auth', href: '/auth-test', icon: UserIcon },
      { name: 'Test Datos', href: '/data-test', icon: DocumentTextIcon },
    ]
  };
}, [adminPermissions]);

// ================================================================
// 2. USERPERMISSIONS.TS - ACTUALIZAR MÉTODOS
// ================================================================

/**
 * ACTUALIZAR MÉTODOS PARA USAR PERMISOS ESPECÍFICOS
 */
const userPermissionsFixed = {
  // ✅ Para ver módulo de usuarios (ADMINISTRATIVO)
  canViewUsersModule: () => adminPermissions.hasPermission('admin.users.view_module'),
  
  // ✅ Para gestionar usuarios (ADMINISTRATIVO)  
  canManageUsersModule: () => adminPermissions.hasPermission('admin.users.manage'),
  
  // ✅ Para ver módulo de roles (ADMINISTRATIVO)
  canViewRolesModule: () => adminPermissions.hasPermission('admin.roles.view_module'),
  
  // ✅ Para gestionar roles (ADMINISTRATIVO)
  canManageRolesModule: () => adminPermissions.hasPermission('admin.roles.manage'),
  
  // ✅ Para ver módulo de configuración (ADMINISTRATIVO)
  canViewConfigModule: () => adminPermissions.hasPermission('admin.config.view_module'),
  
  // ✅ Para gestionar configuración (ADMINISTRATIVO)
  canManageConfigModule: () => adminPermissions.hasPermission('admin.config.manage'),
  
  // ✅ Para perfil propio (NO ADMINISTRATIVO)
  canViewOwnProfile: () => adminPermissions.hasPermission('profile.read_own'),
  canUpdateOwnProfile: () => adminPermissions.hasPermission('profile.update_own'),
  canChangePassword: () => adminPermissions.hasPermission('profile.change_password'),
  
  // ✅ Mantener métodos legacy pero con lógica correcta
  canViewUsers: () => adminPermissions.hasPermission('admin.users.view_module'),
  canManageUsers: () => adminPermissions.hasPermission('admin.users.manage'),
  canViewRoles: () => adminPermissions.hasPermission('admin.roles.view_module'),
  canManageRoles: () => adminPermissions.hasPermission('admin.roles.manage'),
  canViewConfig: () => adminPermissions.hasPermission('admin.config.view_module'),
  canManageConfig: () => adminPermissions.hasPermission('admin.config.manage'),
};

// ================================================================
// 3. PROTECCIÓN DE RUTAS ADMINISTRATIVAS
// ================================================================

/**
 * ACTUALIZAR COMPONENTES PARA VERIFICAR PERMISOS CORRECTOS
 */

// ✅ UsersPage.tsx
export function UsersPage() {
  const adminPermissions = useAdminPermissions();
  
  // Verificar permiso específico administrativo
  if (!adminPermissions.hasPermission('admin.users.view_module')) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder al módulo de administración de usuarios.
        </p>
      </div>
    );
  }
  
  // ... resto del componente
}

// ✅ ConfigurationPage.tsx  
export function ConfigurationPage() {
  const adminPermissions = useAdminPermissions();
  
  // Verificar permiso específico administrativo
  if (!adminPermissions.hasPermission('admin.config.view_module')) {
    return (
      <div className="text-center py-12">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder al módulo de configuración.
        </p>
      </div>
    );
  }
  
  // ... resto del componente
}

// ================================================================
// 4. USEADMINROUTEPERMISSIONS.TS - ACTUALIZAR LÓGICA
// ================================================================

const adminRoutePermissionsFixed = {
  /**
   * ✅ Verificar si puede acceder a rutas administrativas
   */
  canAccessAdminRoutes: (): boolean => {
    return adminPermissions.hasPermission('admin.users.view_module') ||
           adminPermissions.hasPermission('admin.roles.view_module') ||
           adminPermissions.hasPermission('admin.config.view_module') ||
           adminPermissions.hasPermission('admin.development.access');
  },
  
  /**
   * ✅ Verificar si puede acceder a desarrollo
   */
  canAccessDevelopment: (): boolean => {
    return adminPermissions.hasPermission('admin.development.access');
  },
  
  /**
   * ✅ Verificar si es admin real
   */
  isRealAdmin: (): boolean => {
    return adminPermissions.hasPermission('admin.users.manage') &&
           adminPermissions.hasPermission('admin.roles.manage') &&
           adminPermissions.hasPermission('admin.config.manage');
  }
};

export default {
  // Documentación de cambios necesarios
  cambiosNecesarios: {
    frontend: [
      'Actualizar Layout.tsx para usar admin.*.view_module',
      'Modificar useUserPermissions.ts con nuevos métodos',
      'Actualizar componentes administrativos con verificaciones específicas',
      'Implementar useAdminRoutePermissions.ts corregido'
    ],
    backend: [
      'Ejecutar script 102_rediseñar_sistema_permisos_analista.sql',
      'Verificar políticas RLS actualizadas',
      'Probar acceso con usuario Analista'
    ]
  }
};
