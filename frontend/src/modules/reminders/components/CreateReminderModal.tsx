import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, FileSpreadsheet, ChevronLeft, ChevronRight, Send,
  Smartphone, Zap, Check, Loader2, Wand2, Calendar, RotateCcw, Clock, FileText, Download, Image, X
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../contexts/NotificationContext';
import { parseReminderExcel, createReminder, sendReminder, getMessageTemplates } from '../../../services/api';
import api from '../../../services/api';

interface ParsedContact {
  phone: string;
  variables: Record<string, string>;
}

interface ParsedExcel {
  headers: string[];
  phoneKey: string;
  rows: ParsedContact[];
  total: number;
}

interface CreateReminderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (reminder: any) => void;
}

const delayOptions = [
  { value: '1500', label: '1.5 segundos entre mensajes' },
  { value: '3000', label: '3 segundos' },
  { value: '6000', label: '6 segundos (recomendado)' },
  { value: '10000', label: '10 segundos' },
];

const scheduleOptions = [
  { value: 'now', label: 'Inmediato', desc: 'Enviar al crear el recordatorio', icon: Send },
  { value: 'once', label: 'Una vez', desc: 'Programar para una fecha específica', icon: Calendar },
  { value: 'recurring', label: 'Recurrente', desc: 'Enviar periódicamente', icon: RotateCcw },
];

const recurringOptions = [
  { value: 'daily', label: 'Diariamente', cron: '0 9 * * *' },
  { value: 'weekly', label: 'Cada semana (lunes)', cron: '0 9 * * 1' },
  { value: 'biweekly', label: 'Cada 2 semanas', cron: '0 9 */14 * *' },
  { value: 'monthly', label: 'Mensualmente (día 1)', cron: '0 9 1 * *' },
];

const stepsMeta = [
  { label: 'Contactos', desc: 'Carga tu base de datos' },
  { label: 'Mensaje', desc: 'Redacta tu recordatorio' },
  { label: 'Programación', desc: 'Cuándo enviar' },
  { label: 'Revisión', desc: 'Confirma y activa' },
];

