import { useNotifications } from 'reapop';

/**
 * Hook envoltorio para Reapop que simplifica su uso en la aplicación
 */
export const useAppNotifications = () => {
  const { notify } = useNotifications();

  const notifySuccess = (title: string, message?: string) => {
    notify({
      title,
      message,
      status: 'success',
      dismissible: true,
      dismissAfter: 5000,
    });
  };

  const notifyError = (title: string, message?: string) => {
    notify({
      title,
      message,
      status: 'error',
      dismissible: true,
      dismissAfter: 7000,
    });
  };

  const notifyInfo = (title: string, message?: string) => {
    notify({
      title,
      message,
      status: 'info',
      dismissible: true,
      dismissAfter: 5000,
    });
  };

  const notifyWarning = (title: string, message?: string) => {
    notify({
      title,
      message,
      status: 'warning',
      dismissible: true,
      dismissAfter: 6000,
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notify, // exportamos la instancia base por si necesitan opciones avanzadas
  };
};
