// ================================================================
// GUÍA COMPLETA DEL SISTEMA DE PERMISOS
// ================================================================

import React, { useState } from 'react';
import { Button } from '../../shared';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  BookOpenIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  LightBulbIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PermissionsGuideProps {
  onClose: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const CollapsibleSection: React.FC<SectionProps> = ({ 
  title, 
  icon, 
  children, 
  isExpanded = false, 
  onToggle 
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {isExpanded ? (
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
      )}
    </button>
    {isExpanded && (
      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
        {children}
      </div>
    )}
  </div>
);

const PermissionExample: React.FC<{
  name: string;
  resource: string;
  action: string;
  scope: string;
  description: string;
  example: string;
}> = ({ name, resource, action, scope, description, example }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
    <div className="flex items-center justify-between mb-2">
      <code className="text-sm font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
        {name}
      </code>
      <div className="flex space-x-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          {resource}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
          {action}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
          {scope}
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{description}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{example}</p>
  </div>
);

const RoleExample: React.FC<{
  role: string;
  description: string;
  permissions: string[];
  useCase: string;
}> = ({ role, description, permissions, useCase }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg mb-4">
    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{role}</h4>
    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">{description}</p>
    <div className="mb-3">
      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Permisos típicos:</p>
      <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400 space-y-1">
        {permissions.map((permission, index) => (
          <li key={index}>{permission}</li>
        ))}
      </ul>
    </div>
    <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Caso de uso:</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{useCase}</p>
    </div>
  </div>
);

export const PermissionsGuide: React.FC<PermissionsGuideProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intro: true,
    structure: false,
    scopes: false,
    modules: false,
    roles: false,
    examples: false,
    best: false,
    troubleshoot: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Guía del Sistema de Permisos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aprende a configurar roles y permisos correctamente
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* 1. Introducción */}
          <CollapsibleSection
            title="¿Qué son los Permisos?"
            icon={<BookOpenIcon className="w-6 h-6" />}
            isExpanded={expandedSections.intro}
            onToggle={() => toggleSection('intro')}
          >
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Los permisos son reglas que determinan qué acciones puede realizar un usuario en el sistema. 
                Cada permiso específica:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Recurso:</strong> El módulo o entidad sobre la que se actúa (casos, usuarios, notas, etc.)</li>
                <li><strong>Acción:</strong> Lo que se puede hacer (leer, crear, actualizar, eliminar, admin)</li>
                <li><strong>Scope:</strong> El alcance de la acción (own=propio, team=equipo, all=todo)</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-2">
                  <LightBulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Ejemplo:</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <code>cases.read_own</code> = El usuario puede ver solo sus propios casos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 2. Estructura de Permisos */}
          <CollapsibleSection
            title="Estructura de los Permisos"
            icon={<CubeTransparentIcon className="w-6 h-6" />}
            isExpanded={expandedSections.structure}
            onToggle={() => toggleSection('structure')}
          >
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Los permisos siguen la estructura: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recurso.acción_scope</code>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Recursos</h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• cases (Casos)</li>
                    <li>• users (Usuarios)</li>
                    <li>• notes (Notas)</li>
                    <li>• todos (TODOs)</li>
                    <li>• config (Configuración)</li>
                    <li>• archive (Archivo)</li>
                    <li>• documentation (Documentación)</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Acciones</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• read (Ver/Leer)</li>
                    <li>• create (Crear)</li>
                    <li>• update (Actualizar)</li>
                    <li>• delete (Eliminar)</li>
                    <li>• admin (Administrar)</li>
                    <li>• export (Exportar)</li>
                    <li>• assign (Asignar)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Scopes</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                    <li>• own (Solo propios)</li>
                    <li>• team (Del equipo)</li>
                    <li>• all (Todos)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 3. Explicación de Scopes */}
          <CollapsibleSection
            title="Entendiendo los Scopes"
            icon={<UserGroupIcon className="w-6 h-6" />}
            isExpanded={expandedSections.scopes}
            onToggle={() => toggleSection('scopes')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">OWN (Propio)</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                    Solo puede acceder a recursos que le pertenecen directamente.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-500">
                    <strong>Ejemplo:</strong> cases.read_own - Solo ve los casos que creó
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">TEAM (Equipo)</h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                    Puede acceder a recursos de su equipo o usuarios subordinados.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-500">
                    <strong>Ejemplo:</strong> cases.read_team - Ve casos de su equipo
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">ALL (Todos)</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                    Acceso completo a todos los recursos del sistema.
                  </p>
                  <div className="text-xs text-red-600 dark:text-red-500">
                    <strong>Ejemplo:</strong> cases.read_all - Ve todos los casos del sistema
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">¡Importante!</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Los scopes son jerárquicos: ALL incluye TEAM y OWN, TEAM incluye OWN.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 4. Módulos del Sistema */}
          <CollapsibleSection
            title="Módulos del Sistema"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            isExpanded={expandedSections.modules}
            onToggle={() => toggleSection('modules')}
          >
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                El sistema está organizado en módulos. Cada módulo tiene sus propios permisos:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Cases (Casos)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gestión de casos legales y expedientes</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• cases.read_own/team/all</li>
                      <li>• cases.create_own/team/all</li>
                      <li>• cases.update_own/team/all</li>
                      <li>• cases.delete_own/team/all</li>
                      <li>• cases.admin_own/team/all</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ TODOs</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tareas y recordatorios</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• todos.read_own/team/all</li>
                      <li>• todos.create_own/team/all</li>
                      <li>• todos.update_own/team/all</li>
                      <li>• todos.assign_own/team/all</li>
                      <li>• todos.control_own/team/all</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Notes (Notas)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notas y anotaciones</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• notes.read_own/team/all</li>
                      <li>• notes.create_own/team/all</li>
                      <li>• notes.update_own/team/all</li>
                      <li>• notes.archive_own/team/all</li>
                      <li>• notes.manage_tags_own/team/all</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">👥 Users (Usuarios)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gestión de usuarios y perfiles</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• users.read_own/team/all</li>
                      <li>• users.create_own/team/all</li>
                      <li>• users.update_own/team/all</li>
                      <li>• users.admin_own/team/all</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ Config (Configuración)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Configuraciones del sistema</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• config.read_own/team/all</li>
                      <li>• config.create_own/team/all</li>
                      <li>• config.update_own/team/all</li>
                      <li>• config.admin_own/team/all</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📚 Documentation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Documentos y archivos</p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>• documentation.read_own/team/all</li>
                      <li>• documentation.create_own/team/all</li>
                      <li>• documentation.publish_own/team/all</li>
                      <li>• documentation.analytics_own/team/all</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 5. Ejemplos de Roles */}
          <CollapsibleSection
            title="Roles Típicos y sus Permisos"
            icon={<KeyIcon className="w-6 h-6" />}
            isExpanded={expandedSections.roles}
            onToggle={() => toggleSection('roles')}
          >
            <div className="space-y-4">
              <RoleExample
                role="Analista Junior"
                description="Usuario básico que puede trabajar con sus propios casos y tareas"
                permissions={[
                  "cases.read_own - Ver solo sus casos",
                  "cases.create_own - Crear casos propios", 
                  "cases.update_own - Actualizar sus casos",
                  "todos.read_own - Ver sus tareas",
                  "notes.create_own - Crear notas propias",
                  "users.read_own - Ver su perfil"
                ]}
                useCase="Para abogados juniors o asistentes que manejan sus propios casos sin supervisar a otros."
              />

              <RoleExample
                role="Supervisor de Equipo"
                description="Puede gestionar recursos de su equipo y supervisar subordinados"
                permissions={[
                  "cases.read_team - Ver casos del equipo",
                  "cases.admin_team - Administrar casos del equipo",
                  "users.read_team - Ver usuarios del equipo",
                  "todos.assign_team - Asignar tareas en el equipo",
                  "notes.read_team - Ver notas del equipo"
                ]}
                useCase="Para jefes de departamento que supervisan un equipo de analistas."
              />

              <RoleExample
                role="Administrador"
                description="Acceso completo a todo el sistema"
                permissions={[
                  "*.read_all - Ver todo en el sistema",
                  "*.admin_all - Administrar todo",
                  "config.admin_all - Configurar sistema",
                  "users.admin_all - Gestionar usuarios",
                  "roles.admin_all - Gestionar roles"
                ]}
                useCase="Para administradores del sistema que necesitan acceso completo."
              />

              <RoleExample
                role="Auditor"
                description="Solo lectura para supervisión y control"
                permissions={[
                  "cases.read_all - Ver todos los casos",
                  "users.read_all - Ver todos los usuarios",
                  "notes.read_all - Ver todas las notas",
                  "archive.view_all - Ver archivo completo"
                ]}
                useCase="Para personal de auditoría que necesita revisar sin modificar."
              />
            </div>
          </CollapsibleSection>

          {/* 6. Ejemplos Prácticos */}
          <CollapsibleSection
            title="Ejemplos de Permisos"
            icon={<CheckCircleIcon className="w-6 h-6" />}
            isExpanded={expandedSections.examples}
            onToggle={() => toggleSection('examples')}
          >
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Aquí tienes ejemplos de permisos específicos y lo que permiten hacer:
              </p>

              <PermissionExample
                name="users.read_own"
                resource="users"
                action="read"
                scope="own"
                description="Permite al usuario ver únicamente su propio perfil"
                example="Un analista puede ver su información personal pero no la de otros usuarios"
              />

              <PermissionExample
                name="cases.admin_team"
                resource="cases"
                action="admin"
                scope="team"
                description="Administración completa de casos del equipo (crear, ver, editar, eliminar, asignar)"
                example="Un supervisor puede gestionar todos los casos de su departamento"
              />

              <PermissionExample
                name="config.read_all"
                resource="config"
                action="read"
                scope="all"
                description="Ver todas las configuraciones del sistema"
                example="Un administrador puede ver todas las configuraciones de todos los módulos"
              />

              <PermissionExample
                name="notes.create_team"
                resource="notes"
                action="create"
                scope="team"
                description="Crear notas para usuarios de su equipo"
                example="Un supervisor puede crear notas relacionadas con cualquier miembro de su equipo"
              />

              <PermissionExample
                name="documentation.publish_all"
                resource="documentation"
                action="publish"
                scope="all"
                description="Publicar cualquier documento en el sistema"
                example="Un administrador puede publicar documentos creados por cualquier usuario"
              />
            </div>
          </CollapsibleSection>

          {/* 7. Mejores Prácticas */}
          <CollapsibleSection
            title="Mejores Prácticas"
            icon={<LightBulbIcon className="w-6 h-6" />}
            isExpanded={expandedSections.best}
            onToggle={() => toggleSection('best')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">✅ Hacer</h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-2">
                    <li>• Usar el principio de menor privilegio</li>
                    <li>• Asignar permisos específicos según el rol</li>
                    <li>• Probar los permisos después de asignar</li>
                    <li>• Documentar los roles personalizados</li>
                    <li>• Revisar permisos periódicamente</li>
                    <li>• Usar scopes apropiados (own/team/all)</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">❌ Evitar</h4>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                    <li>• Dar permisos "all" innecesariamente</li>
                    <li>• Crear roles con permisos excesivos</li>
                    <li>• Olvidar probar los cambios</li>
                    <li>• Asignar permisos administrativos sin justificación</li>
                    <li>• Mezclar permisos funcionales con administrativos</li>
                    <li>• Dejar usuarios con permisos obsoletos</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Consejos Útiles</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                  <li>• <strong>Comienza con permisos básicos:</strong> Asigna solo lo esencial y añade más según necesidad</li>
                  <li>• <strong>Usa filtros:</strong> Utiliza los filtros de la interfaz para encontrar permisos específicos</li>
                  <li>• <strong>Copia roles:</strong> Si necesitas un rol similar, copia uno existente y modifícalo</li>
                  <li>• <strong>Prueba siempre:</strong> Inicia sesión con el usuario para verificar que funciona correctamente</li>
                  <li>• <strong>Documenta cambios:</strong> Mantén registro de por qué se hicieron cambios específicos</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* 8. Resolución de Problemas */}
          <CollapsibleSection
            title="Resolución de Problemas"
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            isExpanded={expandedSections.troubleshoot}
            onToggle={() => toggleSection('troubleshoot')}
          >
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    🚫 "El usuario no puede ver el módulo de Usuarios"
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2"><strong>Problema:</strong> El usuario no ve la sección en el menú</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2"><strong>Solución:</strong> Verificar que tenga al menos <code>users.read_all</code> para ver el módulo administrativo</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500"><strong>Nota:</strong> <code>users.read_own</code> solo permite ver su perfil, no acceder al módulo</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                    ⚠️ "Error de acceso denegado"
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2"><strong>Problema:</strong> El usuario ve el módulo pero recibe error al intentar usarlo</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2"><strong>Solución:</strong> Verificar que tenga permisos de acción específicos (read, create, update, etc.)</p>
                  <p className="text-sm text-red-600 dark:text-red-500"><strong>Tip:</strong> Los permisos de navegación y funcionales son diferentes</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    🔍 "El usuario no ve todos los datos esperados"
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-2"><strong>Problema:</strong> Solo ve algunos registros</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-2"><strong>Solución:</strong> Revisar el scope del permiso:</p>
                  <ul className="text-xs text-blue-600 dark:text-blue-500 list-disc list-inside ml-4">
                    <li><code>own</code> = Solo sus registros</li>
                    <li><code>team</code> = Solo registros de su equipo</li>
                    <li><code>all</code> = Todos los registros</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    🔧 Pasos para Depurar Problemas
                  </h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Verificar que el usuario tenga un rol asignado</li>
                    <li>Confirmar que el rol tenga los permisos necesarios</li>
                    <li>Comprobar que los permisos estén activos</li>
                    <li>Verificar el scope de los permisos</li>
                    <li>Probar iniciar sesión como el usuario</li>
                    <li>Revisar logs del sistema si persiste el problema</li>
                  </ol>
                </div>
              </div>
            </div>
          </CollapsibleSection>

        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};
