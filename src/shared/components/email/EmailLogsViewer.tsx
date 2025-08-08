import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useSendEmail } from '@/shared/hooks/useSendEmail';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface EmailLogEntry {
  id: string;
  email_type: string;
  recipient_email: string;
  subject?: string;
  template_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  metadata: Record<string, any>;
  sent_at?: string;
  created_at: string;
}

export const EmailLogsViewer: React.FC = () => {
  const { emailLogs, logsLoading, refetchLogs } = useSendEmail();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtrar logs
  const filteredLogs = emailLogs?.filter(log => {
    const matchesText = log.recipient_email.toLowerCase().includes(filter.toLowerCase()) ||
                       log.email_type.toLowerCase().includes(filter.toLowerCase()) ||
                       log.subject?.toLowerCase().includes(filter.toLowerCase()) ||
                       log.error_message?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesText && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <EnvelopeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'sent':
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Logs de Emails
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Historial de emails enviados por el sistema
          </p>
        </div>
        <Button onClick={() => refetchLogs()} variant="outline" size="sm">
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por email, tipo o asunto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {emailLogs && emailLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['sent', 'failed', 'pending', 'delivered'].map(status => {
            const count = emailLogs.filter(log => log.status === status).length;
            return (
              <div key={status} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(status)}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de logs */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {filteredLogs.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <li key={log.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{getTypeIcon(log.email_type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {log.recipient_email}
                          </p>
                          <span className={getStatusBadge(log.status)}>
                            {log.status}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{log.email_type}</span>
                            {log.subject && <span> • {log.subject}</span>}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.created_at)}
                            {log.sent_at && log.sent_at !== log.created_at && (
                              <span> • Enviado: {formatDate(log.sent_at)}</span>
                            )}
                          </p>
                        </div>
                        {log.error_message && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Error: {log.error_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {Object.keys(log.metadata).length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <details className="cursor-pointer">
                          <summary className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Metadatos
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-left">
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter || statusFilter !== 'all' 
                ? 'No se encontraron logs que coincidan con los filtros.'
                : 'No hay logs de emails disponibles.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Paginación simple */}
      {filteredLogs.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredLogs.length} de {emailLogs?.length || 0} logs
            {filteredLogs.length === 100 && ' (últimos 100 registros)'}
          </p>
        </div>
      )}
    </div>
  );
};
