import { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, LogOut, CheckCircle, Smartphone, Cloud, ScanLine, Trash2, ExternalLink, Shield, KeyRound, Webhook, MessageSquare } from 'lucide-react';
import { getQRStatus, initializeQR, logoutQR, getSettings, createWhatsAppCloudConnection } from '../../../services/api';
import { useWhatsApp } from '../../../contexts/WhatsAppContext';
import { useConnections } from '../../../contexts/ConnectionsContext';
import { PageHeader } from '../../../components/layout/PageHeader';
import { PageBody } from '../../../components/layout/PageBody';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageLoader } from '../../../components/layout/PageLoader';
import { ConnectionLayout, FormCard, EcosystemStatus, InputField } from '../components/ConnectionLayout';

export const WhatsAppQR = () => {
  const [data, setData] = useState<{ status: string; qr?: string; phoneNumber?: string }>({ status: 'unknown' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'qr' | 'cloud'>('qr');
  const [showCloudForm, setShowCloudForm] = useState(false);
  const [cloudCredentials, setCloudCredentials] = useState({
    phoneNumberId: '',
    accessToken: '',
    displayName: '',
    webhookVerifyToken: ''
  });
  const hasLoadedOnce = useRef(false);

  const { } = useWhatsApp();
  const { connections, addConnection, removeConnection, refreshConnections } = useConnections();

  const cloudConnection = connections.find(c => c.platform_type === 'whatsapp' && c.id !== 'whatsapp_session');

  const fetchStatus = async () => {
    if (connectionMethod !== 'qr') return;
    try {
      const res = await getQRStatus();
      setData(res);
      setLoading(false);
      hasLoadedOnce.current = true;
      if (res.status === 'connected' && res.phoneNumber) {
        await addConnection('whatsapp', { displayName: 'WhatsApp Business', phoneNumber: res.phoneNumber });
      }
      return res;
    } catch (error) {
      console.error('Error fetching QR status:', error);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const settings = await getSettings();
        setConnectionMethod(settings.connectionMethod || 'qr');
        if ((settings.connectionMethod || 'qr') === 'qr') {
          await fetchStatus();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (connectionMethod === 'qr') {
      interval = setInterval(fetchStatus, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [connectionMethod]);

  useEffect(() => {
    if (hasLoadedOnce.current && connectionMethod === 'qr' && !loading && !actionLoading && data.status === 'disconnected' && !data.qr) {
      handleInit();
    }
  }, [data.status, data.qr, loading, actionLoading, connectionMethod]);

  const handleInit = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await initializeQR();
      await fetchStatus();
    } catch (error) {
      console.error('Error initializing QR:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('¿Deseas cerrar la sesión activa de WhatsApp?')) return;
    setActionLoading(true);
    try {
      await logoutQR();
      setData({ status: 'disconnected' });
      const existingConnection = connections.find(c => c.platform_type === 'whatsapp' && c.id === 'whatsapp_session');
      if (existingConnection) { await removeConnection(existingConnection.id); }
      await fetchStatus();
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setActionLoading(false);
  };

  const handleCloudConnection = async () => {
    if (!cloudCredentials.phoneNumberId || !cloudCredentials.accessToken || !cloudCredentials.displayName) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    setActionLoading(true);
    try {
      await createWhatsAppCloudConnection(cloudCredentials);
      setShowCloudForm(false);
      setConnectionMethod('cloud');
      await refreshConnections();
      alert('Conexión WhatsApp Cloud creada exitosamente');
    } catch (error) {
      console.error('Error creating WhatsApp Cloud connection:', error);
      alert('Error al crear conexión WhatsApp Cloud');
    }
    setActionLoading(false);
  };

  const handleCloudDisconnect = async () => {
    if (!window.confirm('¿Deseas desconectar la API de Meta?')) return;
    if (!cloudConnection) return;
    setActionLoading(true);
    try {
      await removeConnection(cloudConnection.id);
      await refreshConnections();
    } catch (error) {
      console.error('Error disconnecting Cloud:', error);
    }
    setActionLoading(false);
  };

  if (loading) return <PageLoader sectionName="Conexión" />;

  const isQrConnected = data.status === 'connected';
  const isCloudConnected = cloudConnection?.status === 'connected';
  const isConnected = connectionMethod === 'qr' ? isQrConnected : isCloudConnected;

  return (
    <PageContainer>
      <PageHeader
        title="Conexión de"
        highlight="WhatsApp"
        description="Vincula la línea que atenderá a tus clientes e iniciará sesión."
        icon={QrCode}
        action={
          <div className={`px-4 h-10 rounded-xl flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${isConnected
            ? 'bg-white dark:bg-dark-card border-emerald-500/20 text-emerald-500'
            : 'bg-white dark:bg-dark-card border-red-500/20 text-red-500'
            }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
            {isConnected ? 'Línea Activa' : 'Sin Conexión'}
          </div>
        }
      />

      <PageBody>
        <ConnectionLayout
          sidebar={<EcosystemStatus platform="whatsapp" />}
        >
          <div className="flex gap-3">
            <button onClick={() => { setConnectionMethod('qr'); setShowCloudForm(false); }}
              className={`flex-1 h-11 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${connectionMethod === 'qr'
                ? 'bg-accent-500 border-accent-500 text-black shadow-lg shadow-accent-500/20'
                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-accent-500/30'
                }`}>
              <div className="flex items-center justify-center gap-2">
                <ScanLine className="w-4 h-4" />
                <span>Código QR</span>
              </div>
            </button>
            <button onClick={() => { setConnectionMethod('cloud'); setShowCloudForm(true); }}
              className={`flex-1 h-11 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${connectionMethod === 'cloud'
                ? 'bg-accent-500 border-accent-500 text-black shadow-lg shadow-accent-500/20'
                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-accent-500/30'
                }`}>
              <div className="flex items-center justify-center gap-2">
                <Cloud className="w-4 h-4" />
                <span>API de Meta</span>
              </div>
            </button>
          </div>

          {connectionMethod === 'cloud' && (
            isCloudConnected ? (
              <FormCard
                icon={<div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20"><Cloud size={18} color="white" /></div>}
                title="Sesión Activa — Cloud API"
              >
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">CONECTADO</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">WhatsApp Cloud API Activa</p>
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number ID</p>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{cloudConnection?.phone_number || '—'}</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="p-2 bg-accent-500/10 rounded-lg text-accent-500">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nombre</p>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{cloudConnection?.display_name || '—'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium max-w-xs italic">
                    Los mensajes se procesan a través de la API oficial de Meta.
                  </p>
                  <button onClick={handleCloudDisconnect} disabled={actionLoading}
                    className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/10 h-10 px-5 rounded-xl transition-all disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" /> Desconectar Cloud API
                  </button>
                </div>
              </FormCard>
            ) : showCloudForm ? (
              <FormCard
                icon={<div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20"><Cloud size={18} color="white" /></div>}
                title="Conectar con WhatsApp Cloud API"
              >
                <div className="space-y-5">
                  {/* Guia paso a paso */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-3">Cómo obtener tus credenciales</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center mt-0.5">1</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">Ve a <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2 hover:text-blue-600">Meta for Developers</a> y selecciona tu App</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center mt-0.5">2</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">En <strong>WhatsApp &rarr; Getting Started</strong> copia el <strong>Phone Number ID</strong></p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center mt-0.5">3</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">En <strong>System Users</strong> genera un token con permisos <strong>whatsapp_business_messaging</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Campos del formulario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Phone Number ID"
                      value={cloudCredentials.phoneNumberId}
                      onChange={(v) => setCloudCredentials({ ...cloudCredentials, phoneNumberId: v })}
                      placeholder="123456789012345"
                      required
                      hint="Lo encuentras en Meta for Developers > WhatsApp > Getting Started"
                    />
                    <InputField
                      label="Access Token"
                      type="password"
                      value={cloudCredentials.accessToken}
                      onChange={(v) => setCloudCredentials({ ...cloudCredentials, accessToken: v })}
                      placeholder="EAAxxxxxxxxxx"
                      required
                      hint="Token temporal de System Users con permisos de mensajería"
                    />
                    <InputField
                      label="Nombre de Conexión"
                      value={cloudCredentials.displayName}
                      onChange={(v) => setCloudCredentials({ ...cloudCredentials, displayName: v })}
                      placeholder="Mi línea de atención"
                      required
                      hint="Un nombre para identificar esta línea en el panel"
                    />
                    <InputField
                      label="Webhook Verify Token"
                      value={cloudCredentials.webhookVerifyToken}
                      onChange={(v) => setCloudCredentials({ ...cloudCredentials, webhookVerifyToken: v })}
                      placeholder="sparktree_webhook"
                      hint="Token para verificar el webhook. Déjalo vacío para usar el default"
                    />
                  </div>

                  {/* Link a documentación */}
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-bold text-accent-500 hover:text-accent-400 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Ver guía oficial de Meta para Cloud API
                  </a>

                  {/* Botones */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleCloudConnection} disabled={actionLoading}
                      className="flex-1 h-11 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]">
                      {actionLoading ? 'Conectando...' : 'Conectar'}
                    </button>
                    <button onClick={() => setShowCloudForm(false)}
                      className="px-6 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                      Cancelar
                    </button>
                  </div>
                </div>
              </FormCard>
            ) : (
              <FormCard
                icon={<div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20"><Cloud size={18} color="white" /></div>}
                title="WhatsApp Cloud API"
              >
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Cloud className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                      Conecta tu número de WhatsApp Business a través de la API oficial de Meta para enviar y recibir mensajes.
                    </p>
                  </div>

                  {/* Beneficios */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                    <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                      <MessageSquare className="w-4 h-4 text-accent-500" />
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Templates</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Oficial Meta</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30">
                      <Webhook className="w-4 h-4 text-blue-500" />
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Webhooks</p>
                    </div>
                  </div>

                  <button onClick={() => setShowCloudForm(true)}
                    className="flex items-center justify-center gap-2 h-11 px-8 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]">
                    <Cloud className="w-3.5 h-3.5" />
                    Configurar Cloud API
                  </button>
                </div>
              </FormCard>
            )
          )}

          {connectionMethod === 'qr' && (
            <FormCard
              icon={<div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20"><ScanLine size={18} color="white" /></div>}
              title={isConnected ? 'Sesión Activa' : 'Escanea para Iniciar Sesión'}
            >
              {!isConnected ? (
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                    {data.qr ? (
                      <img src={data.qr} alt="WhatsApp QR" className="w-52 h-52 rounded-xl" />
                    ) : (
                      <div className="w-52 h-52 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-accent-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Generando sesión...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium max-w-sm">
                    Esta línea será la encargada de enviar todas las respuestas automáticas.
                  </p>
                  <button onClick={handleInit} disabled={actionLoading}
                    className="flex items-center justify-center gap-2 h-11 px-8 bg-transparent border-2 border-slate-900 dark:border-white text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 hover:bg-slate-900 dark:hover:bg-white hover:text-emerald-400 dark:hover:text-emerald-500 active:scale-[0.98] disabled:opacity-50">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerar Código
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">SESIÓN INICIADA</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Línea de Atención Activa</p>
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Número Vinculado</p>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{data.phoneNumber || '+34 XXX XXX XXX'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium max-w-xs italic">
                    Todos los clientes registrados serán atendidos automáticamente bajo este número.
                  </p>
                  <button onClick={handleLogout} disabled={actionLoading}
                    className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/10 h-10 px-5 rounded-xl transition-all disabled:opacity-50">
                    <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión Activa
                  </button>
                </div>
              )}
            </FormCard>
          )}
        </ConnectionLayout>
      </PageBody>
    </PageContainer>
  );
};
