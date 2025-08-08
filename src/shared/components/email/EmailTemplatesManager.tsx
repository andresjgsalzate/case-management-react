import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { useEmailTemplates } from '@/shared/hooks/useSendEmail';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { 
  EnvelopeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  template_type: string;
  template_name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
  mode: 'create' | 'edit' | 'view';
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, template, mode }) => {
  const [formData, setFormData] = useState({
    template_type: template?.template_type || '',
    template_name: template?.template_name || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    text_content: template?.text_content || '',
    variables: template?.variables || [],
    is_default: template?.is_default || false
  });

  const { createTemplate, updateTemplate } = useEmailTemplates();
  const { showSuccess, showError } = useNotification();

  const templateTypes = [
    'confirmation',
    'invitation', 
    'magic_link',
    'password_reset',
    'email_change',
    'notification'
  ];

  const commonVariables = [
    'site_name',
    'base_url',
    'user_name',
    'confirmation_url',
    'magic_link_url',
    'invitation_url',
    'reset_password_url',
    'expiration_hours',
    'inviter_name',
    'team_name',
    'custom_message',
    'otp_code'
  ];

  const handleSave = async () => {
    try {
      if (mode === 'create') {
        await createTemplate.mutateAsync({
          ...formData,
          is_active: true
        } as any);
      } else if (mode === 'edit' && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          ...formData
        });
      }
      onClose();
    } catch (error: any) {
      showError(`Error ${mode === 'create' ? 'creando' : 'actualizando'} template`, error.message);
    }
  };

  const addVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }));
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${mode === 'create' ? 'Crear' : mode === 'edit' ? 'Editar' : 'Ver'} Template`}
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Template
            </label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value }))}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">Seleccionar tipo</option>
              {templateTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Template
            </label>
            <Input
              type="text"
              value={formData.template_name}
              onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
              disabled={isReadOnly}
              placeholder="nombre_del_template"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asunto del Email
          </label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            disabled={isReadOnly}
            placeholder="Asunto del email con {{variables}}"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenido HTML
          </label>
          <textarea
            value={formData.html_content}
            onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
            disabled={isReadOnly}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 font-mono text-sm"
            placeholder="Contenido HTML del email..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenido de Texto (opcional)
          </label>
          <textarea
            value={formData.text_content}
            onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
            disabled={isReadOnly}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            placeholder="Versión de texto plano del email..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Variables Disponibles
          </label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.variables.map(variable => (
                <span
                  key={variable}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {variable}
                  {!isReadOnly && (
                    <button
                      onClick={() => removeVariable(variable)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            
            {!isReadOnly && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Variables comunes disponibles:
                </p>
                <div className="flex flex-wrap gap-1">
                  {commonVariables.map(variable => (
                    <button
                      key={variable}
                      onClick={() => addVariable(variable)}
                      className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                      disabled={formData.variables.includes(variable)}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Template por defecto para este tipo
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          {isReadOnly ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!isReadOnly && (
          <Button 
            onClick={handleSave}
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            {createTemplate.isPending || updateTemplate.isPending 
              ? 'Guardando...' 
              : mode === 'create' ? 'Crear' : 'Actualizar'
            }
          </Button>
        )}
      </div>
    </Modal>
  );
};

export const EmailTemplatesManager: React.FC = () => {
  const { templates, isLoading, deleteTemplate, refetch } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState<'html' | 'text'>('html');
  const [filter, setFilter] = useState('');

  // Filtrar templates
  const filteredTemplates = templates?.filter(template =>
    template.template_name.toLowerCase().includes(filter.toLowerCase()) ||
    template.template_type.toLowerCase().includes(filter.toLowerCase()) ||
    template.subject.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  // Agrupar por tipo
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.template_type]) {
      acc[template.template_type] = [];
    }
    acc[template.template_type].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (window.confirm(`¿Estás seguro de eliminar el template "${template.template_name}"?`)) {
      await deleteTemplate.mutateAsync(template.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'confirmation': return '✅';
      case 'invitation': return '👥';
      case 'magic_link': return '🔗';
      case 'password_reset': return '🔑';
      case 'email_change': return '📧';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Templates de Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona las plantillas de email del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleCreate} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo Template
          </Button>
        </div>
      </div>

      {/* Filtro */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Buscar templates..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Templates agrupados */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
          <div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-xl mr-2">{getTypeIcon(type)}</span>
              {type.replace('_', ' ').toUpperCase()}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''})
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {template.template_name}
                        </h5>
                        {template.is_default && (
                          <StarIcon className="w-4 h-4 text-yellow-500 ml-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {template.subject}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(variable => (
                        <span
                          key={variable}
                          className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(template)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedTemplates).length === 0 && (
        <div className="text-center py-8">
          <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron templates que coincidan con el filtro.
          </p>
          <Button onClick={handleCreate} className="mt-4">
            Crear primer template
          </Button>
        </div>
      )}

      {/* Modal */}
      <TemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={selectedTemplate}
        mode={modalMode}
      />

      {/* Modal mejorado para ver template */}
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ver Template: {selectedTemplate.template_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tipo: {selectedTemplate.template_type} • 
                  {selectedTemplate.is_active ? ' Activo' : ' Inactivo'} • 
                  {selectedTemplate.is_default ? ' Por defecto' : ' Alternativo'}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Panel izquierdo - Información y Source */}
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-600 flex flex-col">
                {/* Información del template */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Asunto del Email
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border text-sm">
                        {selectedTemplate.subject}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Variables Disponibles
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs para Source */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <button
                      onClick={() => setActiveSourceTab('html')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                        activeSourceTab === 'html'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <CodeBracketIcon className="w-4 h-4" />
                      <span>HTML</span>
                    </button>
                    <button
                      onClick={() => setActiveSourceTab('text')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                        activeSourceTab === 'text'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>Texto</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0">
                    <textarea
                      readOnly
                      value={activeSourceTab === 'html' ? selectedTemplate.html_content : selectedTemplate.text_content || ''}
                      className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border-0 resize-none focus:ring-0 text-gray-800 dark:text-gray-200"
                      style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Panel derecho - Preview */}
              <div className="w-1/2 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                    <span className="ml-2 text-xs text-gray-500">(con variables de ejemplo)</span>
                  </h4>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-0">
                  {activeSourceTab === 'html' ? (
                    <div 
                      className="bg-white rounded border shadow-sm min-h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedTemplate.html_content
                          .replace(/\{\{site_name\}\}/g, 'Case Management System')
                          .replace(/\{\{user_name\}\}/g, 'Juan Pérez')
                          .replace(/\{\{confirmation_url\}\}/g, 'https://example.com/confirm')
                          .replace(/\{\{magic_link_url\}\}/g, 'https://example.com/magic')
                          .replace(/\{\{invitation_url\}\}/g, 'https://example.com/invite')
                          .replace(/\{\{expiration_hours\}\}/g, '24')
                          .replace(/\{\{inviter_name\}\}/g, 'María García')
                          .replace(/\{\{team_name\}\}/g, 'Equipo de Desarrollo')
                          .replace(/\{\{custom_message\}\}/g, 'Te invitamos a unirte a nuestro equipo.')
                          .replace(/\{\{otp_code\}\}/g, '123456')
                      }}
                    />
                  ) : (
                    <div className="bg-white p-4 rounded border shadow-sm min-h-full">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                        {(selectedTemplate.text_content || '')
                          .replace(/\{\{site_name\}\}/g, 'Case Management System')
                          .replace(/\{\{user_name\}\}/g, 'Juan Pérez')
                          .replace(/\{\{confirmation_url\}\}/g, 'https://example.com/confirm')
                          .replace(/\{\{magic_link_url\}\}/g, 'https://example.com/invite')
                          .replace(/\{\{invitation_url\}\}/g, 'https://example.com/invite')
                          .replace(/\{\{expiration_hours\}\}/g, '24')
                          .replace(/\{\{inviter_name\}\}/g, 'María García')
                          .replace(/\{\{team_name\}\}/g, 'Equipo de Desarrollo')
                          .replace(/\{\{custom_message\}\}/g, 'Te invitamos a unirte a nuestro equipo.')
                          .replace(/\{\{otp_code\}\}/g, '123456')
                        }
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTemplate(selectedTemplate);
                  setModalMode('edit');
                  setShowModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Editar Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
