import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { usePermissions } from '@/user-management/hooks/useUserProfile';
import { useCaseControlPermissions } from './useCaseControlPermissions';
import { 
  CaseControl, 
  CaseStatusControl, 
  TimeEntry, 
  ManualTimeEntry,
  StartCaseControlForm,
  AddManualTimeForm
} from '@/types';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Función para convertir datos con joins al formato CaseControl
const adaptDetailedToCaseControl = (data: any): CaseControl => {
  return {
    id: data.id,
    caseId: data.case_id,
    userId: data.user_id,
    statusId: data.status_id,
    totalTimeMinutes: data.total_time_minutes,
    timerStartAt: data.timer_start_at,
    isTimerActive: data.is_timer_active,
    assignedAt: data.assigned_at,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    
    // Datos poblados desde los joins
    case: data.cases ? {
      id: data.case_id,
      numeroCaso: data.cases.numero_caso || 'N/A',
      descripcion: data.cases.descripcion || 'Sin descripción',
      clasificacion: data.cases.clasificacion || 'Baja Complejidad',
      puntuacion: 5, // placeholder - no disponible en join básico
      fecha: new Date().toISOString().split('T')[0], // placeholder
      historialCaso: 1,
      conocimientoModulo: 1,
      manipulacionDatos: 1,
      claridadDescripcion: 1,
      causaFallo: 1,
      createdAt: '',
      updatedAt: '',
      userId: '',
      // Añadir aplicación si está disponible
      aplicacion: data.cases?.aplicaciones ? {
        id: '',
        nombre: data.cases.aplicaciones.nombre,
        descripcion: data.cases.aplicaciones.descripcion || '',
        isActive: true,
        createdAt: '',
        updatedAt: ''
      } : undefined
    } as any : undefined,
    
    user: (data.user_profiles?.full_name || data.user_id) ? {
      id: data.user_id,
      fullName: data.user_profiles?.full_name || 'Usuario desconocido',
      email: data.user_profiles?.email || '',
      created_at: '',
      updated_at: ''
    } as any : undefined,
    
    status: (data.case_status_control?.name || data.status_id) ? {
      id: data.status_id,
      name: data.case_status_control?.name || 'Estado desconocido',
      description: data.case_status_control?.description || '',
      color: data.case_status_control?.color || '#6B7280',
      isActive: true,
      displayOrder: 0,
      createdAt: '',
      updatedAt: ''
    } : undefined
  };
};

// ==========================================
// QUERIES - OBTENER DATOS
// ==========================================

export const useCaseControls = () => {
  const { userProfile } = usePermissions();
  const caseControlPermissions = useCaseControlPermissions();
  
  return useQuery({
    queryKey: ['caseControls', userProfile?.id],
    queryFn: async (): Promise<CaseControl[]> => {
      try {
        // Usar la tabla case_control con joins necesarios
        let query = supabase
          .from('case_control')
          .select(`
            id,
            case_id,
            user_id,
            status_id,
            total_time_minutes,
            timer_start_at,
            is_timer_active,
            assigned_at,
            started_at,
            completed_at,
            created_at,
            updated_at,
            cases(numero_caso, descripcion, clasificacion, aplicaciones(nombre, descripcion)),
            user_profiles(full_name, email),
            case_status_control(name, color, description)
          `);

        // Aplicar filtros basados en los permisos de case control
        const highestReadScope = caseControlPermissions.getHighestReadScope();
        
        if (!highestReadScope) {
          throw new Error('No tiene permisos para ver controles de casos');
        }
        
        if (highestReadScope === 'own' && userProfile?.id) {
          // Solo puede ver sus propios controles de casos
          query = query.eq('user_id', userProfile.id);
        } else if (highestReadScope === 'team') {
          // Por ahora team = all hasta implementar jerarquías
          // query = query; // Sin filtros adicionales
        } else if (highestReadScope === 'all') {
          // Sin filtros adicionales - puede ver todos
          // query = query;
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error con vista detallada, usando fallback:', error);
          // Fallback a consulta manual si la vista falla
          let fallbackQuery = supabase
            .from('case_control')
            .select('*');

          // Aplicar el mismo filtrado al fallback
          if (highestReadScope === 'own' && userProfile?.id) {
            fallbackQuery = fallbackQuery.eq('user_id', userProfile.id);
          }

          const { data: fallbackData, error: fallbackError } = await fallbackQuery
            .order('created_at', { ascending: false });

          if (fallbackError) {
            throw fallbackError;
          }

          return fallbackData || [];
        }

        // Convertir datos de la vista al formato esperado
        return (data || []).map(adaptDetailedToCaseControl);
      } catch (error) {
        console.error('💥 Fatal error fetching case controls:', error);
        throw error;
      }
    },
    enabled: !!userProfile && caseControlPermissions.hasAnyCaseControlPermission(), // Solo ejecutar cuando tenga permisos
  });
};

