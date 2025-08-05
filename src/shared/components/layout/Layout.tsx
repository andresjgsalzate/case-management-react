import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  ListBulletIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { VersionDisplay } from '@/shared/components/version/VersionDisplay';
import { VersionModal } from '@/shared/components/version/VersionModal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useUserPermissions } from '@/user-management/hooks/useUserPermissions';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';
import { useCasesPermissions } from '@/case-management/hooks/useCasesPermissions';
import { useTodoPermissions } from '@/task-management/hooks/useTodoPermissions';
import { useDisposicionScriptsPermissions } from '@/disposicion-scripts/hooks/useDisposicionScriptsPermissions';
import { useArchivePermissions } from '@/archive-management/hooks/useArchivePermissions';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';
import { useNativeTheme } from '@/shared/hooks/useNativeTheme';
import { mapRoleToDisplayName } from '@/shared/utils/roleUtils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: userProfile } = useUserProfile();
  const userPermissions = useUserPermissions();
  const casesPermissions = useCasesPermissions();
  const todoPermissions = useTodoPermissions();
  const disposicionesPermissions = useDisposicionScriptsPermissions();
  const archivePermissions = useArchivePermissions();
  const adminPermissions = useAdminPermissions();
  const { isDark, toggleTheme } = useNativeTheme();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userManuallyToggled, setUserManuallyToggled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Navegación básica - condicionada por permisos
  const navigation = React.useMemo(() => {
    const baseNavigation = [];

    // Dashboard - siempre visible para usuarios autenticados
    baseNavigation.push({ name: 'Dashboard', href: '/', icon: HomeIcon });

    // Casos - solo si tiene permisos de lectura
    if (casesPermissions.canReadOwnCases || casesPermissions.canReadTeamCases || casesPermissions.canReadAllCases) {
      baseNavigation.push({ name: 'Casos', href: '/cases', icon: DocumentTextIcon });
    }

    // Nuevo Caso - solo si tiene permisos de creación  
    if (casesPermissions.canCreateOwnCases || casesPermissions.canCreateTeamCases || casesPermissions.canCreateAllCases) {
      baseNavigation.push({ name: 'Nuevo Caso', href: '/cases/new', icon: PlusIcon });
    }

    // Control de Casos - solo si tiene permisos de lectura de casos
    if (casesPermissions.canReadOwnCases || casesPermissions.canReadTeamCases || casesPermissions.canReadAllCases) {
      baseNavigation.push({ name: 'Control de Casos', href: '/case-control', icon: ClockIcon });
    }

    // Disposiciones - solo si tiene permisos específicos
    if (disposicionesPermissions.canReadOwnDisposiciones || disposicionesPermissions.canReadAllDisposiciones) {
      baseNavigation.push({ name: 'Disposiciones', href: '/disposiciones', icon: DocumentArrowUpIcon });
    }

    // TODOs - solo si tiene permisos
    if (todoPermissions.canReadOwnTodos || todoPermissions.canReadTeamTodos || todoPermissions.canReadAllTodos) {
      baseNavigation.push({ name: 'TODOs', href: '/todos', icon: ListBulletIcon });
    }

    // Notas - siempre visible (usuarios pueden crear sus propias notas)
    baseNavigation.push({ name: 'Notas', href: '/notes', icon: ChatBubbleLeftRightIcon });

    // Base de Conocimiento - siempre visible para consulta
    baseNavigation.push({ name: 'Base de Conocimiento', href: '/documentation', icon: BookOpenIcon });

    // Archivo - solo para usuarios con permisos de archivo
    if (archivePermissions.canViewOwnArchive || archivePermissions.canViewAllArchive) {
      baseNavigation.push({ name: 'Archivo', href: '/archive', icon: ArchiveBoxIcon });
    }

    return baseNavigation;
  }, [casesPermissions, todoPermissions, disposicionesPermissions, archivePermissions]);

  // Secciones de administración agrupadas
  const adminSections = React.useMemo(() => {
    const sections = [];

    // Sección de usuarios y roles
    const userManagement = [];
    if (userPermissions.canViewUsers() || userPermissions.canManageUsers()) {
      userManagement.push({ 
        name: 'Gestionar Usuarios', 
        href: '/admin/users', 
        icon: UsersIcon 
      });
    }

    // Agregar gestión de roles y permisos para admins
    if (adminPermissions.canReadRoles) {
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

    if (userManagement.length > 0) {
      sections.push({
        id: 'user-management',
        title: 'Usuarios y Roles',
        icon: UsersIcon,
        items: userManagement
      });
    }

    // Sección de configuración del sistema
    const systemConfig = [];
    if (userPermissions.canViewOrigenes() || userPermissions.canManageOrigenes() || userPermissions.canViewAplicaciones() || userPermissions.canManageAplicaciones() || adminPermissions.canReadConfig) {
      systemConfig.push({ 
        name: 'Configuración', 
        href: '/admin/config', 
        icon: CogIcon 
      });
    }

    // Gestión de etiquetas
    if (adminPermissions.canReadTags) {
      systemConfig.push({ 
        name: 'Etiquetas', 
        href: '/admin/tags', 
        icon: TagIcon 
      });
    }

    // Gestión de tipos de documentos
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
  }, [userProfile, userPermissions, adminPermissions]);

  // Navegación de desarrollo/test agrupada - SOLO PARA ADMINS
  const devSection = React.useMemo(() => {
    if (!userProfile || !adminPermissions.hasAnyAdminPermission) return null;
    
    return {
      id: 'development',
      title: 'Desarrollo',
      icon: WrenchScrewdriverIcon,
      items: [
        { name: 'Test Auth', href: '/auth-test', icon: UserIcon },
        { name: 'Test Datos', href: '/data-test', icon: DocumentTextIcon },
      ]
    };
  }, [userProfile, adminPermissions]);

  const isActive = React.useCallback((path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname]);

  const isDropdownActive = React.useCallback((items: any[]) => {
    return items.some(item => isActive(item.href));
  }, [isActive]);

  const toggleDropdown = React.useCallback((sectionId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleSignOut = React.useCallback(() => {
    signOut.mutate();
    setShowUserMenu(false);
  }, [signOut]);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev);
    setUserManuallyToggled(true); // Marcar que el usuario hizo un toggle manual
    // Cerrar todos los dropdowns cuando se colapsa
    if (!isCollapsed) {
      setOpenDropdowns(new Set());
      setShowUserMenu(false);
    }
  }, [isCollapsed]);

  // Cerrar menús cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Cerrar user menu si se hace clic fuera
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      
      // Cerrar dropdowns si se hace clic fuera del nav
      if (navRef.current && !navRef.current.contains(target)) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar el resize de la ventana para colapsar sidebar en pantallas pequeñas
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Solo auto-colapsar si el usuario no ha hecho un toggle manual
      if (!userManuallyToggled) {
        // Auto-colapsar en pantallas menores a 768px
        if (width < 768 && !isCollapsed) {
          setIsCollapsed(true);
        }
        // Auto-expandir en pantallas grandes si está colapsado
        else if (width >= 1280 && isCollapsed) {
          setIsCollapsed(false);
        }
      }
    };

    // Configurar el estado inicial solo una vez
    const width = window.innerWidth;
    if (width < 768 && !userManuallyToggled) {
      setIsCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isCollapsed, userManuallyToggled]);

  // DESPUÉS de todos los hooks, ahora podemos hacer early return
  // Ya no hay errores RLS porque eliminamos el sistema de permisos complejo

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Overlay para móviles cuando el sidebar está expandido */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5 sm:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar - Fixed */}
      <div className={`fixed top-0 left-0 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen z-10 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo/Header */}
        <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleCollapse}
            className="flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 -mx-2 px-2 py-1"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChartBarIcon className="h-8 w-8 text-primary-600 flex-shrink-0" />
            {!isCollapsed && (
              <h1 className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
                Gestión de Casos
              </h1>
            )}
          </button>
        </div>

        {/* Navigation - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-4 space-y-2" ref={navRef}>
            {/* Navegación básica */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
            
            {/* Separador si hay contenido admin */}
            {adminSections.length > 0 && !isCollapsed && (
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            )}
            
            {/* Secciones de administración */}
            {adminSections.map((section) => {
              const SectionIcon = section.icon;
              const sectionActive = isDropdownActive(section.items);
              const isOpen = openDropdowns.has(section.id);
              
              if (isCollapsed) {
                // En modo colapsado, mostrar solo el icono de la sección
                return (
                  <div key={section.id} className="relative">
                    <button
                      className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        sectionActive
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={section.title}
                    >
                      <SectionIcon className="h-6 w-6" />
                    </button>
                  </div>
                );
              }
              
              return (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => toggleDropdown(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      sectionActive
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <SectionIcon className="h-5 w-5 mr-3" />
                      {section.title}
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Submenu items */}
                  {isOpen && (
                    <div className="ml-6 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                              isActive(item.href)
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Sección de desarrollo */}
            {devSection && (
              <>
                {!isCollapsed && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                )}
                <div className="space-y-1">
                  {isCollapsed ? (
                    // En modo colapsado, mostrar solo el icono
                    <div className="relative">
                      <button
                        className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isDropdownActive(devSection.items)
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={devSection.title}
                      >
                        <WrenchScrewdriverIcon className="h-6 w-6" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleDropdown(devSection.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isDropdownActive(devSection.items)
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <devSection.icon className="h-5 w-5 mr-3" />
                          {devSection.title}
                        </div>
                        <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${
                          openDropdowns.has(devSection.id) ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Submenu items */}
                      {openDropdowns.has(devSection.id) && (
                        <div className="ml-6 space-y-1">
                          {devSection.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                  isActive(item.href)
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <ItemIcon className="h-4 w-4 mr-3" />
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>

        {/* User Menu en la parte inferior - Fixed Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Version Display */}
          {!isCollapsed && (
            <div className="flex justify-center">
              <VersionDisplay onClick={() => setShowVersionModal(true)} />
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <>
                <SunIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Modo Claro</span>}
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Modo Oscuro</span>}
              </>
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title={isCollapsed ? userProfile?.fullName || 'Usuario' : undefined}
            >
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="ml-3 text-left">
                    <div className="font-medium">
                      {userProfile?.fullName || user?.user_metadata?.name || 'Usuario'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {mapRoleToDisplayName(userProfile?.roleName || undefined, userProfile?.roleDescription)}
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Dropdown menu */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 mb-2 z-50">
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content-container ${
        isCollapsed ? 'main-content-collapsed' : 'main-content-expanded'
      }`}>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Version Modal */}
      {showVersionModal && (
        <VersionModal
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
        />
      )}
    </div>
  );
};
