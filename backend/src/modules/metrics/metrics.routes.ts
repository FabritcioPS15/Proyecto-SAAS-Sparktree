import express from 'express';
import { supabase } from '../../core/config/supabase';

const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

/** Extrae el texto real de una consulta inbound (el content viene como JSON de Baileys) */
function extractQueryText(content: string): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    return (
      parsed?.message?.conversation ||
      parsed?.message?.extendedTextMessage?.text ||
      parsed?.text?.body ||
      parsed?.body ||
      parsed?.message?.imageMessage?.caption ||
      parsed?.message?.documentMessage?.caption ||
      parsed?.message?.videoMessage?.caption ||
      parsed?.pushName ||
      ''
    );
  } catch {
    // No es JSON: usar el contenido tal cual
    return content;
  }
}

/** Clasifica el tipo de consulta según palabras clave (rubro construcción) */
function classifyQueryType(text: string): string {
  const t = (text || '').toLowerCase();
  if (/hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos/.test(t)) return 'saludo';
  if (/precio|cuánto|cuanto|cuesta|costo|tarifa|valor|presupuesto/.test(t)) return 'precio';
  if (/proyecto|departamento|edificio|casa|condominio|residencial|entrega|inmueble/.test(t)) return 'proyecto';
  if (/servicio|remodelaci|construcci|ampliaci|diseño|estudio de suelos|obra/.test(t)) return 'servicio';
  if (/material|cemento|fierro|ladrillo|arena|acero|insumo|hierro/.test(t)) return 'material';
  if (/acabado|porcelanato|grifer|puerta|piso|revestimiento/.test(t)) return 'acabado';
  if (/cotizaci|cotizar|comprar|pedido|adquirir/.test(t)) return 'cotizacion';
  if (/horario|ubicaci|direcci|contacto|teléfono|telefono|donde est/.test(t)) return 'informacion';
  if (/reclamo|queja|problema|error|no funciona|ayuda|soporte/.test(t)) return 'soporte';
  return 'general';
}

/** Obtiene el organization_id de múltiples fuentes (tenant middleware, user, header, param) */
function resolveOrgId(req: any, explicit?: string): string | null {
  return (
    explicit ||
    req.organizationId ||
    req.tenant?.id ||
    req.user?.organization_id ||
    req.headers['x-organization-id'] ||
    req.query.organization_id ||
    null
  );
}

/** Calcula los 5 indicadores del instrumento para un período y condición */
async function calculateReport(orgId: string, from: Date, to: Date, condition: string) {
  const { data: all, error } = await supabase
    .from('consultation_metrics')
    .select('*')
    .eq('organization_id', orgId)
    .eq('condition', condition)
    .eq('is_test', false)   // ← AGREGAR: excluir pruebas
    .gte('started_at', from.toISOString())
    .lte('started_at', to.toISOString());

  if (error) throw new Error(error.message);
  if (!all || all.length === 0) {
    return { condition, total: 0, tpac_min: null, trc_pct: null, trr_pct: null, tcre_pct: null, te_pct: null };
  }

  const n = all.length;
  const withDuration = all.filter((m: any) => m.duration_seconds != null);
  const sumDurationMin = withDuration.reduce((acc: number, m: any) => acc + m.duration_seconds / 60, 0);
  const tpac = withDuration.length > 0 ? sumDurationMin / withDuration.length : null;

  const correct = all.filter((m: any) => m.is_correct === true).length;
  const relevant = all.filter((m: any) => m.is_relevant === true).length;
  const resolved = all.filter((m: any) => m.resolved_without_escalation === true).length;
  const escalated = all.filter((m: any) => m.escalated_to_human === true).length;
  const reviewed = all.filter((m: any) => m.is_correct != null).length;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    condition,
    total: n,
    tpac_min: tpac != null ? round2(tpac) : null,
    trc_pct: round2((correct / n) * 100),
    trr_pct: round2((relevant / n) * 100),
    tcre_pct: round2((resolved / n) * 100),
    te_pct: round2((escalated / n) * 100),
    correct_count: correct,
    relevant_count: relevant,
    resolved_count: resolved,
    escalated_count: escalated,
    reviewed_count: reviewed,
    pending_review: n - reviewed,
  };
}

