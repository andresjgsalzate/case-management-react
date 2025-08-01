import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { Case, CaseFormData } from '@/types';
import { calcularPuntuacion, clasificarCaso } from '@/shared/utils/caseUtils';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

// Función para mapear datos de DB a formato frontend
const mapCaseFromDB = (dbCase: any): Case => {
  return {
    id: dbCase.id,
    numeroCaso: dbCase.numero_caso,
    descripcion: dbCase.descripcion,
    fecha: dbCase.fecha,
    origenId: dbCase.origen_id,
    aplicacionId: dbCase.aplicacion_id,
    historialCaso: dbCase.historial_caso,
    conocimientoModulo: dbCase.conocimiento_modulo,
    manipulacionDatos: dbCase.manipulacion_datos,
    claridadDescripcion: dbCase.claridad_descripcion,
    causaFallo: dbCase.causa_fallo,
    puntuacion: dbCase.puntuacion,
    clasificacion: dbCase.clasificacion,
    createdAt: dbCase.created_at,
    updatedAt: dbCase.updated_at,
    userId: dbCase.user_id,
    origen: dbCase.origen,
    aplicacion: dbCase.aplicacion,
  };
};

// Hook para obtener todos los casos (filtrado según permisos del usuario)
export const useCases = () => {
  const { canViewAllCases, userProfile } = usePermissions();
  
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      try {
        let query = supabase
          .from('cases')
          .select(`
            *,
            origen:origenes(*),
            aplicacion:aplicaciones(*)
          `)
          .order('created_at', { ascending: false });

        // Si el usuario NO puede ver todos los casos, filtrar solo los suyos
        if (!canViewAllCases() && userProfile?.id) {
          query = query.eq('user_id', userProfile.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Error fetching cases:', error);
          
          // Check if it's the infinite recursion error
          if (error.code === '42P17' && error.message?.includes('infinite recursion')) {
            console.error('🔄 RLS infinite recursion detected. Please run migration 007_fix_rls_recursion.sql');
            // Return empty array to prevent further attempts until migration is applied
            return [];
          }
          
          throw error;
        }
        
        return data?.map(mapCaseFromDB) || [];
      } catch (error) {
        console.error('💥 Fatal error fetching cases:', error);
        throw error;
      }
    },
    enabled: !!userProfile, // Solo ejecutar cuando tengamos el perfil del usuario
  });
};

// Hook para obtener un caso específico
export const useCase = (id: string) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          origen:origenes(*),
          aplicacion:aplicaciones(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return mapCaseFromDB(data);
    },
    enabled: !!id,
  });
};

// Hook para crear un caso
export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseData: CaseFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const puntuacion = calcularPuntuacion(
        caseData.historialCaso,
        caseData.conocimientoModulo,
        caseData.manipulacionDatos,
        caseData.claridadDescripcion,
        caseData.causaFallo
      );

      const clasificacion = clasificarCaso(puntuacion);

      const newCase = {
        numero_caso: caseData.numeroCaso,
        descripcion: caseData.descripcion,
        fecha: caseData.fecha,
        origen_id: caseData.origenId || null,
        aplicacion_id: caseData.aplicacionId || null,
        historial_caso: caseData.historialCaso,
        conocimiento_modulo: caseData.conocimientoModulo,
        manipulacion_datos: caseData.manipulacionDatos,
        claridad_descripcion: caseData.claridadDescripcion,
        causa_fallo: caseData.causaFallo,
        puntuacion,
        clasificacion,
        user_id: user.user.id,
      };

      const { data, error } = await supabase
        .from('cases')
        .insert(newCase)
        .select(`
          *,
          origen:origenes(*),
          aplicacion:aplicaciones(*)
        `)
        .single();

      if (error) throw error;
      return mapCaseFromDB(data);
    },
    onSuccess: () => {
      // Invalidar queries de casos
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      // Invalidar queries de control de casos (cross-módulo)
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
    },
  });
};

// Hook para actualizar un caso
export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...caseData }: CaseFormData & { id: string }) => {
      const puntuacion = calcularPuntuacion(
        caseData.historialCaso,
        caseData.conocimientoModulo,
        caseData.manipulacionDatos,
        caseData.claridadDescripcion,
        caseData.causaFallo
      );

      const clasificacion = clasificarCaso(puntuacion);

      const updatedCase = {
        numero_caso: caseData.numeroCaso,
        descripcion: caseData.descripcion,
        fecha: caseData.fecha,
        origen_id: caseData.origenId || null,
        aplicacion_id: caseData.aplicacionId || null,
        historial_caso: caseData.historialCaso,
        conocimiento_modulo: caseData.conocimientoModulo,
        manipulacion_datos: caseData.manipulacionDatos,
        claridad_descripcion: caseData.claridadDescripcion,
        causa_fallo: caseData.causaFallo,
        puntuacion,
        clasificacion,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('cases')
        .update(updatedCase)
        .eq('id', id)
        .select(`
          *,
          origen:origenes(*),
          aplicacion:aplicaciones(*)
        `)
        .single();

      if (error) throw error;
      return mapCaseFromDB(data);
    },
    onSuccess: (data) => {
      // Invalidar queries de casos
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', data.id] });
      // Invalidar queries de control de casos (cross-módulo)
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
    },
  });
};

// Hook para eliminar un caso
export const useDeleteCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar queries de casos
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      // Invalidar queries de control de casos (cross-módulo)
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
    },
  });
};
