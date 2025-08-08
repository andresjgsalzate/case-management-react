import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { sendCustomPasswordReset } from '@/shared/services/customPasswordReset';

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
  const { showSuccess, showError } = useNotification();

  const queryClient = useQueryClient();

  // Verificar usuario actual con timeout
  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // Timeout para evitar cuelgues indefinidos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al conectar con Supabase')), 10000);
      });

      const authPromise = supabase.auth.getUser();

      try {
        const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]) as any;
        
        // Si hay error pero es porque no hay sesión, devolver null en lugar de arrojar error
        if (error) {
          // Estos errores son normales cuando no hay sesión activa
          if (error.message?.includes('Auth session missing') || 
              error.message?.includes('No session') ||
              error.message?.includes('session_not_found')) {
            return null;
          }
          
          console.error('❌ Error auth:', error);
          throw error;
        }
        
        return user;
      } catch (error: any) {
        // Si es un error de sesión faltante, devolver null en lugar de arrojar error
        if (error.message?.includes('Auth session missing') || 
            error.message?.includes('No session') ||
            error.message?.includes('session_not_found')) {
          return null;
        }
        
        console.error('💥 Error fatal en auth:', error);
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // No reintentar si es un error de sesión faltante
      if (error?.message?.includes('Auth session missing') || 
          error?.message?.includes('No session') ||
          error?.message?.includes('session_not_found')) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 2000,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Escuchar cambios de autenticación
  useEffect(() => {
const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });

        // Solo invalidar queries específicas, no todas
        if (event === 'SIGNED_IN') {
          queryClient.invalidateQueries({ queryKey: ['auth'] });
          queryClient.invalidateQueries({ queryKey: ['systemAccess'] });
        } else if (event === 'SIGNED_OUT') {
          // No invalidar queries aquí, ya se limpian en onSuccess del signOut
}
      }
    );

    return () => {
subscription.unsubscribe();
    };
  }, [queryClient]);

  // Actualizar estado cuando cambie la query
  useEffect(() => {
    // Solo establecer error si no es un error de sesión faltante
    let actualError: AuthError | null = null;
    if (queryError && 
        !queryError.message?.includes('Auth session missing') && 
        !queryError.message?.includes('No session') &&
        !queryError.message?.includes('session_not_found')) {
      actualError = queryError as AuthError;
    }

    setAuthState({
      user: user ?? null,
      loading: isLoading,
      error: actualError,
    });
  }, [user, isLoading, queryError]);

  // Mutation para sign in
  const signIn = useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error sign in:', error);
        throw error;
      }

return data;
    },
    onSuccess: () => {
      showSuccess('¡Bienvenido de vuelta!');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign in:', error);
      showError(getAuthErrorMessage(error));
    },
  });

  // Mutation para sign up
  const signUp = useMutation({
    mutationFn: async ({ email, password, name }: SignUpData) => {
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

return data;
    },
    onSuccess: (data) => {
      if (data.user && !data.user.email_confirmed_at) {
        showSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      } else {
        showSuccess('¡Cuenta creada exitosamente!');
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign up:', error);
      showError(getAuthErrorMessage(error));
    },
  });

  // Mutation para sign out
  const signOut = useMutation({
    mutationFn: async () => {
const { error } = await supabase.auth.signOut({
        scope: 'local' // Cerrar sesión solo localmente
      });

      if (error) {
        console.error('❌ Error sign out:', error);
        throw error;
      }

},
    onSuccess: () => {
      // Limpiar el estado local inmediatamente
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      
      // Limpiar todas las queries después de un pequeño delay
      setTimeout(() => {
        queryClient.clear();
      }, 100);
      
      showSuccess('Sesión cerrada correctamente');
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en sign out:', error);
      showError('Error al cerrar sesión');
    },
  });

  // Mutation para reset password - USANDO SISTEMA PERSONALIZADO
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      console.log('🔐 Usando sistema personalizado de recuperación para:', email);
      
      const result = await sendCustomPasswordReset({ email });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: (result) => {
      console.log('✅ Recuperación personalizada exitosa:', result.logId);
      showSuccess('Email de recuperación enviado', result.message);
    },
    onError: (error: any) => {
      console.error('❌ Error en recuperación personalizada:', error);
      showError('Error al enviar email', error.message);
    },
  });

  // Mutation para update password
  const updatePassword = useMutation({
    mutationFn: async (newPassword: string) => {
const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('❌ Error update password:', error);
        throw error;
      }

},
    onSuccess: () => {
      showSuccess('Contraseña actualizada correctamente');
    },
    onError: (error: AuthError) => {
      console.error('❌ Error en update password:', error);
      showError(getAuthErrorMessage(error));
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
