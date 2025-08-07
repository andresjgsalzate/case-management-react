/**
 * =================================================================
 * HOOK: TIPOS DE DOCUMENTOS PARAMETRIZABLES
 * =================================================================
 * Descripción: Hook para gestionar tipos de documentos desde BD
 * Versión: 1.0
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentTypesService, type CreateDocumentTypeRequest, type UpdateDocumentTypeRequest } from '../services/documentTypesService';

// ===== QUERY KEYS =====
const QUERY_KEYS = {
  documentTypes: 'document-types',
  activeDocumentTypes: 'active-document-types',
  allDocumentTypes: 'all-document-types',
} as const;

// ===== HOOKS DE CONSULTA =====

/**
 * Hook para obtener tipos de documentos activos
 */
export const useActiveDocumentTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.activeDocumentTypes],
    queryFn: DocumentTypesService.getActiveDocumentTypes,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener todos los tipos de documentos (admin)
 */
export const useAllDocumentTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.allDocumentTypes],
    queryFn: DocumentTypesService.getAllDocumentTypes,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un tipo de documento por ID
 */
export const useDocumentType = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documentTypes, id],
    queryFn: () => id ? DocumentTypesService.getDocumentTypeById(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un tipo de documento por código
 */
export const useDocumentTypeByCode = (code: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documentTypes, 'code', code],
    queryFn: () => code ? DocumentTypesService.getDocumentTypeByCode(code) : null,
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ===== HOOKS DE MUTACIÓN =====

/**
 * Hook para crear un nuevo tipo de documento
 */
export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentType: CreateDocumentTypeRequest) => 
      DocumentTypesService.createDocumentType(documentType),
    onSuccess: () => {
      // Invalidar cachés relacionados
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para actualizar un tipo de documento
 */
export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateDocumentTypeRequest }) => 
      DocumentTypesService.updateDocumentType(id, updates),
    onSuccess: (updatedType) => {
      // Actualizar cachés específicos
      queryClient.setQueryData(
        [QUERY_KEYS.documentTypes, updatedType.id], 
        updatedType
      );
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para desactivar un tipo de documento
 */
export const useDeactivateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentTypesService.deactivateDocumentType(id),
    onSuccess: () => {
      // Invalidar cachés
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para activar un tipo de documento
 */
export const useActivateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentTypesService.activateDocumentType(id),
    onSuccess: () => {
      // Invalidar cachés
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para eliminar permanentemente un tipo de documento
 */
export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentTypesService.deleteDocumentType(id),
    onSuccess: () => {
      // Invalidar cachés
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para actualizar orden de tipos
 */
export const useUpdateDisplayOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (typeOrders: Array<{ id: string; display_order: number }>) => 
      DocumentTypesService.updateDisplayOrder(typeOrders),
    onSuccess: () => {
      // Invalidar cachés para refrescar orden
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activeDocumentTypes] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allDocumentTypes] });
    },
  });
};

/**
 * Hook para verificar disponibilidad de código
 */
export const useCheckCodeAvailability = () => {
  return useMutation({
    mutationFn: ({ code, excludeId }: { code: string; excludeId?: string }) => 
      DocumentTypesService.isCodeAvailable(code, excludeId),
  });
};

// ===== HOOK COMPUESTO =====

/**
 * Hook compuesto que proporciona todas las funcionalidades
 */
export const useDocumentTypes = () => {
  const activeTypes = useActiveDocumentTypes();
  const allTypes = useAllDocumentTypes();
  const createType = useCreateDocumentType();
  const updateType = useUpdateDocumentType();
  const deactivateType = useDeactivateDocumentType();
  const activateType = useActivateDocumentType();
  const deleteType = useDeleteDocumentType();
  const updateOrder = useUpdateDisplayOrder();
  const checkCode = useCheckCodeAvailability();

  return {
    // Datos
    activeTypes: activeTypes.data || [],
    allTypes: allTypes.data || [],
    
    // Estados de carga
    isLoadingActive: activeTypes.isLoading,
    isLoadingAll: allTypes.isLoading,
    
    // Estados de error
    activeTypesError: activeTypes.error,
    allTypesError: allTypes.error,
    
    // Acciones
    createType: createType.mutate,
    updateType: updateType.mutate,
    deactivateType: deactivateType.mutate,
    activateType: activateType.mutate,
    deleteType: deleteType.mutate,
    updateDisplayOrder: updateOrder.mutate,
    checkCodeAvailability: checkCode.mutateAsync,
    
    // Estados de mutación
    isCreating: createType.isPending,
    isUpdating: updateType.isPending,
    isDeactivating: deactivateType.isPending,
    isActivating: activateType.isPending,
    isDeleting: deleteType.isPending,
    isUpdatingOrder: updateOrder.isPending,
    
    // Funciones de refetch
    refetchActive: activeTypes.refetch,
    refetchAll: allTypes.refetch,
  };
};

// ===== UTILIDADES =====

/**
 * Obtener opciones para selector dropdown
 */
export const useDocumentTypeOptions = () => {
  const { data: types, isLoading, error } = useActiveDocumentTypes();

  const options = types?.map(type => ({
    value: type.id,
    label: type.name,
    description: type.description,
    icon: type.icon,
    color: type.color,
    code: type.code,
  })) || [];

  return {
    options,
    isLoading,
    error,
  };
};

/**
 * Buscar tipo por código (para compatibilidad con código legacy)
 */
export const useDocumentTypeByCodeLegacy = (code: string | undefined) => {
  const { activeTypes } = useDocumentTypes();
  
  const type = activeTypes.find(t => t.code === code);
  
  return {
    type,
    isFound: !!type,
  };
};
