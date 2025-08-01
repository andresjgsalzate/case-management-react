import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

// Interfaces para las métricas
export interface TimeMetrics {
  totalTimeMinutes: number;
  totalHours: number;
  averageTimePerCase: number;
  activeTimers: number;
  currentMonth: string; // Nuevo campo para indicar el mes actual
  currentYear: number;  // Nuevo campo para indicar el año actual
}

export interface UserTimeMetrics {
  userId: string;
  userName: string;
  totalTimeMinutes: number;
  casesWorked: number;
}

export interface CaseTimeMetrics {
  caseId: string;
  caseNumber: string;
  description: string;
  totalTimeMinutes: number;
  status: string;
  statusColor?: string;
}

export interface StatusMetrics {
  statusId: string;
  statusName: string;
  statusColor: string;
  casesCount: number;
  totalTimeMinutes: number;
}

export interface ApplicationTimeMetrics {
  applicationId: string;
  applicationName: string;
  totalTimeMinutes: number;
  casesCount: number;
}

// Función helper para obtener fechas del mes actual
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    start: startOfMonth.toISOString(),
    end: endOfMonth.toISOString()
  };
};

// Hook para métricas generales de tiempo (SOLO DEL MES ACTUAL)
export const useTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['timeMetrics', userProfile?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async (): Promise<TimeMetrics> => {
      const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
      
      // Obtener casos activos (para contadores base)
      let caseQuery = supabase
        .from('case_control_detailed')
        .select('case_id, is_timer_active');

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        caseQuery = caseQuery.eq('user_id', userProfile.id);
      }

      const { data: caseData, error: caseError } = await caseQuery;

      if (caseError) {
        console.error('Error fetching case control data:', caseError);
        const now = new Date();
        return {
          totalTimeMinutes: 0,
          totalHours: 0,
          averageTimePerCase: 0,
          activeTimers: 0,
          currentMonth: now.toLocaleString('es-ES', { month: 'long' }),
          currentYear: now.getFullYear(),
        };
      }

      // Obtener time entries del mes actual
      let timeQuery = supabase
        .from('time_entries')
        .select('duration_minutes, case_control_id, case_control!inner(user_id)')
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .not('duration_minutes', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        timeQuery = timeQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: timeEntries, error: timeError } = await timeQuery;

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
      }

      // Obtener manual time entries del mes actual
      let manualQuery = supabase
        .from('manual_time_entries')
        .select('duration_minutes, case_control_id, case_control!inner(user_id)')
        .gte('date', monthStart.split('T')[0])
        .lte('date', monthEnd.split('T')[0]);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        manualQuery = manualQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: manualEntries, error: manualError } = await manualQuery;

      if (manualError) {
        console.error('Error fetching manual time entries:', manualError);
      }

      // Calcular métricas solo del mes actual
      const timeMinutesFromTimer = (timeEntries || []).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
      const timeMinutesFromManual = (manualEntries || []).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
      const totalTimeMinutes = timeMinutesFromTimer + timeMinutesFromManual;
      
      const activeTimers = (caseData || []).filter(entry => entry.is_timer_active).length;
      
      // Contar casos únicos que tuvieron tiempo en el mes actual
      const casesWithTimeThisMonth = new Set([
        ...(timeEntries || []).map(e => e.case_control_id),
        ...(manualEntries || []).map(e => e.case_control_id)
      ]).size;

      const now = new Date();

      return {
        totalTimeMinutes,
        totalHours: Math.round((totalTimeMinutes / 60) * 100) / 100,
        averageTimePerCase: casesWithTimeThisMonth > 0 ? Math.round((totalTimeMinutes / casesWithTimeThisMonth) * 100) / 100 : 0,
        activeTimers,
        currentMonth: now.toLocaleString('es-ES', { month: 'long' }),
        currentYear: now.getFullYear(),
      };
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para tiempo por usuario (SOLO DEL MES ACTUAL)
export const useUserTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['userTimeMetrics', userProfile?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async (): Promise<UserTimeMetrics[]> => {
      const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
      
      // Obtener time entries del mes actual
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            user_profiles!inner(id, full_name)
          )
        `)
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .not('duration_minutes', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        timeQuery = timeQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: timeEntries, error: timeError } = await timeQuery;

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        return [];
      }

      // Obtener manual time entries del mes actual
      let manualQuery = supabase
        .from('manual_time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            user_profiles!inner(id, full_name)
          )
        `)
        .gte('date', monthStart.split('T')[0])
        .lte('date', monthEnd.split('T')[0]);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        manualQuery = manualQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: manualEntries, error: manualError } = await manualQuery;

      if (manualError) {
        console.error('Error fetching manual time entries:', manualError);
      }

      // Procesar los datos para agrupar por usuario
      const userMetrics = new Map<string, {
        userId: string;
        userName: string;
        totalTimeMinutes: number;
        casesWorked: Set<string>;
      }>();

      // Procesar time entries
      (timeEntries || []).forEach((entry: any) => {
        const userId = entry.case_control?.user_id;
        const userName = entry.case_control?.user_profiles?.full_name || 'Usuario sin nombre';
        const caseId = entry.case_control?.case_id;
        
        if (userId) {
          if (!userMetrics.has(userId)) {
            userMetrics.set(userId, {
              userId,
              userName,
              totalTimeMinutes: 0,
              casesWorked: new Set(),
            });
          }
          
          const userMetric = userMetrics.get(userId)!;
          userMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId) {
            userMetric.casesWorked.add(caseId);
          }
        }
      });

      // Procesar manual entries
      (manualEntries || []).forEach((entry: any) => {
        const userId = entry.case_control?.user_id;
        const userName = entry.case_control?.user_profiles?.full_name || 'Usuario sin nombre';
        const caseId = entry.case_control?.case_id;
        
        if (userId) {
          if (!userMetrics.has(userId)) {
            userMetrics.set(userId, {
              userId,
              userName,
              totalTimeMinutes: 0,
              casesWorked: new Set(),
            });
          }
          
          const userMetric = userMetrics.get(userId)!;
          userMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId) {
            userMetric.casesWorked.add(caseId);
          }
        }
      });

      return Array.from(userMetrics.values()).map(metric => ({
        userId: metric.userId,
        userName: metric.userName,
        totalTimeMinutes: metric.totalTimeMinutes,
        casesWorked: metric.casesWorked.size,
      })).sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para tiempo por caso (SOLO DEL MES ACTUAL)
