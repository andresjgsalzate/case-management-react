// Tipos para el sistema de casos
export interface Case {
  id: string;
  numeroCaso: string;
  descripcion: string;
  fecha: string;
  origenId?: string;
  aplicacionId?: string;
  historialCaso: number;
  conocimientoModulo: number;
  manipulacionDatos: number;
  claridadDescripcion: number;
  causaFallo: number;
  puntuacion: number;
  clasificacion: CaseComplexity;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  // Relaciones pobladas
  origen?: Origen;
  aplicacion?: Aplicacion;
}

// Tipos para roles y permisos
export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  permissions?: Permission[];
  userCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  // Relaciones
  role?: Role;
  permission?: Permission;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  roleId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  role?: Role;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Origen {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Aplicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CaseComplexity = 'Baja Complejidad' | 'Media Complejidad' | 'Alta Complejidad';

// Tipos para formularios
export interface CaseFormData {
  numeroCaso: string;
  descripcion: string;
  fecha: string;
  origenId?: string;
  aplicacionId?: string;
  historialCaso: number;
  conocimientoModulo: number;
  manipulacionDatos: number;
  claridadDescripcion: number;
  causaFallo: number;
}

export interface CaseFilters {
  fecha?: string;
  clasificacion?: CaseComplexity;
  origenId?: string;
  aplicacionId?: string;
  busqueda?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  isActive: boolean;
  permissionIds: string[];
}

export interface PermissionFormData {
  name: string;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
}

export interface UserFormData {
  email: string;
  fullName?: string;
  roleId: string;
  isActive: boolean;
}

export interface OrigenFormData {
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface AplicacionFormData {
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// Opciones para los select
export interface SelectOption {
  value: number;
  label: string;
}

export const HISTORIAL_CASO_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Error conocido y solucionado previamente' },
  { value: 2, label: 'Error recurrente, no solucionado' },
  { value: 3, label: 'Error desconocido, no solucionado' },
];

export const CONOCIMIENTO_MODULO_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Conoce módulo y función puntual' },
  { value: 2, label: 'Conoce módulo, requiere capacitación' },
  { value: 3, label: 'Desconoce módulo, requiere capacitación' },
];

export const MANIPULACION_DATOS_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Mínima o no necesaria' },
  { value: 2, label: 'Intensiva, sin replicar lógica' },
  { value: 3, label: 'Extremadamente compleja, replicar lógica' },
];

export const CLARIDAD_DESCRIPCION_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Descripción clara y precisa' },
  { value: 2, label: 'Descripción ambigua o poco clara' },
  { value: 3, label: 'Descripción confusa o inexacta' },
];

export const CAUSA_FALLO_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Error operativo, fácil solución' },
  { value: 2, label: 'Falla puntual, requiere pruebas' },
  { value: 3, label: 'Falla compleja, pruebas adicionales' },
];

// ====================================
// TIPOS PARA CONTROL DE CASOS
// ====================================

export interface CaseStatusControl {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para entradas de tiempo
export interface TimeEntry {
  id: string;
  caseControlId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  entryType: 'automatic' | 'manual';
  description?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relación poblada
  user?: UserProfile;
}

export interface ManualTimeEntry {
  id: string;
  caseControlId: string;
  userId: string;
  date: string;
  durationMinutes: number;
  description: string;
  createdAt: string;
  createdBy: string;
  
  // Relaciones pobladas
  user?: UserProfile;
  creator?: UserProfile;
}

export interface CaseControl {
  id: string;
  caseId: string;
  userId: string;
  statusId: string;
  
  // Tiempos
  totalTimeMinutes: number;
  timerStartAt?: string;
  isTimerActive: boolean;
  
  // Metadatos
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones pobladas
  case?: Case;
  user?: UserProfile;
  status?: CaseStatusControl;
  timeEntries?: TimeEntry[];
  manualTimeEntries?: ManualTimeEntry[];
}

// Tipo para la vista detallada de case_control_detailed
export interface CaseControlDetailed {
  id: string;
  case_id: string;
  user_id: string;
  status_id: string;
  total_time_minutes: number;
  timer_start_at?: string;
  is_timer_active: boolean;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Información del usuario asignado (desde la vista)
  assigned_user_name?: string;
  assigned_user_email?: string;
  
