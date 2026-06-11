import { useState } from 'react';
import { TbReportSearch } from "react-icons/tb";
import { BarChart3, TrendingUp, FileText, Download, Filter, Calendar } from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { PageBody } from '../components/layout/PageBody';

export const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('conversations');

  const reportTypes = [
    {
      id: 'conversations',
      name: 'Reporte de Conversaciones',
      description: 'Análisis detallado de todas las conversaciones',
      icon: FileText,
      color: 'bg-black'
    },
    {
      id: 'performance',
      name: 'Reporte de Rendimiento',
      description: 'Métricas de rendimiento del chatbot',
      icon: BarChart3,
      color: 'bg-accent-500'
    },
    {
      id: 'leads',
      name: 'Reporte de Leads',
      description: 'Seguimiento de clientes potenciales',
      icon: TrendingUp,
      color: 'bg-accent-600'
    }
  ];

  const periods = [
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último año' }
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Centro de"
        highlight="Reportes"
        description="Genera informes detallados y exporta datos estratégicos."
        icon={TbReportSearch}
      />

      <PageBody>

        {/* Controls */}
        <div className="bg-white dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent font-medium"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-accent-500 text-white dark:text-black rounded-xl font-black uppercase tracking-wider text-[11px] transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Download className="w-4 h-4" />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`group p-6 rounded-[2rem] border-2 transition-all duration-200 hover:scale-105 ${
                  selectedReport === report.id
                    ? 'border-accent-500 bg-accent-500/5 dark:bg-accent-500/10 shadow-lg shadow-accent-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black/40 backdrop-blur-xl hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 ${report.color} rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left">
                    {report.name}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm text-left">
                  {report.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm p-8 flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Sample Report Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Fecha</th>
                  <th className="text-left py-4 px-6 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Tipo</th>
                  <th className="text-left py-4 px-6 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Descripción</th>
                  <th className="text-left py-4 px-6 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Estado</th>
                  <th className="text-left py-4 px-6 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 text-slate-900 dark:text-white font-medium">2024-01-15</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-black uppercase tracking-wider">
                      Conversación
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">Cliente interesado en producto premium</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-accent-500/10 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-full text-xs font-black uppercase tracking-wider">
                      Completado
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 font-black text-sm uppercase tracking-wider">
                      Ver detalles
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 text-slate-900 dark:text-white font-medium">2024-01-14</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-400 rounded-full text-xs font-black uppercase tracking-wider">
                      Lead
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">Nuevo lead potencial identificado</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">
                      En proceso
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 font-black text-sm uppercase tracking-wider">
                      Ver detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageBody>
    </PageContainer>
  );
};

export default Reports;
