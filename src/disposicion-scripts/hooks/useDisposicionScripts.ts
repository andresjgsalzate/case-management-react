import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { usePermissions } from '@/user-management/hooks/useUserProfile';
import { useDisposicionScriptsPermissions } from './useDisposicionScriptsPermissions';
import { 
  DisposicionScripts, 
  DisposicionScriptsFormData, 
  DisposicionMensual,
  DisposicionPorCaso,
  DisposicionFilters 
} from '@/types';

// ===== CONSULTAS =====

export const useDisposicionesScripts = (filters?: DisposicionFilters) => {
  const { userProfile } = usePermissions();
  const disposicionesPermissions = useDisposicionScriptsPermissions();
  
  return useQuery({
    queryKey: ['disposiciones-scripts', filters, userProfile?.id],
    queryFn: async (): Promise<DisposicionScripts[]> => {
      try {
        // Usar la nueva vista que maneja casos activos y archivados
        let query = supabase
          .from('disposiciones_scripts_with_case')
          .select(`
            *,
            aplicacion:aplicaciones!inner(id, nombre),
            user:user_profiles(id, full_name, email)
          `)
          .order('created_at', { ascending: false });

        // Aplicar filtros basados en los permisos de disposiciones
        const highestReadScope = disposicionesPermissions.getHighestReadScope();
        
        if (!highestReadScope) {
          throw new Error('No tiene permisos para ver disposiciones');
        }
        
        if (highestReadScope === 'own' && userProfile?.id) {
          // Solo puede ver sus propias disposiciones
          query = query.eq('user_id', userProfile.id);
        } else if (highestReadScope === 'team') {
          // Por ahora team = all hasta implementar jerarquías
          // query = query; // Sin filtros adicionales
        } else if (highestReadScope === 'all') {
          // Sin filtros adicionales - puede ver todas
          // query = query;
        }

        // Aplicar filtros adicionales
        if (filters?.year) {
          query = query.gte('fecha', `${filters.year}-01-01`)
                      .lte('fecha', `${filters.year}-12-31`);
        }

        if (filters?.month && filters?.year) {
          const startDate = `${filters.year}-${filters.month.toString().padStart(2, '0')}-01`;
          const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
          query = query.gte('fecha', startDate).lte('fecha', endDate);
        }

        if (filters?.aplicacionId) {
          query = query.eq('aplicacion_id', filters.aplicacionId);
        }

        if (filters?.caseNumber) {
          query = query.eq('case_number', filters.caseNumber);
        }

        if (filters?.caseId) {
          query = query.eq('case_id', filters.caseId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching disposiciones:', error);
          throw error;
        }

        return data?.map(item => ({
          id: item.id,
          fecha: item.fecha,
        caseNumber: item.case_number,
        caseId: item.case_id,
        nombreScript: item.nombre_script,
        numeroRevisionSvn: item.numero_revision_svn,
        aplicacionId: item.aplicacion_id,
        observaciones: item.observaciones,
        userId: item.user_profile_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isCaseArchived: item.is_case_archived,
        case: item.case_info ? {
          id: item.case_info.id,
          numeroCaso: item.case_info.numero_caso,
          descripcion: item.case_info.descripcion,
          fecha: item.case_info.created_at || '',
          historialCaso: 1,
          conocimientoModulo: 1,
          manipulacionDatos: 1,
          claridadDescripcion: 1,
          causaFallo: 1,
          puntuacion: 5,
          clasificacion: item.case_info.clasificacion as any || 'Baja Complejidad',
          createdAt: item.case_info.created_at || '',
          updatedAt: item.case_info.updated_at || '',
          is_archived: item.case_info.is_archived
        } : undefined,
        aplicacion: item.aplicacion ? {
          id: item.aplicacion.id,
          nombre: item.aplicacion.nombre,
          activo: true,
          createdAt: '',
          updatedAt: ''
        } : undefined,
        user: item.user ? {
          id: item.user.id,
          email: item.user.email,
          fullName: item.user.full_name,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        } : undefined
      })) || [];
      } catch (error) {
        console.error('💥 Fatal error fetching disposiciones:', error);
        throw error;
      }
    },
    enabled: !!userProfile && disposicionesPermissions.hasAnyDisposicionesPermission(), // Solo ejecutar cuando tenga permisos
  });
};

export const useDisposicionScripts = (id: string) => {
  const { userProfile } = usePermissions();
  const disposicionesPermissions = useDisposicionScriptsPermissions();
  
  return useQuery({
    queryKey: ['disposicion-scripts', id],
    queryFn: async (): Promise<DisposicionScripts | null> => {
      const { data, error } = await supabase
        .from('disposiciones_scripts_with_case')
        .select(`
          *,
          aplicacion:aplicaciones!inner(id, nombre),
          user:user_profiles(id, full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching disposicion:', error);
        throw error;
      }

      if (!data) return null;

      // Verificar si el usuario puede leer esta disposición específica
      if (!userProfile?.id || !disposicionesPermissions.canPerformActionOnDisposicion(data.user_profile_id, userProfile.id, 'read')) {
        throw new Error('No tiene permisos para ver esta disposición');
      }

      return {
        id: data.id,
        fecha: data.fecha,
        caseNumber: data.case_number,
        caseId: data.case_id,
        nombreScript: data.nombre_script,
        numeroRevisionSvn: data.numero_revision_svn,
        aplicacionId: data.aplicacion_id,
        observaciones: data.observaciones,
        userId: data.user_profile_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isCaseArchived: data.is_case_archived,
        case: data.case_info ? {
          id: data.case_info.id,
          numeroCaso: data.case_info.numero_caso,
          descripcion: data.case_info.descripcion,
          fecha: data.case_info.created_at || '',
          historialCaso: 1,
          conocimientoModulo: 1,
          manipulacionDatos: 1,
          claridadDescripcion: 1,
          causaFallo: 1,
          puntuacion: 5,
          clasificacion: data.case_info.clasificacion as any || 'Baja Complejidad',
          createdAt: data.case_info.created_at || '',
          updatedAt: data.case_info.updated_at || '',
          is_archived: data.case_info.is_archived
        } : undefined,
        aplicacion: data.aplicacion ? {
          id: data.aplicacion.id,
          nombre: data.aplicacion.nombre,
          activo: true,
          createdAt: '',
          updatedAt: ''
        } : undefined,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        } : undefined
      };
    },
    enabled: !!id,
  });
};

export const useDisposicionScriptsPorMes = (year?: number) => {
  return useQuery({
    queryKey: ['disposiciones-por-mes', year],
    queryFn: async (): Promise<DisposicionMensual[]> => {
      let query = supabase
        .from('disposiciones_scripts_with_case')
        .select(`
          fecha,
          case_number,
          case_id,
          is_case_archived,
          aplicacion:aplicaciones!inner(nombre, id)
        `);

      if (year) {
        query = query.gte('fecha', `${year}-01-01`)
                    .lte('fecha', `${year}-12-31`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching disposiciones por mes:', error);
        throw error;
      }

      // Agrupar por mes
      const grupoPorMes: { [key: string]: any[] } = {};
      
      data?.forEach(item => {
        const fecha = new Date(item.fecha);
        const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
        
        if (!grupoPorMes[key]) {
          grupoPorMes[key] = [];
        }
        grupoPorMes[key].push(item);
      });

      // Convertir a formato de respuesta
      const result: DisposicionMensual[] = Object.entries(grupoPorMes).map(([key, disposiciones]) => {
        const [yearStr, monthStr] = key.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        
        // Agrupar por caso y aplicación
        const grupoPorCaso: { [caseKey: string]: DisposicionPorCaso } = {};
        
        disposiciones.forEach(disp => {
          const caseKey = `${disp.case_number}-${disp.aplicacion.nombre}`;
          
          if (!grupoPorCaso[caseKey]) {
            grupoPorCaso[caseKey] = {
              numeroCaso: disp.case_number,
              aplicacionNombre: disp.aplicacion.nombre,
              cantidad: 0,
              caseId: disp.case_id, // Puede ser null si está archivado
              aplicacionId: disp.aplicacion.id,
              isCaseArchived: disp.is_case_archived,
            };
          }
          grupoPorCaso[caseKey].cantidad++;
        });

        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        return {
          year,
          month,
          monthName: monthNames[month - 1],
          disposiciones: Object.values(grupoPorCaso),
          totalDisposiciones: disposiciones.length,
        };
      });

      // Ordenar por año y mes descendente
      return result.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    },
  });
};

// ===== MUTACIONES =====

export const useCreateDisposicionScripts = () => {
  const queryClient = useQueryClient();
  const disposicionesPermissions = useDisposicionScriptsPermissions();

  return useMutation({
    mutationFn: async (data: DisposicionScriptsFormData): Promise<DisposicionScripts> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar permisos de creación
      if (!disposicionesPermissions.canCreateOwnDisposiciones && !disposicionesPermissions.canCreateTeamDisposiciones && !disposicionesPermissions.canCreateAllDisposiciones) {
        throw new Error('No tiene permisos para crear disposiciones');
      }

      // Obtener el perfil del usuario
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !currentUserProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // Buscar el case_id basado en el número de caso
      let caseId = data.caseId;
      if (!caseId && data.caseNumber) {
        const { data: caseData } = await supabase
          .from('cases')
          .select('id')
          .eq('numero_caso', data.caseNumber)
          .single();
        
        caseId = caseData?.id || null;
      }

      const insertData = {
        fecha: data.fecha,
        case_number: data.caseNumber,
        case_id: caseId, // Puede ser null si el caso está archivado
        nombre_script: data.nombreScript,
        numero_revision_svn: data.numeroRevisionSvn || null,
        aplicacion_id: data.aplicacionId,
        observaciones: data.observaciones || null,
        user_profile_id: currentUserProfile.id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('disposiciones_scripts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating disposicion:', error);
        throw error;
      }

      // Obtener el registro completo usando la vista
      const { data: fullRecord, error: fetchError } = await supabase
        .from('disposiciones_scripts_with_case')
        .select(`
          *,
          aplicacion:aplicaciones!inner(nombre),
          user:user_profiles(full_name, email)
        `)
        .eq('id', result.id)
        .single();

      if (fetchError) {
        console.error('Error fetching created disposicion:', fetchError);
        throw fetchError;
      }

      return {
        id: fullRecord.id,
        fecha: fullRecord.fecha,
        caseNumber: fullRecord.case_number,
        caseId: fullRecord.case_id,
        nombreScript: fullRecord.nombre_script,
        numeroRevisionSvn: fullRecord.numero_revision_svn,
        aplicacionId: fullRecord.aplicacion_id,
        observaciones: fullRecord.observaciones,
        userId: fullRecord.user_profile_id,
        createdAt: fullRecord.created_at,
        updatedAt: fullRecord.updated_at,
        isCaseArchived: fullRecord.is_case_archived,
        case: fullRecord.case_info,
        aplicacion: fullRecord.aplicacion,
        user: fullRecord.user,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-por-mes'] });
    },
  });
};

export const useUpdateDisposicionScripts = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();
  const disposicionesPermissions = useDisposicionScriptsPermissions();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DisposicionScriptsFormData }): Promise<DisposicionScripts> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener la disposición actual para verificar permisos
      const { data: currentDisposicion, error: getCurrentError } = await supabase
        .from('disposiciones_scripts')
        .select('user_profile_id')
        .eq('id', id)
        .single();
        
      if (getCurrentError) throw getCurrentError;
      
      // Verificar permisos de actualización
      if (!userProfile?.id || !disposicionesPermissions.canPerformActionOnDisposicion(currentDisposicion.user_profile_id, userProfile.id, 'update')) {
        throw new Error('No tiene permisos para actualizar esta disposición');
      }

      // Buscar el case_id basado en el número de caso
      let caseId = data.caseId;
      if (!caseId && data.caseNumber) {
        const { data: caseData } = await supabase
          .from('cases')
          .select('id')
          .eq('numero_caso', data.caseNumber)
          .single();
        
        caseId = caseData?.id || null;
      }

      const updateData = {
        fecha: data.fecha,
        case_number: data.caseNumber,
        case_id: caseId, // Puede ser null si el caso está archivado
        nombre_script: data.nombreScript,
        numero_revision_svn: data.numeroRevisionSvn || null,
        aplicacion_id: data.aplicacionId,
        observaciones: data.observaciones || null,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('disposiciones_scripts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating disposicion:', error);
        throw error;
      }

      // Obtener el registro completo usando la vista
      const { data: fullRecord, error: fetchError } = await supabase
        .from('disposiciones_scripts_with_case')
        .select(`
          *,
          aplicacion:aplicaciones!inner(nombre),
          user:user_profiles(full_name, email)
        `)
        .eq('id', result.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated disposicion:', fetchError);
        throw fetchError;
      }

      return {
        id: fullRecord.id,
        fecha: fullRecord.fecha,
        caseNumber: fullRecord.case_number,
        caseId: fullRecord.case_id,
        nombreScript: fullRecord.nombre_script,
        numeroRevisionSvn: fullRecord.numero_revision_svn,
        aplicacionId: fullRecord.aplicacion_id,
        observaciones: fullRecord.observaciones,
        userId: fullRecord.user_profile_id,
        createdAt: fullRecord.created_at,
        updatedAt: fullRecord.updated_at,
        isCaseArchived: fullRecord.is_case_archived,
        case: fullRecord.case_info,
        aplicacion: fullRecord.aplicacion,
        user: fullRecord.user,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-por-mes'] });
    },
  });
};

export const useDeleteDisposicionScripts = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();
  const disposicionesPermissions = useDisposicionScriptsPermissions();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener la disposición actual para verificar permisos
      const { data: currentDisposicion, error: getDeleteError } = await supabase
        .from('disposiciones_scripts')
        .select('user_profile_id')
        .eq('id', id)
        .single();
        
      if (getDeleteError) throw getDeleteError;
      
      // Verificar permisos de eliminación
      if (!userProfile?.id || !disposicionesPermissions.canPerformActionOnDisposicion(currentDisposicion.user_profile_id, userProfile.id, 'delete')) {
        throw new Error('No tiene permisos para eliminar esta disposición');
      }

      const { error } = await supabase
        .from('disposiciones_scripts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting disposicion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-por-mes'] });
    },
  });
};
