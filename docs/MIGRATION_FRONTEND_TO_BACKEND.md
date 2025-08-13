# 🎯 Servicios a Migrar del Frontend al Backend AWS

## 🔴 **ALTA PRIORIDAD - Migrar Inmediatamente**

### 1. **Sistema de Autenticación y Permisos**
```typescript
// ACTUAL: Frontend (src/shared/hooks/useAdminPermissions.ts)
// MIGRAR A: Backend Lambda + Cognito

// Backend Service
export class PermissionService {
  async validateUserPermissions(userId: string, resource: string, action: string): Promise<boolean> {
    // Implementar validación en backend
    // Reemplazar todas las validaciones del frontend
  }
  
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Centralizar permisos en backend
  }
}

// Frontend: Solo cachear y usar
const { permissions } = useQuery(['user-permissions'], 
  () => apiClient.get('/auth/permissions')
);
```

### 2. **Lógica de Casos (Case Management)**
```typescript
// MIGRAR: src/case-management/hooks/useCases.ts
// A: Backend Lambda

// Backend Service
export class CaseService {
  async createCase(caseData: CaseFormData, userId: string): Promise<Case> {
    // Validaciones de negocio
    const puntuacion = this.calcularPuntuacion(caseData);
    const clasificacion = this.clasificarCaso(puntuacion);
    
    // Verificar permisos en backend
    const canCreate = await this.permissionService.validatePermission(
      userId, 'cases', 'create'
    );
    
    if (!canCreate) throw new UnauthorizedError();
    
    // Guardar en RDS
    return await this.caseRepository.create({
      ...caseData,
      puntuacion,
      clasificacion,
      userId
    });
  }

  async getCases(userId: string, filters?: CaseFilters): Promise<Case[]> {
    // Aplicar filtros de permisos en SQL
    const userScope = await this.getUserScope(userId);
    return await this.caseRepository.getByUserScope(userScope, filters);
  }
}
```

### 3. **Control de Tiempo (Time Control)**
```typescript
// MIGRAR: src/time-control/hooks/useCaseControl.ts
// A: Backend con validaciones estrictas

// Backend Service
export class TimeControlService {
  async startTimer(userId: string, caseId: string): Promise<TimeEntry> {
    // Validar que no hay timer activo
    const activeTimer = await this.getActiveTimer(userId);
    if (activeTimer) throw new Error('Ya hay un timer activo');
    
    // Validar permisos del caso
    const canControl = await this.permissionService.validateCaseAccess(
      userId, caseId, 'timer'
    );
    
    if (!canControl) throw new UnauthorizedError();
    
    return await this.timeRepository.startTimer(userId, caseId);
  }

  async calculateMetrics(userId: string, period: string): Promise<TimeMetrics> {
    // Cálculos complejos en backend
    const userScope = await this.getUserScope(userId);
    return await this.analyticsService.calculateTimeMetrics(userScope, period);
  }
}
```

### 4. **Sistema de Archivos**
```typescript
// MIGRAR: src/shared/services/StorageService.ts
// A: S3 con pre-signed URLs

// Backend Service
export class DocumentService {
  async getUploadUrl(fileName: string, userId: string): Promise<PresignedUrl> {
    // Validar permisos
    const canUpload = await this.permissionService.validatePermission(
      userId, 'documents', 'create'
    );
    
    if (!canUpload) throw new UnauthorizedError();
    
    // Generar URL firmada para S3
    return await this.s3Service.generatePresignedUrl(fileName);
  }

  async processUploadedFile(fileKey: string, metadata: FileMetadata): Promise<Document> {
    // Procesar archivo después del upload
    // Generar thumbnails, extraer texto, etc.
    return await this.documentRepository.create(metadata);
  }
}
```

## 🟡 **MEDIA PRIORIDAD - Migrar en Fase 2**

### 5. **Disposiciones y Scripts**
```typescript
// MIGRAR: src/disposicion-scripts/hooks/useDisposicionScripts.ts
// A: Backend con validaciones y cálculos

export class DisposicionService {
  async createDisposicion(data: DisposicionFormData, userId: string): Promise<Disposicion> {
    // Validaciones de negocio complejas
    // Cálculos de disposiciones mensuales
  }
  
  async generateMonthlyReport(year: number, month: number): Promise<DisposicionReport> {
    // Generar reportes en backend
  }
}
```

