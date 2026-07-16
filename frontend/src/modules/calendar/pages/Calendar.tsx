import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Users } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  description: string;
  attendees: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Reunión equipo ventas', date: new Date(2026, 6, 14), time: '10:00', duration: '1h', description: 'Revisión de métricas semanales y objetivos del mes.', attendees: 'Carlos, Ana, Luis' },
  { id: '2', title: 'Demo con cliente potencial', date: new Date(2026, 6, 14), time: '15:30', duration: '45m', description: 'Presentación de la plataforma para cliente del sector retail.', attendees: 'Cliente, Equipo comercial' },
  { id: '3', title: 'Sprint planning', date: new Date(2026, 6, 15), time: '09:00', duration: '2h', description: 'Planificación del sprint 24. Revisión de backlog y estimaciones.', attendees: 'Dev team, PM' },
  { id: '4', title: 'Webinar: IA en ventas', date: new Date(2026, 6, 16), time: '11:00', duration: '1h', description: 'Webinar interno sobre uso de inteligencia artificial en procesos comerciales.', attendees: 'Todo el equipo' },
  { id: '5', title: 'Revisión trimestral', date: new Date(2026, 6, 18), time: '14:00', duration: '1.5h', description: 'Revisión de resultados del Q3 y definición de estrategia Q4.', attendees: 'Directores, Gerentes' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const Calendar = () => {
  const { addNotification } = useNotifications();
  const [today] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({ title: '', time: '09:00', duration: '1h', description: '', attendees: '' });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfWeek]);

  const monthEvents = useMemo(() => {
    return events.filter(e => e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear);
  }, [events, currentMonth, currentYear]);

  const getEventsForDay = (day: number) => monthEvents.filter(e => e.date.getDate() === day);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(p => p - 1); } else setCurrentMonth(p => p - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(p => p + 1); } else setCurrentMonth(p => p + 1); };

  const isToday = (day: number) => today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const handleCreateEvent = () => {
    if (!formData.title.trim()) return;
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      date: selectedDate || new Date(currentYear, currentMonth, 1),
      time: formData.time,
      duration: formData.duration,
      description: formData.description,
      attendees: formData.attendees,
    };
    setEvents(prev => [...prev, newEvent]);
    setShowCreateEvent(false);
    setFormData({ title: '', time: '09:00', duration: '1h', description: '', attendees: '' });
    addNotification({ type: 'success', title: 'Evento creado', message: `"${newEvent.title}" agregado al calendario.` });
  };

  const handleDeleteEvent = (id: string) => {
    const deleted = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
    if (deleted) addNotification({ type: 'success', title: 'Evento eliminado', message: `"${deleted.title}" ha sido eliminado.` });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Calendario"
        highlight="de Eventos"
        description="Administra reuniones, eventos y actividades."
        icon={CalendarIcon}
        action={
          <button onClick={() => { setSelectedDate(new Date(currentYear, currentMonth, today.getDate())); setShowCreateEvent(true); }}
            className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        }
      />

      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all text-slate-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all text-slate-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
              {DAYS.map(d => (
                <div key={d} className="px-2 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => (
                <div key={idx}
                  className={`min-h-[90px] p-1.5 border-b border-r border-slate-100 dark:border-slate-800/50 transition-all ${
                    day ? 'hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer' : 'bg-slate-50/50 dark:bg-black/10'
                  }`}
                  onClick={() => { if (day) { setSelectedDate(new Date(currentYear, currentMonth, day)); setShowCreateEvent(true); } }}
                >
                  {day && (
                    <>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isToday(day) ? 'bg-accent-500 text-black' : 'text-slate-700 dark:text-slate-300'
                      }`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {getEventsForDay(day).slice(0, 2).map(ev => (
                          <button key={ev.id} onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                            className="w-full text-left px-1.5 py-0.5 bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded text-[9px] font-bold truncate hover:bg-accent-500/20 transition-all">
                            {ev.title}
                          </button>
                        ))}
                        {getEventsForDay(day).length > 2 && (
                          <p className="text-[8px] text-slate-400 px-1">+{getEventsForDay(day).length - 2} más</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Events list sidebar */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-accent-500" />
              Eventos de {MONTHS[currentMonth]}
            </h3>
            <div className="space-y-3">
              {monthEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No hay eventos este mes</p>
              ) : monthEvents.sort((a, b) => a.date.getDate() - b.date.getDate()).map(ev => (
                <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700/50 hover:bg-accent-500/5 hover:border-accent-500/20 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex flex-col items-center justify-center text-accent-500 shrink-0">
                      <span className="text-xs font-black">{ev.date.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.time} ({ev.duration})
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageBody>

      {/* Create Event Modal */}
      <Modal
        open={showCreateEvent}
        onClose={() => { setShowCreateEvent(false); setFormData({ title: '', time: '09:00', duration: '1h', description: '', attendees: '' }); }}
        title="Nuevo Evento"
        icon={<CalendarIcon className="w-5 h-5 text-accent-500" />}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Título</label>
            <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Nombre del evento"
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Hora</label>
              <input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Duración</label>
              <input type="text" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                placeholder="ej. 1h, 45m"
                className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Descripción</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3}
              placeholder="Descripción del evento"
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60 resize-none" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5">Asistentes</label>
            <input type="text" value={formData.attendees} onChange={e => setFormData(p => ({ ...p, attendees: e.target.value }))}
              placeholder="Nombres separados por coma"
              className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder-slate-400/60" />
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleCreateEvent}
              className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md">
              Crear Evento
            </button>
          </div>
        </div>
      </Modal>

      {/* Event detail Modal */}
      <Modal
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title ?? ''}
        icon={<CalendarIcon className="w-5 h-5 text-accent-500" />}
        size="sm"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEvent.date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Horario</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEvent.time} ({selectedEvent.duration})</p>
              </div>
            </div>
            {selectedEvent.description && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selectedEvent.description}</p>
              </div>
            )}
            {selectedEvent.attendees && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Asistentes
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEvent.attendees}</p>
              </div>
            )}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="w-full py-3.5 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center justify-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Evento
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
