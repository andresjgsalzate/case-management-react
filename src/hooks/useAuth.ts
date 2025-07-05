import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const queryClient = useQueryClient();

  // Verificar usuario actual con timeout
  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      console.log('🔐 Obteniendo usuario de Supabase...');
      
      // Timeout para evitar cuelgues indefinidos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al conectar con Supabase')), 10000);
      });

      const authPromise = supabase.auth.getUser();

      try {
        const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('❌ Error auth:', error);
          throw error;
        }
        
        console.log('👤 Usuario obtenido:', user ? `${user.email}` : 'No autenticado');
        return user;
      } catch (error) {
        console.error('💥 Error fatal en auth:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 2000,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Escuchar cambios de autenticación
  useEffect(() => {
    console.log('🔄 Configurando listener de auth...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
        
        setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });

        // Invalidar queries cuando cambie el estado de auth
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        queryClient.invalidateQueries({ queryKey: ['origenes'] });
        queryClient.invalidateQueries({ queryKey: ['aplicaciones'] });
      }
    );

    return () => {
      console.log('🧹 Limpiando listener de auth...');
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Actualizar estado cuando cambie la query
  useEffect(() => {
    setAuthState({
      user: user ?? null,
      loading: isLoading,
      error: queryError as AuthError ?? null,
    });
  }, [user, isLoading, queryError]);

  // Mutation para sign in
  const signIn = useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      console.log('🔐 Iniciando sesión...', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error sign in:', error);
        throw error;
      }

      console.log('✅ Sign in exitoso');
      return data;
    },
    onSuccess: () => {
      toast.success('¡Bienvenido de vuelta!');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign in:', error);
      toast.error(getAuthErrorMessage(error));
    },
  });

  // Mutation para sign up
  const signUp = useMutation({
    mutationFn: async ({ email, password, name }: SignUpData) => {
      console.log('📝 Registrando usuario...', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          }
        }
      });

      if (error) {
        console.error('❌ Error sign up:', error);
        throw error;
      }

      console.log('✅ Sign up exitoso');
      return data;
    },
    onSuccess: (data) => {
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      } else {
        toast.success('¡Cuenta creada exitosamente!');
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign up:', error);
      toast.error(getAuthErrorMessage(error));
    },
  });

  // Mutation para sign out
  const signOut = useMutation({
    mutationFn: async () => {
      console.log('🚪 Cerrando sesión...');
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Error sign out:', error);
        throw error;
      }

      console.log('✅ Sign out exitoso');
    },
    onSuccess: () => {
      toast.success('Sesión cerrada correctamente');
      queryClient.clear(); // Limpiar todas las queries
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign out:', error);
      toast.error('Error al cerrar sesión');
    },
  });

  // Mutation para reset password
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      console.log('🔄 Enviando reset password...', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Error reset password:', error);
        throw error;
      }

      console.log('✅ Reset password enviado');
    },
    onSuccess: () => {
      toast.success('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en reset password:', error);
      toast.error(getAuthErrorMessage(error));
    },
  });

  // Mutation para update password
  const updatePassword = useMutation({
    mutationFn: async (newPassword: string) => {
      console.log('🔄 Actualizando contraseña...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('❌ Error update password:', error);
        throw error;
      }

      console.log('✅ Contraseña actualizada');
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente');
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en update password:', error);
      toast.error(getAuthErrorMessage(error));
    },
  });

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
};

// Función helper para traducir errores de auth
function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    case 'Email not confirmed':
      return 'Debes confirmar tu email antes de iniciar sesión.';
    case 'User already registered':
      return 'Ya existe una cuenta con este email.';
    case 'Password should be at least 6 characters':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'Unable to validate email address: invalid format':
      return 'Formato de email inválido.';
    case 'Signup is disabled':
      return 'El registro está deshabilitado.';
    case 'Too many requests':
      return 'Demasiados intentos. Intenta más tarde.';
    case 'Email rate limit exceeded':
      return 'Límite de emails excedido. Espera antes de intentar de nuevo.';
    default:
      return error.message || 'Error de autenticación';
  }
}
