import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook para obtener todos los roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      console.log('🔍 [useRoles] Consultando roles...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ [useRoles] Error fetching roles:', error);
        throw error;
      }

      console.log('✅ [useRoles] Roles obtenidos:', data);

      // Mapear de snake_case a camelCase
      return data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.is_active,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
      }));
    },
  });
};
