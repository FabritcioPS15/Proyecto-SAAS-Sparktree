import { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, LogOut, CheckCircle, Smartphone, Activity } from 'lucide-react';
import { getQRStatus, initializeQR, logoutQR, getSettings } from '../services/api';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoader } from '../components/layout/PageLoader';

export const WhatsAppQR = () => {
    const [data, setData] = useState<{ status: string; qr?: string; phoneNumber?: string }>({ status: 'unknown' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectionMethod, setConnectionMethod] = useState<'qr' | 'cloud'>('qr');
    const [botIdentity] = useState({ name: 'Sparktree Bot' });
    // Tracks whether the initial status has been fetched at least once.
    // Prevents auto-init from firing before we know the real server state.
    const hasLoadedOnce = useRef(false);

    const { } = useWhatsApp();

    const fetchStatus = async () => {
        if (connectionMethod !== 'qr') return;
        try {
            const res = await getQRStatus();
            setData(res);
            setLoading(false);
            // Mark that we have real server data — safe to auto-init if needed
            hasLoadedOnce.current = true;
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
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [connectionMethod]);

    useEffect(() => {
        // IMPORTANT: Only auto-init if we already have real server data (hasLoadedOnce).
        // Without this guard, the component would call handleInit() on every mount
        // before fetchStatus() returns, restarting an active WhatsApp session.
        if (
            hasLoadedOnce.current &&
            connectionMethod === 'qr' &&
            !loading &&
            !actionLoading &&
            data.status === 'disconnected' &&
            !data.qr
        ) {
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
            await fetchStatus();
        } catch (error) {
            console.error('Error logging out:', error);
        }
        setActionLoading(false);
    };

    if (loading) return <PageLoader sectionName="Conexión" />;

    const isConnected = connectionMethod === 'qr' ? data.status === 'connected' : false;

    return (
        <div className="h-full animate-in fade-in duration-500 flex flex-col gap-1">
            <PageHeader
                title="Conexión de"
                highlight="WhatsApp"
                description="Vincula la línea que atenderá a tus clientes e iniciará sesión."
                icon={QrCode}
                action={
                    <div className={`px-4 h-10 rounded-xl flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${isConnected
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                        {isConnected ? 'Línea Activa' : 'Sin Conexión'}
                    </div>
                }
            />

            <div className="flex-1 bg-white dark:bg-[#11141b]/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-lg relative overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">

                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden min-h-[400px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                            {!isConnected ? (
                                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                                    <div className="p-4 bg-white dark:bg-[#0a0c10] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5">
                                        {data.qr ? (
                                            <img src={data.qr} alt="WhatsApp QR" className="w-56 h-56 rounded-xl" />
                                        ) : (
                                            <div className="w-56 h-56 flex flex-col items-center justify-center gap-4 text-slate-400">
                                                <RefreshCw className="w-10 h-10 animate-spin text-accent-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Generando sesión...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escanea para Iniciar Sesión</h3>
                                        <p className="text-xs text-slate-500 mt-2 font-medium italic">Esta línea será la encargada de enviar todas las respuestas automáticas.</p>
                                    </div>
                                    <button onClick={handleInit} className="w-full h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                                        Regenerar Código
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">SESIÓN INICIADA</h3>
                                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">Línea de Atención Activa</p>
                                        </div>

                                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/30">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Número Vinculado</p>
                                                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{data.phoneNumber || '+34 XXX XXX XXX'}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-500 font-medium max-w-[300px] mx-auto italic">
                                            Todos los clientes registrados serán atendidos automáticamente bajo este número de sesión.
                                        </p>

                                        <button onClick={handleLogout} className="mt-4 flex items-center gap-2 mx-auto text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 h-10 px-6 rounded-xl transition-all">
                                            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión Activa
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="p-6 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-accent-500 rounded-lg text-black shadow-lg shadow-accent-500/20">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Estado del Ecosistema</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresa</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{botIdentity.name}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Método</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{connectionMethod}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3 text-[11px] leading-relaxed">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                                        <div className="w-6 h-6 flex-shrink-0 bg-accent-500 text-black text-[10px] font-black rounded flex items-center justify-center">01</div>
                                        <p><span className="font-black text-slate-900 dark:text-white block uppercase mb-0.5">Sesión Activa</span>El bot toma control total de esta línea para responder a los clientes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
