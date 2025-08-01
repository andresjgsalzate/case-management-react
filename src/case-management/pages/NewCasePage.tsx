import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaseForm } from '@/case-management/components/CaseForm';
import { CaseFormSchema } from '@/shared/lib/validations';
import { useCreateCase, useUpdateCase, useCase } from '@/case-management/hooks/useCases';
import { LoadingSpinner, ErrorMessage } from '@/shared/components/ui/LoadingSpinner';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { showSuccess, showError } = useNotification();

  // Hooks para operaciones
  const createCase = useCreateCase();
  const updateCase = useUpdateCase();
  const { data: existingCase, isLoading, error } = useCase(id || '');

  const handleSubmit = async (data: CaseFormSchema) => {
    try {
      const formData = {
        ...data,
        origenId: data.origenId || undefined,
        aplicacionId: data.aplicacionId || undefined,
      };

      if (isEditing && id) {
        await updateCase.mutateAsync({ ...formData, id });
        showSuccess('Caso actualizado exitosamente');
      } else {
        await createCase.mutateAsync(formData);
        showSuccess('Caso creado exitosamente');
      }
      navigate('/cases');
    } catch (error) {
      showError('Error al guardar el caso', error instanceof Error ? error.message : 'Error desconocido');
      console.error('Error submitting case:', error);
    }
  };

  // Estados de carga para edición
  if (isEditing && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" text="Cargando caso..." />
      </div>
    );
  }

  if (isEditing && error) {
    return (
      <ErrorMessage 
        message="Error al cargar el caso para editar" 
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Preparar valores por defecto para edición
  const defaultValues = isEditing && existingCase ? {
    numeroCaso: existingCase.numeroCaso,
    descripcion: existingCase.descripcion,
    fecha: existingCase.fecha,
    origenId: existingCase.origenId,
    aplicacionId: existingCase.aplicacionId,
    historialCaso: existingCase.historialCaso,
    conocimientoModulo: existingCase.conocimientoModulo,
    manipulacionDatos: existingCase.manipulacionDatos,
    claridadDescripcion: existingCase.claridadDescripcion,
    causaFallo: existingCase.causaFallo,
  } : undefined;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Caso' : 'Nuevo Caso'}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {isEditing ? 'Modifique los datos del caso' : 'Registre un nuevo caso en el sistema'}
        </p>
      </div>

      <div className="card p-8 w-full">
        <CaseForm 
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isLoading={createCase.isPending || updateCase.isPending}
          submitText={isEditing ? 'Actualizar Caso' : 'Registrar Caso'}
        />
      </div>
    </PageWrapper>
  );
};
