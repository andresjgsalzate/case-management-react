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
