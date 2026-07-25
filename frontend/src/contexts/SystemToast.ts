import { useNotifications } from './NotificationContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export function useSystemToast() {
  const { addNotification } = useNotifications();

  const toast = {
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message: message || '' }),

    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message: message || '' }),

    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message: message || '' }),

    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message: message || '' }),
  };

  return toast;
}
