import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Play, Pause, Trash2, Eye, Plus, Bell, RefreshCw, AlertTriangle, Clock, Calendar, RotateCcw } from 'lucide-react';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageBody } from '../../../components/layout/PageBody';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';
import { CreateReminderModal } from '../components/CreateReminderModal';
import {
  getReminders, getReminder, sendReminder, pauseReminder, resumeReminder, deleteReminder, cancelReminder,
} from '../../../services/api';

interface Reminder {
  id: string;
  name: string;
  message_template: string;
  whatsapp_connection_id: string | null;
  status: string;
  schedule_type: string;
  scheduled_at: string | null;
  recurring_cron: string | null;
  delay_ms: number;
  total: number;
  sent: number;
  failed: number;
  last_sent_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

interface ReminderDetail extends Reminder {
  contacts: Array<{
    id: string;
    phone: string;
    variables: Record<string, string>;
    status: string;
    error_message: string | null;
    sent_at: string | null;
  }>;
  count: number;
  logs: Array<{
    id: string;
    total_sent: number;
    total_failed: number;
    started_at: string;
    finished_at: string | null;
  }>;
}

const reminderStatusMeta: Record<string, { variant: string; label: string }> = {
  draft: { variant: 'default', label: 'Borrador' },
  scheduled: { variant: 'primary', label: 'Programado' },
  sending: { variant: 'info', label: 'Enviando' },
  paused: { variant: 'warning', label: 'Pausado' },
  completed: { variant: 'success', label: 'Completado' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
  failed: { variant: 'danger', label: 'Fallido' },
};

const scheduleTypeMeta: Record<string, { label: string; icon: any }> = {
  now: { label: 'Inmediato', icon: Send },
  once: { label: 'Una vez', icon: Calendar },
  recurring: { label: 'Recurrente', icon: RotateCcw },
};

export const Reminders = () => {
  const { addNotification } = useNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<ReminderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasActiveSend = useCallback((list: Reminder[]) => {
    return list.some((r) => r.status === 'sending' || r.status === 'paused');
  }, []);

  const loadReminders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rows = await getReminders();
      const list = Array.isArray(rows) ? rows : [];
      setReminders(list);

      const active = hasActiveSend(list);
      if (active && !pollRef.current) {
        pollRef.current = setInterval(() => loadReminders(true), 3000);
      } else if (!active && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [hasActiveSend]);

  useEffect(() => {
    loadReminders();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadReminders]);

  const openDetail = async (reminder: Reminder) => {
    setDetailLoading(true);
    try {
      const row = await getReminder(reminder.id);
      setDetail(row);
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo cargar el detalle del recordatorio.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSend = async (reminder: Reminder) => {
    try {
      await sendReminder(reminder.id);
      addNotification({ type: 'success', title: 'Enviando', message: `Recordatorio "${reminder.name}" iniciado.` });
      await loadReminders(true);
      if (detail?.id === reminder.id) openDetail(reminder);
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err?.response?.data?.error || 'No se pudo iniciar el envío.' });
    }
  };

  const handlePause = async (reminder: Reminder) => {
    try {
      await pauseReminder(reminder.id);
      addNotification({ type: 'warning', title: 'Envío pausado', message: `El recordatorio "${reminder.name}" fue pausado.` });
      await loadReminders(true);
      if (detail?.id === reminder.id) openDetail(reminder);
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err?.response?.data?.error || 'No se pudo pausar el envío.' });
    }
  };

