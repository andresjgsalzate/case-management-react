# 🏢 ARQUITECTURA DE PERMISOS POR EQUIPOS

## 📋 **RESUMEN EJECUTIVO**

Este documento describe la arquitectura propuesta para implementar permisos basados en equipos en el Sistema de Gestión de Casos, extendiendo el modelo actual de permisos con scopes (`own`, `team`, `all`) para soportar estructuras organizacionales jerárquicas.

**Estado:** 📋 Propuesta de diseño - No implementado  
**Fecha:** Agosto 2025  
**Versión:** 1.0

---

## 🎯 **MODELO CONCEPTUAL**

### **🔐 Estructura Actual de Permisos**
```
Formato: modulo.accion_scope
Ejemplos:
- cases.read_own     → Solo casos propios
- cases.read_team    → Casos del equipo  
- cases.read_all     → Todos los casos
```

### **👥 Ejemplo de Organización**
```
📊 EMPRESA
├── 🏢 Departamento Legal
│   ├── 👨‍💼 Supervisor Legal (María)
│   │   └── Permisos: cases.read_team, cases.update_team
│   ├── 👤 Analista Senior (Juan)
│   │   └── Permisos: cases.read_own, cases.update_own
│   ├── 👤 Analista Junior (Ana)
│   │   └── Permisos: cases.read_own
│   └── 👤 Asistente (Pedro)
│       └── Permisos: cases.read_own
│
└── 🏢 Departamento Técnico
    ├── 👨‍💼 Supervisor Técnico (Carlos)
    │   └── Permisos: cases.read_team, todos.read_team
    ├── 👤 Desarrollador Senior (Luis)
    │   └── Permisos: cases.read_own, todos.update_own
    └── 👤 Desarrollador Junior (Sofia)
        └── Permisos: cases.read_own
```

### **🔍 Comportamiento de Scopes**

| Scope | Usuario | Acceso | Descripción |
|-------|---------|---------|-------------|
| `own` | Ana | ✅ Solo sus casos | Ve únicamente casos asignados/creados por ella |
| `team` | María | ✅ Todo el Dept. Legal | Ve casos de María, Juan, Ana, Pedro |
| `all` | Admin | ✅ Toda la empresa | Ve casos de todos los departamentos |

---

## 🏗️ **ARQUITECTURA DE BASE DE DATOS**

### **1. 📊 Nuevas Tablas**

#### **Tabla: `teams`**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,        -- "Departamento Legal"
  description TEXT,
  code VARCHAR(20) UNIQUE,                  -- "LEGAL", "TECH"
  parent_team_id UUID REFERENCES teams(id), -- Para jerarquías anidadas
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Índices para performance
CREATE INDEX idx_teams_parent ON teams(parent_team_id);
CREATE INDEX idx_teams_active ON teams(is_active);
```

#### **Tabla: `team_hierarchy`**
```sql
-- Para jerarquías complejas y consultas optimizadas
CREATE TABLE team_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ancestor_team_id UUID REFERENCES teams(id),   -- Equipo padre
  descendant_team_id UUID REFERENCES teams(id), -- Equipo hijo
  hierarchy_level INTEGER NOT NULL,             -- 0=mismo, 1=directo, 2=sub-equipo
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(ancestor_team_id, descendant_team_id)
);

-- Índices para consultas jerárquicas
CREATE INDEX idx_hierarchy_ancestor ON team_hierarchy(ancestor_team_id);
CREATE INDEX idx_hierarchy_descendant ON team_hierarchy(descendant_team_id);
CREATE INDEX idx_hierarchy_level ON team_hierarchy(hierarchy_level);
```

### **2. 🔄 Modificaciones a Tablas Existentes**

#### **Extensión: `user_profiles`**
```sql
-- Agregar campos de equipo
ALTER TABLE user_profiles 
ADD COLUMN team_id UUID REFERENCES teams(id),
ADD COLUMN is_team_leader BOOLEAN DEFAULT false,
ADD COLUMN team_role VARCHAR(50),              -- "supervisor", "senior", "junior"
ADD COLUMN team_join_date DATE DEFAULT CURRENT_DATE;

