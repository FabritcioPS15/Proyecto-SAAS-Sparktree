import { useState, useMemo } from 'react';
import { Mail, Search, Plus, Trash2, Send, Archive, AlertCircle, Star, Inbox, FileText, PenSquare } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  read: boolean;
  starred: boolean;
}

const MOCK_EMAILS: EmailMessage[] = [
  { id: '1', from: 'ana@empresa.com', subject: 'Nueva cotización solicitada', preview: 'Hola, me gustaría recibir una cotización para los servicios de...', date: new Date(Date.now() - 1000 * 60 * 30), folder: 'inbox', read: false, starred: true },
  { id: '2', from: 'soporte@sparktree.io', subject: 'Tu suscripción está activa', preview: 'Gracias por confiar en Sparktree. Tu plan Growth está activo desde...', date: new Date(Date.now() - 1000 * 60 * 60 * 2), folder: 'inbox', read: false, starred: false },
  { id: '3', from: 'notificaciones@sparktree.io', subject: 'Reporte semanal disponible', preview: 'Tu reporte de la semana del 7 al 14 de julio ya está disponible...', date: new Date(Date.now() - 1000 * 60 * 60 * 24), folder: 'inbox', read: true, starred: false },
  { id: '4', from: 'carlos@cliente.com', subject: 'Re: Propuesta comercial', preview: 'Nos interesa mucho la propuesta. ¿Podemos agendar una reunión...', date: new Date(Date.now() - 1000 * 60 * 60 * 48), folder: 'inbox', read: true, starred: true },
  { id: '5', from: 'maria@proveedor.com', subject: 'Factura junio 2026', preview: 'Adjuntamos la factura correspondiente al mes de junio por los servicios...', date: new Date(Date.now() - 1000 * 60 * 60 * 72), folder: 'inbox', read: true, starred: false },
  { id: '6', from: 'tucuenta@sparktree.io', subject: 'Verificación de seguridad', preview: 'Hemos detectado un inicio de sesión desde un nuevo dispositivo...', date: new Date(Date.now() - 1000 * 60 * 60 * 96), folder: 'spam', read: false, starred: false },
  { id: '7', from: 'yo@sparktree.io', subject: 'Propuesta comercial - Cliente nuevo', preview: 'Adjunto la propuesta comercial para el cliente potencial del sector...', date: new Date(Date.now() - 1000 * 60 * 60 * 4), folder: 'sent', read: true, starred: false },
];

const FOLDERS = [
  { key: 'inbox', label: 'Recibidos', icon: Inbox, count: true },
  { key: 'sent', label: 'Enviados', icon: Send, count: false },
  { key: 'drafts', label: 'Borradores', icon: FileText, count: false },
  { key: 'spam', label: 'Spam', icon: AlertCircle, count: false },
  { key: 'trash', label: 'Papelera', icon: Trash2, count: false },
];

export const Email = () => {
  const { addNotification } = useNotifications();
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const filteredEmails = useMemo(() => {
    return emails
      .filter(e => e.folder === activeFolder)
      .filter(e => !searchTerm || e.subject.toLowerCase().includes(searchTerm.toLowerCase()) || e.from.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [emails, activeFolder, searchTerm]);

  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;

  const handleSend = () => {
    if (!composeData.to.trim() || !composeData.subject.trim()) return;
    const newEmail: EmailMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from: 'yo@sparktree.io',
      subject: composeData.subject,
      preview: composeData.body.slice(0, 80),
      date: new Date(),
      folder: 'sent',
      read: true,
      starred: false,
    };
    setEmails(prev => [newEmail, ...prev]);
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    addNotification({ type: 'success', title: 'Correo enviado', message: `Mensaje enviado a ${composeData.to}` });
  };

  const handleDelete = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
    setSelectedEmail(null);
    addNotification({ type: 'success', title: 'Correo movido a papelera', message: 'Puedes recuperarlo desde la carpeta Papelera.' });
  };

  const toggleStar = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const markRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const formatDate = (d: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return `${Math.floor(diffMs / (1000 * 60))}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Correo"
        highlight="Electrónico"
        description="Bandeja de entrada y mensajería interna."
        icon={Mail}
        action={
          <button onClick={() => setShowCompose(true)}
            className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
            <PenSquare className="w-4 h-4" />
            Redactar
          </button>
        }
      />

      <PageBody>
        <div className="flex gap-0 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-dark-card min-h-[600px]">
          {/* Folders sidebar */}
          <div className="w-52 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1">
            {FOLDERS.map(f => {
              const Icon = f.icon;
              const isActive = activeFolder === f.key;
              const count = f.count ? unreadCount : 0;
              return (
                <button key={f.key} onClick={() => setActiveFolder(f.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive ? 'bg-accent-500/10 text-accent-500 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{f.label}</span>
                  {count > 0 && (
                    <span className="px-1.5 py-0.5 bg-accent-500 text-white text-[9px] font-black rounded-md min-w-[18px] text-center">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Email list */}
          <div className={`flex-1 flex flex-col ${selectedEmail ? 'hidden lg:flex' : ''}`}>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar correos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Inbox className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No hay correos en esta carpeta</p>
                </div>
              ) : filteredEmails.map(email => (
                <button key={email.id} onClick={() => { setSelectedEmail(email); markRead(email.id); }}
                  className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-start gap-3 ${!email.read ? 'bg-accent-500/5' : ''}`}>
                  <button onClick={e => { e.stopPropagation(); toggleStar(email.id); }}
                    className={`mt-0.5 shrink-0 ${email.starred ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'}`}>
                    <Star className="w-4 h-4" fill={email.starred ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm truncate ${!email.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{email.from}</span>
                      <span className="ml-auto text-[10px] text-slate-400 shrink-0">{formatDate(email.date)}</span>
                    </div>
                    <p className={`text-sm truncate ${!email.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{email.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{email.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email detail */}
          {selectedEmail && (
            <div className="flex-1 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 font-black text-sm">
                  {selectedEmail.from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{selectedEmail.from}</p>
                  <p className="text-xs text-slate-400">{selectedEmail.date.toLocaleString('es')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(selectedEmail.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelectedEmail(null); }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">{selectedEmail.subject}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>{selectedEmail.preview}</p>
                <p className="mt-4">Saludos cordiales,<br />Equipo Sparktree</p>
              </div>
            </div>
          )}
        </div>
      </PageBody>

      {/* Compose Modal */}
      <Modal
        open={showCompose}
        onClose={() => { setShowCompose(false); setComposeData({ to: '', subject: '', body: '' }); }}
        title="Redactar Correo"
        icon={<Mail className="w-5 h-5 text-accent-500" />}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Para</label>
            <input type="email" value={composeData.to} onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Asunto</label>
            <input type="text" value={composeData.subject} onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))}
              placeholder="Asunto del mensaje"
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Mensaje</label>
            <textarea value={composeData.body} onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))} rows={6}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60 resize-none" />
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleSend}
              className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md flex items-center justify-center gap-2">
              <Send className="w-3.5 h-3.5" />
              Enviar Correo
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
