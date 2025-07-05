import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/useUserProfile';
import { useOrigenes, useCreateOrigen, useUpdateOrigen, useDeleteOrigen } from '@/hooks/useOrigenesAplicaciones';
import { useAplicaciones, useCreateAplicacion, useUpdateAplicacion, useDeleteAplicacion } from '@/hooks/useOrigenesAplicaciones';
import { Origen, Aplicacion, OrigenFormData, AplicacionFormData } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

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

  const [formData, setFormData] = useState<OrigenFormData>({
    nombre: origen?.nombre || '',
    descripcion: origen?.descripcion || '',
    activo: origen?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (isEdit && origen) {
        await updateOrigen.mutateAsync({ id: origen.id, data: formData });
      } else {
        await createOrigen.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving origen:', error);
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

  const [formData, setFormData] = useState<AplicacionFormData>({
    nombre: aplicacion?.nombre || '',
    descripcion: aplicacion?.descripcion || '',
    activo: aplicacion?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (isEdit && aplicacion) {
        await updateAplicacion.mutateAsync({ id: aplicacion.id, data: formData });
      } else {
        await createAplicacion.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving aplicacion:', error);
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

export const ConfigurationPage: React.FC = () => {
  const { canManageOrigenes, canManageAplicaciones } = usePermissions();
  
  const { data: origenes } = useOrigenes();
  const { data: aplicaciones } = useAplicaciones();
  
  const deleteOrigen = useDeleteOrigen();
  const deleteAplicacion = useDeleteAplicacion();

  const [activeTab, setActiveTab] = useState<'origenes' | 'aplicaciones'>('origenes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [isOrigenModalOpen, setIsOrigenModalOpen] = useState(false);
  const [isAplicacionModalOpen, setIsAplicacionModalOpen] = useState(false);
  const [selectedOrigen, setSelectedOrigen] = useState<Origen | undefined>();
  const [selectedAplicacion, setSelectedAplicacion] = useState<Aplicacion | undefined>();
  const [isEdit, setIsEdit] = useState(false);

  // Verificar permisos
  if (!canManageOrigenes() && !canManageAplicaciones()) {
    return (
      <div className="text-center py-12">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Acceso denegado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para gestionar la configuración.
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

  const handleDeleteOrigen = async (origen: Origen) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el origen "${origen.nombre}"?`)) {
      try {
        await deleteOrigen.mutateAsync(origen.id);
      } catch (error) {
        console.error('Error deleting origen:', error);
      }
    }
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

  const handleDeleteAplicacion = async (aplicacion: Aplicacion) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la aplicación "${aplicacion.nombre}"?`)) {
      try {
        await deleteAplicacion.mutateAsync(aplicacion.id);
      } catch (error) {
        console.error('Error deleting aplicacion:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona los orígenes y aplicaciones del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {canManageOrigenes() && (
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
          {canManageAplicaciones() && (
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
            placeholder={`Buscar ${activeTab}...`}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={activeTab === 'origenes' ? handleCreateOrigen : handleCreateAplicacion}
          className="flex items-center"
          disabled={activeTab === 'origenes' ? !canManageOrigenes() : !canManageAplicaciones()}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {activeTab === 'origenes' ? 'Nuevo Origen' : 'Nueva Aplicación'}
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'origenes' && canManageOrigenes() && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrigenes.map((origen) => (
                <tr key={origen.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {origen.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {origen.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      origen.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {origen.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(origen.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

      {activeTab === 'aplicaciones' && canManageAplicaciones() && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAplicaciones.map((aplicacion) => (
                <tr key={aplicacion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {aplicacion.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {aplicacion.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      aplicacion.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {aplicacion.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(aplicacion.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
    </div>
  );
};