-- Índices
CREATE INDEX idx_user_profiles_team ON user_profiles(team_id);
CREATE INDEX idx_user_profiles_leader ON user_profiles(is_team_leader);
```

#### **Extensión: `cases` (opcional)**
```sql
-- Para optimizar consultas de team
ALTER TABLE cases 
ADD COLUMN assigned_team_id UUID REFERENCES teams(id);

CREATE INDEX idx_cases_assigned_team ON cases(assigned_team_id);
```

### **3. 🔐 Funciones de Base de Datos**

#### **Función: Obtener Miembros del Equipo**
```sql
CREATE OR REPLACE FUNCTION get_team_members(user_id UUID)
RETURNS TABLE(member_id UUID) AS $$
BEGIN
  RETURN QUERY
  WITH user_team AS (
    SELECT team_id, is_team_leader 
    FROM user_profiles 
    WHERE id = user_id
  )
  SELECT up.id
  FROM user_profiles up
  JOIN user_team ut ON (
    -- Miembros del mismo equipo
    up.team_id = ut.team_id OR
    
    -- Si es líder, incluir subordinados
    (ut.is_team_leader AND up.team_id IN (
      SELECT th.descendant_team_id 
      FROM team_hierarchy th 
      WHERE th.ancestor_team_id = ut.team_id
        AND th.hierarchy_level <= 2  -- Máximo 2 niveles
    ))
  )
  WHERE up.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Función: Verificar Permisos de Equipo**
```sql
CREATE OR REPLACE FUNCTION user_can_access_team_resource(
  user_id UUID,
  resource_owner_id UUID,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
  team_members UUID[];
BEGIN
  -- Verificar si tiene el permiso
  SELECT user_has_permission(user_id, permission_name) INTO has_permission;
  
  IF NOT has_permission THEN
    RETURN FALSE;
  END IF;
  
  -- Si el permiso termina en '_own', solo acceso propio
  IF permission_name LIKE '%_own' THEN
    RETURN user_id = resource_owner_id;
  END IF;
  
  -- Si el permiso termina en '_team', verificar equipo
  IF permission_name LIKE '%_team' THEN
    SELECT ARRAY(SELECT member_id FROM get_team_members(user_id)) INTO team_members;
    RETURN resource_owner_id = ANY(team_members);
  END IF;
  
  -- Si el permiso termina en '_all', acceso total
  IF permission_name LIKE '%_all' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔒 **ROW LEVEL SECURITY (RLS)**

### **Políticas para Casos**
```sql
-- Política de lectura con soporte de equipos
DROP POLICY IF EXISTS "users_can_read_cases" ON cases;
CREATE POLICY "users_can_read_cases" ON cases
FOR SELECT USING (
  user_can_access_team_resource(
    auth.uid(), 
    COALESCE(assigned_user_id, created_by), 
    'cases.read_own'
  ) OR
  user_can_access_team_resource(
    auth.uid(), 
    COALESCE(assigned_user_id, created_by), 
    'cases.read_team'  
  ) OR
  user_has_permission(auth.uid(), 'cases.read_all')
);

