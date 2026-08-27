import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../contexts/AuthContext";

const API_BASE = 'http://localhost:3000/api';

interface Metric {
  id: string;
  user_message: string;
  bot_response: string;
  duration_seconds: number | null;
  query_type: string;
  started_at: string;
  is_correct: boolean | null;
  is_relevant: boolean | null;
  correct_criteria: string | null;
  relevant_criteria: string | null;
  resolved_without_escalation: boolean;
  escalated_to_human: boolean;
  observation: string | null;
}

interface Report {
  total: number;
  tpac_min: number | null;
  trc_pct: number | null;
  trr_pct: number | null;
  tcre_pct: number | null;
  te_pct: number | null;
  correct_count: number;
  relevant_count: number;
  resolved_count: number;
  escalated_count: number;
  reviewed_count: number;
  pending_review: number;
}

export default function MetricsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [condition, setCondition] = useState<'pre' | 'post'>('post');
  const [consolidating, setConsolidating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  // Headers de autenticación según tu backend (X-User-ID + X-Organization-ID)
  const getHeaders = () => ({
    'X-User-ID': user?.id || '',
    'X-Organization-ID': user?.organizationId || (user as any)?.organization_id || '',
  });

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user, condition]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const headers = getHeaders();

      const [metricsRes, reportRes] = await Promise.all([
        axios.get(`${API_BASE}/metrics?condition=${condition}`, { headers }),
        axios.get(`${API_BASE}/metrics/report?condition=${condition}`, { headers }),
      ]);

      setMetrics(metricsRes.data.metrics || []);
      setReport(reportRes.data.report || null);
    } catch (error: any) {
      console.error('Error fetching data:', error.response?.data || error.message);
      alert(`Error cargando métricas: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Consolidar consultas del día
  const handleConsolidate = async () => {
    setConsolidating(true);
    try {
      const headers = getHeaders();
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, -1).toISOString();

      const res = await axios.post(
        `${API_BASE}/metrics/consolidate`,
        { from, to },
        { headers }
      );

      alert(`✅ Consolidadas: ${res.data.consolidated} consultas (saltadas: ${res.data.skipped})`);
      fetchData();
    } catch (error: any) {
      alert(`Error consolidando: ${error.response?.data?.error || error.message}`);
    } finally {
      setConsolidating(false);
    }
  };

  // Calificar TRC / TRR
  const handleRate = async (
    metricId: string,
    field: 'is_correct' | 'is_relevant',
    value: boolean
  ) => {
    try {
      const headers = getHeaders();
      const criteria = prompt(
        `Criterio aplicado para ${field === 'is_correct' ? 'corrección' : 'relevancia'}:\n` +
        `(Ej: "Precio exacto del catálogo" / "Aborda la intención del usuario")`
      );
      if (criteria === null) return; // Canceló

      await axios.patch(
        `${API_BASE}/metrics/${metricId}`,
        {
          [field]: value,
          [field === 'is_correct' ? 'correct_criteria' : 'relevant_criteria']: criteria,
        },
        { headers }
      );

      fetchData();
    } catch (error: any) {
      alert(`Error calificando: ${error.response?.data?.error || error.message}`);
    }
  };

  // Marcar como escalamiento manual
  const handleToggleEscalation = async (metricId: string, escalated: boolean) => {
    try {
      const headers = getHeaders();
      const reason = escalated
        ? prompt('Motivo del escalamiento:', 'consulta_compleja') || 'consulta_compleja'
        : '';

      await axios.patch(
        `${API_BASE}/metrics/${metricId}`,
        {
          escalated_to_human: escalated,
          resolved_without_escalation: !escalated,
          escalation_reason: reason,
        },
        { headers }
      );
      fetchData();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // ⭐ EXPORTACIÓN CSV (vía fetch con headers + blob)
  const handleExport = async () => {
    try {
      const headers = getHeaders();
      const res = await axios.get(
        `${API_BASE}/metrics/report?condition=${condition}&format=csv`,
        { headers, responseType: 'blob' }
      );

      // Crear link de descarga desde el blob
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `metricas_${condition}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Error exportando: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando métricas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📊 Métricas del Chatbot
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {condition === 'post' ? 'Post-test (O₂) — Atención con chatbot' : 'Pre-test (O₁) — Atención manual'}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'pre' | 'post')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="post">Post-test (O₂)</option>
            <option value="pre">Pre-test (O₁)</option>
          </select>
        </div>
      </div>

      {/* 5 Indicadores del Instrumento */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Ficha 1 — TPAC
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {report.tpac_min != null ? report.tpac_min.toFixed(2) : '—'} <span className="text-sm font-medium text-slate-500">min</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Tiempo promedio de atención</div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
              Ficha 2 — TRC
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {report.trc_pct != null ? `${report.trc_pct.toFixed(1)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {report.correct_count || 0}/{report.total || 0} correctas
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Ficha 3 — TRR
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {report.trr_pct != null ? `${report.trr_pct.toFixed(1)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {report.relevant_count || 0}/{report.total || 0} relevantes
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
              Ficha 4 — TCRE
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {report.tcre_pct != null ? `${report.tcre_pct.toFixed(1)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {report.resolved_count || 0}/{report.total || 0} resueltas
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">
              Ficha 5 — TE
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {report.te_pct != null ? `${report.te_pct.toFixed(1)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {report.escalated_count || 0}/{report.total || 0} escaladas
            </div>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex flex-wrap gap-3 mb-6 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <button
          onClick={handleConsolidate}
          disabled={consolidating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {consolidating ? '⏳ Consolidando...' : '🔄 Consolidar consultas de hoy'}
        </button>

        <button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          📥 Exportar CSV para SPSS
        </button>

        <button
          onClick={fetchData}
          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Refrescar
        </button>

        <div className="ml-auto text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold">{report?.total || 0}</span> consultas ·{' '}
          <span className="font-semibold text-orange-600">{report?.pending_review || 0}</span> pendientes de calificar
        </div>
      </div>

      {/* Tabla de consultas (Fichas 2, 3, 4, 5) */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Detalle de Consultas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Califica cada respuesta marcando S (correcta/relevante) o N
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Consulta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Respuesta</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Dur.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">TRC</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">TRR</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">TCRE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">TE</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No hay consultas para mostrar. Haz clic en "Consolidar consultas de hoy" o cambia de condición.
                  </td>
                </tr>
              ) : (
                metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 max-w-xs">
                      <div className="font-medium truncate">{m.user_message || '(vacío)'}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.query_type} · {new Date(m.started_at).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 max-w-md">
                      <div className="truncate" title={m.bot_response || ''}>
                        {m.bot_response || <span className="italic text-slate-400">(sin respuesta)</span>}
                      </div>
                      {m.correct_criteria && (
                        <div className="text-xs text-slate-500 mt-1 italic">↳ {m.correct_criteria}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-slate-700 dark:text-slate-300">
                      {m.duration_seconds != null ? `${m.duration_seconds}s` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_correct === null ? (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleRate(m.id, 'is_correct', true)} className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold">S</button>
                          <button onClick={() => handleRate(m.id, 'is_correct', false)} className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold">N</button>
                        </div>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${m.is_correct ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                          {m.is_correct ? 'SÍ' : 'NO'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_relevant === null ? (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleRate(m.id, 'is_relevant', true)} className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold">S</button>
                          <button onClick={() => handleRate(m.id, 'is_relevant', false)} className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold">N</button>
                        </div>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${m.is_relevant ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                          {m.is_relevant ? 'SÍ' : 'NO'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${m.resolved_without_escalation ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {m.resolved_without_escalation ? 'SÍ' : 'NO'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.escalated_to_human ? (
                        <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">SÍ</span>
                      ) : (
                        <button onClick={() => handleToggleEscalation(m.id, true)} className="text-xs text-slate-500 hover:text-red-600 underline">
                          Marcar escalada
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}