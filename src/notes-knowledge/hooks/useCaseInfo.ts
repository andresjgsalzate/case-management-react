import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

interface CaseInfo {
  numero_caso?: string;
  case_number?: string;
  descripcion?: string;
  description?: string;
  clasificacion?: string;
  classification?: string;
}

export const useCaseInfo = (caseId: string, isArchived: boolean = false) => {
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        const table = isArchived ? 'archived_cases' : 'cases';
        const fields = isArchived 
          ? 'case_number, description, classification'
          : 'numero_caso, descripcion, clasificacion';

        const { data, error } = await supabase
          .from(table)
          .select(fields)
          .eq('id', caseId)
          .single();

        if (data && !error) {
          setCaseInfo(data);
        }
      } catch (err) {
        console.error('Error fetching case:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId, isArchived]);

  return { caseInfo, loading };
};