-- Política de actualización con soporte de equipos
DROP POLICY IF EXISTS "users_can_update_cases" ON cases;
CREATE POLICY "users_can_update_cases" ON cases
FOR UPDATE USING (
  user_can_access_team_resource(
    auth.uid(), 
    COALESCE(assigned_user_id, created_by), 
    'cases.update_own'
  ) OR
  user_can_access_team_resource(
    auth.uid(), 
    COALESCE(assigned_user_id, created_by), 
    'cases.update_team'
  ) OR
  user_has_permission(auth.uid(), 'cases.update_all')
);
```

### **Políticas para TODOs**
```sql
CREATE POLICY "users_can_read_team_todos" ON todos
FOR SELECT USING (
  user_can_access_team_resource(auth.uid(), assigned_to, 'todos.read_own') OR
  user_can_access_team_resource(auth.uid(), assigned_to, 'todos.read_team') OR
  user_has_permission(auth.uid(), 'todos.read_all')
);
```

---

## 💻 **IMPLEMENTACIÓN FRONTEND**

### **1. 🔧 Hooks y Servicios**

#### **Hook: `useTeamPermissions`**
```typescript
// src/shared/hooks/useTeamPermissions.ts
export const useTeamPermissions = () => {
  const { hasPermission } = useAdminPermissions();
  const { data: userProfile } = useUserProfile();

  return useMemo(() => ({
    // Gestión de equipos
    canManageTeams: hasPermission('teams.admin_all'),
    canViewTeams: hasPermission('teams.read_all') || hasPermission('teams.read_team'),
    canCreateTeams: hasPermission('teams.create_all'),
    
    // Gestión de miembros
    canManageTeamMembers: hasPermission('teams.manage_members_all') || 
                         (hasPermission('teams.manage_members_team') && userProfile?.is_team_leader),
    canViewTeamMembers: hasPermission('teams.read_members_team'),
    
    // Asignaciones
    canAssignToTeam: hasPermission('teams.assign_all') || 
                    (hasPermission('teams.assign_team') && userProfile?.is_team_leader),
    
    // Información del equipo actual
    currentTeam: userProfile?.team,
    isTeamLeader: userProfile?.is_team_leader,
    teamMembers: [], // Se populará con query
    subordinateTeams: [] // Se populará con query
  }), [hasPermission, userProfile]);
};
```

#### **Hook: `useTeamHierarchy`**
```typescript
// src/shared/hooks/useTeamHierarchy.ts
export const useTeamHierarchy = () => {
  const { data: teams } = useQuery({
    queryKey: ['teams', 'hierarchy'],
    queryFn: async () => {
      const { data } = await supabase
        .from('teams')
        .select(`
          *,
          parent_team:parent_team_id(id, name),
          child_teams:teams!parent_team_id(id, name),
          members:user_profiles(id, full_name, is_team_leader)
        `)
        .eq('is_active', true);
      return data;
    }
  });

  const getTeamHierarchy = useCallback(() => {
    // Construir árbol jerárquico
    return buildTeamTree(teams || []);
  }, [teams]);

  const getTeamMembers = useCallback((teamId: string) => {
    return teams?.find(t => t.id === teamId)?.members || [];
  }, [teams]);

  const getSubordinateTeams = useCallback((teamId: string) => {
    return teams?.filter(t => t.parent_team_id === teamId) || [];
  }, [teams]);

  return {
    teams,
    getTeamHierarchy,
    getTeamMembers,
    getSubordinateTeams
  };
};
```

### **2. 🎛️ Componentes de Administración**

#### **Página: Gestión de Equipos**
```typescript
// src/user-management/pages/admin/TeamsPage.tsx
export const TeamsPage: React.FC = () => {
  const { canManageTeams, canViewTeams } = useTeamPermissions();
  const { teams, getTeamHierarchy } = useTeamHierarchy();
  
  if (!canViewTeams) {
    return <AccessDenied message="No tienes permisos para ver equipos" />;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <Header 
          title="Gestión de Equipos"
          actions={canManageTeams && (
            <Button onClick={() => setShowCreateModal(true)}>
              + Crear Equipo
            </Button>
          )}
        />
        
        <TeamHierarchyTree 
          teams={getTeamHierarchy()}
          onEdit={canManageTeams ? handleEdit : undefined}
          onDelete={canManageTeams ? handleDelete : undefined}
        />
      </div>
    </PageWrapper>
  );
};
```

#### **Componente: Árbol de Equipos**
```typescript
// src/shared/components/teams/TeamHierarchyTree.tsx
interface TeamHierarchyTreeProps {
  teams: TeamNode[];
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export const TeamHierarchyTree: React.FC<TeamHierarchyTreeProps> = ({
  teams, onEdit, onDelete
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {teams.map(team => (
        <TeamNode 
          key={team.id}
          team={team}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```

### **3. 🔄 Actualización de Permisos Existentes**

#### **Extensión: `useCasesPermissions`**
```typescript
// Agregar funciones de equipo
export const useCasesPermissions = () => {
  const adminPermissions = useAdminPermissions();
  const { data: userProfile } = useUserProfile();
  const { getTeamMembers } = useTeamHierarchy();

  const permissions = useMemo(() => {
    // ... permisos existentes ...
    
    // Nuevas funciones de equipo
    getTeamScope(): 'all' | 'team' | 'own' | null {
      if (adminPermissions.hasPermission('cases.read_all')) return 'all';
      if (adminPermissions.hasPermission('cases.read_team')) return 'team';
      if (adminPermissions.hasPermission('cases.read_own')) return 'own';
      return null;
    },
    
    canAccessCase(caseOwnerId: string): boolean {
      const scope = this.getTeamScope();
      
      switch (scope) {
        case 'own':
          return caseOwnerId === userProfile?.id;
        case 'team':
          const teamMembers = getTeamMembers(userProfile?.team_id || '');
          return teamMembers.some(member => member.id === caseOwnerId);
        case 'all':
          return true;
        default:
          return false;
      }
    },
    
    getAccessibleUsers(): string[] {
      const scope = this.getTeamScope();
      
      switch (scope) {
        case 'own':
          return [userProfile?.id || ''];
        case 'team':
          return getTeamMembers(userProfile?.team_id || '').map(m => m.id);
        case 'all':
          return []; // Query sin filtro
        default:
          return [];
      }
    }
  }, [adminPermissions, userProfile, getTeamMembers]);

  return permissions;
};
```

---

## 📊 **FLUJOS DE TRABAJO**

### **🎯 Escenario 1: Supervisor Revisando Casos**

**Usuario:** María (Supervisor Legal)  
**Permisos:** `cases.read_team`, `cases.update_team`  
**Acción:** Navega a `/cases`

```typescript
// Flujo interno del sistema:
1. useUserProfile() → { team_id: "legal_dept", is_team_leader: true }
2. useCasesPermissions() → { getTeamScope: () => "team" }
3. get_team_members("legal_dept") → [maría_id, juan_id, ana_id, pedro_id]
4. RLS aplica filtro: WHERE created_by IN (maría_id, juan_id, ana_id, pedro_id)
5. María ve: Todos los casos del departamento legal
```

### **🎯 Escenario 2: Analista Trabajando**

**Usuario:** Ana (Analista Junior)  
**Permisos:** `cases.read_own`  
**Acción:** Navega a `/cases`

```typescript
// Flujo interno del sistema:
1. useUserProfile() → { team_id: "legal_dept", is_team_leader: false }
2. useCasesPermissions() → { getTeamScope: () => "own" }
3. RLS aplica filtro: WHERE created_by = ana_id
4. Ana ve: Solo sus casos asignados
```

### **🎯 Escenario 3: Dashboard con Métricas de Equipo**

**Usuario:** María (Supervisor Legal)  
**Vista:** Dashboard con métricas del equipo

```typescript
// Componente Dashboard
const teamMetrics = useDashboardMetrics({
  scope: 'team',
  teamId: userProfile?.team_id
});

// Muestra:
- Total casos del equipo: 45
- Casos por miembro: Juan(15), Ana(12), Pedro(8), María(10)
- Tiempo promedio del equipo: 2.5 horas/caso
- Estados: Pendientes(12), En progreso(18), Completados(15)
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **📅 Fase 1: Fundación (2-3 semanas)**
- [ ] **Base de datos:** Crear tablas teams, team_hierarchy
- [ ] **RLS:** Actualizar políticas con funciones de equipo
- [ ] **Backend:** Funciones SQL para manejo de equipos
- [ ] **Testing:** Pruebas unitarias de funciones de base

### **📅 Fase 2: Hooks y Servicios (2 semanas)**
- [ ] **Frontend:** Hooks useTeamPermissions, useTeamHierarchy
- [ ] **Permisos:** Extender hooks existentes con lógica de equipo
- [ ] **Testing:** Pruebas de integración de permisos
- [ ] **Documentación:** API docs para nuevos hooks

### **📅 Fase 3: Interfaz de Administración (3 semanas)**
- [ ] **UI:** Páginas de gestión de equipos
- [ ] **Componentes:** TeamHierarchyTree, TeamMembersList
- [ ] **Formularios:** Crear/editar equipos y asignaciones
- [ ] **Validaciones:** Reglas de negocio para jerarquías

### **📅 Fase 4: Integración y Optimización (2 semanas)**
- [ ] **Dashboard:** Métricas por equipo
- [ ] **Filtros:** Aplicar filtros automáticos por scope
- [ ] **Performance:** Optimizar queries de jerarquías
- [ ] **UX:** Mejorar indicadores visuales de scope

### **📅 Fase 5: Testing y Despliegue (1 semana)**
- [ ] **QA:** Pruebas end-to-end de escenarios completos
- [ ] **Migración:** Scripts de migración para datos existentes
- [ ] **Documentación:** Manual de usuario para administradores
- [ ] **Despliegue:** Release gradual con feature flags

---

## ⚡ **BENEFICIOS ESPERADOS**

### **🎯 Organizacionales**
- **✅ Jerarquía clara:** Supervisores supervisan, analistas ejecutan
- **✅ Aislamiento departamental:** Cada equipo ve solo su trabajo
- **✅ Escalabilidad:** Fácil agregar equipos sin afectar permisos existentes
- **✅ Delegación:** Líderes pueden gestionar su equipo independientemente

### **🔒 Seguridad**
- **✅ Principio de menor privilegio:** Acceso mínimo necesario
- **✅ Auditoría granular:** Trazabilidad por equipo y jerarquía
- **✅ Flexibilidad:** Permisos específicos por rol dentro del equipo
- **✅ Consistencia:** Mismo modelo aplicado a todos los módulos

### **👤 Experiencia de Usuario**
- **✅ Contexto relevante:** Dashboard y métricas del ámbito de trabajo
- **✅ Filtros automáticos:** Sin configuración manual de alcance
- **✅ Navegación intuitiva:** Menú adaptado al scope de permisos
- **✅ Performance mejorada:** Queries optimizadas por equipo

---

## 🚨 **CONSIDERACIONES Y RIESGOS**

### **⚠️ Complejidad**
- **Riesgo:** Incremento significativo en complejidad de queries
- **Mitigación:** Funciones SQL optimizadas, índices estratégicos
- **Monitoreo:** Métricas de performance de queries por equipo

### **⚠️ Migración de Datos**
- **Riesgo:** Usuarios existentes sin asignación de equipo
- **Mitigación:** Equipo "General" por defecto, migración gradual
- **Plan B:** Mantener compatibilidad con usuarios sin equipo

### **⚠️ UX Complexity**
- **Riesgo:** Confusión sobre scope de permisos
- **Mitigación:** Indicadores visuales claros, tooltips explicativos
- **Feedback:** Beta testing con usuarios reales

### **⚠️ Performance**
- **Riesgo:** Queries de jerarquías pueden ser lentas
- **Mitigación:** Caché de jerarquías, materialización de vistas
- **Escalabilidad:** Límites en profundidad de jerarquías (max 3 niveles)

---

## 📚 **RECURSOS ADICIONALES**

### **🔗 Referencias**
- [PostgreSQL Recursive Queries](https://www.postgresql.org/docs/current/queries-with.html)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query Team Management](https://tanstack.com/query/latest)

### **📖 Documentos Relacionados**
- `PERMISSIONS_ARCHITECTURE.md` - Arquitectura actual de permisos
- `DATABASE_SCHEMA.md` - Esquema actual de base de datos
- `API_DOCUMENTATION.md` - APIs existentes del sistema

### **🛠️ Herramientas de Desarrollo**
- **Testing:** Jest + React Testing Library
- **DB Migrations:** Supabase CLI
- **Performance:** PostgreSQL EXPLAIN ANALYZE
- **Monitoring:** Supabase Dashboard + Custom metrics

---

**📝 Notas del Documento:**
- Este es un diseño propuesto, no una implementación final
- Los tiempos estimados son aproximados y pueden variar
- Se recomienda validación con stakeholders antes de implementar
- Considerar feature flags para rollout gradual

**📞 Contacto:**
- Documento creado: Agosto 2025
- Última actualización: Agosto 5, 2025
- Versión: 1.0
- Estado: 📋 Propuesta de diseño
