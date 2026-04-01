import { useState, useEffect } from 'react';
import { Search, Phone, Mail, MessageSquare, Star, TrendingUp, User, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { getLeads } from '../services/api';

interface Lead {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'whatsapp' | 'referral' | 'social' | 'other';
  score: number;
  lastInteraction: string;
  notes: string;
  assignedTo?: string;
  tags: string[];
  conversationsCount: number;
  avgResponseTime?: number;
  budget?: string;
  timeline?: string;
  isHappyPath: boolean; // New field to track happy path completion
  flowCompleted: string[]; // Which flows/steps they completed
  currentStage: string; // Current stage in the happy path
}

import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';
import { PageLoader } from '../components/layout/PageLoader';

export const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Mock data - en producción vendría de la API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        setLeads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    // Only show leads that are on happy path
    if (!lead.isHappyPath) return false;

    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-accent-500/10 text-accent-600 border-accent-500/20';
      case 'contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'qualified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'converted': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-secondary-100 text-secondary-700 border-secondary-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-gray-700 bg-gray-100';
    if (score >= 60) return 'text-gray-600 bg-gray-100';
    return 'text-gray-500 bg-gray-100';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nuevo';
      case 'contacted': return 'Contactado';
      case 'qualified': return 'Calificado';
      case 'converted': return 'Convertido';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const stats = {
    total: leads.filter(l => l.isHappyPath).length,
    new: leads.filter(l => l.isHappyPath && l.status === 'new').length,
    qualified: leads.filter(l => l.isHappyPath && l.status === 'qualified').length,
    converted: leads.filter(l => l.isHappyPath && l.status === 'converted').length,
    avgScore: leads.filter(l => l.isHappyPath).length > 0 ? Math.round(leads.filter(l => l.isHappyPath).reduce((acc, l) => acc + l.score, 0) / leads.filter(l => l.isHappyPath).length) : 0
  };

  if (loading) {
    return <PageLoader sectionName="Prospectos" />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de"
        highlight="Leads"
        description="Monitoriza a los usuarios que han completado el Happy Path y están listos para la conversión."
        icon={TrendingUp}
        action={
          <button
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
          >
            <User className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nuevo Cliente
          </button>
        }
      />

      <PageBody>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
          {[
            { label: 'Total Leads', value: stats.total, icon: User, color: 'black' },
            { label: 'Nuevos', value: stats.new, icon: AlertCircle, color: 'accent' },
            { label: 'Calificados', value: stats.qualified, icon: CheckCircle, color: 'emerald' },
            { label: 'Convertidos', value: stats.converted, icon: Star, color: 'amber' },
            { label: 'Score Promedio', value: stats.avgScore, icon: TrendingUp, color: 'accent' }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#11141b] rounded-[1.5rem] p-4 shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 group hover:scale-105 transition-all duration-500">
              <div className={`p-2 bg-${item.color === 'black' ? 'black' : item.color + '-500/10'} rounded-xl w-fit mb-3 group-hover:rotate-6 transition-transform`}>
                <item.icon className={`w-5 h-5 ${item.color === 'black' ? 'text-white' : 'text-' + item.color + '-500'}`} />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Area */}
        <div className="bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[1.5rem] p-4 border border-gray-200 dark:border-gray-800/50 shadow-sm mb-2">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nombre, empresa o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer min-w-[160px] text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevos</option>
                <option value="contacted">Contactados</option>
                <option value="qualified">Calificados</option>
                <option value="converted">Convertidos</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer min-w-[160px] text-sm"
              >
                <option value="all">Todas las prioridades</option>
                <option value="high">Prioridad Alta</option>
                <option value="medium">Prioridad Media</option>
                <option value="low">Prioridad Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table Container */}
        <div className="bg-white dark:bg-[#11141b] rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden flex-1 min-h-0">
          <div className="overflow-y-auto custom-scrollbar h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-10">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lead / Empresa</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado & Score</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id || lead._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center font-black text-accent-600 dark:text-accent-400 text-sm group-hover:scale-110 transition-transform">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors truncate">{lead.name}</div>
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate">{lead.company || 'Personal'}</div>
                          <div className="flex gap-1 mt-1">
                            {lead.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded"><Mail className="w-3 h-3" /></div>
                          <span className="truncate">{lead.email || 'Sin correo'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded"><Phone className="w-3 h-3" /></div>
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border ${getStatusColor(lead.status)}`}>
                            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            {getStatusText(lead.status)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(lead.priority)}`}>
                              {getPriorityText(lead.priority)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase">Score</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 rounded-xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-700/50"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-accent-600 text-white rounded-xl shadow-lg shadow-accent-600/20 hover:scale-110 active:scale-95 transition-all duration-300"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modern Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#11141b] rounded-[3rem] shadow-2xl border border-gray-200 dark:border-gray-800/50 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              {/* Modal Header Special Design */}
              <div className="p-10 pb-6 flex items-start justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="flex gap-6 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-accent-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedLead.name}</h2>
                    <p className="text-lg font-bold text-slate-500 dark:text-slate-400">{selectedLead.company || 'Consultor Independiente'}</p>
                    <div className="flex gap-3 mt-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedLead.status)}`}>
                        {getStatusText(selectedLead.status)}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(selectedLead.priority)}`}>
                        Prioridad {getPriorityText(selectedLead.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-2xl font-light shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pt-0 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-10">
                    <section className="space-y-6">
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
                        Análisis del Happy Path
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Presupuesto Estimado</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.budget || 'Bajo consulta'}</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tiempo de Cierre</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.timeline || 'Inmediato'}</p>
                        </div>
                      </div>
                      <div className="p-8 bg-accent-500/5 rounded-3xl border border-accent-500/20">
                        <p className="text-[10px] font-black text-accent-500 uppercase tracking-widest mb-4">Notas de la IA</p>
                        <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                          {selectedLead.notes}
                        </p>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
                        Etiquetas & Segmentación
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedLead.tags.map((tag, index) => (
                          <span key={index} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
                            <Tag className="w-3 h-3 text-accent-500" />
                            {tag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <div className="p-8 bg-slate-900 dark:bg-white rounded-[2.5rem] text-white dark:text-slate-900 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Lead Score</p>
                      <p className="text-6xl font-black mb-6">{selectedLead.score}</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                          <p className="text-xs font-bold uppercase opacity-80">Calidad Premium</p>
                        </div>
                        <div className="pt-6 border-t border-white/10 dark:border-slate-200">
                          <p className="text-[10px] font-black uppercase opacity-60 mb-2">Etapa Actual</p>
                          <p className="text-lg font-black uppercase">{selectedLead.currentStage}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Contacto Directo</h4>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-sm font-bold truncate">{selectedLead.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                            <Phone className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                            <p className="text-sm font-bold truncate">{selectedLead.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 flex gap-4">
                <button className="flex-1 px-8 py-5 bg-accent-600 text-white font-black rounded-2xl shadow-xl shadow-accent-600/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Iniciar Chat WhatsApp
                </button>
                <button className="px-8 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-sm uppercase tracking-widest">
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </PageBody>
    </PageContainer>
  );
};
