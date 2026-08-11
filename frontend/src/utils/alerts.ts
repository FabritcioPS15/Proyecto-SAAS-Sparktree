import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Muestra un modal de confirmación estándar usando SweetAlert2
 * Útil para acciones destructivas como eliminar o cancelar
 */
export const confirmAction = async (
  title: string = '¿Estás seguro?',
  text: string = 'No podrás revertir esta acción',
  confirmButtonText: string = 'Sí, continuar',
  cancelButtonText: string = 'Cancelar'
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6', // Tailwind blue-500
    cancelButtonColor: '#ef4444', // Tailwind red-500
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: 'dark:bg-[#1e1e1e] dark:text-white rounded-2xl border dark:border-[#333]',
      title: 'dark:text-white font-black',
      confirmButton: 'rounded-xl px-4 py-2 font-bold',
      cancelButton: 'rounded-xl px-4 py-2 font-bold',
    }
  });

  return result.isConfirmed;
};

/**
 * Muestra un modal de éxito o información simple
 */
export const showAlert = (
  title: string,
  text: string = '',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success',
  options?: Partial<SweetAlertOptions>
) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'dark:bg-[#1e1e1e] dark:text-white rounded-2xl border dark:border-[#333]',
      title: 'dark:text-white font-black',
      confirmButton: 'rounded-xl px-4 py-2 font-bold',
    },
    ...options,
  } as SweetAlertOptions);
};