### 6. **Sistema de Tareas (TODOs)**
```typescript
// MIGRAR: src/task-management/hooks/useTodos.ts
// A: Backend con notificaciones

export class TaskService {
  async createTask(taskData: TaskFormData, userId: string): Promise<Task> {
    // Crear tarea y configurar notificaciones
    const task = await this.taskRepository.create(taskData);
    
    // Enviar notificaciones
    await this.notificationService.sendTaskNotification(task);
    
    return task;
  }
}
```

### 7. **Analytics y Dashboard**
```typescript
// MIGRAR: src/dashboard-analytics/hooks/useDashboardMetrics.ts
// A: Backend con caching

export class AnalyticsService {
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    // Cálculos pesados en backend
    // Cache con Redis
    const cacheKey = `dashboard:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) return cached;
    
    const metrics = await this.calculateMetrics(userId);
    await this.cacheService.set(cacheKey, metrics, 300); // 5 min cache
    
    return metrics;
  }
}
```

## 🟢 **BAJA PRIORIDAD - Mantener en Frontend Inicialmente**

### 8. **Validaciones de Formularios**
```typescript
// MANTENER: Validaciones básicas en frontend con Zod
// DUPLICAR: Validaciones críticas en backend
```

### 9. **Estado de UI**
```typescript
// MANTENER: Zustand stores para estado local
// src/stores/* - Estados de UI, filtros, etc.
```

### 10. **Componentes de UI**
```typescript
// MANTENER: Todo el sistema de componentes React
// Solo cambiar las llamadas de API
```

## 🔧 **ESTRUCTURA BACKEND RECOMENDADA**

### API Gateway Routes
```typescript
// cases/
POST   /api/cases                    # CaseService.createCase
GET    /api/cases                    # CaseService.getCases
GET    /api/cases/:id               # CaseService.getCaseById
PUT    /api/cases/:id               # CaseService.updateCase
DELETE /api/cases/:id               # CaseService.deleteCase

// time-control/
POST   /api/time-control/start      # TimeControlService.startTimer
POST   /api/time-control/stop       # TimeControlService.stopTimer
GET    /api/time-control/active     # TimeControlService.getActiveTimer
GET    /api/time-control/entries    # TimeControlService.getTimeEntries

// auth/
POST   /api/auth/login              # AuthService.login
POST   /api/auth/refresh            # AuthService.refreshToken
GET    /api/auth/permissions        # AuthService.getUserPermissions
POST   /api/auth/logout             # AuthService.logout

// documents/
POST   /api/documents/upload-url    # DocumentService.getUploadUrl
POST   /api/documents/process       # DocumentService.processUploadedFile
GET    /api/documents/:id          # DocumentService.getDocument
```

### Middleware Stack
```typescript
// Cada Lambda tendrá este middleware stack:
1. CORS Handler
2. Authentication (JWT/Cognito)
3. Authorization (Permisos)
4. Request Validation
5. Business Logic
6. Response Formatting
7. Error Handling
8. Logging
```

## 📊 **IMPACTO EN EL FRONTEND**

### Cambios en el Frontend
```typescript
// ANTES: Lógica en hooks
const { mutate: createCase } = useMutation({
  mutationFn: async (data) => {
    // Validaciones complejas aquí
    const puntuacion = calcularPuntuacion(data);
    const clasificacion = clasificarCaso(puntuacion);
    
    return supabase.from('cases').insert({
      ...data,
      puntuacion,
      clasificacion
    });
  }
});

// DESPUÉS: Solo llamadas de API
const { mutate: createCase } = useMutation({
  mutationFn: (data) => apiClient.post('/api/cases', data)
});
```

### Nuevo Cliente API
```typescript
// src/shared/lib/apiClient.ts
export class ApiClient {
  async post<T>(url: string, data: any): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    
    return response.json();
  }
}
```

## 🚀 **PLAN DE MIGRACIÓN GRADUAL**

### Semana 1-2: Backend Base
- ✅ Configurar infraestructura AWS (RDS, Lambda, API Gateway)
- ✅ Implementar sistema de autenticación con Cognito
- ✅ Migrar sistema de permisos

### Semana 3-4: Servicios Core
- ✅ Migrar CaseService (CRUD de casos)
- ✅ Migrar TimeControlService (control de tiempo)
- ✅ Migrar DocumentService (gestión de archivos)

### Semana 5-6: Servicios Secundarios
- ✅ Migrar DisposicionService
- ✅ Migrar TaskService
- ✅ Migrar AnalyticsService

### Semana 7-8: Testing y Deploy
- ✅ Actualizar frontend para usar nuevas APIs
- ✅ Testing exhaustivo
- ✅ Migración de datos
- ✅ Go-live

¿Te gustaría que profundicemos en algún servicio específico o prefieres que creemos la estructura completa del backend?