  // Información del caso (desde la vista)
  case_number?: string;
  case_description?: string;
  case_classification?: string;
  case_score?: number;
  
  // Información de la aplicación (desde la vista)
  application_name?: string;
  application_description?: string;
  
  // Información del estado (desde la vista)
  status_name?: string;
  status_description?: string;
  status_color?: string;
}

// ====================================
// TIPOS PARA REPORTES Y ESTADÍSTICAS
// ====================================

export interface TimeReportData {
  date: string;
  totalMinutes: number;
  caseCount: number;
  entries: {
    caseId: string;
    caseNumber: string;
    totalMinutes: number;
    status: string;
    user: string;
  }[];
}

export interface CaseControlStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalTimeMinutes: number;
  averageTimePerCase: number;
  
  // Por estado
  byStatus: {
    [statusName: string]: {
      count: number;
      totalMinutes: number;
    };
  };
  
  // Por usuario
  byUser: {
    userId: string;
    userName: string;
    caseCount: number;
    totalMinutes: number;
  }[];
  
  // Por día (últimos 30 días)
  dailyStats: {
    date: string;
    caseCount: number;
    totalMinutes: number;
  }[];
}

export interface UserTimeStats {
  userId: string;
  userName: string;
  totalMinutes: number;
  caseCount: number;
  averageTimePerCase: number;
  activeCases: number;
  completedCases: number;
}

// ====================================
// TIPOS PARA FORMULARIOS
// ====================================

export interface StartCaseControlForm {
  caseId: string;
  userId?: string; // Si no se especifica, usa el usuario actual
  statusId?: string; // Si no se especifica, usa PENDIENTE
}

export interface UpdateCaseStatusForm {
  statusId: string;
}

export interface AddManualTimeForm {
  date: string;
  durationMinutes: number;
  description: string;
}

export interface TimeReportFilters {
  startDate: string;
  endDate: string;
  userId?: string;
  statusId?: string;
  caseId?: string;
}

// ====================================
// ENUMS Y CONSTANTES
// ====================================

export const CASE_CONTROL_STATUS = {
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'EN CURSO',
  ESCALADA: 'ESCALADA',
  TERMINADA: 'TERMINADA'
} as const;

export type CaseControlStatusType = typeof CASE_CONTROL_STATUS[keyof typeof CASE_CONTROL_STATUS];

export const TIME_ENTRY_TYPE = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual'
} as const;

export type TimeEntryType = typeof TIME_ENTRY_TYPE[keyof typeof TIME_ENTRY_TYPE];

// =============================================
// TIPOS PARA MÓDULO TODO
// =============================================

export interface TodoPriority {
  id: string;
  name: string;
  description?: string;
  color: string;
  level: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  priorityId: string;
  assignedUserId?: string;
  estimatedMinutes?: number;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones pobladas
  priority?: TodoPriority;
  assignedUser?: UserProfile;
  createdByUser?: UserProfile;
  control?: TodoControl;
}

export interface TodoControl {
  id: string;
  todoId: string;
  userId: string;
  statusId: string;
  totalTimeMinutes: number;
  timerStartAt?: string;
  isTimerActive: boolean;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones pobladas
  user?: UserProfile;
  status?: CaseStatusControl;
  todo?: TodoItem;
  timeEntries?: TodoTimeEntry[];
  manualTimeEntries?: TodoManualTimeEntry[];
}

export interface TodoTimeEntry {
  id: string;
  todoControlId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  entryType: 'automatic' | 'manual';
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones pobladas
  user?: UserProfile;
  todoControl?: TodoControl;
}

export interface TodoManualTimeEntry {
  id: string;
  todoControlId: string;
  userId: string;
  date: string;
  durationMinutes: number;
  description: string;
  createdAt: string;
  createdBy: string;
  // Relaciones pobladas
  user?: UserProfile;
  createdByUser?: UserProfile;
  todoControl?: TodoControl;
}

