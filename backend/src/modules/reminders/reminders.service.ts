import * as XLSX from 'xlsx';
import { supabase } from '../../core/config/supabase';
import { multiWhatsAppService } from '../integrations/multiWhatsAppService';
import { whatsappCloudService } from '../integrations/platform/whatsappCloudService';

const PHONE_HEADER_PATTERN = /cel|celular|telefono|tel[eé]fono|phone|movil|m[oó]vil|whatsapp|numero|n[uú]mero|mobile|contacto/i;

export interface ParsedContact {
  phone: string;
  variables: Record<string, string>;
}

export interface ParsedExcel {
  headers: string[];
  phoneKey: string;
  rows: ParsedContact[];
  total: number;
}

export interface ReminderRow {
  id: string;
  organization_id: string;
  name: string;
  message_template: string;
  whatsapp_connection_id: string | null;
  status: string;
  schedule_type: string;
  scheduled_at: string | null;
  recurring_cron: string | null;
  recurring_timezone: string | null;
  delay_ms: number;
  total: number;
  sent: number;
  failed: number;
  last_sent_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SendState {
  reminderId: string;
  paused: boolean;
  cancelled: boolean;
}

function normalizePhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 9 && !digits.startsWith('51')) {
    return '51' + digits;
  }
  return digits;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderTemplate(template: string, variables: Record<string, string> = {}): string {
  let text = template;
  for (const [key, value] of Object.entries(variables || {})) {
    if (value === undefined || value === null) continue;
    const re = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'gi');
    text = text.replace(re, String(value));
  }
  text = text.replace(/\{\{\s*[\w\s-]+\s*\}\}/g, '');
  return text;
}

export function parseExcelBase64(base64Data: string): ParsedExcel {
  const buffer = Buffer.from(base64Data, 'base64');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json: Array<Record<string, any>> = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (json.length === 0) {
    return { headers: [], phoneKey: '', rows: [], total: 0 };
  }

  const headers = Object.keys(json[0]);
  const phoneKey =
    headers.find((h) => PHONE_HEADER_PATTERN.test(h)) ||
    headers[0];

  const rows: ParsedContact[] = [];
  for (const row of json) {
    const rawPhone = String(row[phoneKey] ?? '');
    const phone = normalizePhone(rawPhone);
    if (!phone) continue;

    const variables: Record<string, string> = {};
    for (const h of headers) {
      variables[h] = String(row[h] ?? '');
    }

    rows.push({ phone, variables });
  }

  return { headers, phoneKey, rows, total: rows.length };
}

