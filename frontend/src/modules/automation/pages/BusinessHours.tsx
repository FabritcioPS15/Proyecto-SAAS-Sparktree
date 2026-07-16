import { useState } from 'react';
import { Plus, Search, Trash2, List, LayoutGrid, Clock } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageBody } from '../../../components/layout/PageBody';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';

interface BusinessHour {
  id: string; day: string; openTime: string; closeTime: string; autoResponse: string;
}

const mockHours: BusinessHour[] = [
  { id: 'BH-001', day: 'Lunes', openTime: '09:00', closeTime: '18:00', autoResponse: 'Gracias por contactarnos. Te responderemos en horario laboral.' },
  { id: 'BH-002', day: 'Martes', openTime: '09:00', closeTime: '18:00', autoResponse: 'Gracias por contactarnos. Te responderemos en horario laboral.' },
  { id: 'BH-003', day: 'Miércoles', openTime: '09:00', closeTime: '18:00', autoResponse: 'Gracias por contactarnos. Te responderemos en horario laboral.' },
  { id: 'BH-004', day: 'Jueves', openTime: '09:00', closeTime: '18:00', autoResponse: 'Gracias por contactarnos. Te responderemos en horario laboral.' },
  { id: 'BH-005', day: 'Viernes', openTime: '09:00', closeTime: '17:00', autoResponse: 'Gracias por contactarnos. Te responderemos en horario laboral.' },
  { id: 'BH-006', day: 'Sábado', openTime: '10:00', closeTime: '14:00', autoResponse: 'Gracias por contactarnos. Te responderemos el lunes.' },
  { id: 'BH-007', day: 'Domingo', openTime: '-', closeTime: '-', autoResponse: 'Cerrado. Te responderemos el lunes.' },
];

export const BusinessHours = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formDay, setFormDay] = useState('');
  const [formOpenTime, setFormOpenTime] = useState('');
  const [formCloseTime, setFormCloseTime] = useState('');

  const filtered = mockHours.filter(h =>
    h.day.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterAvail === 'all' || (filterAvail === 'open' ? h.openTime !== '-' : h.openTime === '-'))
  );

  return (
    <PageContainer>
      <PageHeader
        title="Horarios de Atención"
        description="Configuración de horario laboral y respuestas automáticas"
        action={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" /> Nuevo Horario
          </button>
        }
      />
      <PageBody>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
              <input type="text" placeholder="Buscar por día..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={filterAvail}
                onChange={(v) => setFilterAvail(v)}
                options={[
                  { value: 'all', label: 'Todos los días' },
                  { value: 'open', label: 'Con horario' },
                  { value: 'closed', label: 'Cerrado' },
                ]}
              />
              <div className="flex items-center dark:bg-dark-card rounded-xl p-1 border border-gray-200 dark:border-white/5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {filtered.map((hour) => (
                <div key={hour.id} className={`rounded-2xl p-4 border text-center transition-all ${hour.openTime === '-' ? 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-black/30 hover:shadow-md'}`}>
                  <div className={`p-2 rounded-xl mx-auto w-fit mb-2 ${hour.openTime === '-' ? 'bg-red-100 dark:bg-red-900/20 text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-xs mb-2">{hour.day}</h3>
                  {hour.openTime === '-' ? (
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Cerrado</span>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-500">{hour.openTime}</p>
                      <p className="text-[10px] text-slate-400">—</p>
                      <p className="text-[10px] font-black text-slate-500">{hour.closeTime}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((hour) => (
                <div key={hour.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${hour.openTime === '-' ? 'bg-red-100 dark:bg-red-900/20 text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">{hour.day}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {hour.openTime === '-' ? 'Cerrado' : `${hour.openTime} - ${hour.closeTime}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-slate-400 max-w-xs truncate hidden md:block">{hour.autoResponse}</p>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Horario"
        icon={<Clock className="w-5 h-5 text-accent-500" />}
      >
        <form onSubmit={(e) => { e.preventDefault(); addNotification({ type: 'success', title: 'Horario creado', message: `Se ha creado el horario para ${formDay}` }); setShowCreateModal(false); }} className="space-y-4">
          <Dropdown
            value={formDay}
            onChange={v => setFormDay(v)}
            placeholder="Seleccionar día"
            options={[
              { value: 'Lunes', label: 'Lunes' },
              { value: 'Martes', label: 'Martes' },
              { value: 'Miércoles', label: 'Miércoles' },
              { value: 'Jueves', label: 'Jueves' },
              { value: 'Viernes', label: 'Viernes' },
              { value: 'Sábado', label: 'Sábado' },
              { value: 'Domingo', label: 'Domingo' },
            ]}
          />
          <div className="flex gap-3">
            <input type="time" value={formOpenTime} onChange={e => setFormOpenTime(e.target.value)} required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white" />
            <input type="time" value={formCloseTime} onChange={e => setFormCloseTime(e.target.value)} required className="w-full px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all font-bold text-sm text-slate-900 dark:text-white" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-accent-600 hover:to-emerald-600 transition-all shadow-md">Crear Horario</button>
        </form>
      </Modal>
    </PageContainer>
  );
};
