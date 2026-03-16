import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, Copy, Share } from 'lucide-react';

interface AdvancedCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  collapsible?: boolean;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
  className?: string;
}

export const AdvancedCard = ({
  title,
  subtitle,
  children,
  variant = 'default',
  size = 'md',
  collapsible = false,
  actions = [],
  className = '',
}: AdvancedCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    secondary: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const titleClasses = {
    default: 'text-gray-900 dark:text-white',
    primary: 'text-blue-900 dark:text-blue-100',
    secondary: 'text-purple-900 dark:text-purple-100',
    success: 'text-green-900 dark:text-green-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    error: 'text-red-900 dark:text-red-100',
  };

  return (
    <div
      className={`
        relative border rounded-xl shadow-sm hover:shadow-md transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            )}
            <div>
              <h3 className={`font-semibold text-lg ${titleClasses[variant]}`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setShowActions(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${action.variant === 'danger' 
                          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                        ${index === 0 ? 'rounded-t-lg' : ''}
                        ${index === actions.length - 1 ? 'rounded-b-lg' : ''}
                      `}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Card Components Específicos
export const PlanCard = ({ planName, price, features, isActive }: {
  planName: string;
  price: string;
  features: string[];
  isActive: boolean;
}) => {
  return (
    <AdvancedCard
      title={planName}
      subtitle={isActive ? "Plan Actual" : "Opción disponible"}
      variant={isActive ? "success" : "default"}
      size="md"
      actions={[
        {
          icon: <Edit className="w-4 h-4" />,
          label: "Editar",
          onClick: () => console.log("Editar plan"),
        },
        {
          icon: <Copy className="w-4 h-4" />,
          label: "Duplicar",
          onClick: () => console.log("Duplicar plan"),
        },
      ]}
    >
      <div className="space-y-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {price}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mes</span>
        </div>
        
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              {feature}
            </li>
          ))}
        </ul>

        <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          {isActive ? "Gestionar Plan" : "Seleccionar Plan"}
        </button>
      </div>
    </AdvancedCard>
  );
};

export const ChatCard = ({ name, lastMessage, time, unreadCount, avatar }: {
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar?: string;
}) => {
  return (
    <AdvancedCard
      title={name}
      subtitle={lastMessage}
      variant="default"
      size="sm"
      collapsible={false}
      actions={[
        {
          icon: <Share className="w-4 h-4" />,
          label: "Compartir",
          onClick: () => console.log("Compartir chat"),
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: "Eliminar",
          onClick: () => console.log("Eliminar chat"),
          variant: "danger",
        },
      ]}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {avatar || name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
          </div>
        </div>
        
        {unreadCount && unreadCount > 0 && (
          <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </div>
        )}
      </div>
    </AdvancedCard>
  );
};

export const StatsCard = ({ title, value, change, icon }: {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}) => {
  return (
    <AdvancedCard
      title={title}
      variant="default"
      size="sm"
      collapsible={false}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {change && (
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.isPositive ? '↑' : '↓'} {change.value}
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
          {icon}
        </div>
      </div>
    </AdvancedCard>
  );
};
