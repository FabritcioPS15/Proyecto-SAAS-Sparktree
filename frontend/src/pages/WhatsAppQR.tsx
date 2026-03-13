import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, LogOut, CheckCircle, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { getQRStatus, initializeQR, logoutQR } from '../services/api';

export const WhatsAppQR = () => {
    const [data, setData] = useState<{ status: string; qr?: string }>({ status: 'unknown' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await getQRStatus();
            setData(res);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching QR status:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleInit = async () => {
        setActionLoading(true);
        try {
            await initializeQR();
            await fetchStatus();
        } catch (error) {
            console.error('Error initializing QR:', error);
        }
        setActionLoading(false);
    };

    const handleLogout = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cerrar la sesión de WhatsApp?')) return;
        setActionLoading(true);
        try {
            await logoutQR();
            await fetchStatus();
        } catch (error) {
            console.error('Error logging out:', error);
        }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Conectando con el servidor...</p>
                </div>
            </div>
        );
    }

    const isConnected = data.status === 'connected';

    return (
        <div className="h-[calc(100vh-8rem)] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
            <div className="flex-1 p-3 lg:p-4 space-y-3 relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-4 lg:p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-2xl rounded-full -mr-16 -mt-16" />

                    <div className="space-y-1 relative z-10">
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Conexión <span className="text-primary-600 dark:text-primary-400">WhatsApp</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
                            Vincula tu cuenta de WhatsApp escaneando el código QR. Sin APIs complejas, conexión directa.
                        </p>
                    </div>

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
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* QR Display Section */}
                    <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden flex flex-col items-center justify-center p-10 lg:p-12 min-h-[500px] relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {!isConnected ? (
                            <div className="flex flex-col items-center gap-8 relative z-10">
                                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-inner group/qr">
                                    {data.qr ? (
                                        <div className="relative">
                                            <img src={data.qr} alt="WhatsApp QR" className="w-[300px] h-[300px] rounded-2xl shadow-2xl" />
                                            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-2xl animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="w-[300px] h-[300px] flex flex-col items-center justify-center gap-5 text-slate-400">
                                            <QrCode className="w-16 h-16 animate-bounce" />
                                            <p className="font-bold text-base uppercase tracking-widest">Generando QR...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-5 max-w-sm text-center">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Escanea el código</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                                        Abre WhatsApp {'>'} Dispositivos vinculados {'>'} Vincular dispositivo
                                    </p>

                                    <button
                                        onClick={handleInit}
                                        disabled={actionLoading}
                                        className="mt-4 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 text-base"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${actionLoading ? 'animate-spin' : ''}`} />
                                        Nuevo QR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 relative z-10">
                                <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                    <CheckCircle className="w-16 h-16 text-white" />
                                </div>

                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">¡Sesión Activa!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        Tu bot está escuchando mensajes y listo para responder.
                                    </p>

                                    <button
                                        onClick={handleLogout}
                                        disabled={actionLoading}
                                        className="mt-4 px-6 py-3 bg-secondary-500 text-white rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 mx-auto text-sm"
                                    >
                                        <LogOut className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guidelines Section */}
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group flex-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl">📍</span>
                                Pasos para vincular
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { icon: Smartphone, title: 'Abre tu Smartphone', desc: 'Inicia la aplicación de WhatsApp en tu dispositivo principal.' },
                                    { icon: ShieldCheck, title: 'Menú de Configuración', desc: 'Ve a Ajustes y busca "Dispositivos vinculados".' },
                                    { icon: Zap, title: 'Escanea el Código', desc: 'Apunta la cámara al QR para establecer la conexión.' }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                            <step.icon className="w-6 h-6 text-primary-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900 dark:text-white text-sm">{step.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-2xl rounded-full -mr-20 -mt-20" />

                            <div className="relative z-10 space-y-5">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center animate-pulse">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-black tracking-tight">Beneficios de Baileys</h4>
                                <ul className="space-y-3 text-sm font-medium text-primary-100">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Sin necesidad de aprobación de Meta.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Soporte para múltiples dispositivos.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Conexión instantánea en 2 segundos.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
