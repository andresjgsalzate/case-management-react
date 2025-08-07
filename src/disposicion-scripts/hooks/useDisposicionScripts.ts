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
        // Usar la tabla real con joins necesarios
        let mainQuery = supabase
          .from('disposiciones_scripts')
          .select(`
            *,
            aplicaciones(id, nombre),
            user_profiles(id, full_name, email),
            cases(id, numero_caso, descripcion)
          `)
          .order('created_at', { ascending: false });

        // ⚠️ CORRECCIÓN CRÍTICA: Aplicar filtros basados en los permisos de disposiciones
        const highestReadScope = disposicionesPermissions.getHighestReadScope();
        
        if (highestReadScope === 'all') {
          // ✅ ADMIN puede ver TODAS las disposiciones - NO aplicar filtro
        } else if (highestReadScope === 'team') {
          // Puede ver disposiciones de su equipo (implementar lógica de equipo si es necesario)
        } else if (highestReadScope === 'own' && userProfile?.id) {
          // Solo puede ver sus propias disposiciones
          mainQuery = mainQuery.eq('user_profile_id', userProfile.id);
        } else {
          // Sin permisos de lectura - no retornar datos
          return [];
        }

        // Aplicar filtros adicionales si existen
        if (filters?.year) {
          mainQuery = mainQuery.gte('fecha', `${filters.year}-01-01`)
                      .lt('fecha', `${filters.year + 1}-01-01`);
        }

        if (filters?.month) {
          const monthStart = `${filters.year || new Date().getFullYear()}-${filters.month.toString().padStart(2, '0')}-01`;
          const nextMonth = filters.month === 12 ? 1 : filters.month + 1;
          const nextYear = filters.month === 12 ? (filters.year || new Date().getFullYear()) + 1 : (filters.year || new Date().getFullYear());
          const monthEnd = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
          
          mainQuery = mainQuery.gte('fecha', monthStart).lt('fecha', monthEnd);
        }

        if (filters?.aplicacionId) {
          mainQuery = mainQuery.eq('aplicacion_id', filters.aplicacionId);
        }

        if (filters?.caseNumber) {
          mainQuery = mainQuery.ilike('case_number', `%${filters.caseNumber}%`);
        }

        const { data, error } = await mainQuery;

        if (error) {
          console.error('❌ [DISPOSICIONES] Error en query:', error);
          console.error('❌ [DISPOSICIONES] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        // ⚠️ MAPEO CRUCIAL: Convertir datos de la base de datos al formato esperado por la interfaz
        const mappedData = data?.map((record: any) => ({
          ...record,
          // Mapear campos de la base de datos (snake_case) a la interfaz (camelCase)
          aplicacionId: record.aplicacion_id,
          caseNumber: record.case_number,
          caseId: record.case_id,
          nombreScript: record.nombre_script,
          numeroRevisionSvn: record.numero_revision_svn,
          userId: record.user_profile_id,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
          // ⚠️ PRESERVAR RELACIONES: Mantener las relaciones pobladas por Supabase
          aplicacion: record.aplicaciones, // aplicaciones -> aplicacion
          user: record.user_profiles ? { // user_profiles -> user (normalizando campos)
            ...record.user_profiles,
            fullName: record.user_profiles.full_name // Convertir snake_case a camelCase
          } : null,
          case: record.cases,              // cases -> case
        })) || [];

        return mappedData;
      } catch (error) {
        console.error('💥 [DISPOSICIONES] Error fatal en useDisposicionesScripts:', error);
        throw error;
      }
    },
    enabled: disposicionesPermissions.hasAnyDisposicionesPermission(),
    retry: 2,
    retryDelay: 1000,
  });
};

// ===== MUTACIONES =====

export const useCreateDisposicionScript = () => {
  const queryClient = useQueryClient();
  const { userProfile } = usePermissions();

  return useMutation({
    mutationFn: async (data: DisposicionScriptsFormData): Promise<DisposicionScripts> => {
      // Mapear campos del formulario a la estructura de la base de datos
      const disposicionData = {
        fecha: data.fecha,
        case_number: data.caseNumber,
        case_id: data.caseId,
        aplicacion_id: data.aplicacionId,  // ⚠️ CORRECCIÓN: aplicacionId -> aplicacion_id
        nombre_script: data.nombreScript,
        numero_revision_svn: data.numeroRevisionSvn,
        observaciones: data.observaciones,
        user_profile_id: userProfile?.id,
      };
      
      const { data: result, error } = await supabase
        .from('disposiciones_scripts')
        .insert(disposicionData)
        .select(`
          *,
          aplicaciones(id, nombre),
          user_profiles(id, full_name, email),
          cases(id, numero_caso, descripcion)
        `)
        .single();

      if (error) {
        console.error('❌ [DISPOSICIONES] Error al crear disposición:', error);
        throw error;
      }

      // ⚠️ MAPEO: Convertir respuesta de la base de datos al formato esperado por la interfaz
      const mappedResult = {
        ...result,
        aplicacionId: result.aplicacion_id,
        caseNumber: result.case_number,
        caseId: result.case_id,
        nombreScript: result.nombre_script,
        numeroRevisionSvn: result.numero_revision_svn,
        userId: result.user_profile_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        // ⚠️ PRESERVAR RELACIONES
        aplicacion: result.aplicaciones,
        user: result.user_profiles ? { // Normalizar campos del usuario
          ...result.user_profiles,
          fullName: result.user_profiles.full_name // Convertir snake_case a camelCase
        } : null,
        case: result.cases,
      };
      
      return mappedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-mensuales'] });
    },
  });
};