export const useCaseControl = (id: string) => {
  return useQuery({
    queryKey: ['caseControl', id],
    queryFn: async (): Promise<CaseControl | null> => {
      // Usar la tabla case_control con joins necesarios
      const { data, error } = await supabase
        .from('case_control')
        .select(`
          id,
          case_id,
          user_id,
          status_id,
          total_time_minutes,
          timer_start_at,
          is_timer_active,
          assigned_at,
          started_at,
          completed_at,
          created_at,
          updated_at,
          cases(numero_caso, descripcion, clasificacion),
          user_profiles(full_name, email),
          case_status_control(name, color)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching case control:', error);
        // Fallback a consulta básica
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('case_control')
          .select('*')
          .eq('id', id)
          .single();

        if (fallbackError) {
          throw fallbackError;
        }

        return fallbackData;
      }

      // Convertir datos de la vista al formato esperado
      return data ? adaptDetailedToCaseControl(data) : null;
    },
    enabled: !!id,
  });
};

export const useCaseControlByCase = (caseId: string) => {
  return useQuery({
    queryKey: ['caseControl', 'byCase', caseId],
    queryFn: async (): Promise<CaseControl | null> => {
      // Usar la tabla case_control con joins necesarios
      const { data, error } = await supabase
        .from('case_control')
        .select(`
          id,
          case_id,
          user_id,
          status_id,
          total_time_minutes,
          timer_start_at,
          is_timer_active,
          assigned_at,
          started_at,
          completed_at,
          created_at,
          updated_at,
          cases(numero_caso, descripcion, clasificacion),
          user_profiles(full_name, email),
          case_status_control(name, color)
        `)
        .eq('case_id', caseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching case control by case:', error);
        // Fallback a consulta básica
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('case_control')
          .select('*')
          .eq('case_id', caseId)
          .single();

        if (fallbackError && fallbackError.code !== 'PGRST116') {
          throw fallbackError;
        }

        return fallbackData || null;
      }

      // Convertir datos de la vista al formato esperado
      return data ? adaptDetailedToCaseControl(data) : null;
    },
    enabled: !!caseId,
  });
};

export const useCaseStatuses = () => {
  return useQuery({
    queryKey: ['caseStatuses'],
    queryFn: async (): Promise<CaseStatusControl[]> => {
      const { data, error } = await supabase
        .from('case_status_control')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching case statuses:', error);
        throw error;
      }

      return data || [];
    },
    select: (data: any[]) => {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        isActive: row.is_active,
        displayOrder: row.display_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },
  });
};

export const useTimeEntries = (caseControlId: string) => {
  return useQuery({
    queryKey: ['timeEntries', caseControlId],
    queryFn: async (): Promise<TimeEntry[]> => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('case_control_id', caseControlId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching time entries:', error);
        throw error;
      }

      // Convertir de snake_case a camelCase para el frontend
      const entries = (data || []).map(entry => ({
        id: entry.id,
        caseControlId: entry.case_control_id,
        userId: entry.user_id,
        startTime: entry.start_time,
        endTime: entry.end_time,
        durationMinutes: entry.duration_minutes,
        entryType: entry.entry_type,
        description: entry.description,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }));

      return entries;
    },
    enabled: !!caseControlId,
  });
};

export const useManualTimeEntries = (caseControlId: string) => {
  return useQuery({
    queryKey: ['manualTimeEntries', caseControlId],
    queryFn: async (): Promise<ManualTimeEntry[]> => {
      const { data, error } = await supabase
        .from('manual_time_entries')
        .select('*')
        .eq('case_control_id', caseControlId)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching manual time entries:', error);
        throw error;
      }

      // Convertir de snake_case a camelCase para el frontend
      const entries = (data || []).map(entry => ({
        id: entry.id,
        caseControlId: entry.case_control_id,
        userId: entry.user_id,
        date: entry.date,
        durationMinutes: entry.duration_minutes,
        description: entry.description,
        createdAt: entry.created_at,
        createdBy: entry.created_by
      }));

      return entries;
    },
    enabled: !!caseControlId,
  });
};

// ==========================================
// MUTATIONS - MODIFICAR DATOS
// ==========================================

export const useStartCaseControl = () => {
  const queryClient = useQueryClient();
  const caseControlPermissions = useCaseControlPermissions();

  return useMutation({
    mutationFn: async (form: StartCaseControlForm): Promise<CaseControl> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar permisos de asignación
      if (!caseControlPermissions.canAssignOwnCases && !caseControlPermissions.canAssignTeamCases && !caseControlPermissions.canAssignAllCases) {
        throw new Error('No tiene permisos para asignar casos al control');
      }

      // Verificar si ya existe un control para este caso
      const { data: existingControl, error: checkError } = await supabase
        .from('case_control')
        .select('id')
        .eq('case_id', form.caseId)
        .maybeSingle();

      // Si hay error y no es el de "no hay filas", lanzar error
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing control:', checkError);
        throw checkError;
      }

      if (existingControl) {
        throw new Error('Ya existe un control activo para este caso');
      }

      // Obtener el estado PENDIENTE por defecto
      const { data: defaultStatus } = await supabase
        .from('case_status_control')
        .select('id')
        .eq('name', 'PENDIENTE')
        .single();

      if (!defaultStatus) {
        throw new Error('Estado PENDIENTE no encontrado');
      }

      const { data, error } = await supabase
        .from('case_control')
        .insert({
          case_id: form.caseId,
          user_id: form.userId || user.id,
          status_id: form.statusId || defaultStatus.id,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error starting case control:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error starting case control:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();
  const caseControlPermissions = useCaseControlPermissions();

  return useMutation({
    mutationFn: async ({ id, statusId }: { id: string; statusId: string }): Promise<CaseControl> => {
      // Obtener el control actual para verificar permisos
      const { data: currentControl, error: fetchError } = await supabase
        .from('case_control')
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verificar permisos de actualización de estado
      if (!userProfile?.id || !caseControlPermissions.canPerformActionOnCaseControl(currentControl.user_id, userProfile.id, 'update_status')) {
        throw new Error('No tiene permisos para actualizar el estado de este control de caso');
      }

      const updateData: any = { status_id: statusId };

      // Si cambia a EN CURSO y no tiene started_at, establecerlo
      const { data: status } = await supabase
        .from('case_status_control')
        .select('name')
        .eq('id', statusId)
        .single();

      if (status?.name === 'EN CURSO') {
        const { data: currentControlData } = await supabase
          .from('case_control')
          .select('started_at')
          .eq('id', id)
          .single();

        if (!currentControlData?.started_at) {
          updateData.started_at = new Date().toISOString();
        }
      }

      // Si cambia a TERMINADA, establecer completed_at
      if (status?.name === 'TERMINADA') {
        updateData.completed_at = new Date().toISOString();
        updateData.is_timer_active = false;
        updateData.timer_start_at = null;
      }

      const { data, error } = await supabase
        .from('case_control')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating case status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error updating case status:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();
  const caseControlPermissions = useCaseControlPermissions();

  return useMutation({
    mutationFn: async (caseControlId: string): Promise<CaseControl> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el control actual para verificar su estado y permisos
      const { data: currentControl, error: currentError } = await supabase
        .from('case_control')
        .select(`
          *,
          status:case_status_control(id, name)
        `)
        .eq('id', caseControlId)
        .single();

      if (currentError) {
        console.error('Error getting current control:', currentError);
        throw currentError;
      }

      // Verificar permisos de control de timer
      if (!userProfile?.id || !caseControlPermissions.canPerformActionOnCaseControl(currentControl.user_id, userProfile.id, 'timer')) {
        throw new Error('No tiene permisos para controlar el timer de este caso');
      }

      // Detener cualquier timer activo del usuario
      await supabase
        .from('case_control')
        .update({ 
          is_timer_active: false,
          timer_start_at: null
        })
        .eq('user_id', user.id)
        .eq('is_timer_active', true);

      // Obtener el estado "EN CURSO" si el estado actual es "PENDIENTE"
      let updateData: any = {
        is_timer_active: true,
        timer_start_at: new Date().toISOString(),
      };

      if (currentControl.status?.name === 'PENDIENTE') {
        // Buscar el estado "EN CURSO"
        const { data: enCursoStatus, error: statusError } = await supabase
          .from('case_status_control')
          .select('id')
          .eq('name', 'EN CURSO')
          .single();

        if (!statusError && enCursoStatus) {
          updateData.status_id = enCursoStatus.id;
        }
      }

      // Iniciar el nuevo timer
      const { data, error } = await supabase
        .from('case_control')
        .update(updateData)
        .eq('id', caseControlId)
        .select('*')
        .single();

      if (error) {
        console.error('Error starting timer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error starting timer:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseControlId: string): Promise<TimeEntry> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el control actual
      const { data: control, error: controlError } = await supabase
        .from('case_control')
        .select('timer_start_at')
        .eq('id', caseControlId)
        .eq('is_timer_active', true)
        .single();

      if (controlError || !control?.timer_start_at) {
        throw new Error('No hay un timer activo para este caso');
      }

      const endTime = new Date().toISOString();

      // Crear entrada de tiempo
      const { data: timeEntry, error: timeError } = await supabase
        .from('time_entries')
        .insert({
          case_control_id: caseControlId,
          user_id: user.id,
          start_time: control.timer_start_at,
          end_time: endTime,
          entry_type: 'automatic',
        })
        .select('*')
        .single();

      if (timeError) {
        console.error('Error creating time entry:', timeError);
        throw timeError;
      }

      // Actualizar el control para desactivar el timer
      const { error: updateError } = await supabase
        .from('case_control')
        .update({
          is_timer_active: false,
          timer_start_at: null,
        })
        .eq('id', caseControlId);

      if (updateError) {
        console.error('Error updating case control:', updateError);
        throw updateError;
      }

      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error stopping timer:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const usePauseTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseControlId: string): Promise<TimeEntry> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el control actual
      const { data: control, error: controlError } = await supabase
        .from('case_control')
        .select('timer_start_at')
        .eq('id', caseControlId)
        .eq('is_timer_active', true)
        .single();

      if (controlError || !control?.timer_start_at) {
        throw new Error('No hay un timer activo para este caso');
      }

      const endTime = new Date().toISOString();

      // Crear entrada de tiempo
      const { data: timeEntry, error: timeError } = await supabase
        .from('time_entries')
        .insert({
          case_control_id: caseControlId,
          user_id: user.id,
          start_time: control.timer_start_at,
          end_time: endTime,
          entry_type: 'automatic',
          description: 'Pausa de timer'
        })
        .select('*')
        .single();

      if (timeError) {
        console.error('Error creating time entry:', timeError);
        throw timeError;
      }

      // Solo pausar el timer (mantener listo para reanudar)
      const { error: updateError } = await supabase
        .from('case_control')
        .update({
          is_timer_active: false,
          timer_start_at: null,
        })
        .eq('id', caseControlId);

      if (updateError) {
        console.error('Error updating case control:', updateError);
        throw updateError;
      }

      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error pausing timer:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useAddManualTime = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();
  const caseControlPermissions = useCaseControlPermissions();

  return useMutation({
    mutationFn: async ({ 
      caseControlId, 
      form 
    }: { 
      caseControlId: string; 
      form: AddManualTimeForm 
    }): Promise<ManualTimeEntry> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el control de caso para verificar permisos
      const { data: caseControl, error: fetchError } = await supabase
        .from('case_control')
        .select('user_id')
        .eq('id', caseControlId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verificar permisos de tiempo manual
      if (!userProfile?.id || !caseControlPermissions.canPerformActionOnCaseControl(caseControl.user_id, userProfile.id, 'manual_time')) {
        throw new Error('No tiene permisos para gestionar el tiempo manual de este caso');
      }

      const { data, error } = await supabase
        .from('manual_time_entries')
        .insert({
          case_control_id: caseControlId,
          user_id: user.id,
          date: form.date,
          duration_minutes: form.durationMinutes,
          description: form.description,
          created_by: user.id,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding manual time:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      queryClient.invalidateQueries({ queryKey: ['manualTimeEntries'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error adding manual time:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useDeleteManualTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string): Promise<void> => {
      const { error } = await supabase
        .from('manual_time_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error deleting manual time entry:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      queryClient.invalidateQueries({ queryKey: ['manualTimeEntries'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error deleting manual time entry:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string): Promise<void> => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error deleting time entry:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      // Notificación manejada por el componente si es necesario
    },
    onError: (error: any) => {
      console.error('Error deleting time entry:', error);
      // Error manejado por el componente si es necesario
    },
  });
};

// ==========================================
// QUERIES PARA REPORTES
// ==========================================

export const useAllTimeEntries = () => {
  return useQuery({
    queryKey: ['allTimeEntries'],
    queryFn: async (): Promise<TimeEntry[]> => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching all time entries:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAllManualTimeEntries = () => {
  return useQuery({
    queryKey: ['allManualTimeEntries'],
    queryFn: async (): Promise<ManualTimeEntry[]> => {
      const { data, error } = await supabase
        .from('manual_time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all manual time entries:', error);
        throw error;
      }

      return data || [];
    },
  });
};
