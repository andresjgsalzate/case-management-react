import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/useUserProfile';

// Interfaces para las métricas
export interface TimeMetrics {
  totalTimeMinutes: number;
  totalHours: number;
  averageTimePerCase: number;
  activeTimers: number;
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

// Hook para métricas generales de tiempo
export const useTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['timeMetrics', userProfile?.id],
    queryFn: async (): Promise<TimeMetrics> => {
      // Usar la vista case_control_detailed como fuente única de datos
      let query = supabase
        .from('case_control_detailed')
        .select('total_time_minutes, is_timer_active, case_id');

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data: caseData, error } = await query;

      if (error) {
        console.error('Error fetching case control data:', error);
        return {
          totalTimeMinutes: 0,
          totalHours: 0,
          averageTimePerCase: 0,
          activeTimers: 0,
        };
      }

      // Calcular métricas
      const totalTimeMinutes = (caseData || []).reduce((sum, entry) => sum + (entry.total_time_minutes || 0), 0);
      const activeTimers = (caseData || []).filter(entry => entry.is_timer_active).length;
      const casesCount = caseData?.length || 0;

      return {
        totalTimeMinutes,
        totalHours: Math.round((totalTimeMinutes / 60) * 100) / 100,
        averageTimePerCase: casesCount > 0 ? Math.round((totalTimeMinutes / casesCount) * 100) / 100 : 0,
        activeTimers,
      };
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para tiempo por usuario
export const useUserTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['userTimeMetrics', userProfile?.id],
    queryFn: async (): Promise<UserTimeMetrics[]> => {
      // Usar la vista case_control_detailed para obtener datos de usuarios
      let query = supabase
        .from('case_control_detailed')
        .select('user_id, assigned_user_name, total_time_minutes, case_id')
        .not('user_id', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data: caseData, error } = await query;

      if (error) {
        console.error('Error fetching user time metrics:', error);
        return [];
      }

      // Procesar los datos para agrupar por usuario
      const userMetrics = new Map<string, {
        userId: string;
        userName: string;
        totalTimeMinutes: number;
        casesWorked: Set<string>;
      }>();

      (caseData || []).forEach((entry: any) => {
        const userId = entry.user_id;
        const userName = entry.assigned_user_name || 'Usuario sin nombre';
        
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
          userMetric.totalTimeMinutes += entry.total_time_minutes || 0;
          if (entry.case_id) {
            userMetric.casesWorked.add(entry.case_id);
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

// Hook para tiempo por caso
export const useCaseTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['caseTimeMetrics', userProfile?.id],
    queryFn: async (): Promise<CaseTimeMetrics[]> => {
      // Usar la vista case_control_detailed para obtener datos de casos
      let query = supabase
        .from('case_control_detailed')
        .select('case_id, case_number, case_description, total_time_minutes, status_name, status_color');

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data: caseData, error } = await query;

      if (error) {
        console.error('Error fetching case time metrics:', error);
        return [];
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

      (caseData || []).forEach((entry: any) => {
        const caseId = entry.case_id;
        
        if (caseId) {
          if (!caseMetrics.has(caseId)) {
            caseMetrics.set(caseId, {
              caseId,
              caseNumber: entry.case_number || 'N/A',
              description: entry.case_description || 'Sin descripción',
              totalTimeMinutes: 0,
              status: entry.status_name || 'Sin estado',
              statusColor: entry.status_color || '#6b7280',
            });
          }
          
          const caseMetric = caseMetrics.get(caseId)!;
          caseMetric.totalTimeMinutes += entry.total_time_minutes || 0;
        }
      });

      return Array.from(caseMetrics.values())
        .sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para métricas por estado
export const useStatusMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['statusMetrics', userProfile?.id],
    queryFn: async (): Promise<StatusMetrics[]> => {
      // Usar la vista case_control_detailed para obtener datos de estados
      let query = supabase
        .from('case_control_detailed')
        .select('status_id, status_name, status_color, total_time_minutes, case_id');

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data: caseData, error } = await query;

      if (error) {
        console.error('Error fetching status metrics:', error);
        return [];
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

      (caseData || []).forEach((entry: any) => {
        const statusId = entry.status_id;
        
        if (statusId) {
          if (!statusMetrics.has(statusId)) {
            statusMetrics.set(statusId, {
              statusId,
              statusName: entry.status_name || 'Sin estado',
              statusColor: entry.status_color || '#6b7280',
              casesCount: 0,
              totalTimeMinutes: 0,
              casesSet: new Set(),
            });
          }
          
          const statusMetric = statusMetrics.get(statusId)!;
          statusMetric.totalTimeMinutes += entry.total_time_minutes || 0;
          
          if (entry.case_id && !statusMetric.casesSet.has(entry.case_id)) {
            statusMetric.casesSet.add(entry.case_id);
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

// Hook para tiempo por aplicación
export const useApplicationTimeMetrics = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['applicationTimeMetrics', userProfile?.id],
    queryFn: async (): Promise<ApplicationTimeMetrics[]> => {
      // Usar la vista case_control_detailed para obtener datos de aplicaciones
      let query = supabase
        .from('case_control_detailed')
        .select('application_name, total_time_minutes, case_id')
        .not('application_name', 'is', null);

      // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
      if (!canViewAllCases() && userProfile?.id) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data: caseData, error } = await query;

      if (error) {
        console.error('Error fetching application time metrics:', error);
        return [];
      }

      // Procesar los datos para agrupar por aplicación
      const appMetrics = new Map<string, {
        applicationId: string;
        applicationName: string;
        totalTimeMinutes: number;
        casesSet: Set<string>;
      }>();

      (caseData || []).forEach((entry: any) => {
        const applicationName = entry.application_name;
        
        if (applicationName) {
          // Usar el nombre como ID único (ya que no tenemos access directo al ID)
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
          appMetric.totalTimeMinutes += entry.total_time_minutes || 0;
          
          if (entry.case_id) {
            appMetric.casesSet.add(entry.case_id);
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
