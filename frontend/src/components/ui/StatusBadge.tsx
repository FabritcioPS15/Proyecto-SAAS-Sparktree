import { cn } from '../../utils/cn';

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { variant: StatusBadgeProps['variant']; label: string }> = {
  pending: { variant: 'warning', label: 'Pendiente' },
  paid: { variant: 'success', label: 'Pagado' },
  sent: { variant: 'info', label: 'Enviado' },
  delivered: { variant: 'success', label: 'Entregado' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
  active: { variant: 'success', label: 'Activo' },
  inactive: { variant: 'default', label: 'Inactivo' },
  available: { variant: 'success', label: 'Disponible' },
  busy: { variant: 'warning', label: 'Ocupado' },
  offline: { variant: 'default', label: 'Offline' },
};

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export const StatusBadge = ({ status, variant, size = 'md' }: StatusBadgeProps) => {
  const statusKey = status?.toLowerCase() || 'default';
  const config = statusConfig[statusKey] || { variant: 'default' as const, label: status || 'Desconocido' };
  const badgeVariant = variant || config.variant || 'default';
  const label = config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[badgeVariant],
        sizeStyles[size]
      )}
    >
      {label}
    </span>
  );
};