  const handleResume = async (reminder: Reminder) => {
    try {
      await resumeReminder(reminder.id);
      addNotification({ type: 'success', title: 'Enviando', message: `El recordatorio "${reminder.name}" se reanudó.` });
      await loadReminders(true);
      if (detail?.id === reminder.id) openDetail(reminder);
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err?.response?.data?.error || 'No se pudo reanudar el envío.' });
    }
  };

  const handleCancel = async (reminder: Reminder) => {
    if (!window.confirm(`¿Cancelar el recordatorio "${reminder.name}"?`)) return;
    try {
      await cancelReminder(reminder.id);
      addNotification({ type: 'success', title: 'Cancelado', message: `Se canceló "${reminder.name}".` });
      await loadReminders(true);
      if (detail?.id === reminder.id) openDetail(reminder);
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo cancelar el recordatorio.' });
    }
  };

  const handleDelete = async (reminder: Reminder) => {
    if (!window.confirm(`¿Eliminar el recordatorio "${reminder.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteReminder(reminder.id);
      setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
      if (detail?.id === reminder.id) setDetail(null);
      addNotification({ type: 'success', title: 'Recordatorio eliminado', message: `Se eliminó "${reminder.name}".` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el recordatorio.' });
    }
  };

  const statusLabel = (status: string) => reminderStatusMeta[status]?.label || status;
  const statusVariant = (status: string) => (reminderStatusMeta[status]?.variant as any) || 'default';
  const canSend = (r: Reminder) => r.status !== 'sending' && r.total > 0;

  const columns = [
    { key: 'name', header: 'Recordatorio', render: (v: string, row: Reminder) => (
      <div className="min-w-0">
        <p className="font-bold text-slate-900 dark:text-white truncate">{v}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-400">{new Date(row.created_at).toLocaleString()}</span>
          {row.schedule_type && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400">
              {scheduleTypeMeta[row.schedule_type]?.label || row.schedule_type}
            </span>
          )}
        </div>
      </div>
    )},
    { key: 'status', header: 'Estado', render: (v: string) => <StatusBadge status={v} variant={statusVariant(v)} /> },
    { key: 'progress', header: 'Progreso', render: (_v: unknown, row: Reminder) => {
      const pct = row.total > 0 ? Math.min(100, Math.round(((row.sent + row.failed) / row.total) * 100)) : 0;
      return (
        <div className="w-40">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="text-slate-500 dark:text-slate-400">{row.sent + row.failed}/{row.total}</span>
            <span className="text-accent-500">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${row.failed > 0 && row.sent === 0 ? 'bg-red-500' : 'bg-gradient-to-r from-accent-500 to-emerald-500'}`} style={{ width: `${pct}%` }} />
          </div>
          {row.failed > 0 && <p className="text-[9px] text-red-400 mt-0.5">{row.failed} fallaron</p>}
        </div>
      );
    }},
    { key: 'actions', header: 'Acciones', className: 'text-center', render: (_v: unknown, row: Reminder) => (
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => openDetail(row)} title="Ver detalle" className="p-1.5 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-500/10 transition-all"><Eye className="w-4 h-4" /></button>
        {row.status === 'sending' ? (
          <button onClick={() => handlePause(row)} title="Pausar envío" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"><Pause className="w-4 h-4" /></button>
        ) : row.status === 'paused' ? (
          <button onClick={() => handleResume(row)} title="Reanudar envío" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"><Play className="w-4 h-4" /></button>
        ) : (
          <button onClick={() => handleSend(row)} disabled={!canSend(row)} title="Enviar" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Send className="w-4 h-4" /></button>
        )}
        {row.status !== 'sending' && row.status !== 'paused' && (
          <button onClick={() => handleDelete(row)} title="Eliminar" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
        )}
        {row.status !== 'cancelled' && row.status !== 'completed' && (
          <button onClick={() => handleCancel(row)} title="Cancelar" className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all"><Clock className="w-4 h-4" /></button>
        )}
      </div>
    )},
  ];

  const detailProgress = detail && detail.total > 0
    ? Math.min(100, Math.round(((detail.sent + detail.failed) / detail.total) * 100))
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Recordatorios"
        description="Envía mensajes automatizados programados a tus contactos"
        icon={Bell}
        meta={[
          { label: 'Recordatorios', value: reminders.length, icon: Bell, color: 'accent' },
          { label: 'Activos', value: reminders.filter((r) => r.status === 'sending' || r.status === 'paused').length, icon: Send, color: 'emerald' },
          { label: 'Programados', value: reminders.filter((r) => r.status === 'scheduled').length, icon: Clock, color: 'blue' },
        ]}
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-95">
            <Plus className="w-4 h-4" /> Nuevo Recordatorio
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          {reminders.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-accent-500/10 rounded-2xl mb-4">
                <Bell className="w-10 h-10 text-accent-500" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Aún no tienes recordatorios</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">
                Crea recordatorios para enviar mensajes automatizados a tus contactos programadamente o de forma inmediata.
              </p>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 h-10 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-sm font-black rounded-xl hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Crear mi primer recordatorio
              </button>
            </div>
          ) : (
            <DataTable
              data={reminders}
              columns={columns}
              loading={loading}
              onRowClick={openDetail}
              emptyMessage="No hay recordatorios disponibles"
            />
          )}
        </div>

        <div className="mt-4 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Los recordatorios recurrentes se reinician automáticamente después de cada envío. Usa los mensajes con moderación y dentro del horario permitido por WhatsApp.
          </span>
        </div>
      </PageBody>

      <CreateReminderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => loadReminders()}
      />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        size="full"
        title={detail?.name || 'Detalle de recordatorio'}
        icon={<Bell className="w-5 h-5 text-accent-500" />}
        footer={
          detail && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {detail.status === 'sending' ? (
                  <button onClick={() => handlePause(detail)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold bg-amber-500 text-black hover:bg-amber-600 transition-all">
                    <Pause className="w-4 h-4" /> Pausar
                  </button>
                ) : detail.status === 'paused' ? (
                  <button onClick={() => handleResume(detail)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-600 transition-all">
                    <Play className="w-4 h-4" /> Reanudar
                  </button>
                ) : (
                  <button onClick={() => handleSend(detail)} disabled={!canSend(detail)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold bg-accent-500 text-black hover:bg-accent-600 transition-all disabled:opacity-40">
                    <Send className="w-4 h-4" /> Enviar
                  </button>
                )}
                {detail.status !== 'cancelled' && detail.status !== 'completed' && (
                  <button onClick={() => handleCancel(detail)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-orange-500 hover:bg-orange-500/10 transition-all">
                    <Clock className="w-4 h-4" /> Cancelar
                  </button>
                )}
                <button onClick={() => handleDelete(detail)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
              <button onClick={() => loadReminders(true)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
          )
        }
      >
        {detailLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white" />
          </div>
        ) : detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={detail.status} variant={statusVariant(detail.status)} />
              <div className="flex items-center gap-2">
                {scheduleTypeMeta[detail.schedule_type] && (() => {
                  const SIcon = scheduleTypeMeta[detail.schedule_type].icon;
                  return <><SIcon className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-bold text-slate-500">{scheduleTypeMeta[detail.schedule_type].label}</span></>;
                })()}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Enviados {detail.sent} · Fallidos {detail.failed} · Pendientes {detail.total - detail.sent - detail.failed}</span>
                  <span className="text-accent-500">{detailProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-500 to-emerald-500 rounded-full transition-all" style={{ width: `${detailProgress}%` }} />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Último envío: {detail.last_sent_at ? new Date(detail.last_sent_at).toLocaleString() : '—'}
                {detail.next_run_at && detail.status === 'scheduled' && (
                  <><br />Próximo: {new Date(detail.next_run_at).toLocaleString()}</>
                )}
              </p>
            </div>

            <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">{detail.message_template}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Contactos ({detail.count})
              </p>
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Teléfono</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Estado</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 hidden md:table-cell">Variables</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 hidden lg:table-cell">Enviado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.contacts.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="px-3 py-2 text-sm font-mono text-slate-700 dark:text-slate-300">{c.phone}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={c.status} variant={c.status === 'sent' ? 'success' : c.status === 'failed' ? 'danger' : 'warning'} />
                        </td>
                        <td className="px-3 py-2 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Object.entries(c.variables).slice(0, 4).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 text-[9px] font-mono bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded">{k}: {String(v).slice(0, 14)}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400 hidden lg:table-cell">{c.sent_at ? new Date(c.sent_at).toLocaleTimeString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {detail.contacts.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-sm text-slate-400">Sin contactos</div>
                )}
              </div>
              {detail.count > detail.contacts.length && (
                <p className="text-[10px] text-slate-400 mt-1">Mostrando los primeros {detail.contacts.length} contactos.</p>
              )}
            </div>

            {detail.logs && detail.logs.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Historial de envíos ({detail.logs.length})
                </p>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900">
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Inicio</th>
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Fin</th>
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Enviados</th>
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Fallidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.logs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50">
                          <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{new Date(log.started_at).toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">{log.finished_at ? new Date(log.finished_at).toLocaleString() : '—'}</td>
                          <td className="px-3 py-2 text-xs font-bold text-emerald-500">{log.total_sent}</td>
                          <td className="px-3 py-2 text-xs font-bold text-red-500">{log.total_failed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
