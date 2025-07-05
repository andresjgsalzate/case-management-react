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
  ShieldCheckIcon,
  KeyIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { FloatingActionButton } from './FloatingActionButton';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useUserProfile';
import { RLSError } from './RLSError';
import { useThemeStore } from '@/stores/themeStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { userProfile, canAccessAdmin, canManageUsers, canManageRoles, canManagePermissions, canManageOrigenes, canManageAplicaciones, hasRLSError } = usePermissions();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Navegación básica
  const navigation = React.useMemo(() => [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Casos', href: '/cases', icon: DocumentTextIcon },
    { name: 'Nuevo Caso', href: '/cases/new', icon: PlusIcon },
  ], []);

  // Navegación de administración agrupada por secciones
  const adminSections = React.useMemo(() => {
    if (!userProfile) return [];

    const sections = [];

    // Sección: Gestión de Usuarios
    const userManagement = [];
    if (canManageUsers()) userManagement.push({ name: 'Usuarios', href: '/admin/users', icon: UsersIcon });
    if (canManageRoles()) userManagement.push({ name: 'Roles', href: '/admin/roles', icon: ShieldCheckIcon });
    if (canManagePermissions()) userManagement.push({ name: 'Permisos', href: '/admin/permissions', icon: KeyIcon });
    
    if (userManagement.length > 0) {
      sections.push({
        id: 'user-management',
        title: 'Usuarios',
        icon: UsersIcon,
        items: userManagement
      });
    }

    // Sección: Configuración del Sistema
    const systemConfig = [];
    if (canManageOrigenes() || canManageAplicaciones()) {
      systemConfig.push({ name: 'Orígenes y Aplicaciones', href: '/admin/config', icon: CogIcon });
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
  }, [userProfile, canManageUsers, canManageRoles, canManagePermissions, canManageOrigenes, canManageAplicaciones]);

  // Navegación de desarrollo/test agrupada
  const devSection = React.useMemo(() => {
    if (!userProfile || !canAccessAdmin()) return null;
    
    return {
      id: 'development',
      title: 'Desarrollo',
      icon: WrenchScrewdriverIcon,
      items: [
        { name: 'Test Auth', href: '/auth-test', icon: UserIcon },
        { name: 'Test Datos', href: '/data-test', icon: DocumentTextIcon },
        { name: 'Debug', href: '/debug', icon: CogIcon },
      ]
    };
  }, [userProfile, canAccessAdmin]);

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

  // DESPUÉS de todos los hooks, ahora podemos hacer early return
  if (hasRLSError) {
    return <RLSError onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo/Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <ChartBarIcon className="h-8 w-8 text-primary-600" />
          <h1 className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
            Gestión de Casos
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto" ref={navRef}>
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
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          
          {/* Separador si hay contenido admin */}
          {adminSections.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          )}
          
          {/* Secciones de administración */}
          {adminSections.map((section) => {
            const SectionIcon = section.icon;
            const sectionActive = isDropdownActive(section.items);
            const isOpen = openDropdowns.has(section.id);
            
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
                              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
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
          
          {/* Sección de desarrollo - Solo en desarrollo y para admins */}
          {import.meta.env.DEV && devSection && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              <div className="space-y-1">
                <button
                  onClick={() => toggleDropdown(devSection.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isDropdownActive(devSection.items)
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    {React.createElement(devSection.icon, { className: "h-5 w-5 mr-3" })}
                    {devSection.title}
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${openDropdowns.has(devSection.id) ? 'rotate-180' : ''}`} />
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
                              ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
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
            </>
          )}
        </nav>

        {/* User Menu en la parte inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? (
              <>
                <SunIcon className="h-5 w-5 mr-3 text-yellow-500" />
                Modo Claro
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                Modo Oscuro
              </>
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">
                    {userProfile?.fullName || user?.user_metadata?.name || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userProfile?.role?.name === 'admin' ? 'Administrador' : 'Usuario'}
                  </div>
                </div>
              </div>
              <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {user?.email}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header (opcional, para breadcrumbs o acciones) */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Aquí puedes agregar breadcrumbs en el futuro */}
            </div>
            <div className="flex items-center space-x-4">
              {/* Acciones adicionales si es necesario */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};
