import { CreditCard, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';

export const Billing = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Facturación y Costos</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestiona los gatos de la API de WhatsApp y tus planes</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Historial
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Portal Meta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Gasto Mensual Estimado"
          value="$45.20"
          icon={CreditCard}
        />
        <StatCard
          title="Mensajes Enviados (Marketing)"
          value="1,245"
          icon={CreditCard}
        />
        <StatCard
          title="Mensajes de Servicio"
          value="8,902"
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            Detalle de Consumo API
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <div>
                  <p className="font-semibold text-gray-800">Mensajes de Service (Conversaciones iniciadas por usuario)</p>
                  <p className="text-sm text-gray-500">8,902 mensajes a $0.00</p>
               </div>
               <span className="font-bold text-gray-900">$0.00</span>
            </div>
             <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <div>
                  <p className="font-semibold text-gray-800">Mensajes Utility (Conversaciones iniciadas por negocio)</p>
                  <p className="text-sm text-gray-500">650 mensajes a $0.035</p>
               </div>
               <span className="font-bold text-gray-900">$22.75</span>
            </div>
             <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <div>
                  <p className="font-semibold text-gray-800">Mensajes Marketing (Conversaciones de venta)</p>
                  <p className="text-sm text-gray-500">595 mensajes a $0.06</p>
               </div>
               <span className="font-bold text-gray-900">$22.45</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
             <span className="text-lg font-bold text-gray-700">Total Mensual Estimado (Meta API)</span>
             <span className="text-2xl font-extrabold text-indigo-600">$45.20</span>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               Método de Pago Metas
             </h3>
             <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex gap-4 items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                   <p className="text-sm font-semibold text-blue-900">Nota sobre facturación</p>
                   <p className="text-sm text-blue-700 mt-1">Los cobros de los mensajes se realizan directamente a través de tu cuenta de Meta Business Manager. Plataforma Bot SaaS cobra únicamente por el acceso al panel de control.</p>
                </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-lg border border-indigo-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="w-32 h-32 text-white" />
             </div>
             <h3 className="text-lg font-bold text-white mb-2 relative z-10">Suscripción SaaS</h3>
             <p className="text-indigo-200 text-sm mb-6 relative z-10">Plan Pro - Pago recurrente mensual</p>
             
             <div className="flex items-end gap-2 mb-6 relative z-10">
                <span className="text-4xl font-extrabold text-white">$49.00</span>
                <span className="text-indigo-300 mb-1">/ mes</span>
             </div>
             
             <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm relative z-10">
               Gestionar Suscripción
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
