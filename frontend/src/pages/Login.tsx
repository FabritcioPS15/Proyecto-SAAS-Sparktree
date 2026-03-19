import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] relative overflow-hidden p-4">
      {/* Abstract Animated Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[120px] rounded-full -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-600/10 blur-[100px] rounded-full -ml-32 -mb-32 animate-pulse" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/5 dark:bg-[#11141b]/50 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl shadow-2xl shadow-primary-500/20 mb-2">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">Sparktree</span>
            </h1>
            <p className="text-gray-400 font-medium">Panel de Control Multitenant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-white font-bold placeholder:text-gray-600"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-white font-bold placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Entrar al Panel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Test Accounts Section */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center mb-4">Cuentas de Prueba</p>
            <div className="grid grid-cols-1 gap-3">
              <div 
                onClick={() => { setEmail('admin@sparktree.io'); setPassword('hashed_password_placeholder'); }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Super Administrador</p>
                    <p className="text-[10px] text-gray-500">admin@sparktree.io</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div 
                onClick={() => { setEmail('staff@sparktree.io'); setPassword('hashed_password_placeholder'); }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Administrador de Staff</p>
                    <p className="text-[10px] text-gray-500">staff@sparktree.io</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div 
                onClick={() => { setEmail('empresa@demo.com'); setPassword('hashed_password_placeholder'); }}
                className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl cursor-pointer hover:from-emerald-500/20 hover:to-teal-500/20 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">Usuario Empresa</p>
                    <p className="text-[10px] text-emerald-600">empresa@demo.com</p>
                    <p className="text-[8px] text-emerald-700 mt-1">Acceso limitado</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm font-medium">
            ¿No tienes cuenta? <span className="text-primary-400 cursor-pointer hover:underline">Contactar a soporte</span>
          </p>
        </div>
      </div>
    </div>
  );
};
