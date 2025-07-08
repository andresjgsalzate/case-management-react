import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface CleanupResult {
  deletedCount: number;
  success: boolean;
  error?: string;
}

export const useCleanupOrphanedRecords = () => {
  const [isLoading, setIsLoading] = useState(false);

  const cleanupOrphanedRecords = async (): Promise<CleanupResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('cleanup_orphaned_records');

      if (error) {
        throw error;
      }

      return {
        deletedCount: data || 0,
        success: true
      };
    } catch (error) {
      console.error('Error cleaning up orphaned records:', error);
      return {
        deletedCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cleanupOrphanedRecords,
    isLoading
  };
};