export const useCaseTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['caseTimeMetrics', userProfile?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async (): Promise<CaseTimeMetrics[]> => {
      const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
      
      // Obtener time entries del mes actual con información del caso
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            cases!inner(numero_caso, descripcion),
            case_status_control!inner(name, color)
          )
        `)
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .not('duration_minutes', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        timeQuery = timeQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: timeEntries, error: timeError } = await timeQuery;

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        return [];
      }

      // Obtener manual time entries del mes actual con información del caso
      let manualQuery = supabase
        .from('manual_time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            cases!inner(numero_caso, descripcion),
            case_status_control!inner(name, color)
          )
        `)
        .gte('date', monthStart.split('T')[0])
        .lte('date', monthEnd.split('T')[0]);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        manualQuery = manualQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: manualEntries, error: manualError } = await manualQuery;

      if (manualError) {
        console.error('Error fetching manual time entries:', manualError);
      }

      // Procesar los datos para agrupar por caso
      const caseMetrics = new Map<string, {
        caseId: string;
        caseNumber: string;
        description: string;
        totalTimeMinutes: number;
        status: string;
        statusColor?: string;
      }>();

      // Procesar time entries
      (timeEntries || []).forEach((entry: any) => {
        const caseId = entry.case_control?.case_id;
        const caseNumber = entry.case_control?.cases?.numero_caso;
        const description = entry.case_control?.cases?.descripcion;
        const statusName = entry.case_control?.case_status_control?.name;
        const statusColor = entry.case_control?.case_status_control?.color;
        
        if (caseId) {
          if (!caseMetrics.has(caseId)) {
            caseMetrics.set(caseId, {
              caseId,
              caseNumber: caseNumber || 'N/A',
              description: description || 'Sin descripción',
              totalTimeMinutes: 0,
              status: statusName || 'Sin estado',
              statusColor: statusColor || '#6b7280',
            });
          }
          
          const caseMetric = caseMetrics.get(caseId)!;
          caseMetric.totalTimeMinutes += entry.duration_minutes || 0;
        }
      });

      // Procesar manual entries
      (manualEntries || []).forEach((entry: any) => {
        const caseId = entry.case_control?.case_id;
        const caseNumber = entry.case_control?.cases?.numero_caso;
        const description = entry.case_control?.cases?.descripcion;
        const statusName = entry.case_control?.case_status_control?.name;
        const statusColor = entry.case_control?.case_status_control?.color;
        
        if (caseId) {
          if (!caseMetrics.has(caseId)) {
            caseMetrics.set(caseId, {
              caseId,
              caseNumber: caseNumber || 'N/A',
              description: description || 'Sin descripción',
              totalTimeMinutes: 0,
              status: statusName || 'Sin estado',
              statusColor: statusColor || '#6b7280',
            });
          }
          
          const caseMetric = caseMetrics.get(caseId)!;
          caseMetric.totalTimeMinutes += entry.duration_minutes || 0;
        }
      });

      return Array.from(caseMetrics.values())
        .sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para métricas por estado (SOLO DEL MES ACTUAL)