async function countContacts(reminderId: string, status: string): Promise<number> {
  const { count, error } = await supabase
    .from('reminder_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('reminder_id', reminderId)
    .eq('status', status);
  if (error) {
    console.error('[Reminders] Error counting contacts:', error);
    return 0;
  }
  return count || 0;
}

async function updateProgress(reminderId: string) {
  const [sent, failed] = await Promise.all([
    countContacts(reminderId, 'sent'),
    countContacts(reminderId, 'failed'),
  ]);
  await supabase
    .from('reminders')
    .update({ sent, failed, updated_at: new Date().toISOString() })
    .eq('id', reminderId);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class RemindersService {
  private activeSends: Map<string, SendState> = new Map();

  isSending(reminderId: string): boolean {
    return this.activeSends.has(reminderId);
  }

  async recoverInterruptedReminders() {
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('status', 'sending');
    if (error) {
      const msg = error.message || '';
      if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('not find the table') || msg.includes('relation')) {
        console.log('\x1b[33m⚠️  [Recordatorios]\x1b[0m Tabla no existe aún. Omitiendo recuperación.');
      } else {
        console.error('\x1b[31m❌ [Recordatorios]\x1b[0m Error recuperando:', error.message);
      }
    } else {
      console.log('\x1b[32m✅ [Recordatorios]\x1b[0m Recuperación de envíos interrumpidos completada');
    }
  }

  async parseExcel(fileName: string | undefined, base64Data: string): Promise<ParsedExcel> {
    const result = parseExcelBase64(base64Data);
    console.log(`[Reminders] Parsed "${fileName || 'sin nombre'}" -> ${result.total} contactos, columna teléfono: "${result.phoneKey}"`);
    return result;
  }

  async createReminder(data: {
    organizationId: string;
    name: string;
    messageTemplate: string;
    whatsappConnectionId: string | null;
    scheduleType?: string;
    scheduledAt?: string | null;
    recurringCron?: string | null;
    recurringTimezone?: string | null;
    delayMs?: number;
    contacts: ParsedContact[];
    createdBy?: string | null;
    imageBase64?: string | null;
    metaTemplateName?: string | null;
    metaTemplateLanguage?: string | null;
  }) {
    const total = data.contacts.length;
    const status = data.scheduleType === 'now' ? 'draft' : 'scheduled';

    const insertData: any = {
      organization_id: data.organizationId,
      name: data.name,
      message_template: data.messageTemplate,
      whatsapp_connection_id: data.whatsappConnectionId,
      schedule_type: data.scheduleType || 'now',
      status,
      delay_ms: data.delayMs && data.delayMs > 0 ? data.delayMs : 6000,
      total,
      created_by: data.createdBy || null,
    };

    if (data.scheduledAt) insertData.scheduled_at = data.scheduledAt;
    if (data.recurringCron) insertData.recurring_cron = data.recurringCron;
    if (data.recurringTimezone) insertData.recurring_timezone = data.recurringTimezone;

    if (data.scheduleType === 'now') {
      insertData.next_run_at = new Date().toISOString();
    } else if (data.scheduleType === 'once' && data.scheduledAt) {
      insertData.next_run_at = data.scheduledAt;
    } else if (data.scheduleType === 'recurring') {
      // For daily recurring, set next_run_at to the scheduled time today (or tomorrow if past)
      const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
      const now = new Date();
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
      insertData.next_run_at = scheduledDate.toISOString();
    }
    if (data.imageBase64) insertData.image_base64 = data.imageBase64;
    if (data.metaTemplateName) insertData.meta_template_name = data.metaTemplateName;
    if (data.metaTemplateLanguage) insertData.meta_template_language = data.metaTemplateLanguage;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    const contacts = data.contacts.map((c) => ({
      reminder_id: reminder.id,
      phone: c.phone,
      variables: c.variables,
      status: 'pending',
    }));

    if (contacts.length > 0) {
      for (let i = 0; i < contacts.length; i += 500) {
        const { error: insertError } = await supabase
          .from('reminder_contacts')
          .insert(contacts.slice(i, i + 500));
        if (insertError) {
          console.error('[Reminders] Error inserting contacts:', insertError);
          throw insertError;
        }
      }
    }

    return reminder;
  }

  async listReminders(organizationId: string): Promise<ReminderRow[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ReminderRow[];
  }

  async getReminder(reminderId: string, organizationId: string) {
    const { data: reminder, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return reminder;
  }

  async getReminderContacts(reminderId: string, organizationId: string, limit = 200, offset = 0) {
    const { data: contacts, error, count } = await supabase
      .from('reminder_contacts')
      .select('*', { count: 'exact' })
      .eq('reminder_id', reminderId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { contacts: contacts || [], count: count || 0 };
  }

  async getReminderLogs(reminderId: string, organizationId: string) {
    const { data: logs, error } = await supabase
      .from('reminder_logs')
      .select('*')
      .eq('reminder_id', reminderId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return logs || [];
  }

  async updateReminder(reminderId: string, organizationId: string, updates: any) {
    const { data, error } = await supabase
      .from('reminders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', reminderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteReminder(reminderId: string, organizationId: string) {
    const state = this.activeSends.get(reminderId);
    if (state) {
      state.cancelled = true;
      this.activeSends.delete(reminderId);
    }
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return { success: true };
  }

  async startSending(reminderId: string, organizationId: string) {
    if (this.activeSends.has(reminderId)) {
      throw new Error('El recordatorio ya se está enviando');
    }

    const reminder = await this.getReminder(reminderId, organizationId);

    if (!reminder.whatsapp_connection_id) {
      throw new Error('El recordatorio no tiene una conexión WhatsApp asignada');
    }

    // Try Baileys first
    let connection = multiWhatsAppService.getConnection(reminder.whatsapp_connection_id);
    let isCloudApi = false;

    // If not found in Baileys, try Cloud API
    if (!connection || connection.status !== 'connected') {
      const { data: platformConn } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('id', reminder.whatsapp_connection_id)
        .eq('status', 'connected')
        .single();

      if (platformConn) {
        await whatsappCloudService.initializeConnection(platformConn);
        const cloudConn = whatsappCloudService['connections'].get(platformConn.id);
        if (cloudConn) {
          connection = cloudConn as any;
          isCloudApi = true;
        }
      }
    }

    if (!connection || (connection as any).status !== 'connected') {
      throw new Error('La conexión WhatsApp no está conectada. Verifica el estado del dispositivo.');
    }

    await supabase
      .from('reminders')
      .update({ status: 'sending', last_sent_at: new Date().toISOString() })
      .eq('id', reminderId);

    const logEntry = await supabase
      .from('reminder_logs')
      .insert({
        reminder_id: reminderId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const state: SendState = { reminderId, paused: false, cancelled: false };
    this.activeSends.set(reminderId, state);

    this.runSendLoop(state, reminder, connection, logEntry?.data?.id, isCloudApi).catch((err) => {
      console.error('[Reminders] Send loop error:', err);
      this.activeSends.delete(reminderId);
    });

    return { success: true, status: 'sending' };
  }

  async pauseSending(reminderId: string) {
    const state = this.activeSends.get(reminderId);
    if (!state) {
      await supabase
        .from('reminders')
        .update({ status: 'paused' })
        .eq('id', reminderId);
      return { success: true, status: 'paused' };
    }
    state.paused = true;
    await supabase
      .from('reminders')
      .update({ status: 'paused' })
      .eq('id', reminderId);
    return { success: true, status: 'paused' };
  }

  async resumeSending(reminderId: string, organizationId: string) {
    const state = this.activeSends.get(reminderId);
    if (!state) {
      return this.startSending(reminderId, organizationId);
    }
    state.paused = false;
    await supabase
      .from('reminders')
      .update({ status: 'sending' })
      .eq('id', reminderId);
    return { success: true, status: 'sending' };
  }

  async cancelReminder(reminderId: string, organizationId: string) {
    const state = this.activeSends.get(reminderId);
    if (state) {
      state.cancelled = true;
      this.activeSends.delete(reminderId);
    }
    await supabase
      .from('reminders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', reminderId)
      .eq('organization_id', organizationId);
    return { success: true };
  }

  private async runSendLoop(state: SendState, reminder: any, connection: any, logId?: string, isCloudApi = false) {
    const adapter = isCloudApi
      ? whatsappCloudService.createServiceAdapter(connection)
      : multiWhatsAppService.createWaServiceAdapter(connection);
    const delayMs = Math.max(Number(reminder.delay_ms) || 3000, 500);

    try {
      while (state.paused && !state.cancelled) {
        await sleep(500);
      }
      if (state.cancelled) return;

      const { data: contacts } = await supabase
        .from('reminder_contacts')
        .select('*')
        .eq('reminder_id', reminder.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      for (const contact of contacts || []) {
        if (state.cancelled) return;

        while (state.paused && !state.cancelled) {
          await sleep(500);
        }
        if (state.cancelled) return;

        try {
          const text = renderTemplate(reminder.message_template, contact.variables);
          if (isCloudApi && reminder.meta_template_name) {
            const langCode = reminder.meta_template_language || 'es';
            const renderedText = renderTemplate(reminder.message_template, contact.variables);
            await (adapter as any).sendTemplateMessage!(contact.phone, reminder.meta_template_name, langCode, [
              { type: 'body', parameters: [{ type: 'text', text: renderedText }] },
            ]);
          } else if (reminder.image_base64 && !isCloudApi) {
            await (adapter as any).sendImageMessage(contact.phone, reminder.image_base64, text);
          } else {
            await adapter.sendTextMessage(contact.phone, text);
          }
          await supabase
            .from('reminder_contacts')
            .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
            .eq('id', contact.id);
        } catch (err: any) {
          console.error('[Reminders] Send failed for', contact.phone, err?.message || err);
          await supabase
            .from('reminder_contacts')
            .update({ status: 'failed', error_message: String(err?.message || err) })
            .eq('id', contact.id);
        }

        await updateProgress(reminder.id);
        
        // Log progress visually
        const processed = (contact as any)._index !== undefined ? (contact as any)._index + 1 : ((contacts || []).indexOf(contact) + 1);
        const total = reminder.total;
        const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
        const filled = Math.round(pct / 10);
        const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
        console.log(`\x1b[36m⏱️ [Recordatorio]\x1b[0m ${reminder.name} | Progreso: \x1b[32m[${bar}]\x1b[0m ${pct}% (${processed}/${total})`);

        await sleep(delayMs);
      }

      await updateProgress(reminder.id);

      const [sentCount, failedCount] = await Promise.all([
        countContacts(reminder.id, 'sent'),
        countContacts(reminder.id, 'failed'),
      ]);

      if (logId) {
        await supabase
          .from('reminder_logs')
          .update({
            total_sent: sentCount,
            total_failed: failedCount,
            finished_at: new Date().toISOString(),
          })
          .eq('id', logId);
      }

      const newStatus = reminder.schedule_type === 'recurring' ? 'scheduled' : 'completed';
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };

      // For recurring, calculate next_run_at (next day at same time)
      if (reminder.schedule_type === 'recurring') {
        const tz = reminder.recurring_timezone || 'America/Lima';
        const lastRun = new Date();
        lastRun.setDate(lastRun.getDate() + 1);
        updateData.next_run_at = lastRun.toISOString();
      } else {
        updateData.next_run_at = null;
      }

      await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', reminder.id);
    } finally {
      this.activeSends.delete(reminder.id);
    }
  }

  startScheduler() {
    console.log('[Reminders] ⏰ Scheduler de recordatorios iniciado (cada 30 segundos)');

    setInterval(async () => {
      try {
        const now = new Date().toISOString();
        const { data: dueReminders } = await supabase
          .from('reminders')
          .select('*')
          .eq('status', 'scheduled')
          .lte('next_run_at', now)
          .not('next_run_at', 'is', null);

        if (!dueReminders || dueReminders.length === 0) return;

        console.log(`[Reminders] 📋 ${dueReminders.length} recordatorio(s) programado(s) listos para enviar`);

        for (const reminder of dueReminders) {
          if (this.activeSends.has(reminder.id)) continue;

          console.log(`[Reminders] 🚀 Enviando recordatorio programado: "${reminder.name}" (${reminder.schedule_type})`);
          try {
            await this.startSending(reminder.id, reminder.organization_id);
          } catch (err: any) {
            console.error(`[Reminders] ❌ Error iniciando recordatorio "${reminder.name}":`, err.message || err);
          }
        }
      } catch (err: any) {
        console.error('[Reminders] ⚠️ Error en scheduler:', err.message || err);
      }
    }, 30_000);
  }
}

export const remindersService = new RemindersService();
