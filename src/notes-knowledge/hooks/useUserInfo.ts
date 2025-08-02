import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

interface UserInfo {
  full_name: string;
  email: string;
}

export const useUserInfo = (userId: string) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        if (data && !error) {
          setUserInfo(data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { userInfo, loading };
};
