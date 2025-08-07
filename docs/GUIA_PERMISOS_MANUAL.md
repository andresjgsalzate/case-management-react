# Guía del Sistema de Permisos - Manual de Usuario

## 📋 Descripción

La **Guía del Sistema de Permisos** es una herramienta educativa integrada en el módulo de asignación de permisos que ayuda a los administradores a entender y configurar correctamente los roles y permisos en el sistema.

## 🚀 Cómo Acceder

1. Navegar a **Gestión de Usuarios > Asignar Permisos a Roles**
2. Hacer clic en el botón **"Guía de Permisos"** (icono de pregunta) en la esquina superior derecha
3. La guía se abrirá como un modal interactivo

## 📚 Contenido de la Guía

La guía está organizada en secciones colapsibles que cubren:

### 1. ¿Qué son los Permisos?
- Introducción conceptual
- Estructura de permisos: Recurso.Acción_Scope
- Ejemplos básicos

### 2. Estructura de los Permisos
- **Recursos**: casos, usuarios, notas, todos, configuración, etc.
- **Acciones**: read, create, update, delete, admin, export, assign
- **Scopes**: own (propio), team (equipo), all (todos)

### 3. Entendiendo los Scopes
- **OWN**: Solo recursos propios del usuario
- **TEAM**: Recursos del equipo o subordinados
- **ALL**: Acceso completo a todos los recursos
- Jerarquía de scopes (ALL > TEAM > OWN)

### 4. Módulos del Sistema
Descripción detallada de cada módulo:
- 📋 Cases (Casos)
- ✅ TODOs (Tareas)
- 📝 Notes (Notas)
- 👥 Users (Usuarios)
- ⚙️ Config (Configuración)
- 📚 Documentation (Documentación)

### 5. Roles Típicos y sus Permisos
Ejemplos de roles comunes:
- **Analista Junior**: Permisos básicos (own)
- **Supervisor de Equipo**: Gestión de equipo (team)
- **Administrador**: Acceso completo (all)
- **Auditor**: Solo lectura amplia

### 6. Ejemplos de Permisos
Casos prácticos específicos con explicaciones:
- `users.read_own`: Solo ver su propio perfil
- `cases.admin_team`: Administrar casos del equipo
- `config.read_all`: Ver todas las configuraciones
- Y más ejemplos contextualizados

### 7. Mejores Prácticas
- ✅ **Hacer**: Principio de menor privilegio, roles específicos, documentación
- ❌ **Evitar**: Permisos excesivos, mezclar funcional con administrativo
- 💡 **Consejos**: Comenzar básico, usar filtros, probar siempre

### 8. Resolución de Problemas
Soluciones a problemas comunes:
- Usuario no ve módulos
- Error de acceso denegado
- No ve todos los datos esperados
- Pasos para depurar problemas

## 🎯 Funcionalidades

### Navegación
- **Secciones Colapsibles**: Cada sección se puede expandir/contraer independientemente
- **Iconos Descriptivos**: Cada sección tiene un icono representativo
- **Índice Visual**: Fácil identificación del contenido

### Diseño Responsive
- Compatible con dispositivos móviles
- Ajuste automático de layout
- Scroll interno para contenido extenso

### Modo Oscuro
- Soporte completo para tema oscuro
- Transiciones suaves entre temas
- Colores optimizados para legibilidad

### Ejemplos Interactivos
- **Tarjetas de Permisos**: Visualización clara de estructura
- **Ejemplos de Roles**: Casos de uso contextualizados
- **Códigos Destacados**: Syntax highlighting para permisos

## 🛠️ Implementación Técnica

### Componente Principal
```typescript
<PermissionsGuide onClose={() => setShowGuide(false)} />
```

### Props
- `onClose`: Función para cerrar la guía

### Estado
```typescript
const [showGuide, setShowGuide] = useState(false);
```

### Integración
```typescript
// Botón para abrir la guía
<Button onClick={() => setShowGuide(true)}>
  Guía de Permisos
</Button>

// Renderizado condicional
{showGuide && <PermissionsGuide onClose={() => setShowGuide(false)} />}
```

## 🎨 Componentes de UI

### CollapsibleSection
Sección expandible/contraíble con:
- Título e icono
- Contenido colapsible
- Estado de expansión
- Indicadores visuales

### PermissionExample
Tarjeta de ejemplo de permiso con:
- Nombre del permiso en código
- Tags de recurso, acción y scope
- Descripción funcional
- Ejemplo de uso práctico

### RoleExample
Ejemplo de rol con:
- Nombre y descripción del rol
- Lista de permisos típicos
- Caso de uso contextualizado
- Diseño diferenciado

## 🚀 Beneficios

### Para Administradores
- **Reducción de Errores**: Mejor comprensión = menos errores de configuración
- **Eficiencia**: Configuración más rápida con ejemplos claros
- **Confianza**: Entendimiento completo del sistema de permisos

### Para el Sistema
- **Seguridad Mejorada**: Configuraciones más precisas y apropiadas
- **Menor Soporte**: Menos consultas por problemas de permisos
- **Adopción**: Facilita el uso correcto del sistema

### Para Usuarios Finales
- **Acceso Apropiado**: Permisos configurados correctamente
- **Experiencia Consistente**: Menos errores de acceso
- **Productividad**: Acceso eficiente a las funciones necesarias

## 📝 Notas de Mantenimiento

### Actualización de Contenido
- La guía debe actualizarse cuando se agreguen nuevos permisos
- Los ejemplos deben reflejar la estructura actual del sistema
- Los roles de ejemplo deben mantenerse relevantes

### Mejoras Futuras
- Búsqueda dentro de la guía
- Enlaces directos a secciones específicas
- Ejemplos interactivos con simulación
- Exportación de la guía como PDF

## 🔧 Personalización

### Agregar Nueva Sección
```typescript
<CollapsibleSection
  title="Nueva Sección"
  icon={<NuevoIcon className="w-6 h-6" />}
  isExpanded={expandedSections.nuevo}
  onToggle={() => toggleSection('nuevo')}
>
  {/* Contenido de la nueva sección */}
</CollapsibleSection>
```

### Modificar Ejemplos
Editar los arrays de ejemplos en el componente para reflejar cambios en el sistema de permisos.

### Styling
La guía utiliza Tailwind CSS y sigue el design system del proyecto para mantener consistencia visual.

---

**Desarrollado para mejorar la experiencia de administración de permisos** 🛡️