export const CreateReminderModal = ({ open, onClose, onCreated }: CreateReminderModalProps) => {
  const { addNotification } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [delayMs, setDelayMs] = useState('6000');
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [recurringOption, setRecurringOption] = useState('daily');
  const [sendNow, setSendNow] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setParsed(null);
    setFileName('');
    setParseError('');
    setName('');
    setMessage('');
    setDelayMs('6000');
    setScheduleType('now');
    setScheduledDate('');
    setScheduledTime('09:00');
    setRecurringOption('daily');
    setSendNow(true);
    setCreating(false);
    setSelectedTemplateId('');
    setImageFile(null);
    setImagePreview(null);
    (async () => {
      try {
        const connRes = await api.get('/whatsapp-connections');
        const connData = connRes.data;
        const connList = Array.isArray(connData) ? connData : (connData?.connections || connData?.data || []);
        setConnections(connList);
        const connected = connList.find((c: any) => c.status === 'connected');
        setConnectionId(connected?.id || connList[0]?.id || '');
        console.log('[Reminders] Conexiones cargadas:', connList.length, connList.map((c: any) => `${c.display_name} (${c.status})`));
      } catch (e: any) {
        console.error('[Reminders] Error cargando conexiones:', e?.response?.data || e?.message || e);
        setConnections([]);
        setConnectionId('');
      }
      try {
        const tplRes = await getMessageTemplates();
        setTemplates(Array.isArray(tplRes) ? tplRes : []);
      } catch (e: any) {
        console.warn('[Reminders] Error cargando plantillas:', e?.response?.data || e?.message || e);
        setTemplates([]);
      }
    })();
  }, [open]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(ext || '')) {
      setParseError('Solo se permiten archivos .xlsx o .xls');
      return;
    }
    setParsing(true);
    setParseError('');
    try {
      const base64Data = await readFileAsBase64(file);
      const result = await parseReminderExcel(file.name, base64Data);
      if (!result.rows || result.rows.length === 0) {
        setParseError('No se encontraron teléfonos válidos en el archivo.');
        setParsing(false);
        return;
      }
      setParsed(result);
      setFileName(file.name);
      setStep(2);
    } catch (err: any) {
      setParseError(err?.response?.data?.error || 'No se pudo leer el archivo Excel.');
    } finally {
      setParsing(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) {
      setMessage((prev) => prev + `{{${variable}}}`);
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const next = message.slice(0, start) + `{{${variable}}}` + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + variable.length + 4;
      el.setSelectionRange(pos, pos);
    });
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/reminders/template-excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_recordatorios.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification({ type: 'success', title: 'Plantilla descargada', message: 'Abre el archivo en Excel, rellena los datos y guárdalo como .xlsx antes de subirlo.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'No se pudo descargar la plantilla.' });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addNotification({ type: 'error', title: 'Formato inválido', message: 'Solo se permiten archivos de imagen.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addNotification({ type: 'error', title: 'Archivo muy grande', message: 'La imagen no puede superar 5MB.' });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const renderPreview = () => {
    if (!parsed || parsed.rows.length === 0 || !message) return '';
    let preview = message;
    const sample = parsed.rows[0];
    for (const [key, value] of Object.entries(sample.variables)) {
      preview = preview.replace(new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'gi'), value);
    }
    preview = preview.replace(/\{\{\s*[\w\s-]+\s*\}\}/g, '');
    return preview;
  };

  const handleCreate = async () => {
    if (!parsed) return;
    if (!name.trim()) {
      addNotification({ type: 'error', title: 'Falta el nombre', message: 'Ingresa un nombre para el recordatorio.' });
      return;
    }
    if (!message.trim()) {
      addNotification({ type: 'error', title: 'Falta el mensaje', message: 'Redacta el mensaje a enviar.' });
      return;
    }
    setCreating(true);
    try {
      let scheduledAt = null;
      let recurringCron = null;

      if (scheduleType === 'once' && scheduledDate) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      } else if (scheduleType === 'recurring') {
        const selectedOpt = recurringOptions.find((o) => o.value === recurringOption);
        recurringCron = selectedOpt?.cron || '0 9 * * *';
      }

      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await readFileAsBase64(imageFile);
      }

      const reminder = await createReminder({
        name: name.trim(),
        messageTemplate: message.trim(),
        whatsappConnectionId: connectionId || null,
        scheduleType,
        scheduledAt,
        recurringCron,
        delayMs: Number(delayMs) || 6000,
        contacts: parsed.rows,
        imageBase64,
      });
      addNotification({ type: 'success', title: 'Recordatorio creado', message: `Se cargaron ${parsed.total} contactos.` });

      // Incrementar contador de uso de la plantilla si se seleccionó una
      if (selectedTemplateId) {
        try {
          await api.post(`/message-templates/${selectedTemplateId}/increment-usage`);
        } catch (e) {
          console.warn('No se pudo incrementar el contador de uso de la plantilla');
        }
      }

      if (sendNow && scheduleType === 'now') {
        try {
          await sendReminder(reminder.id);
        } catch (err: any) {
          addNotification({ type: 'warning', title: 'No se inició el envío', message: err?.response?.data?.error || 'Configura la conexión WhatsApp e inicia el envío manualmente.' });
        }
      }
      onCreated(reminder);
      onClose();
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err?.response?.data?.error || 'No se pudo crear el recordatorio.' });
    } finally {
      setCreating(false);
    }
  };

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title="Nuevo Recordatorio"
      subtitle="Carga contactos, personaliza el mensaje y prográma el envío automático"
      icon={<Clock className="w-5 h-5 text-accent-500" />}
    >
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {stepsMeta.map((s, i) => {
          const idx = i + 1;
          const active = idx === step;
          const done = idx < step;
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-accent-500 text-black' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-none ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 hidden sm:block truncate">{s.desc}</p>
              </div>
              {idx < 4 && <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-500/50' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Excel */}
      {step === 1 && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-accent-500/60 hover:bg-accent-500/5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {parsing ? (
              <>
                <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Procesando archivo...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-accent-500/10 rounded-2xl mb-3 transition-transform group-hover:scale-105">
                  <UploadCloud className="w-8 h-8 text-accent-500" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Arrastra tu archivo Excel aquí o <span className="text-accent-500 underline">haz clic para seleccionarlo</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos: .xlsx, .xls — Debe contener una columna con teléfonos (celular, teléfono, whatsapp, número...)
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400">
            <Wand2 className="w-4 h-4 shrink-0" />
            <span>
              Las columnas del Excel se usan como variables. Ejemplos: <code className="font-mono bg-blue-500/10 px-1 rounded">{'{{nombre_completo}}'}</code>, <code className="font-mono bg-blue-500/10 px-1 rounded">{'{{placa}}'}</code>, <code className="font-mono bg-blue-500/10 px-1 rounded">{'{{fecha_revision}}'}</code>, <code className="font-mono bg-blue-500/10 px-1 rounded">{'{{dias_restantes}}'}</code>
            </span>
          </div>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer group"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-all">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold">Descargar plantilla Excel (.xlsx)</p>
              <p className="text-[10px] opacity-70">Archivo con 2 hojas: datos de ejemplo y guía de llenado. Columnas: teléfono, placa, nombre, DNI, fecha revisión, días restantes, mensaje</p>
            </div>
          </button>

          {parseError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-500">
              {parseError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => { if (parsed) setStep(2); }}
              disabled={!parsed}
              className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-bold bg-accent-500 text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-600 transition-all"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Message */}
      {step === 2 && parsed && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{fileName}</p>
              <p className="text-[10px] text-slate-400">
                {parsed.total} contactos detectados · Columna teléfono: <span className="font-mono font-bold">{parsed.phoneKey}</span>
              </p>
            </div>
            <button onClick={() => setStep(1)} className="ml-auto text-[11px] font-bold text-accent-500 hover:underline shrink-0">Cambiar archivo</button>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del recordatorio</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Recordatorio de Pago - Agosto"
              className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mensaje</label>
              <span className="text-[10px] text-slate-400">{message.length} caracteres</span>
            </div>

            {templates.length > 0 && (
              <div className="mt-1.5 mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" /> O selecciona una plantilla
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const tplId = e.target.value;
                    setSelectedTemplateId(tplId);
                    if (tplId) {
                      const tpl = templates.find((t) => t.id === tplId);
                      if (tpl) {
                        setMessage(tpl.content);
                        if (!name.trim()) setName(tpl.name);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="">Escribir mensaje manualmente</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category}) — {tpl.usage_count || 0} usos
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder={`Estimado(a) {{nombre_completo}}, su vehículo con placa {{placa}} pasó su revisión el día {{fecha_revision}} y está próxima a vencer.\n\nLe invitamos a pasar su revisión técnica con nosotros. Si es así, escribe "REVISIÓN" para que podamos atenderlo.\n\nSi ya pasó en otro lugar, puede dar omisión a este mensaje.`}
              className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400/60 font-mono leading-relaxed resize-none"
            />
            {parsed.headers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-400 self-center mr-1">Variables:</span>
                {parsed.headers.map((h) => (
                  <button
                    key={h}
                    onClick={() => insertVariable(h)}
                    className="px-2 py-1 text-[10px] font-mono font-bold rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-all border border-accent-500/20"
                    title={`Insertar {{${h}}}`}
                  >
                    {'{{'}{h}{'}}'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Image className="w-3 h-3" /> Imagen (opcional)
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            {imagePreview ? (
              <div className="mt-1.5 relative inline-block">
                <img src={imagePreview} alt="Vista previa" className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-slate-400 mt-1">{imageFile?.name} ({(imageFile?.size || 0 / 1024).toFixed(0)}KB)</p>
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                className="mt-1.5 w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-500 hover:border-accent-500/50 hover:bg-accent-500/5 transition-all"
              >
                <Image className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <p className="font-bold">Agregar imagen al mensaje</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG o WebP (máx. 5MB)</p>
                </div>
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Conexión WhatsApp
            </label>
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
            >
              <option value="">{connections.length === 0 ? 'No hay conexiones' : 'Seleccionar conexión'}</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}{c.phone_number ? ' · ' + c.phone_number : ''} ({c.status})
                </option>
              ))}
            </select>
            {connections.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1">Conecta un WhatsApp en el módulo de Conexiones antes de enviar.</p>
            )}
            {connectedCount === 0 && connections.length > 0 && (
              <p className="text-[10px] text-amber-500 mt-1">Ninguna conexión está conectada actualmente.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Velocidad de envío
            </label>
            <select
              value={delayMs}
              onChange={(e) => setDelayMs(e.target.value)}
              className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
            >
              {delayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Recomendado: 6s para evitar bloqueos de WhatsApp.</p>
          </div>

          <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vista previa (primer contacto)</p>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-accent-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{parsed.rows[0].phone}</p>
                {imagePreview && (
                  <img src={imagePreview} alt="Imagen" className="w-32 h-32 object-cover rounded-lg mb-2" />
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{renderPreview() || 'Escribe un mensaje para ver la vista previa...'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!name.trim() || !message.trim()}
              className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-bold bg-accent-500 text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-600 transition-all"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Schedule */}
      {step === 3 && parsed && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {scheduleOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = scheduleType === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setScheduleType(opt.value)}
                  className={`px-4 py-4 rounded-xl border-2 text-center transition-all ${
                    isActive
                      ? 'border-accent-500 bg-accent-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-accent-500' : 'text-slate-400'}`} />
                  <p className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {scheduleType === 'once' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hora</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {scheduleType === 'recurring' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Frecuencia</label>
              <div className="mt-2 space-y-2">
                {recurringOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRecurringOption(opt.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      recurringOption === opt.value
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <p className={`text-sm font-bold ${recurringOption === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{opt.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Los recordatorios recurrentes se envían a las 9:00 AM y se reinician después de cada envío.</p>
            </div>
          )}

          {scheduleType === 'now' && (
            <label className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl cursor-pointer">
              <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Enviar inmediatamente al crear</p>
                <p className="text-[10px] text-slate-400">Si la conexión no está lista, se guardará como borrador para enviar después.</p>
              </div>
            </label>
          )}

          {scheduleType === 'once' && !scheduledDate && (
            <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400">
              Selecciona una fecha y hora para programar el recordatorio.
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={scheduleType === 'once' && !scheduledDate}
              className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-bold bg-accent-500 text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-600 transition-all"
            >
              Revisar y crear <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review */}
      {step === 4 && parsed && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="px-4 py-4 bg-accent-500/5 border border-accent-500/20 rounded-xl text-center">
              <p className="text-2xl font-black text-accent-500">{parsed.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Contactos</p>
            </div>
            <div className="px-4 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-2xl font-black text-emerald-500">{message.replace(/\{\{\s*[\w\s-]+\s*\}\}/g, '').length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Caracteres</p>
            </div>
            <div className="px-4 py-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
              <p className="text-2xl font-black text-blue-500">{connections.find((c) => c.id === connectionId)?.status === 'connected' ? '✓' : '—'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Conexión lista</p>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{name}</p>
          </div>

          <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{message}</p>
          </div>

          {imagePreview && (
            <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Imagen adjunta</p>
              <img src={imagePreview} alt="Imagen del mensaje" className="w-40 h-40 object-cover rounded-xl" />
            </div>
          )}

          <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Programación</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {scheduleType === 'now' && 'Inmediato'}
              {scheduleType === 'once' && scheduledDate && `Una vez: ${scheduledDate} a las ${scheduledTime}`}
              {scheduleType === 'recurring' && `Recurrente: ${recurringOptions.find((o) => o.value === recurringOption)?.label}`}
            </p>
          </div>

          {connections.find((c) => c.id === connectionId)?.status !== 'connected' && (
            <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400">
              ⚠️ La conexión seleccionada no está conectada. Podrás iniciar el envío manualmente cuando el dispositivo esté en línea.
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(3)} disabled={creating} className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-black bg-gradient-to-r from-accent-500 to-emerald-500 text-black hover:opacity-90 transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {creating ? 'Creando...' : sendNow && scheduleType === 'now' ? 'Crear y Enviar' : 'Crear Recordatorio'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
