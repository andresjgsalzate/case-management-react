import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/user-management/hooks/useUserProfile';
import { useOrigenes, useCreateOrigen, useUpdateOrigen, useDeleteOrigen } from '@/case-management/hooks/useOrigenesAplicaciones';
import { useAplicaciones, useCreateAplicacion, useUpdateAplicacion, useDeleteAplicacion } from '@/case-management/hooks/useOrigenesAplicaciones';
import { 
  useCaseStatuses, 
  useCreateCaseStatus, 
  useUpdateCaseStatus, 
  useDeleteCaseStatus,
  CaseStatusFormData 
} from '@/case-management/hooks/useCaseStatusControl';
import { Origen, Aplicacion, OrigenFormData, AplicacionFormData, CaseStatusControl } from '@/types';
import { Modal } from '@/shared/components/ui/Modal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';

// Modal para Orígenes
interface OrigenModalProps {
  isOpen: boolean;
  onClose: () => void;
  origen?: Origen;
  isEdit?: boolean;
}

const OrigenModal: React.FC<OrigenModalProps> = ({ isOpen, onClose, origen, isEdit = false }) => {
  const createOrigen = useCreateOrigen();
  const updateOrigen = useUpdateOrigen();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<OrigenFormData>({
    nombre: origen?.nombre || '',
    descripcion: origen?.descripcion || '',
    activo: origen?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      if (isEdit && origen) {
        await updateOrigen.mutateAsync({ id: origen.id, data: formData });
        showSuccess('Origen actualizado exitosamente');
      } else {
        await createOrigen.mutateAsync(formData);
        showSuccess('Origen creado exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving origen:', error);
      showError('Error al guardar origen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: origen?.nombre || '',
      descripcion: origen?.descripcion || '',
      activo: origen?.activo ?? true,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, origen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Origen' : 'Crear Origen'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={formData.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="Descripción del origen..."
          />
        </div>

        <div className="flex items-center">
          <input
            id="activo"
            type="checkbox"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={createOrigen.isPending || updateOrigen.isPending}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para Aplicaciones
interface AplicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  aplicacion?: Aplicacion;
  isEdit?: boolean;
}

const AplicacionModal: React.FC<AplicacionModalProps> = ({ isOpen, onClose, aplicacion, isEdit = false }) => {
  const createAplicacion = useCreateAplicacion();
  const updateAplicacion = useUpdateAplicacion();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<AplicacionFormData>({
    nombre: aplicacion?.nombre || '',
    descripcion: aplicacion?.descripcion || '',
    activo: aplicacion?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      if (isEdit && aplicacion) {
        await updateAplicacion.mutateAsync({ id: aplicacion.id, data: formData });
        showSuccess('Aplicación actualizada exitosamente');
      } else {
        await createAplicacion.mutateAsync(formData);
        showSuccess('Aplicación creada exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving aplicacion:', error);
      showError('Error al guardar aplicación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: aplicacion?.nombre || '',
      descripcion: aplicacion?.descripcion || '',
      activo: aplicacion?.activo ?? true,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, aplicacion]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Aplicación' : 'Crear Aplicación'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={formData.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="Descripción de la aplicación..."
          />
        </div>

        <div className="flex items-center">
          <input
            id="activo"
            type="checkbox"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={createAplicacion.isPending || updateAplicacion.isPending}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para Estados de Control de Casos
interface CaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStatus?: CaseStatusControl;
  isEdit?: boolean;
}

const CaseStatusModal: React.FC<CaseStatusModalProps> = ({ isOpen, onClose, caseStatus, isEdit = false }) => {
  const createCaseStatus = useCreateCaseStatus();
  const updateCaseStatus = useUpdateCaseStatus();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<CaseStatusFormData>({
    name: caseStatus?.name || '',
    description: caseStatus?.description || '',
    color: caseStatus?.color || '#3B82F6',
    isActive: caseStatus?.isActive ?? true,
    displayOrder: caseStatus?.displayOrder || 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      if (isEdit && caseStatus) {
        await updateCaseStatus.mutateAsync({ id: caseStatus.id, data: formData });
        showSuccess('Estado de caso actualizado exitosamente');
      } else {
        await createCaseStatus.mutateAsync(formData);
        showSuccess('Estado de caso creado exitosamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving case status:', error);
      showError('Error al guardar estado de caso: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: caseStatus?.name || '',
      description: caseStatus?.description || '',
      color: caseStatus?.color || '#3B82F6',
      isActive: caseStatus?.isActive ?? true,
      displayOrder: caseStatus?.displayOrder || 1,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, caseStatus]);

  const colorOptions = [
    { value: '#3B82F6', label: 'Azul', color: 'bg-blue-500' },
    { value: '#EF4444', label: 'Rojo', color: 'bg-red-500' },
    { value: '#10B981', label: 'Verde', color: 'bg-green-500' },
    { value: '#F59E0B', label: 'Amarillo', color: 'bg-yellow-500' },
    { value: '#8B5CF6', label: 'Púrpura', color: 'bg-purple-500' },
    { value: '#06B6D4', label: 'Cian', color: 'bg-cyan-500' },
    { value: '#F97316', label: 'Naranja', color: 'bg-orange-500' },
    { value: '#84CC16', label: 'Lima', color: 'bg-lime-500' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Estado de Control' : 'Crear Estado de Control'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="Descripción del estado..."
          />
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: option.value })}
                className={`flex items-center space-x-2 p-2 rounded-md border-2 transition-colors ${
                  formData.color === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Orden de Visualización
          </label>
          <Input
            type="number"
            value={formData.displayOrder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
            min="1"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Activo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={createCaseStatus.isPending || updateCaseStatus.isPending}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const ConfigurationPage: React.FC = () => {
  const { 
    canManageOrigenes, 
    canManageAplicaciones, 
    canViewOrigenes, 
    canViewAplicaciones,
    canViewCaseStatuses,
    canCreateCaseStatuses,
    canUpdateCaseStatuses,
    canDeleteCaseStatuses,
    canManageCaseStatuses
  } = usePermissions();
  const { showSuccess, showError } = useNotification();
  
  const { data: origenes } = useOrigenes();
  const { data: aplicaciones } = useAplicaciones();
  const { data: caseStatuses } = useCaseStatuses();
  
  const deleteOrigen = useDeleteOrigen();
  const deleteAplicacion = useDeleteAplicacion();
  const deleteCaseStatus = useDeleteCaseStatus();

  const [activeTab, setActiveTab] = useState<'origenes' | 'aplicaciones' | 'case-statuses'>('origenes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [isOrigenModalOpen, setIsOrigenModalOpen] = useState(false);
  const [isAplicacionModalOpen, setIsAplicacionModalOpen] = useState(false);
  const [isCaseStatusModalOpen, setIsCaseStatusModalOpen] = useState(false);
  const [selectedOrigen, setSelectedOrigen] = useState<Origen | undefined>();
  const [selectedAplicacion, setSelectedAplicacion] = useState<Aplicacion | undefined>();
  const [selectedCaseStatus, setSelectedCaseStatus] = useState<CaseStatusControl | undefined>();
  const [isEdit, setIsEdit] = useState(false);

  // Estados para modales de confirmación de eliminación
  const [deleteOrigenModal, setDeleteOrigenModal] = useState<{
    isOpen: boolean;
    origen: Origen | null;
  }>({
    isOpen: false,
    origen: null
  });

  const [deleteAplicacionModal, setDeleteAplicacionModal] = useState<{
    isOpen: boolean;
    aplicacion: Aplicacion | null;
  }>({
    isOpen: false,
    aplicacion: null
  });

  const [deleteCaseStatusModal, setDeleteCaseStatusModal] = useState<{
    isOpen: boolean;
    caseStatus: CaseStatusControl | null;
  }>({
    isOpen: false,
    caseStatus: null
  });

  if (!canViewOrigenes() && !canManageOrigenes() && !canViewAplicaciones() && !canManageAplicaciones() && !canViewCaseStatuses() && !canManageCaseStatuses()) {
    return (
      <div className="text-center py-12">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para ver la configuración.
        </p>
      </div>
    );
  }

  // Filtrar datos
  const filteredOrigenes = origenes?.filter(origen =>
    origen.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    origen.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAplicaciones = aplicaciones?.filter(aplicacion =>
    aplicacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aplicacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCaseStatuses = caseStatuses?.filter(status =>
    status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handlers para Orígenes
  const handleCreateOrigen = () => {
    setSelectedOrigen(undefined);
    setIsEdit(false);
    setIsOrigenModalOpen(true);
  };

  const handleEditOrigen = (origen: Origen) => {
    setSelectedOrigen(origen);
    setIsEdit(true);
    setIsOrigenModalOpen(true);
  };

  const handleDeleteOrigen = (origen: Origen) => {
    setDeleteOrigenModal({
      isOpen: true,
      origen: origen
    });
  };

  const confirmDeleteOrigen = async () => {
    if (deleteOrigenModal.origen) {
      try {
        await deleteOrigen.mutateAsync(deleteOrigenModal.origen.id);
        showSuccess('Origen eliminado exitosamente');
        setDeleteOrigenModal({ isOpen: false, origen: null });
      } catch (error) {
        console.error('Error deleting origen:', error);
        showError('Error al eliminar origen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const cancelDeleteOrigen = () => {
    setDeleteOrigenModal({ isOpen: false, origen: null });
  };

  // Handlers para Aplicaciones
  const handleCreateAplicacion = () => {
    setSelectedAplicacion(undefined);
    setIsEdit(false);
    setIsAplicacionModalOpen(true);
  };

  const handleEditAplicacion = (aplicacion: Aplicacion) => {
    setSelectedAplicacion(aplicacion);
    setIsEdit(true);
    setIsAplicacionModalOpen(true);
  };

  const handleDeleteAplicacion = (aplicacion: Aplicacion) => {
    setDeleteAplicacionModal({
      isOpen: true,
      aplicacion: aplicacion
    });
  };

  const confirmDeleteAplicacion = async () => {
    if (deleteAplicacionModal.aplicacion) {
      try {
        await deleteAplicacion.mutateAsync(deleteAplicacionModal.aplicacion.id);
        showSuccess('Aplicación eliminada exitosamente');
        setDeleteAplicacionModal({ isOpen: false, aplicacion: null });
      } catch (error) {
        console.error('Error deleting aplicacion:', error);
        showError('Error al eliminar aplicación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const cancelDeleteAplicacion = () => {
    setDeleteAplicacionModal({ isOpen: false, aplicacion: null });
  };

  // Handlers para Estados de Control de Casos
  const handleCreateCaseStatus = () => {
    setSelectedCaseStatus(undefined);
    setIsEdit(false);
    setIsCaseStatusModalOpen(true);
  };

  const handleEditCaseStatus = (caseStatus: CaseStatusControl) => {
    setSelectedCaseStatus(caseStatus);
    setIsEdit(true);
    setIsCaseStatusModalOpen(true);
  };

  const handleDeleteCaseStatus = (caseStatus: CaseStatusControl) => {
    setDeleteCaseStatusModal({
      isOpen: true,
      caseStatus: caseStatus
    });
  };

  const confirmDeleteCaseStatus = async () => {
    if (deleteCaseStatusModal.caseStatus) {
      try {
        await deleteCaseStatus.mutateAsync(deleteCaseStatusModal.caseStatus.id);
        showSuccess('Estado de caso eliminado exitosamente');
        setDeleteCaseStatusModal({ isOpen: false, caseStatus: null });
      } catch (error) {
        console.error('Error deleting case status:', error);
        showError('Error al eliminar estado de caso: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const cancelDeleteCaseStatus = () => {
    setDeleteCaseStatusModal({ isOpen: false, caseStatus: null });
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'origenes': return 'Nuevo Origen';
      case 'aplicaciones': return 'Nueva Aplicación';
      case 'case-statuses': return 'Nuevo Estado';
      default: return 'Nuevo';
    }
  };

  const getButtonHandler = () => {
    switch (activeTab) {
      case 'origenes': return handleCreateOrigen;
      case 'aplicaciones': return handleCreateAplicacion;
      case 'case-statuses': return handleCreateCaseStatus;
      default: return () => {};
    }
  };

  const canCreateInCurrentTab = () => {
    switch (activeTab) {
      case 'origenes': return canManageOrigenes();
      case 'aplicaciones': return canManageAplicaciones();
      case 'case-statuses': return canCreateCaseStatuses() || canManageCaseStatuses();
      default: return false;
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona los orígenes, aplicaciones y estados de control del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(canViewOrigenes() || canManageOrigenes()) && (
            <button
              onClick={() => setActiveTab('origenes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'origenes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orígenes
            </button>
          )}
          {(canViewAplicaciones() || canManageAplicaciones()) && (
            <button
              onClick={() => setActiveTab('aplicaciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'aplicaciones'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aplicaciones
            </button>
          )}
          {(canViewCaseStatuses() || canManageCaseStatuses()) && (
            <button
              onClick={() => setActiveTab('case-statuses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'case-statuses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estados de Control
            </button>
          )}
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={`Buscar ${activeTab === 'case-statuses' ? 'estados' : activeTab}...`}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={getButtonHandler()}
          className="flex items-center"
          disabled={!canCreateInCurrentTab()}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {getButtonText()}
        </Button>
      </div>

      {/* Content - Orígenes */}
      {activeTab === 'origenes' && (canViewOrigenes() || canManageOrigenes()) && (
        <div className="table-card">
          <div className="table-overflow-container">
            <table className="full-width-table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrigenes.map((origen) => (
                <tr key={origen.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {origen.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {origen.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      origen.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {origen.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(origen.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {canManageOrigenes() && (
                        <>
                          <button
                            onClick={() => handleEditOrigen(origen)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrigen(origen)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {!canManageOrigenes() && canViewOrigenes() && (
                        <span className="text-gray-400 text-sm">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {filteredOrigenes.length === 0 && (
            <div className="text-center py-12">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                No hay orígenes
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No se encontraron orígenes que coincidan con tu búsqueda.' : 'Comienza creando un nuevo origen.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content - Aplicaciones */}
      {activeTab === 'aplicaciones' && (canViewAplicaciones() || canManageAplicaciones()) && (
        <div className="table-card">
          <div className="table-overflow-container">
            <table className="full-width-table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAplicaciones.map((aplicacion) => (
                <tr key={aplicacion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {aplicacion.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {aplicacion.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      aplicacion.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {aplicacion.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(aplicacion.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {canManageAplicaciones() && (
                        <>
                          <button
                            onClick={() => handleEditAplicacion(aplicacion)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAplicacion(aplicacion)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {!canManageAplicaciones() && canViewAplicaciones() && (
                        <span className="text-gray-400 text-sm">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {filteredAplicaciones.length === 0 && (
            <div className="text-center py-12">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                No hay aplicaciones
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No se encontraron aplicaciones que coincidan con tu búsqueda.' : 'Comienza creando una nueva aplicación.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content - Estados de Control */}
      {activeTab === 'case-statuses' && (canViewCaseStatuses() || canManageCaseStatuses()) && (
        <div className="table-card">
          <div className="table-overflow-container">
            <table className="full-width-table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCaseStatuses.map((status) => (
                <tr key={status.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {status.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {status.description || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {status.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {status.displayOrder}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {status.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {(canUpdateCaseStatuses() || canManageCaseStatuses()) && (
                        <button
                          onClick={() => handleEditCaseStatus(status)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {(canDeleteCaseStatuses() || canManageCaseStatuses()) && (
                        <button
                          onClick={() => handleDeleteCaseStatus(status)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                      {!canUpdateCaseStatuses() && !canDeleteCaseStatuses() && !canManageCaseStatuses() && canViewCaseStatuses() && (
                        <span className="text-gray-400 text-sm">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {filteredCaseStatuses.length === 0 && (
            <div className="text-center py-12">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                No hay estados de control
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No se encontraron estados que coincidan con tu búsqueda.' : 'Comienza creando un nuevo estado de control.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <OrigenModal
        isOpen={isOrigenModalOpen}
        onClose={() => setIsOrigenModalOpen(false)}
        origen={selectedOrigen}
        isEdit={isEdit}
      />

      <AplicacionModal
        isOpen={isAplicacionModalOpen}
        onClose={() => setIsAplicacionModalOpen(false)}
        aplicacion={selectedAplicacion}
        isEdit={isEdit}
      />

      <CaseStatusModal
        isOpen={isCaseStatusModalOpen}
        onClose={() => setIsCaseStatusModalOpen(false)}
        caseStatus={selectedCaseStatus}
        isEdit={isEdit}
      />

      {/* Modales de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteOrigenModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el origen "${deleteOrigenModal.origen?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteOrigen}
        onClose={cancelDeleteOrigen}
        type="danger"
      />

      <ConfirmationModal
        isOpen={deleteAplicacionModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar la aplicación "${deleteAplicacionModal.aplicacion?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteAplicacion}
        onClose={cancelDeleteAplicacion}
        type="danger"
      />

      <ConfirmationModal
        isOpen={deleteCaseStatusModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el estado "${deleteCaseStatusModal.caseStatus?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteCaseStatus}
        onClose={cancelDeleteCaseStatus}
        type="danger"
      />
    </PageWrapper>
  );
};