export const useStatusMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['statusMetrics', userProfile?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async (): Promise<StatusMetrics[]> => {
      const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
      
      // Obtener time entries del mes actual con información del estado
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            case_status_control!inner(id, name, color)
          )
        `)
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .not('duration_minutes', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        timeQuery = timeQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: timeEntries, error: timeError } = await timeQuery;

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        return [];
      }

      // Obtener manual time entries del mes actual con información del estado
      let manualQuery = supabase
        .from('manual_time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            case_status_control!inner(id, name, color)
          )
        `)
        .gte('date', monthStart.split('T')[0])
        .lte('date', monthEnd.split('T')[0]);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        manualQuery = manualQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: manualEntries, error: manualError } = await manualQuery;

      if (manualError) {
        console.error('Error fetching manual time entries:', manualError);
      }

      // Procesar métricas por estado
      const statusMetrics = new Map<string, {
        statusId: string;
        statusName: string;
        statusColor: string;
        casesCount: number;
        totalTimeMinutes: number;
        casesSet: Set<string>;
      }>();

      // Procesar time entries
      (timeEntries || []).forEach((entry: any) => {
        const statusId = entry.case_control?.case_status_control?.id;
        const statusName = entry.case_control?.case_status_control?.name;
        const statusColor = entry.case_control?.case_status_control?.color;
        const caseId = entry.case_control?.case_id;
        
        if (statusId) {
          if (!statusMetrics.has(statusId)) {
            statusMetrics.set(statusId, {
              statusId,
              statusName: statusName || 'Sin estado',
              statusColor: statusColor || '#6b7280',
              casesCount: 0,
              totalTimeMinutes: 0,
              casesSet: new Set(),
            });
          }
          
          const statusMetric = statusMetrics.get(statusId)!;
          statusMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId && !statusMetric.casesSet.has(caseId)) {
            statusMetric.casesSet.add(caseId);
            statusMetric.casesCount++;
          }
        }
      });

      // Procesar manual entries
      (manualEntries || []).forEach((entry: any) => {
        const statusId = entry.case_control?.case_status_control?.id;
        const statusName = entry.case_control?.case_status_control?.name;
        const statusColor = entry.case_control?.case_status_control?.color;
        const caseId = entry.case_control?.case_id;
        
        if (statusId) {
          if (!statusMetrics.has(statusId)) {
            statusMetrics.set(statusId, {
              statusId,
              statusName: statusName || 'Sin estado',
              statusColor: statusColor || '#6b7280',
              casesCount: 0,
              totalTimeMinutes: 0,
              casesSet: new Set(),
            });
          }
          
          const statusMetric = statusMetrics.get(statusId)!;
          statusMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId && !statusMetric.casesSet.has(caseId)) {
            statusMetric.casesSet.add(caseId);
            statusMetric.casesCount++;
          }
        }
      });

      return Array.from(statusMetrics.values()).map(metric => ({
        statusId: metric.statusId,
        statusName: metric.statusName,
        statusColor: metric.statusColor,
        casesCount: metric.casesCount,
        totalTimeMinutes: metric.totalTimeMinutes,
      }));
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para tiempo por aplicación (SOLO DEL MES ACTUAL)
export const useApplicationTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['applicationTimeMetrics', userProfile?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async (): Promise<ApplicationTimeMetrics[]> => {
      const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
      
      // Obtener time entries del mes actual con información de la aplicación
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            cases!inner(aplicacion_id, aplicaciones!inner(nombre))
          )
        `)
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .not('duration_minutes', 'is', null)
        .not('case_control.cases.aplicaciones.nombre', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        timeQuery = timeQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: timeEntries, error: timeError } = await timeQuery;

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        return [];
      }

      // Obtener manual time entries del mes actual con información de la aplicación
      let manualQuery = supabase
        .from('manual_time_entries')
        .select(`
          duration_minutes,
          case_control_id,
          case_control!inner(
            user_id,
            case_id,
            cases!inner(aplicacion_id, aplicaciones!inner(nombre))
          )
        `)
        .gte('date', monthStart.split('T')[0])
        .lte('date', monthEnd.split('T')[0])
        .not('case_control.cases.aplicaciones.nombre', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        manualQuery = manualQuery.eq('case_control.user_id', userProfile.id);
      }

      const { data: manualEntries, error: manualError } = await manualQuery;

      if (manualError) {
        console.error('Error fetching manual time entries:', manualError);
      }

      // Procesar los datos para agrupar por aplicación
      const appMetrics = new Map<string, {
        applicationId: string;
        applicationName: string;
        totalTimeMinutes: number;
        casesSet: Set<string>;
      }>();

      // Procesar time entries
      (timeEntries || []).forEach((entry: any) => {
        const applicationName = entry.case_control?.cases?.aplicaciones?.nombre;
        const caseId = entry.case_control?.case_id;
        
        if (applicationName) {
          // Usar el nombre como ID único
          const appId = applicationName;
          
          if (!appMetrics.has(appId)) {
            appMetrics.set(appId, {
              applicationId: appId,
              applicationName: applicationName,
              totalTimeMinutes: 0,
              casesSet: new Set(),
            });
          }
          
          const appMetric = appMetrics.get(appId)!;
          appMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId) {
            appMetric.casesSet.add(caseId);
          }
        }
      });

      // Procesar manual entries
      (manualEntries || []).forEach((entry: any) => {
        const applicationName = entry.case_control?.cases?.aplicaciones?.nombre;
        const caseId = entry.case_control?.case_id;
        
        if (applicationName) {
          // Usar el nombre como ID único
          const appId = applicationName;
          
          if (!appMetrics.has(appId)) {
            appMetrics.set(appId, {
              applicationId: appId,
              applicationName: applicationName,
              totalTimeMinutes: 0,
              casesSet: new Set(),
            });
          }
          
          const appMetric = appMetrics.get(appId)!;
          appMetric.totalTimeMinutes += entry.duration_minutes || 0;
          
          if (caseId) {
            appMetric.casesSet.add(caseId);
          }
        }
      });

      return Array.from(appMetrics.values()).map(metric => ({
        applicationId: metric.applicationId,
        applicationName: metric.applicationName,
        totalTimeMinutes: metric.totalTimeMinutes,
        casesCount: metric.casesSet.size,
      })).sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5,
  });
};

// Utilidades para formatear tiempo mejoradas
export const formatTime = (minutes: number): string => {
  if (!minutes || isNaN(minutes) || minutes < 0) {
    return '0m';
  }
  
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatHours = (minutes: number): string => {
  if (!minutes || isNaN(minutes) || minutes < 0) {
    return '0.0h';
  }
  return `${(minutes / 60).toFixed(1)}h`;
};

export const formatTimeRange = (minutes: number): string => {
  if (!minutes || isNaN(minutes) || minutes < 0) {
    return '0 minutos';
  }
  
  if (minutes <= 30) return '1-30 minutos';
  if (minutes <= 60) return '31-60 minutos';
  if (minutes <= 120) return '1-2 horas';
  if (minutes <= 240) return '2-4 horas';
  return 'Más de 4 horas';
};

// Validación de datos para evitar NaN
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export const safeAverage = (total: number, count: number): number => {
  if (!count || count === 0 || !total || isNaN(total) || isNaN(count)) {
    return 0;
  }
  return Math.round(total / count);
};
