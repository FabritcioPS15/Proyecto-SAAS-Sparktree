import express from 'express';
import * as XLSX from 'xlsx';
import { remindersService } from './reminders.service';
import { authenticateToken } from '../../core/middleware/auth';
import { tenantMiddleware } from '../../shared/middleware/tenant.middleware';

const router = express.Router();

// Apply auth + tenant middleware to all routes
router.use(authenticateToken);
router.use(tenantMiddleware.use.bind(tenantMiddleware));

// GET /api/reminders/template-excel - Descargar plantilla Excel
router.get('/template-excel', async (req: any, res: any) => {
  try {
    const wb = XLSX.utils.book_new();

    const headers = ['telefono', 'placa', 'nombre_completo', 'dni', 'fecha_revision', 'dias_restantes', 'mensaje'];
    const sampleData = [
      ['999888777', 'ABC-123', 'Juan Pérez García', '45678901', '15/08/2026', 12, 'Estimado(a) Juan, su vehículo con placa ABC-123 pasó su revisión el día 15/08/2026 y está próxima a vencer. Le invitamos a pasar su revisión técnica con nosotros. Si es así, escribe "REVISIÓN" para que podamos atenderlo.'],
      ['999777666', 'XYZ-456', 'María López Martínez', '12345678', '20/08/2026', 17, 'Estimado(a) María, su vehículo con placa XYZ-456 pasó su revisión el día 20/08/2026 y está próxima a vencer. Le invitamos a pasar su revisión técnica con nosotros. Si es así, escribe "REVISIÓN" para que podamos atenderlo.'],
      ['999666555', 'DEF-789', 'Carlos Rodríguez Soto', '87654321', '25/08/2026', 22, 'Estimado(a) Carlos, su vehículo con placa DEF-789 pasó su revisión el día 25/08/2026 y está próxima a vencer. Le invitamos a pasar su revisión técnica con nosotros. Si es así, escribe "REVISIÓN" para que podamos atenderlo.'],
    ];

    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 15 },  // telefono
      { wch: 12 },  // placa
      { wch: 25 },  // nombre_completo
      { wch: 12 },  // dni
      { wch: 16 },  // fecha_revision
      { wch: 15 },  // dias_restantes
      { wch: 60 },  // mensaje
    ];

    // Estilo de cabecera (negrita)
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: 'D9E1F2' } },
        alignment: { horizontal: 'center' },
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Recordatorios');

    // Hoja de instrucciones
    const instrucciones = [
      ['INSTRUCCIONES PARA LLENAR LA PLANTILLA'],
      [''],
      ['Columna', 'Descripción', 'Ejemplo'],
      ['telefono', 'Número de WhatsApp del contacto (obligatorio)', '999888777'],
      ['placa', 'Placa del vehículo', 'ABC-123'],
      ['nombre_completo', 'Nombre y apellidos del cliente', 'Juan Pérez García'],
      ['dni', 'Número de documento de identidad', '45678901'],
      ['fecha_revision', 'Fecha de la revisión vehicular', '15/08/2026'],
      ['dias_restantes', 'Días que faltan para que venza la revisión', '12'],
      ['mensaje', 'Mensaje contextual del recordatorio', 'Su revisión está próxima a vencer...'],
      [''],
      ['NOTAS IMPORTANTES:'],
      ['1. La columna "telefono" es obligatoria y debe contener solo números.'],
      ['2. Las demás columnas son opcionales y se usan como variables en el mensaje.'],
      ['3. Puedes agregar más columnas si lo necesitas (ej: email, modelo_vehiculo, etc.).'],
      ['4. Guarda el archivo como .xlsx antes de subirlo al sistema.'],
      ['5. En el mensaje del recordatorio usa {{nombre_completo}}, {{placa}}, etc. para insertar datos.'],
    ];

    const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [
      { wch: 20 },
      { wch: 55 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_recordatorios.xlsx');
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('[Reminders] Error generating template:', err);
    res.status(500).json({ error: 'No se pudo generar la plantilla' });
  }
});

// POST /api/reminders/parse-excel - Parsear Excel y devolver contactos
router.post('/parse-excel', async (req: any, res: any) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Se requiere el contenido del archivo (base64Data)' });
    }

    const result = await remindersService.parseExcel(fileName, base64Data);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error parsing Excel:', err);
    res.status(500).json({ error: 'No se pudo leer el archivo Excel. Verifica que sea un archivo .xlsx o .xls válido.' });
  }
});

// GET /api/reminders - Listar recordatorios
router.get('/', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const reminders = await remindersService.listReminders(orgId);
    res.json(reminders);
  } catch (err: any) {
    console.error('[Reminders] Error listing reminders:', err);
    res.status(500).json({ error: 'No se pudieron cargar los recordatorios' });
  }
});