export const useUpdateDisposicionScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DisposicionScriptsFormData> }): Promise<DisposicionScripts> => {
      // Mapear campos del formulario a la estructura de la base de datos
      const disposicionData: any = {};
      
      if (data.fecha) disposicionData.fecha = data.fecha;
      if (data.caseNumber) disposicionData.case_number = data.caseNumber;
      if (data.caseId) disposicionData.case_id = data.caseId;
      if (data.aplicacionId) disposicionData.aplicacion_id = data.aplicacionId;  // ⚠️ CORRECCIÓN: aplicacionId -> aplicacion_id
      if (data.nombreScript) disposicionData.nombre_script = data.nombreScript;
      if (data.numeroRevisionSvn) disposicionData.numero_revision_svn = data.numeroRevisionSvn;
      if (data.observaciones !== undefined) disposicionData.observaciones = data.observaciones;
      
      const { data: result, error } = await supabase
        .from('disposiciones_scripts')
        .update(disposicionData)
        .eq('id', id)
        .select(`
          *,
          aplicaciones(id, nombre),
          user_profiles(id, full_name, email),
          cases(id, numero_caso, descripcion)
        `)
        .single();

      if (error) {
        console.error('❌ [DISPOSICIONES] Error al actualizar disposición:', error);
        throw error;
      }

      // ⚠️ MAPEO: Convertir respuesta de la base de datos al formato esperado por la interfaz
      const mappedResult = {
        ...result,
        aplicacionId: result.aplicacion_id,
        caseNumber: result.case_number,
        caseId: result.case_id,
        nombreScript: result.nombre_script,
        numeroRevisionSvn: result.numero_revision_svn,
        userId: result.user_profile_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        // Preservar relaciones de Supabase para mostrar en la interfaz
        aplicacion: result.aplicaciones,
        user: result.user_profiles ? { // Normalizar campos del usuario
          ...result.user_profiles,
          fullName: result.user_profiles.full_name // Convertir snake_case a camelCase
        } : null,
        case: result.cases,
      };
      
      return mappedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-mensuales'] });
    },
  });
};

export const useDeleteDisposicionScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('disposiciones_scripts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposiciones-scripts'] });
      queryClient.invalidateQueries({ queryKey: ['disposiciones-mensuales'] });
    },
  });
};

// ===== CONSULTAS ADICIONALES =====

export const useDisposicionesMensuales = (year?: number) => {
  const disposicionesPermissions = useDisposicionScriptsPermissions();
  
  return useQuery({
    queryKey: ['disposiciones-mensuales', year],
    queryFn: async (): Promise<DisposicionMensual[]> => {
      const targetYear = year || new Date().getFullYear();
      
      const disposicionesQuery = supabase
        .from('disposiciones_scripts')
        .select(`
          fecha,
          case_number,
          aplicaciones(nombre),
          case_id,
          aplicacion_id
        `)
        .gte('fecha', `${targetYear}-01-01`)
        .lt('fecha', `${targetYear + 1}-01-01`)
        .order('fecha', { ascending: false });

      const { data, error } = await disposicionesQuery;

      if (error) {
        throw error;
      }

      // Agrupar por mes
      const mesesMap = new Map<number, DisposicionPorCaso[]>();
      
      data?.forEach((disposicion: any) => {
        const fecha = new Date(disposicion.fecha);
        const mes = fecha.getMonth() + 1;
        
        if (!mesesMap.has(mes)) {
          mesesMap.set(mes, []);
        }
        
        const casosEnMes = mesesMap.get(mes)!;
        const casoExistente = casosEnMes.find(c => 
          c.numeroCaso === disposicion.case_number && 
          c.aplicacionId === disposicion.aplicacion_id
        );
        
        if (casoExistente) {
          casoExistente.cantidad++;
        } else {
          casosEnMes.push({
            numeroCaso: disposicion.case_number,
            aplicacionNombre: disposicion.aplicaciones?.nombre || 'N/A',
            cantidad: 1,
            caseId: disposicion.case_id,
            aplicacionId: disposicion.aplicacion_id,
            isCaseArchived: !disposicion.case_id
          });
        }
      });

      // Convertir a array y ordenar
      const mesesArray: DisposicionMensual[] = [];
      const nombreseMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      for (let mes = 1; mes <= 12; mes++) {
        const disposicionesEnMes = mesesMap.get(mes) || [];
        if (disposicionesEnMes.length > 0) {
          mesesArray.push({
            year: targetYear,
            month: mes,
            monthName: nombreseMeses[mes - 1],
            disposiciones: disposicionesEnMes.sort((a, b) => b.cantidad - a.cantidad),
            totalDisposiciones: disposicionesEnMes.reduce((sum, d) => sum + d.cantidad, 0)
          });
        }
      }

      return mesesArray.sort((a, b) => b.month - a.month);
    },
    enabled: disposicionesPermissions.hasAnyDisposicionesPermission(),
  });
};
