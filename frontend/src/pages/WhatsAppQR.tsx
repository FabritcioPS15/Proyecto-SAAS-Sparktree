import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, LogOut, CheckCircle, Smartphone, AlertTriangle, ChevronDown, Key, Settings, Code, Link2, Globe, MessageSquare, Bot, User, Palette } from 'lucide-react';
import { getQRStatus, initializeQR, logoutQR } from '../services/api';
import { withRetry } from '../utils/retry';
import { ThemeCustomizer } from '../components/ThemeCustomizer';

type ConnectionMethod = 'qr' | 'api';

export const WhatsAppQR = () => {
    const [data, setData] = useState<{ status: string; qr?: string; phoneNumber?: string }>({ status: 'unknown' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [qrTimeout, setQrTimeout] = useState<NodeJS.Timeout | null>(null);
    const [qrTimeLeft, setQrTimeLeft] = useState(0);
    const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>('qr');
    const [showMethodDropdown, setShowMethodDropdown] = useState(false);
    const [showSteps, setShowSteps] = useState(false);
    const [showBotConfig, setShowBotConfig] = useState(false);
    const [apiCredentials, setApiCredentials] = useState({
        phoneNumber: '',
        apiKey: '',
        webhookUrl: ''
    });

    const fetchStatus = async () => {
        try {
            const res = await withRetry(getQRStatus, {
                maxRetries: 3,
                retryDelay: 1000,
                onRetry: (_, attempt) => {
                    console.log(`Reintentando obtener status QR (intento ${attempt})`);
                    setRetryCount(attempt);
                }
            });
            setData(res);
            setError(null);
            setConnectionError(null);
            setRetryCount(0);
        } catch (error) {
            console.error('Error fetching QR status:', error);
            // Si estamos en proceso de conexión, es un error de conexión temporal
            if (data.status === 'connecting') {
                setConnectionError('Problema temporal durante la conexión, reintentando...');
            } else {
                // Error general del servidor
                setError((error as any)?.message || 'Error al conectar con el servidor');
                setData({ status: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => {
            clearInterval(interval);
            if (qrTimeout) {
                clearTimeout(qrTimeout);
            }
        };
    }, []);

    const handleInit = async () => {
        setActionLoading(true);
        setError(null);
        setConnectionError(null);
        
        // Limpiar timeout anterior
        if (qrTimeout) {
            clearTimeout(qrTimeout);
            setQrTimeout(null);
        }
        
        try {
            await withRetry(initializeQR, {
                maxRetries: 2,
                retryDelay: 2000
            });
            await fetchStatus();
            
            // Configurar timeout para QR (60 segundos)
            setQrTimeLeft(60);
            const timeInterval = setInterval(() => {
                setQrTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timeInterval);
                        setError('El código QR ha expirado. Por favor, genera uno nuevo.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            const timeout = setTimeout(() => {
                clearInterval(timeInterval);
                setError('El código QR ha expirado. Por favor, genera uno nuevo.');
            }, 60000);
            setQrTimeout(timeout);
            
        } catch (error) {
            console.error('Error initializing QR:', error);
            setError((error as any)?.message || 'Error al generar el código QR');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cerrar la sesión de WhatsApp?')) return;
        setActionLoading(true);
        setError(null);
        try {
            await withRetry(logoutQR, {
                maxRetries: 2,
                retryDelay: 1000
            });
            await fetchStatus();
        } catch (error) {
            console.error('Error logging out:', error);
            setError((error as any)?.message || 'Error al cerrar sesión');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApiConnection = async () => {
        setActionLoading(true);
        setError(null);
        
        try {
            // Validar credenciales
            if (!apiCredentials.phoneNumber || !apiCredentials.apiKey) {
                setError('Por favor, completa todos los campos requeridos');
                setActionLoading(false);
                return;
            }

            // Simulación de conexión API (reemplazar con llamada real)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simular conexión exitosa
            setData({ status: 'connected' });
            setActionLoading(false);
            
        } catch (error) {
            console.error('Error connecting via API:', error);
            setError((error as any)?.message || 'Error al conectar con la API de WhatsApp');
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                        {retryCount > 0 ? `Reintentando... (${retryCount}/3)` : 'Conectando con el servidor...'}
                    </p>
                </div>
            </div>
        );
    }

    const isConnected = data.status === 'connected';
    const hasError = data.status === 'error' || error;

    if (hasError) {
        return (
            <div className="h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
                            Error de Conexión
                        </h3>
                        <p className="text-red-600 dark:text-red-300 text-sm mb-6">
                            {error || 'No se pudo conectar con el servidor de WhatsApp'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={fetchStatus}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                                Reintentar
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-black hover:scale-105 active:scale-95 transition-all text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {/* Portal para dropdown - fuera del flujo normal */}
            {showMethodDropdown && (
                <div className="fixed inset-0 z-[9999]">
                    <div 
                        className="fixed inset-0" 
                        onClick={() => setShowMethodDropdown(false)}
                    />
                    <div className="absolute top-48 left-[676px] w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                        <div className="p-1">
                            <button
                                onClick={() => {
                                    setConnectionMethod('qr');
                                    setShowMethodDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg group"
                            >
                                <div className={`p-1.5 rounded-lg ${connectionMethod === 'qr' ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-gray-700'} group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors`}>
                                    <QrCode className={`w-4 h-4 ${connectionMethod === 'qr' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-colors`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-medium text-sm ${connectionMethod === 'qr' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>Código QR</div>
                                    <div className="text-xs text-gray-500">Escanea con tu móvil</div>
                                </div>
                                {connectionMethod === 'qr' && (
                                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                )}
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                            <button
                                onClick={() => {
                                    setConnectionMethod('api');
                                    setShowMethodDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg group"
                            >
                                <div className={`p-1.5 rounded-lg ${connectionMethod === 'api' ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-gray-700'} group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors`}>
                                    <Key className={`w-4 h-4 ${connectionMethod === 'api' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-colors`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-medium text-sm ${connectionMethod === 'api' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>API de WhatsApp</div>
                                    <div className="text-xs text-gray-500">Conexión directa</div>
                                </div>
                                {connectionMethod === 'api' && (
                                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-[calc(100vh-8rem)] bg-white/50 dark:bg-[#11141b]/50 backdrop-blur-xl rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
                <div className="flex-shrink-0 p-3 lg:p-4 space-y-3 relative">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#11141b]/50 backdrop-blur-md p-4 lg:p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-2xl rounded-full -mr-16 -mt-16" />

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Conexión <span className="text-primary-600 dark:text-primary-400">WhatsApp</span>
                            </h1>
                            
                            {/* Selector de método de conexión */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                >
                                    {connectionMethod === 'qr' ? (
                                        <>
                                            <QrCode className="w-4 h-4" />
                                            Código QR
                                        </>
                                    ) : (
                                        <>
                                            <Key className="w-4 h-4" />
                                            API
                                        </>
                                    )}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showMethodDropdown ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
                            {connectionMethod === 'qr' 
                                ? 'Vincula tu cuenta de WhatsApp escaneando el código QR. Sin APIs complejas, conexión directa.'
                                : 'Conecta mediante la API oficial de WhatsApp Business para mayor escalabilidad.'
                            }
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
                        {retryCount > 0 && (
                            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black">
                                Reintentando ({retryCount}/3)
                            </div>
                        )}
                    </div>
                </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
                    {/* Connection Display Section */}
                        <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800/50 overflow-hidden flex flex-col items-center justify-center p-6 lg:p-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {!isConnected ? (
                            <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-md">
                                {connectionMethod === 'qr' ? (
                                    <>
                                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-inner group/qr">
                                            {data.qr ? (
                                                <div className="relative">
                                                    <img src={data.qr} alt="WhatsApp QR" className="w-[280px] h-[280px] rounded-2xl shadow-2xl" />
                                                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-2xl animate-pulse" />
                                                    {qrTimeLeft > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-black">
                                                            {qrTimeLeft}s
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-[280px] h-[280px] flex flex-col items-center justify-center gap-4 text-slate-400">
                                                    <QrCode className="w-16 h-16 animate-bounce" />
                                                    <p className="font-bold text-sm uppercase tracking-widest">Generando QR...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Escanea el código</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                Abre WhatsApp {'>'} Dispositivos vinculados {'>'} Vincular dispositivo
                                            </p>

                                            {connectionError && (
                                                <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-3 w-full">
                                                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                        <span className="text-xs font-medium">{connectionError}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={handleInit}
                                                disabled={actionLoading}
                                                className="mt-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 text-sm"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                                                Nuevo QR
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-full space-y-6">
                                            <div className="text-center mb-8">
                                                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Key className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Conexión API</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    Configura tu conexión mediante la API de WhatsApp Business
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Número de Teléfono
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        placeholder="+521234567890"
                                                        value={apiCredentials.phoneNumber}
                                                        onChange={(e) => setApiCredentials(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        API Key
                                                    </label>
                                                    <input
                                                        type="password"
                                                        placeholder="Tu API Key de WhatsApp Business"
                                                        value={apiCredentials.apiKey}
                                                        onChange={(e) => setApiCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Webhook URL (Opcional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://tu-sitio.com/webhook"
                                                        value={apiCredentials.webhookUrl}
                                                        onChange={(e) => setApiCredentials(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleApiConnection}
                                                disabled={actionLoading}
                                                className="w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                                            >
                                                <Key className={`w-5 h-5 ${actionLoading ? 'animate-pulse' : ''}`} />
                                                {actionLoading ? 'Conectando...' : 'Conectar API'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 relative z-10">
                                <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                    <CheckCircle className="w-16 h-16 text-white" />
                                </div>

                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                        ¡{connectionMethod === 'qr' ? 'Sesión Activa' : 'API Conectada'}!
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        {connectionMethod === 'qr' 
                                            ? 'Tu bot está escuchando mensajes y listo para responder.'
                                            : 'Tu API de WhatsApp está configurada y funcionando.'
                                        }
                                    </p>
                                    
                                    {data.phoneNumber && (
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-3 mx-auto max-w-fit">
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                <Smartphone className="w-4 h-4" />
                                                <span className="text-sm font-black">
                                                    {data.phoneNumber.includes('@') 
                                                        ? data.phoneNumber.split('@')[0] 
                                                        : data.phoneNumber
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        disabled={actionLoading}
                                        className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 mx-auto text-sm"
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
                        <div className="bg-white dark:bg-[#11141b] rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800/50 relative overflow-hidden group">
                            <button
                                onClick={() => setShowSteps(!showSteps)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
                            >
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <span className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                                        {connectionMethod === 'qr' ? '📍' : '⚙️'}
                                    </span>
                                    Pasos para vincular
                                </h3>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSteps && (
                                <div className="px-4 pb-4">
                                    {connectionMethod === 'qr' ? (
                                <div className="space-y-3">
                                    {[
                                        { 
                                            icon: Smartphone, 
                                            title: 'Abre WhatsApp', 
                                            desc: 'Inicia la aplicación de WhatsApp en tu dispositivo móvil principal.' 
                                        },
                                        { 
                                            icon: Settings, 
                                            title: 'Dispositivos Vinculados', 
                                            desc: 'Ve al menú de Ajustes > Dispositivos vinculados > Vincular un dispositivo.' 
                                        },
                                        { 
                                            icon: QrCode, 
                                            title: 'Escanea el Código', 
                                            desc: 'Apunta la cámara de tu móvil al código QR para establecer la conexión segura.' 
                                        },
                                        { 
                                            icon: CheckCircle, 
                                            title: 'Confirma la Conexión', 
                                            desc: 'Espera a que se complete la vinculación y verás el estado de conexión activa.' 
                                        }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                                <step.icon className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{step.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { 
                                            icon: Globe, 
                                            title: 'Meta Business Suite', 
                                            desc: 'Regístrate en Meta Business y crea tu cuenta de WhatsApp Business API.' 
                                        },
                                        { 
                                            icon: Code, 
                                            title: 'Obtén Token de Acceso', 
                                            desc: 'Genera tu API Key permanente y guárdala en un lugar seguro.' 
                                        },
                                        { 
                                            icon: Link2, 
                                            title: 'Configura Webhook', 
                                            desc: 'Establece la URL HTTPS donde recibirás todos los mensajes entrantes.' 
                                        },
                                        { 
                                            icon: MessageSquare, 
                                            title: 'Verifica Número', 
                                            desc: 'Confirma tu número de teléfono y envía un mensaje de prueba para activar.' 
                                        }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                                <step.icon className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{step.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                                </div>
                            )}
                        </div>

                        {/* Chatbot Identity Section */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                            <button
                                onClick={() => setShowBotConfig(!showBotConfig)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors rounded-[2.5rem]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center animate-pulse">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-black tracking-tight text-white">Identidad del Chatbot</h4>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-white/80 transition-transform ${showBotConfig ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showBotConfig && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="w-4 h-4 text-purple-200" />
                                            <span className="text-sm font-medium text-purple-100">Nombre del Bot</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Mi Asistente Virtual"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                                        />
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Palette className="w-4 h-4 text-purple-200" />
                                            <span className="text-sm font-medium text-purple-100">Tema del Chat</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {['🔵 Azul', '🟢 Verde', '🟡 Amarillo', '🔴 Rojo'].map((color, idx) => (
                                                <button
                                                    key={idx}
                                                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-2 py-1 text-xs text-white transition-colors"
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Theme Customizer */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Palette className="w-4 h-4 text-purple-200" />
                                            <span className="text-sm font-medium text-purple-100">Personalizar Tema</span>
                                        </div>
                                        <ThemeCustomizer />
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
