import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, UserCheck, Cpu, Eye, Trash2, UserPlus, User } from 'lucide-react';
import { Loader } from '../../../components/ui/Loader';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebookMessenger } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { Mail } from 'lucide-react';
import { getContacts, deleteUser, deleteUsersBulk, createCrmClient } from '../../../services/api';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { PageLoader } from '../../../components/layout/PageLoader';
import { ResponsiveList, ResponsiveColumn } from '../../../components/ui/ResponsiveList';
import { SearchBar } from '../../../components/ui/SearchBar';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { TableCard } from '../../../components/ui/TableCard';
import { useNotifications } from '../../../contexts/NotificationContext';

type SortField = 'phoneNumber' | 'firstInteraction' | 'lastInteraction' | 'totalMessages' | 'attendedBy' | 'usageTime';
type SortOrder = 'asc' | 'desc';

export const Clients = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField] = useState<SortField>('lastInteraction');
  const [sortOrder] = useState<SortOrder>('desc');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    setLoading(true);
    getContacts()
      .then(data => {
        const usersArray = Array.isArray(data) ? data : [];
        console.log('Datos de contactos recibidos:', usersArray);
        console.log('Cantidad de contactos:', usersArray.length);
        if (usersArray.length > 0) {
          console.log('Primer contacto:', usersArray[0]);
        }
        setUsers(usersArray);
      })
      .catch(err => {
        console.error('Failed to fetch contacts', err);
        console.error('Error details:', err.response?.data || err.message);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(confirmDelete.id);
        return next;
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('No se pudo eliminar el cliente. Vuelve a intentarlo.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteUsersBulk(Array.from(selectedIds));
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error deleting users bulk:', err);
      alert('Error al eliminar masivamente. Algunos clientes podrían no haberse borrado.');
    } finally {
      setConfirmBulkDelete(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const company = (form.elements.namedItem('company') as HTMLInputElement)?.value || '';

    setCreating(true);
    try {
      await createCrmClient({ name, email, phone, company, status: 'lead', source: 'manual', notes: '' });
      addNotification({ type: 'success', title: 'Cliente creado', message: `Se ha creado el cliente ${name}` });
      setShowCreateModal(false);
      fetchClients();
    } catch (err: any) {
      console.error('Error creating client:', err);
      addNotification({ type: 'error', title: 'Error', message: err.response?.data?.error || 'No se pudo crear el cliente. Vuelve a intentarlo.' });
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const detectChannel = (user: any) => {
    let channel = null;

    // 1. Desde user.platform_type (campo correcto según esquema BD)
    if (user.platform_type) {
      channel = user.platform_type;
    }

    // 2. Desde user.channels (objeto)
    if (!channel && user.channels && Object.keys(user.channels).length > 0) {
      channel = Object.keys(user.channels)[0];
    }

    // 3. Desde user.channel (string directo - como en Conversations.tsx)
    if (!channel && user.channel) {
      channel = user.channel;
    }

    // 4. Desde user.source (campo alternativo)
    if (!channel && user.source) {
      channel = user.source;
    }

    // 5. Desde user.platform (campo alternativo)
    if (!channel && user.platform) {
      channel = user.platform;
    }

    // 6. Desde user.lastChannel (último canal usado)
    if (!channel && user.lastChannel) {
      channel = user.lastChannel;
    }

    // 7. Desde user.conversationChannel (canal de la conversación)
    if (!channel && user.conversationChannel) {
      channel = user.conversationChannel;
    }

    // 8. Desde user.origin (origen del mensaje)
    if (!channel && user.origin) {
      channel = user.origin;
    }

    if (!channel) return '';

    // Normalizar el nombre del canal
    const normalizedChannel = String(channel).toLowerCase().trim();
    // Mapeo de nombres alternativos a nombres estándar
    const channelMapping: Record<string, string> = {
      'whatsapp': 'whatsapp',
      'wa': 'whatsapp',
      'wsp': 'whatsapp',
      'instagram': 'instagram',
      'ig': 'instagram',
      'tiktok': 'tiktok',
      'telegram': 'telegram',
      'tg': 'telegram',
      'messenger': 'messenger',
      'facebook_messenger': 'messenger',
      'fb': 'messenger',
      'facebook': 'messenger',
      'email': 'email',
      'mail': 'email',
      'correo': 'email'
    };
    return channelMapping[normalizedChannel] || normalizedChannel;
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = filterChannel === 'all' || detectChannel(user) === filterChannel;
    return matchesSearch && matchesChannel;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

const getChannelColor = (channel: string) => {
    const channelLower = channel.toLowerCase();
    switch (channelLower) {
      case 'whatsapp':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'instagram':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'tiktok':
        return 'bg-slate-900/10 text-slate-800 dark:text-slate-200 border-slate-900/20';
      case 'telegram':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'messenger':
        return 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-600/20';
      case 'email':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getChannelIcon = (channel: string) => {
    const channelLower = channel?.toLowerCase() || '';
    switch (channelLower) {
      case 'whatsapp':
        return <FaWhatsapp className="w-3.5 h-3.5" />;
      case 'instagram':
        return <FaInstagram className="w-3.5 h-3.5" />;
      case 'tiktok':
        return <SiTiktok className="w-3.5 h-3.5" />;
      case 'telegram':
        return <FaTelegram className="w-3.5 h-3.5" />;
      case 'messenger':
        return <FaFacebookMessenger className="w-3.5 h-3.5" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5" />;
      }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return { prefix: '', number: '' };
    
    // Convertir a string y limpiar espacios y caracteres especiales
    let cleanPhone = String(phone).trim();
    
    // Eliminar caracteres comunes de WhatsApp (como @c.us, @s.whatsapp.net, etc.)
    cleanPhone = cleanPhone.replace(/@c\.us$/i, '');
    cleanPhone = cleanPhone.replace(/@s\.whatsapp\.net$/i, '');
    cleanPhone = cleanPhone.replace(/@g\.us$/i, '');
    cleanPhone = cleanPhone.replace(/@whatsapp\.net$/i, '');
    
    // Eliminar cualquier otro carácter no numérico excepto el +
    cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
    
    // Si el número está vacío después de limpiar
    if (!cleanPhone) return { prefix: '', number: '' };
    
    // Códigos de país comunes (ISO 3166-1)
    const countryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '88', '91', '92', '93', '94', '95', '98'];
    
    // Detectar si tiene prefijo internacional (+)
    if (cleanPhone.startsWith('+')) {
      const match = cleanPhone.match(/^\+(\d{1,3})(.*)$/);
      if (match) {
        const potentialPrefix = match[1];
        // Verificar si es un código de país válido
        if (countryCodes.includes(potentialPrefix)) {
          return {
            prefix: '+' + potentialPrefix,
            number: match[2].trim()
          };
        }
        // Si no es código de país conocido, intentar con 2 dígitos
        if (potentialPrefix.length === 3) {
          const twoDigitPrefix = potentialPrefix.substring(0, 2);
          if (countryCodes.includes(twoDigitPrefix)) {
            return {
              prefix: '+' + twoDigitPrefix,
              number: potentialPrefix.substring(2) + match[2].trim()
            };
          }
        }
      }
    }
    
    // Intentar detectar prefijo sin + (ej: 51 para Perú, 1 para USA, etc.)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      // Intentar coincidir con códigos de país conocidos
      for (const code of countryCodes.sort((a, b) => b.length - a.length)) {
        if (digitsOnly.startsWith(code)) {
          const remainingLength = digitsOnly.length - code.length;
          // Verificar que el número restante tenga longitud razonable (8-10 dígitos)
          if (remainingLength >= 8 && remainingLength <= 10) {
            return {
              prefix: '+' + code,
              number: digitsOnly.substring(code.length)
            };
          }
        }
      }
    }
    
    // Si no tiene prefijo detectado, asumir formato local
    return {
      prefix: '',
      number: cleanPhone
    };
  };

  if (loading) return <PageLoader sectionName="Directorio" />;

  const responsiveColumns: ResponsiveColumn<any>[] = [
    {
      key: 'phoneNumber',
      header: 'Teléfono',
      mobilePriority: 'high',
      render: (_: any, user: any) => {
        // Intentar obtener el número real de múltiples fuentes
        let realPhone = user.phone_number;
        
        // Si phone_number parece un ID (muy largo), buscar en custom_attributes
        if (!realPhone || realPhone.length > 15) {
          // Revisar custom_attributes donde podría estar el número real
          if (user.custom_attributes) {
            const attrs = user.custom_attributes;
            realPhone = attrs.real_phone_number || attrs.whatsapp_jid || attrs.whatsapp_number || attrs.phone || attrs.phoneNumber;
          }
        }
        
        // Si aún no hay número válido, usar el phone_number original como fallback
        if (!realPhone) {
          realPhone = user.phone_number;
        }
        
        const { prefix, number } = formatPhoneNumber(realPhone);
        const displayNumber = number || realPhone;
        
        return (
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                {prefix && <span className="font-bold text-accent-500 text-sm">{prefix}</span>}
                <span className="font-bold text-slate-900 dark:text-white text-base">{displayNumber}</span>
              </div>
              <span className="text-xs text-accent-500 flex items-center gap-1 mt-1 font-medium">
                <MessageSquare className="w-3 h-3" /> Ir al chat
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'attendedBy',
      header: 'Estado',
      mobilePriority: 'high',
      render: (_: any, user: any) => (
        <div className="flex items-center gap-2">
          {user.bot_state === 'handoff' ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Humano</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Bot</span>
            </div>
          )}
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{user.bot_state || 'main_menu'}</span>
        </div>
      )
    },
    {
      key: 'channels',
      header: 'Canal',
      mobilePriority: 'high',
      render: (_: any, user: any) => {
        const channel = detectChannel(user);

return channel ? (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase border ${getChannelColor(channel)}`}>
            {getChannelIcon(channel)}
            <span>{channel}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Sin canal</span>
        );
      }
    },
    {
      key: 'serviceNumber',
      header: 'Línea',
      mobilePriority: 'high',
      render: (_: any, user: any) => {
        // Usar whatsapp_line_number (número de la conexión WhatsApp activa)
        const lineNumber = user.whatsapp_line_number || user.phone_number;
        const { prefix, number } = formatPhoneNumber(lineNumber);
        return (
          <div className="flex items-center justify-end gap-2 text-slate-600 dark:text-slate-300 text-sm">
            {prefix && <span className="font-bold text-accent-500 text-sm">{prefix}</span>}
            <span className="font-medium">{number || 'Sin línea'}</span>
          </div>
        );
      }
    },
    {
      key: 'lastInteraction',
      header: 'Última interacción',
      mobilePriority: 'medium',
      render: (_: any, user: any) => (
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{formatDate(user.last_active_at)}</span>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Directorio de"
        highlight="Clientes"
        description="Gestión integral de interacciones."
        icon={User}
        action={
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="flex items-center gap-2 px-4 h-10 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar ({selectedIds.size})
              </button>
            )}
            <div className="bg-gray-50 dark:bg-dark-card px-4 h-10 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total: {users.length}</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
              <UserPlus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        }
      />

      <PageBody>
        <TableCard>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <SearchBar
              placeholder="Buscar por número o agente..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={filterChannel}
                onChange={(v) => { setFilterChannel(v); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los Canales' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'messenger', label: 'Messenger' },
                ]}
              />
            </div>
          </div>

          <ResponsiveList
            columns={responsiveColumns}
            data={paginatedUsers}
            onRowClick={() => navigate('/conversations')}
            onRowSelect={(user) => toggleSelect(user.id, { stopPropagation: () => {} } as any)}
            selectedIds={selectedIds}
            getId={(user) => user.id}
            actions={(user) => [
              { icon: <Eye className="w-4 h-4" />, label: 'Ver Chat', onClick: (e) => { e.stopPropagation(); navigate('/conversations'); }, tooltip: 'Ver Chat' },
              { icon: <Trash2 className="w-4 h-4" />, label: 'Eliminar', onClick: (e) => { e.stopPropagation(); setConfirmDelete({ id: user.id }); }, variant: 'danger', tooltip: 'Eliminar Cliente' },
            ]}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        </TableCard>
      </PageBody>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message="¿Eliminar cliente y sus conversaciones? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Eliminar Clientes"
        message={`¿Eliminar los ${selectedIds.size} clientes seleccionados y sus chats?`}
        confirmText={`Eliminar (${selectedIds.size})`}
        variant="danger"
      />

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Cliente"
        icon={<UserPlus className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del cliente" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="email" name="email" placeholder="Correo electrónico" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="tel" name="phone" placeholder="Teléfono" required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <input type="text" name="company" placeholder="Empresa (opcional)" className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          <button type="submit" disabled={creating} className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {creating ? <Loader size="xs" /> : <UserPlus className="w-4 h-4" />}
            {creating ? 'Creando...' : 'Crear Cliente'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
};
