import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, LogOut, CheckCircle, Smartphone, ShieldCheck, Zap, Key, Globe, Save, Info, ChevronDown, User, Edit3 } from 'lucide-react';
import { getQRStatus, initializeQR, logoutQR, getSettings, saveSettings } from '../services/api';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoader } from '../components/layout/PageLoader';

export const WhatsAppQR = () => {
    const [data, setData] = useState<{ status: string; qr?: string; phoneNumber?: string }>({ status: 'unknown' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectionMethod, setConnectionMethod] = useState<'qr' | 'cloud'>('qr');
    const [cloudSettings, setCloudSettings] = useState({
        phoneNumberId: '',
        accessToken: '',
        verifyToken: ''
    });

    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [botIdentity, setBotIdentity] = useState({ name: 'Sparktree Bot', status: 'Online' });

    const { } = useWhatsApp();

    const fetchStatus = async () => {
        if (connectionMethod !== 'qr') return;
        try {
            const res = await getQRStatus();
            setData(res);
            setLoading(false);
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
                setCloudSettings({
                    phoneNumberId: settings.phoneNumberId || '',
                    accessToken: settings.whatsappToken || '',
                    verifyToken: settings.verifyToken || ''
                });

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
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [connectionMethod]);

    // Auto-initialize if disconnected and no QR
    useEffect(() => {
        if (connectionMethod === 'qr' && !loading && !actionLoading && data.status === 'disconnected' && !data.qr) {
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
        if (!window.confirm('¿Estás seguro de que deseas cerrar la sesión de WhatsApp?')) return;
        setActionLoading(true);
        try {
            await logoutQR();
            setData({ status: 'disconnected' });
            await fetchStatus();
        } catch (error) {
            console.error('Error logging out:', error);
        }
        setActionLoading(false);
    };

    const handleToggleMethod = async (method: 'qr' | 'cloud') => {
        setConnectionMethod(method);
        try {
            await saveSettings({ connectionMethod: method });
        } catch (error) {
            console.error('Error saving connection method:', error);
        }
    };

    const handleSaveCloudSettings = async () => {
        setActionLoading(true);
        try {
            await saveSettings({
                phoneNumberId: cloudSettings.phoneNumberId,
                whatsappToken: cloudSettings.accessToken,
                verifyToken: cloudSettings.verifyToken,
                connectionMethod: 'cloud'
            });
            alert('Configuración de Cloud API guardada exitosamente');
        } catch (error) {
            console.error('Error saving cloud settings:', error);
            alert('Error al guardar la configuración');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <PageLoader sectionName="Conexión WhatsApp" />;
    }

    const isConnected = connectionMethod === 'qr' ? data.status === 'connected' : (cloudSettings.phoneNumberId && cloudSettings.accessToken);

    const connectionMethods = [
        { id: 'qr', label: 'Conexión QR', icon: QrCode, description: 'Conexión directa vía dispositivo' },
        { id: 'cloud', label: 'Cloud API', icon: Globe, description: 'API oficial empresarial de Meta' }
    ];

    const currentMethod = connectionMethods.find(m => m.id === connectionMethod) || connectionMethods[0];

    return (
        <div className="h-full space-y-1 animate-in fade-in duration-500 flex flex-col">
            <PageHeader
                title="Conexión"
                highlight={
                    <div className="inline-flex items-center gap-3 ml-4 relative">
                        <span className="text-primary-600 dark:text-primary-400 font-black">WhatsApp</span>

                        {/* Custom Dropdown */}
                        <div className="relative group">
                            <button
                                onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                className="flex items-center gap-3 pl-4 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-tighter hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 dark:text-white"
                            >
                                <div className="p-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-primary-600 dark:text-primary-400">
                                    <currentMethod.icon className="w-3.5 h-3.5" />
                                </div>
                                <span>{currentMethod.label}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isMethodDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>

                            {isMethodDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setIsMethodDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-2 z-50 animate-in zoom-in-95 fade-in duration-200 origin-top">
                                        {connectionMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    handleToggleMethod(method.id as 'qr' | 'cloud');
                                                    setIsMethodDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left ${connectionMethod === method.id
                                                    ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl ${connectionMethod === method.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}>
                                                    <method.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-black uppercase tracking-tighter ${connectionMethod === method.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'
                                                        }`}>{method.label}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium leading-tight">{method.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                }
                description={connectionMethod === 'qr'
                    ? "Vincula tu cuenta de WhatsApp escaneando el código QR. Sin APIs complejas, conexión directa."
                    : "Configura la API oficial de WhatsApp Cloud para una conexión empresarial robusta y escalable."}
                icon={connectionMethod === 'qr' ? QrCode : Key}
                action={
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border text-xs ${isConnected
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-black uppercase tracking-tighter">
                                {isConnected ? 'Sistema Vinculado' : 'Esperando Conexión'}
                            </span>
                        </div>
                    </div>
                }
            />



            <div className="flex-1 bg-white dark:bg-[#11141b]/50 backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-gray-800/50 shadow-xl relative overflow-hidden flex flex-col min-h-0">
                {/* Background purely decorative element for the main card */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none" />

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar relative z-10">
                    {connectionMethod === 'qr' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 h-full">
                            {/* QR Display Section */}
                            <div className="flex flex-col items-center justify-center p-4 lg:p-6 min-h-[450px] relative border-r border-slate-100 dark:border-slate-800/50">
                                {!isConnected ? (
                                    <div className="flex flex-col items-center gap-4 relative z-10">
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-xl group/qr">
                                            {data.qr ? (
                                                <div className="relative">
                                                    <img src={data.qr} alt="WhatsApp QR" className="w-[280px] h-[280px] rounded-2xl" />
                                                    <div className="absolute inset-0 border-2 border-primary-500/10 rounded-2xl animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="w-[280px] h-[280px] flex flex-col items-center justify-center gap-5 text-slate-400">
                                                    <QrCode className="w-16 h-16 animate-bounce" />
                                                    <p className="font-bold text-xs uppercase tracking-widest">Generando Código...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Vincular Dispositivo</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                Escanea este código desde WhatsApp para activar tu chatbot de inmediato.
                                            </p>

                                            <button
                                                onClick={handleInit}
                                                disabled={actionLoading}
                                                className="mt-4 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 text-sm"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                                                Generar Nuevo QR
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 relative z-10">
                                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 relative">
                                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-10" />
                                            <CheckCircle className="w-12 h-12 text-white" />
                                        </div>

                                        <div className="text-center space-y-3">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">¡Conexión Existosa!</h3>
                                            {data.phoneNumber && (
                                                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-500/10 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-500/20 w-fit mx-auto">
                                                    <Smartphone className="w-4 h-4" />
                                                    <span>{data.phoneNumber}</span>
                                                </div>
                                            )}
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-[280px]">
                                                Tu bot está activo y procesando mensajes en tiempo real.
                                            </p>

                                            <button
                                                onClick={handleLogout}
                                                disabled={actionLoading}
                                                className="mt-6 px-8 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-xl font-black hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 mx-auto text-xs uppercase tracking-tighter"
                                            >
                                                <LogOut className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                                                Desconectar Sistema
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Guidelines & Settings Section */}
                            <div className="flex flex-col gap-6 pl-6 lg:pl-10 h-full py-4">
                                {/* Chatbot Identity Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl shadow-lg text-white dark:text-slate-900">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identidad del Chatbot</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="group bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block ml-1">Nombre del Bot</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={botIdentity.name}
                                                    onChange={(e) => setBotIdentity({ ...botIdentity, name: e.target.value })}
                                                    className="bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none w-full"
                                                />
                                                <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-transparent">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block ml-1">Estado</label>
                                                <p className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{botIdentity.status}</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Guide Section */}
                                <div className={`mt-4 space-y-4 transition-all duration-300 ${isGuideOpen ? 'flex-1' : ''}`}>
                                    <button
                                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                                        className="w-full flex items-center justify-between p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all font-black uppercase tracking-tighter text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Info className="w-5 h-5" />
                                            <span>Guía de Configuración</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`space-y-3 transition-all duration-500 overflow-hidden ${isGuideOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        {[
                                            { title: 'Inicia WhatsApp', desc: 'Abre la aplicación en tu celular.' },
                                            { title: 'Menú Vinculación', desc: 'Ve a Ajustes > Dispositivos Vinculados.' },
                                            { title: 'Escanea el Código', desc: 'Apunta tu cámara al código de la izquierda.' }
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-transparent">
                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg flex items-center justify-center font-black text-xs shadow-md">
                                                    {idx + 1}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{step.title}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 h-full">
                            {/* Cloud API Config Section */}
                            <div className="p-6 lg:p-10 relative group border-r border-slate-100 dark:border-slate-800/50">
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 text-white">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Configuración API</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Phone Number ID</label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={cloudSettings.phoneNumberId}
                                                    onChange={(e) => setCloudSettings({ ...cloudSettings, phoneNumberId: e.target.value })}
                                                    placeholder="Ej: 10562728910243..."
                                                    className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Access Token</label>
                                            <div className="relative">
                                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="password"
                                                    value={cloudSettings.accessToken}
                                                    onChange={(e) => setCloudSettings({ ...cloudSettings, accessToken: e.target.value })}
                                                    placeholder="Token de acceso permanente de Meta..."
                                                    className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Verify Token (Webhook)</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={cloudSettings.verifyToken}
                                                    onChange={(e) => setCloudSettings({ ...cloudSettings, verifyToken: e.target.value })}
                                                    placeholder="Token que configurarás en Meta..."
                                                    className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveCloudSettings}
                                        disabled={actionLoading}
                                        className="w-full px-8 py-5 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                                    >
                                        <Save className={`w-5 h-5 ${actionLoading ? 'animate-spin' : ''}`} />
                                        Guardar y Activar API
                                    </button>
                                </div>
                            </div>

                            {/* Cloud API Guidelines & Settings Section */}
                            <div className="flex flex-col gap-6 pl-6 lg:pl-10 h-full py-4">
                                {/* Chatbot Identity Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl shadow-lg text-white dark:text-slate-900">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identidad del Chatbot</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="group bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block ml-1">Nombre del Bot</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={botIdentity.name}
                                                    onChange={(e) => setBotIdentity({ ...botIdentity, name: e.target.value })}
                                                    className="bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none w-full"
                                                />
                                                <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-transparent">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block ml-1">Estado</label>
                                                <p className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{botIdentity.status}</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Steps Section */}
                                <div className={`mt-4 space-y-4 transition-all duration-300 ${isGuideOpen ? 'flex-1' : ''}`}>
                                    <button
                                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                                        className="w-full flex items-center justify-between p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg transition-all font-black uppercase tracking-tighter text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>Pasos de Activación</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`space-y-3 transition-all duration-500 overflow-hidden ${isGuideOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        {[
                                            { title: 'App en Meta Developers', desc: 'Crea una aplicación de tipo "Business".' },
                                            { title: 'Token Permanente', desc: 'Genera un token de acceso que no expire.' },
                                            { title: 'Verificación Webhook', desc: 'Configura la URL y el Token en Meta.' }
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-transparent">
                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg flex items-center justify-center font-black text-xs shadow-md">
                                                    {idx + 1}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{step.title}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

