import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, ArrowRight, Loader2, Info, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex bg-[#050608] selection:bg-primary-500/30 overflow-hidden">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5">
        {/* Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-primary-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-accent-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 w-full max-w-md space-y-16">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md mb-4 shadow-xl shadow-primary-500/5">
              <MessageCircle className="w-6 h-6 text-primary-400" />
              <span className="text-white font-bold tracking-tight">Sparktree <span className="text-primary-400">Bot</span></span>
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Lleva tu atención al <br/>
                <span className="inline-block pb-1 pr-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 italic">siguiente nivel</span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed font-medium">
                La plataforma de automatización multi-agente diseñada para escalar tus operaciones de WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm group hover:bg-white/[0.04] transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-sm font-bold text-white">Flujos Inteligentes</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Automatiza el 80% de tus consultas comunes sin esfuerzo.</p>
            </div>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm group hover:bg-white/[0.04] transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-accent-400" />
              </div>
              <p className="text-sm font-bold text-white">Multi-Usuario</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Colabora con todo tu equipo en tiempo real de forma segura.</p>
            </div>
          </div>
        </div>

        {/* Footer info Left Side */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest pointer-events-none">
          <span>© 2024 SPARKTREE TECH</span>
          <span className="w-1 h-1 bg-gray-800 rounded-full" />
          <span>SaaS Platform V4.2.0-PRO</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        {/* Mobile/Side Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary-900/10 blur-[100px] rounded-full opacity-50" />
        </div>

        <div className="w-full max-w-md relative z-10 py-12">
          <div className="lg:hidden text-center mb-12">
            <div className="inline-flex p-3 bg-primary-600/10 rounded-2xl border border-primary-500/20 mb-4">
              <MessageCircle className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sparktree</h1>
          </div>

          <div className="space-y-3 mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">Iniciar sesión</h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Bienvenido de nuevo. Gestiona tus comunicaciones de manera centralizada.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 focus-within:translate-x-1 transition-transform duration-300">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all text-white text-sm placeholder:text-gray-600 font-medium"
                  placeholder="nombre@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 focus-within:translate-x-1 transition-transform duration-300">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                <button type="button" className="text-[10px] text-primary-400 hover:text-primary-300 font-bold transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all text-white text-sm placeholder:text-gray-600 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-[13px] font-bold animate-in slide-in-from-top-1">
                <Info className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4 relative overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Acceder al Panel</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Toggle */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <button 
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition-colors group"
            >
              <span>Atajos de prueba</span>
              {showTestAccounts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />}
            </button>
            
            {showTestAccounts && (
              <div className="grid grid-cols-1 gap-2 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {[
                  { label: 'Super Administrador', email: 'admin@sparktree.io', color: 'text-primary-400' },
                  { label: 'Personal de Staff', email: 'staff@sparktree.io', color: 'text-white' },
                  { label: 'Cliente Demo', email: 'empresa@demo.com', color: 'text-emerald-400' }
                ].map((account) => (
                  <button 
                    key={account.email}
                    onClick={() => setTestAccount(account.email, 'hashed_password_placeholder')}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-left group/btn"
                  >
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${account.color}`}>{account.label}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{account.email}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover/btn:text-white transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-[11px] mt-10 font-bold uppercase tracking-wider">
            Sparktree Tech Hub © 2024
          </p>
        </div>
      </div>
    </div>
  );
};



