import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 4000,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out`}>
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sistema de gestión de notificaciones
interface Notification extends NotificationProps {
  id: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'onClose'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      onClose: () => removeNotification(id)
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showNotification({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({ type: 'warning', title, message });
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      {notifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          {...notification}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
