import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useRoles } from '@/shared/hooks/useRoles';
import type { Role } from '@/shared/types/permissions';

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  roleId: z.string().min(1, 'Debe seleccionar un rol'),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface InviteNewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteNewUserModal: React.FC<InviteNewUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showSuccess, showError } = useNotification();
  const { data: rolesData } = useRoles();
  const queryClient = useQueryClient();

  const roles = rolesData?.roles || [];

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      roleId: '',
    },
  });

  // Hook para invitar nuevo usuario
  const inviteUser = useMutation({
    mutationFn: async (userData: InviteUserForm) => {
      // 1. Crear usuario en Supabase Auth con inviteUserByEmail
      const { data, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        userData.email,
        {
          data: {
            full_name: userData.fullName,
            role_id: userData.roleId,
          },
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (authError) {
        console.error('Error inviting user:', authError);
        throw authError;
      }

      if (!data.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear perfil de usuario en user_profiles
      const selectedRole = roles.find((role: Role) => role.id === userData.roleId);
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role_id: userData.roleId,
          role_name: selectedRole?.name || 'user',
          is_active: false, // Inactivo hasta que complete el registro
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Intentar limpiar el usuario de auth si falla la creación del perfil
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (cleanupError) {
          console.error('Error cleaning up user:', cleanupError);
        }
        throw profileError;
      }

      return {
        userId: data.user.id,
        email: userData.email,
        fullName: userData.fullName,
      };
    },
    onSuccess: (result) => {
      showSuccess(
        'Usuario invitado exitosamente',
        `Se ha enviado un email de invitación a ${result.email}. El usuario debe seguir el enlace para completar su registro.`
      );
      
      // Invalidar queries para actualizar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Limpiar formulario y cerrar modal
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      console.error('Error inviting user:', error);
      
      let errorMessage = 'Error al invitar usuario';
      
      if (error.message?.includes('already been invited')) {
        errorMessage = 'Este usuario ya ha sido invitado anteriormente';
      } else if (error.message?.includes('already registered')) {
        errorMessage = 'Ya existe un usuario con este email';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El formato del email no es válido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError('Error en invitación', errorMessage);
    },
  });

  const handleSubmit = (data: InviteUserForm) => {
    inviteUser.mutate(data);
  };

  const handleClose = () => {
    if (!inviteUser.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invitar Nuevo Usuario"
      size="md"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Email */}
        <Input
          label="Email *"
          type="email"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
          disabled={inviteUser.isPending}
          placeholder="usuario@ejemplo.com"
        />

        {/* Nombre completo */}
        <Input
          label="Nombre Completo *"
          {...form.register('fullName')}
          error={form.formState.errors.fullName?.message}
          disabled={inviteUser.isPending}
          placeholder="Ej: Juan Pérez García"
        />

        {/* Rol */}
        <Select
          label="Rol *"
          {...form.register('roleId')}
          error={form.formState.errors.roleId?.message}
          disabled={inviteUser.isPending}
        >
          <option value="">Seleccionar rol...</option>
          {roles?.filter((role: Role) => role.is_active).map((role: Role) => (
            <option key={role.id} value={role.id}>
              {role.name} - {role.description}
            </option>
          ))}
        </Select>

        {/* Información sobre el proceso */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">📧 Proceso de invitación:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Se enviará un email de invitación al usuario</li>
              <li>El usuario debe hacer clic en el enlace del email</li>
              <li>Se le pedirá que establezca su contraseña</li>
              <li>Una vez completado, su cuenta estará activa</li>
            </ul>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={inviteUser.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={inviteUser.isPending || !form.formState.isValid}
          >
            {inviteUser.isPending ? 'Enviando invitación...' : 'Enviar Invitación'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
