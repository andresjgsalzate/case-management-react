import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  DisposicionScripts, 
  DisposicionScriptsFormData, 
  DisposicionMensual,
  DisposicionPorCaso,
  DisposicionFilters 
} from '@/types';

// ===== CONSULTAS =====

export const useDisposicionesScripts = (filters?: DisposicionFilters) => {
  return useQuery({
    queryKey: ['disposiciones-scripts', filters],
    queryFn: async (): Promise<DisposicionScripts[]> => {
      let query = supabase
        .from('disposiciones_scripts')
        .select(`
          *,
          case:cases!inner(
            id,
            numero_caso,
            descripcion,
            aplicacion:aplicaciones(id, nombre)
          ),
          aplicacion:aplicaciones!inner(id, nombre),
          user:user_profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
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
        caseId: item.case_id,
        nombreScript: item.nombre_script,
        numeroRevisionSvn: item.numero_revision_svn,
        aplicacionId: item.aplicacion_id,
        observaciones: item.observaciones,
        userId: item.user_profile_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        case: item.case ? {
          id: item.case.id,
          numeroCaso: item.case.numero_caso,
          descripcion: item.case.descripcion,
          fecha: '', // No necesitamos todos los campos para la relación
          historialCaso: 1,
          conocimientoModulo: 1,
          manipulacionDatos: 1,
          claridadDescripcion: 1,
          causaFallo: 1,
          puntuacion: 5,
          clasificacion: 'Baja Complejidad' as const,
          createdAt: '',
          updatedAt: '',
          aplicacion: item.case.aplicacion
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
    },
  });
};

export const useDisposicionScripts = (id: string) => {
  return useQuery({
    queryKey: ['disposicion-scripts', id],
    queryFn: async (): Promise<DisposicionScripts | null> => {
      const { data, error } = await supabase
        .from('disposiciones_scripts')
        .select(`
          *,
          case:cases!inner(
            id,
            numero_caso,
            descripcion,
            aplicacion:aplicaciones(id, nombre)
          ),
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

      return {
        id: data.id,
        fecha: data.fecha,
        caseId: data.case_id,
        nombreScript: data.nombre_script,
        numeroRevisionSvn: data.numero_revision_svn,
        aplicacionId: data.aplicacion_id,
        observaciones: data.observaciones,
        userId: data.user_profile_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        case: data.case ? {
          id: data.case.id,
          numeroCaso: data.case.numero_caso,
          descripcion: data.case.descripcion,
          fecha: '',
          historialCaso: 1,
          conocimientoModulo: 1,
          manipulacionDatos: 1,
          claridadDescripcion: 1,
          causaFallo: 1,
          puntuacion: 5,
          clasificacion: 'Baja Complejidad' as const,
          createdAt: '',
          updatedAt: '',
          aplicacion: data.case.aplicacion
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
        .from('disposiciones_scripts')
        .select(`
          fecha,
          case:cases!inner(numero_caso, id),
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
          const caseKey = `${disp.case.numero_caso}-${disp.aplicacion.nombre}`;
          
          if (!grupoPorCaso[caseKey]) {
            grupoPorCaso[caseKey] = {
              numeroCaso: disp.case.numero_caso,
              aplicacionNombre: disp.aplicacion.nombre,
              cantidad: 0,
              caseId: disp.case.id,
              aplicacionId: disp.aplicacion.id,
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

  return useMutation({
    mutationFn: async (data: DisposicionScriptsFormData): Promise<DisposicionScripts> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el perfil del usuario
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      const insertData = {
        fecha: data.fecha,
        case_id: data.caseId,
        nombre_script: data.nombreScript,
        numero_revision_svn: data.numeroRevisionSvn || null,
        aplicacion_id: data.aplicacionId,
        observaciones: data.observaciones || null,
        user_profile_id: userProfile.id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('disposiciones_scripts')
        .insert(insertData)
        .select(`
          *,
          case:cases!inner(numero_caso, descripcion),
          aplicacion:aplicaciones!inner(nombre),
          user:user_profiles(full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating disposicion:', error);
        throw error;
      }

      return {
        id: result.id,
        fecha: result.fecha,
        caseId: result.case_id,
        nombreScript: result.nombre_script,
        numeroRevisionSvn: result.numero_revision_svn,
        aplicacionId: result.aplicacion_id,
        observaciones: result.observaciones,
        userId: result.user_profile_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        case: result.case,
        aplicacion: result.aplicacion,
        user: result.user,
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

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DisposicionScriptsFormData }): Promise<DisposicionScripts> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const updateData = {
        fecha: data.fecha,
        case_id: data.caseId,
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
        .select(`
          *,
          case:cases!inner(numero_caso, descripcion),
          aplicacion:aplicaciones!inner(nombre),
          user:user_profiles(full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating disposicion:', error);
        throw error;
      }

      return {
        id: result.id,
        fecha: result.fecha,
        caseId: result.case_id,
        nombreScript: result.nombre_script,
        numeroRevisionSvn: result.numero_revision_svn,
        aplicacionId: result.aplicacion_id,
        observaciones: result.observaciones,
        userId: result.user_profile_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        case: result.case,
        aplicacion: result.aplicacion,
        user: result.user,
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

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
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
