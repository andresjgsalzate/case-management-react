// Archivo temporal para debugging - eliminar después
import { useQueryClient } from '@tanstack/react-query';

export const useDebugHelper = () => {
  const queryClient = useQueryClient();

  const invalidateAllQueries = () => {
    console.log('🔄 Invalidando todas las queries...');
    queryClient.invalidateQueries();
    queryClient.removeQueries();
    console.log('✅ Queries invalidadas');
  };

  const logCacheStatus = () => {
    console.log('📊 Estado del cache de React Query:');
    console.log('- UserProfile queries:', queryClient.getQueriesData({ queryKey: ['userProfile'] }));
    console.log('- Users queries:', queryClient.getQueriesData({ queryKey: ['users'] }));
    console.log('- UserPermissions queries:', queryClient.getQueriesData({ queryKey: ['userPermissions'] }));
  };

  return {
    invalidateAllQueries,
    logCacheStatus
  };
};

// Función global para usar en la consola del navegador
(window as any).debugQueries = () => {
  const queryClient = (window as any).__reactQueryClient;
  if (queryClient) {
    console.log('🔄 Invalidando todas las queries desde consola...');
    queryClient.invalidateQueries();
    queryClient.removeQueries();
    console.log('✅ Queries invalidadas desde consola');
  } else {
    console.error('❌ No se encontró el queryClient');
  }
};