// GET /api/reminders/:id - Detalle de recordatorio
router.get('/:id', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const reminder = await remindersService.getReminder(req.params.id, orgId);
    const contacts = await remindersService.getReminderContacts(
      req.params.id,
      orgId,
      Math.min(parseInt(req.query.limit as string) || 200, 500),
      parseInt(req.query.offset as string) || 0
    );
    const logs = await remindersService.getReminderLogs(req.params.id, orgId);

    res.json({ ...reminder, ...contacts, logs });
  } catch (err: any) {
    console.error('[Reminders] Error fetching reminder:', err);
    res.status(404).json({ error: 'Recordatorio no encontrado' });
  }
});

// POST /api/reminders - Crear recordatorio
router.post('/', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { name, messageTemplate, whatsappConnectionId, scheduleType, scheduledAt, recurringCron, recurringTimezone, delayMs, contacts, imageBase64, metaTemplateName, metaTemplateLanguage } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del recordatorio es obligatorio' });
    }
    if (!messageTemplate || !messageTemplate.trim()) {
      return res.status(400).json({ error: 'El mensaje del recordatorio es obligatorio' });
    }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Debes cargar al menos un contacto' });
    }

    const reminder = await remindersService.createReminder({
      organizationId: orgId,
      name: name.trim(),
      messageTemplate: messageTemplate.trim(),
      whatsappConnectionId: whatsappConnectionId || null,
      scheduleType: scheduleType || 'now',
      scheduledAt: scheduledAt || null,
      recurringCron: recurringCron || null,
      recurringTimezone: recurringTimezone || null,
      delayMs,
      contacts,
      createdBy: (req as any).userId || null,
      imageBase64: imageBase64 || null,
      metaTemplateName: metaTemplateName || null,
      metaTemplateLanguage: metaTemplateLanguage || 'es',
    });

    res.status(201).json(reminder);
  } catch (err: any) {
    console.error('[Reminders] Error creating reminder:', err);
    res.status(500).json({ error: 'No se pudo crear el recordatorio' });
  }
});

// PUT /api/reminders/:id - Actualizar recordatorio
router.put('/:id', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.messageTemplate !== undefined) updates.message_template = req.body.messageTemplate;
    if (req.body.whatsappConnectionId !== undefined) updates.whatsapp_connection_id = req.body.whatsappConnectionId;
    if (req.body.scheduleType !== undefined) updates.schedule_type = req.body.scheduleType;
    if (req.body.scheduledAt !== undefined) updates.scheduled_at = req.body.scheduledAt;
    if (req.body.recurringCron !== undefined) updates.recurring_cron = req.body.recurringCron;
    if (req.body.delayMs !== undefined) updates.delay_ms = Math.max(Number(req.body.delayMs) || 3000, 500);

    const reminder = await remindersService.updateReminder(req.params.id, orgId, updates);
    res.json(reminder);
  } catch (err: any) {
    console.error('[Reminders] Error updating reminder:', err);
    res.status(404).json({ error: 'Recordatorio no encontrado' });
  }
});

// POST /api/reminders/:id/send - Iniciar envío
router.post('/:id/send', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const result = await remindersService.startSending(req.params.id, orgId);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error starting send:', err);
    res.status(400).json({ error: err.message || 'No se pudo iniciar el envío' });
  }
});

// POST /api/reminders/:id/pause - Pausar envío
router.post('/:id/pause', async (req: any, res: any) => {
  try {
    const result = await remindersService.pauseSending(req.params.id);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error pausing send:', err);
    res.status(400).json({ error: err.message || 'No se pudo pausar el envío' });
  }
});

// POST /api/reminders/:id/resume - Reanudar envío
router.post('/:id/resume', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const result = await remindersService.resumeSending(req.params.id, orgId);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error resuming send:', err);
    res.status(400).json({ error: err.message || 'No se pudo reanudar el envío' });
  }
});

// POST /api/reminders/:id/cancel - Cancelar recordatorio
router.post('/:id/cancel', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const result = await remindersService.cancelReminder(req.params.id, orgId);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error cancelling reminder:', err);
    res.status(400).json({ error: err.message || 'No se pudo cancelar el recordatorio' });
  }
});

// DELETE /api/reminders/:id - Eliminar recordatorio
router.delete('/:id', async (req: any, res: any) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const result = await remindersService.deleteReminder(req.params.id, orgId);
    res.json(result);
  } catch (err: any) {
    console.error('[Reminders] Error deleting reminder:', err);
    res.status(500).json({ error: 'No se pudo eliminar el recordatorio' });
  }
});

export default router;