// Tipos para formularios TODO
export interface CreateTodoData {
  title: string;
  description?: string;
  priorityId: string;
  assignedUserId: string;
  estimatedMinutes?: number;
  dueDate?: string;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  id: string;
}

export interface TodoControlUpdate {
  statusId?: string;
  totalTimeMinutes?: number;
  isTimerActive?: boolean;
  timerStartAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateTodoTimeEntryData {
  todoControlId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  entryType: 'automatic' | 'manual';
  description?: string;
}

export interface CreateTodoManualTimeEntryData {
  todoControlId: string;
  userId: string;
  date: string;
  durationMinutes: number;
  description: string;
}

// Tipos para filtros y búsquedas TODO
export interface TodoFilters {
  priorityId?: string;
  assignedUserId?: string;
  statusId?: string;
  createdBy?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

// Tipos para métricas del dashboard TODO
export interface TodoMetrics {
  totalTodos: number;
  pendingTodos: number;
  inProgressTodos: number;
  completedTodos: number;
  overdueTodos: number;
  totalTimeToday: number;
  totalTimeWeek: number;
  totalTimeMonth: number;
  averageCompletionTime: number;
  productivityScore: number;
}

// Tipos para reportes TODO
export interface TodoReport {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  assignedUser?: UserProfile;
  status: CaseStatusControl;
  totalTime: number;
  estimatedTime?: number;
  completionDate?: string;
  createdAt: string;
  tags?: string[];
  efficiency: number; // Porcentaje de eficiencia (tiempo real vs estimado)
}

// =============================================
// FIN TIPOS MÓDULO TODO
// =============================================

// =============================================
// TIPOS MÓDULO ARCHIVO
// =============================================

export interface ArchivedCase {
  id: string;
  originalCaseId: string;
  caseNumber: string;
  description: string;
  classification: CaseComplexity;
  totalTimeMinutes: number;
  completedAt: string;
  archivedAt: string;
  archivedBy: string;
  originalData: any; // JSON con todos los datos originales del caso
  controlData: any; // JSON con datos de control y tiempo
  // Relaciones
  archivedByUser?: UserProfile;
  restoredAt?: string;
  restoredBy?: string;
  restoredByUser?: UserProfile;
  isRestored: boolean;
}

export interface ArchivedTodo {
  id: string;
  originalTodoId: string;
  title: string;
  description?: string;
  priority: string;
  totalTimeMinutes: number;
  completedAt: string;
  archivedAt: string;
  archivedBy: string;
  originalData: any; // JSON con todos los datos originales del TODO
  controlData: any; // JSON con datos de control y tiempo
  // Relaciones
  archivedByUser?: UserProfile;
  restoredAt?: string;
  restoredBy?: string;
  restoredByUser?: UserProfile;
  isRestored: boolean;
}

export interface ArchiveStats {
  totalArchivedCases: number;
  totalArchivedTodos: number;
  totalArchivedTimeMinutes: number;
  archivedThisMonth: number;
  restoredThisMonth: number;
  
  // Por usuario
  byUser: {
    userId: string;
    userName: string;
    archivedCases: number;
    archivedTodos: number;
    totalTimeMinutes: number;
  }[];
  
  // Por mes (últimos 12 meses)
  monthlyStats: {
    month: string;
    archivedCases: number;
    archivedTodos: number;
    totalTimeMinutes: number;
  }[];
}

export interface ArchiveFilters {
  type?: 'cases' | 'todos' | 'all';
  archivedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  classification?: CaseComplexity;
  priority?: string;
  search?: string;
  showRestored?: boolean;
}

export interface ArchiveActionData {
  id: string;
  type: 'case' | 'todo';
  reason?: string;
}

export interface RestoreActionData {
  id: string;
  type: 'case' | 'todo';
  reason?: string;
}

// =============================================
// FIN TIPOS MÓDULO ARCHIVO
// =============================================