// ============================================================
// POST /api/metrics/consolidate
// Consolida mensajes de un período en consultation_metrics
// ============================================================
router.post('/consolidate', async (req: any, res) => {
  try {
    const { from, to, organization_id } = req.body || {};
    const orgId = resolveOrgId(req, organization_id);

    if (!orgId) {
      return res.status(400).json({ error: 'organization_id requerido' });
    }

    // Rango por defecto: hoy
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const toDate = to ? new Date(to) : now;

    // 1. Mensajes inbound de texto en el período
    const { data: inboundMessages, error: inErr } = await supabase
      .from('messages')
      .select('*')
      .eq('organization_id', orgId)
      .eq('direction', 'inbound')
      .eq('type', 'text')
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString())
      .order('created_at', { ascending: true });

    if (inErr) return res.status(500).json({ error: inErr.message });

    // 2. Mensajes outbound de texto (para emparejar respuestas)
    const { data: outboundMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('organization_id', orgId)
      .eq('direction', 'outbound')
      .eq('type', 'text')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: true });

    const consolidated: any[] = [];
    let skipped = 0;

    // 3. Emparejar cada inbound con su respuesta outbound
    for (const inbound of inboundMessages || []) {
      const sourceId = inbound.whatsapp_message_id || inbound.id;

      // Evitar duplicados si ya se consolidó antes
      const { data: existing } = await supabase
        .from('consultation_metrics')
        .select('id')
        .eq('source_message_id', sourceId)
        .maybeSingle();
      if (existing) { skipped++; continue; }

      const queryText = extractQueryText(inbound.content);

      // Primera respuesta outbound en la misma conversación después del inbound
      const response = (outboundMessages || []).find(
        (out: any) =>
          out.conversation_id === inbound.conversation_id &&
          new Date(out.created_at) > new Date(inbound.created_at)
      );

      const startedAt = new Date(inbound.created_at);
      const endedAt = response ? new Date(response.created_at) : null;
      const durationSec = endedAt
        ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
        : null;

      const metric = {
        organization_id: orgId,
        conversation_id: inbound.conversation_id,
        contact_id: inbound.contact_id,
        channel: 'whatsapp',
        condition: 'post', // bot activo (O₂)
        started_at: startedAt.toISOString(),
        ended_at: endedAt?.toISOString() || null,
        duration_seconds: durationSec,
        query_type: classifyQueryType(queryText),
        query_summary: (queryText || '').substring(0, 200),
        user_message: queryText,
        bot_response: response?.content || null,
        // Si el bot respondió, se resolvió sin escalar (por ahora no hay handoff)
        resolved_without_escalation: !!response,
        escalated_to_human: false,
        bot_enabled: true,
        is_test: req.body?.is_test === true,   // ← AGREGAR (false por defecto)
        source_message_id: sourceId,
      };

      const { data: inserted, error: insErr } = await supabase
        .from('consultation_metrics')
        .insert(metric)
        .select()
        .single();

      if (!insErr && inserted) consolidated.push(inserted);
      else skipped++;
    }

    // 4. Calcular indicadores del período
    const report = await calculateReport(orgId, fromDate, toDate, 'post');

    res.json({
      success: true,
      consolidated: consolidated.length,
      skipped,
      report,
    });
  } catch (error: any) {
    console.error('[Metrics] Consolidate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET /api/metrics/report  → indicadores + detalle (y CSV p/ SPSS)
// ============================================================
router.get('/report', async (req: any, res) => {
  try {
    const { from, to, condition = 'post', format = 'json' } = req.query;
    const orgId = resolveOrgId(req);
    if (!orgId) return res.status(400).json({ error: 'organization_id requerido' });

    const now = new Date();
    const fromDate = from ? new Date(from as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to as string) : now;

    const report = await calculateReport(orgId, fromDate, toDate, condition as string);

    const { data: details } = await supabase
      .from('consultation_metrics')
      .select('*')
      .eq('organization_id', orgId)
      .eq('condition', condition)
      .eq('is_test', false)   // ← AGREGAR
      .gte('started_at', fromDate.toISOString())
      .lte('started_at', toDate.toISOString())
      .order('started_at', { ascending: true });

    // Exportación CSV compatible con SPSS (variables numéricas)
    if (format === 'csv') {
      const esc = (v: any) => {
        if (v == null) return '';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      };
      const header = [
        'id_consulta', 'condicion', 'canal', 'tipo_consulta', 'duracion_min',
        'es_correcta', 'es_relevante', 'resuelta_sin_escalar', 'escalada_a_humano',
        'consulta', 'respuesta', 'fecha'
      ].join(',');

      const rows = (details || []).map((m: any, i: number) => {
        return [
          i + 1,
          condition === 'pre' ? 1 : 2,                    // 1=pre, 2=post (codificado p/ SPSS)
          1,                                               // 1=whatsapp
          esc(m.query_type),
          m.duration_seconds != null ? (m.duration_seconds / 60).toFixed(3) : '',
          m.is_correct == null ? '' : (m.is_correct ? 1 : 0),
          m.is_relevant == null ? '' : (m.is_relevant ? 1 : 0),
          m.resolved_without_escalation ? 1 : 0,
          m.escalated_to_human ? 1 : 0,
          esc(m.user_message),
          esc(m.bot_response),
          esc((m.started_at || '').substring(0, 10)),
        ].join(',');
      });

      const csv = '\uFEFF' + [header, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=metricas_${condition}_${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ report, details });
  } catch (error: any) {
    console.error('[Metrics] Report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET /api/metrics  → lista de consultas pendientes de calificar
// ============================================================
router.get('/', async (req: any, res) => {
  try {
    const orgId = resolveOrgId(req);
    const { condition = 'post', pending_only = 'false' } = req.query;
    if (!orgId) return res.status(400).json({ error: 'organization_id requerido' });

    let query = supabase
      .from('consultation_metrics')
      .select('*')
      .eq('organization_id', orgId)
      .eq('condition', condition)
      .order('started_at', { ascending: false })
      .limit(200);

    if (pending_only === 'true') query = query.is('is_correct', null);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, count: data?.length || 0, metrics: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PATCH /api/metrics/:id  → calificar TRC / TRR / resolución
// ============================================================
router.patch('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      is_correct, correct_criteria,
      is_relevant, relevant_criteria,
      resolved_without_escalation, escalated_to_human, escalation_reason,
      observation,
    } = req.body;

    const update: any = { updated_at: new Date().toISOString(), reviewed_at: new Date().toISOString() };
    if (is_correct !== undefined) update.is_correct = is_correct;
    if (correct_criteria !== undefined) update.correct_criteria = correct_criteria;
    if (is_relevant !== undefined) update.is_relevant = is_relevant;
    if (relevant_criteria !== undefined) update.relevant_criteria = relevant_criteria;
    if (resolved_without_escalation !== undefined) update.resolved_without_escalation = resolved_without_escalation;
    if (escalated_to_human !== undefined) update.escalated_to_human = escalated_to_human;
    if (escalation_reason !== undefined) update.escalation_reason = escalation_reason;
    if (observation !== undefined) update.observation = observation;

    const { data, error } = await supabase
      .from('consultation_metrics')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, metric: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;