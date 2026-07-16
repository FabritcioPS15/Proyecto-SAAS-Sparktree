import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
import { ConnectionsProvider } from './contexts/ConnectionsContext';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomizationProvider } from './contexts/CustomizationContext';
import { Navigate } from 'react-router-dom';
import { PageLoader } from './components/layout/PageLoader';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./modules/dashboard/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Users = lazy(() => import('./modules/crm/pages/Clients').then(module => ({ default: module.Clients })));
const Conversations = lazy(() => import('./modules/inbox/pages/Conversations').then(module => ({ default: module.Conversations })));
const Analytics = lazy(() => import('./modules/dashboard/pages/Analytics').then(module => ({ default: module.Analytics })));
const Settings = lazy(() => import('./modules/settings/pages/Settings').then(module => ({ default: module.Settings })));
const Billing = lazy(() => import('./modules/billing/pages/Billing').then(module => ({ default: module.Billing })));
const FlowManager = lazy(() => import('./modules/automation/pages/FlowManager').then(module => ({ default: module.FlowManager })));
const Leads = lazy(() => import('./modules/crm/pages/Leads').then(module => ({ default: module.Leads })));
const WhatsAppQR = lazy(() => import('./modules/inbox/pages/WhatsAppQR').then(module => ({ default: module.WhatsAppQR })));
const Connections = lazy(() => import('./modules/inbox/pages/Connections').then(module => ({ default: module.Connections })));
const Reports = lazy(() => import('./modules/reports/pages/Reports').then(module => ({ default: module.Reports })));
const Organizations = lazy(() => import('./modules/crm/pages/Organizations').then(module => ({ default: module.Organizations })));
const StaffManagement = lazy(() => import('./modules/hr/pages/StaffManagement').then(module => ({ default: module.StaffManagement })));
const Login = lazy(() => import('./modules/auth/pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./modules/auth/pages/Register').then(module => ({ default: module.Register })));
const RecoverPassword = lazy(() => import('./modules/auth/pages/RecoverPassword').then(module => ({ default: module.RecoverPassword })));
const TelegramConfig = lazy(() => import('./modules/inbox/pages/TelegramConfig').then(module => ({ default: module.TelegramConfig })));
const InstagramConfig = lazy(() => import('./modules/inbox/pages/InstagramConfig').then(module => ({ default: module.InstagramConfig })));
const FacebookConfig = lazy(() => import('./modules/inbox/pages/FacebookConfig').then(module => ({ default: module.FacebookConfig })));
const TikTokConfig = lazy(() => import('./modules/inbox/pages/TikTokConfig').then(module => ({ default: module.TikTokConfig })));
const CRM = lazy(() => import('./modules/crm/pages/CRM').then(module => ({ default: module.CRM })));
const Pipeline = lazy(() => import('./modules/crm/pages/Pipeline').then(module => ({ default: module.Pipeline })));

const ProfileSelectionPage = lazy(() => import('./modules/auth/pages/ProfileSelection').then(module => ({ default: module.ProfileSelection })));
const Catalogs = lazy(() => import('./modules/crm/pages/Catalogs').then(module => ({ default: module.Catalogs })));

// New modules
const Orders = lazy(() => import('./modules/orders/pages/Orders').then(module => ({ default: module.Orders })));
const Promotions = lazy(() => import('./modules/promotions/pages/Promotions').then(module => ({ default: module.Promotions })));
const MessageTemplates = lazy(() => import('./modules/automation/pages/MessageTemplates').then(module => ({ default: module.MessageTemplates })));
const AssignmentRules = lazy(() => import('./modules/automation/pages/AssignmentRules').then(module => ({ default: module.AssignmentRules })));
const BusinessHours = lazy(() => import('./modules/automation/pages/BusinessHours').then(module => ({ default: module.BusinessHours })));
const Agents = lazy(() => import('./modules/support/pages/Agents').then(module => ({ default: module.Agents })));
const KnowledgeBase = lazy(() => import('./modules/support/pages/KnowledgeBase').then(module => ({ default: module.KnowledgeBase })));
const Support = lazy(() => import('./modules/support/pages/Support').then(module => ({ default: module.Support })));
const Notifications = lazy(() => import('./modules/system/pages/Notifications').then(module => ({ default: module.Notifications })));
const Webhooks = lazy(() => import('./modules/system/pages/Webhooks').then(module => ({ default: module.Webhooks })));
const Plans = lazy(() => import('./modules/billing/pages/Plans').then(module => ({ default: module.Plans })));
const AIProviderSettings = lazy(() => import('./modules/ai/pages/AIProviderSettings').then(module => ({ default: module.AIProviderSettings })));
const Payments = lazy(() => import('./modules/billing/pages/Payments').then(module => ({ default: module.Payments })));
const Usage = lazy(() => import('./modules/billing/pages/Usage').then(module => ({ default: module.Usage })));
const RolesPermissions = lazy(() => import('./modules/system/pages/RolesPermissions').then(module => ({ default: module.RolesPermissions })));
const AuditLogs = lazy(() => import('./modules/system/pages/AuditLogs').then(module => ({ default: module.AuditLogs })));
const Companies = lazy(() => import('./modules/superadmin/pages/Companies').then(module => ({ default: module.Companies })));
const BusinessMetrics = lazy(() => import('./modules/superadmin/pages/BusinessMetrics').then(module => ({ default: module.BusinessMetrics })));
const SystemLogs = lazy(() => import('./modules/superadmin/pages/SystemLogs').then(module => ({ default: module.SystemLogs })));
const Email = lazy(() => import('./modules/email/pages/Email').then(module => ({ default: module.Email })));
const Calendar = lazy(() => import('./modules/calendar/pages/Calendar').then(module => ({ default: module.Calendar })));
const WhatsAppManager = lazy(() => import('./modules/inbox/pages/WhatsAppManager').then(module => ({ default: module.WhatsAppManager })));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, activeProfile } = useAuth();
  
  if (loading) return <PageLoader isInitial />;
  if (!user) return <Navigate to="/login" />;
  
  // Si es rol empresa y no ha seleccionado perfil, obligar a seleccionar
  if (user.role === 'empresa' && !activeProfile) {
    return <ProfileSelectionPage />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<PageLoader sectionName="Inicio de Sesión" isInitial />}>{!user ? <Login /> : <Navigate to="/" />}</Suspense>} />
      <Route path="/register" element={<Suspense fallback={<PageLoader sectionName="Registro" isInitial />}>{!user ? <Register /> : <Navigate to="/" />}</Suspense>} />
      <Route path="/recover-password" element={<Suspense fallback={<PageLoader sectionName="Recuperar Contraseña" isInitial />}><RecoverPassword /></Suspense>} />
      <Route path="/" element={<Suspense fallback={<PageLoader sectionName="Dashboard" />}><ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/clients" element={<Suspense fallback={<PageLoader sectionName="Clientes" />}><ProtectedRoute><Layout><Users /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/conversations" element={<Suspense fallback={<PageLoader sectionName="Conversaciones" />}><ProtectedRoute><Layout fullWidth noPadding><Conversations /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/conversations/:id" element={<Suspense fallback={<PageLoader sectionName="Conversación" />}><ProtectedRoute><Layout fullWidth noPadding><Conversations /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/catalogs" element={<Suspense fallback={<PageLoader sectionName="Catálogos" />}><ProtectedRoute><Layout><Catalogs /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/leads" element={<Suspense fallback={<PageLoader sectionName="Leads" />}><ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/flows" element={<Suspense fallback={<PageLoader sectionName="Flujos" />}><ProtectedRoute><Layout><FlowManager /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/flow-manager" element={<Suspense fallback={<PageLoader sectionName="Gestor de Flujos" />}><ProtectedRoute><Layout><FlowManager /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/analytics" element={<Suspense fallback={<PageLoader sectionName="Analíticas" />}><ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/reports" element={<Suspense fallback={<PageLoader sectionName="Reportes" />}><ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/billing" element={<Suspense fallback={<PageLoader sectionName="Facturación" />}><ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/settings" element={<Suspense fallback={<PageLoader sectionName="Ajustes" />}><ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/whatsapp-qr" element={<Suspense fallback={<PageLoader sectionName="WhatsApp" />}><ProtectedRoute><Layout><WhatsAppQR /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/connections" element={<Suspense fallback={<PageLoader sectionName="Conexiones" />}><ProtectedRoute><Layout><Connections /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/telegram-config" element={<Suspense fallback={<PageLoader sectionName="Telegram" />}><ProtectedRoute><Layout><TelegramConfig /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/instagram-config" element={<Suspense fallback={<PageLoader sectionName="Instagram" />}><ProtectedRoute><Layout><InstagramConfig /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/facebook-config" element={<Suspense fallback={<PageLoader sectionName="Facebook Messenger" />}><ProtectedRoute><Layout><FacebookConfig /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/tiktok-config" element={<Suspense fallback={<PageLoader sectionName="TikTok" />}><ProtectedRoute><Layout><TikTokConfig /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/admin/organizations" element={<Suspense fallback={<PageLoader sectionName="Organizaciones" />}><ProtectedRoute><Layout><Organizations /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/admin/staff" element={<Suspense fallback={<PageLoader sectionName="Personal" />}><ProtectedRoute><Layout><StaffManagement /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/crm" element={<Suspense fallback={<PageLoader sectionName="CRM" />}><ProtectedRoute><Layout><CRM /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/pipeline" element={<Suspense fallback={<PageLoader sectionName="Pipeline" />}><ProtectedRoute><Layout><Pipeline /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/email" element={<Suspense fallback={<PageLoader sectionName="Correo" />}><ProtectedRoute><Layout><Email /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/calendar" element={<Suspense fallback={<PageLoader sectionName="Calendario" />}><ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Negocio */}
      <Route path="/orders" element={<Suspense fallback={<PageLoader sectionName="Pedidos" />}><ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/promotions" element={<Suspense fallback={<PageLoader sectionName="Promociones" />}><ProtectedRoute><Layout><Promotions /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Automatización */}
      <Route path="/message-templates" element={<Suspense fallback={<PageLoader sectionName="Plantillas" />}><ProtectedRoute><Layout><MessageTemplates /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/assignment-rules" element={<Suspense fallback={<PageLoader sectionName="Reglas de Asignación" />}><ProtectedRoute><Layout><AssignmentRules /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/business-hours" element={<Suspense fallback={<PageLoader sectionName="Horarios de Atención" />}><ProtectedRoute><Layout><BusinessHours /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Atención */}
      <Route path="/support" element={<Suspense fallback={<PageLoader sectionName="Atención" />}><ProtectedRoute><Layout><Support /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/agents" element={<Suspense fallback={<PageLoader sectionName="Agentes" />}><ProtectedRoute><Layout><Agents /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/knowledge-base" element={<Suspense fallback={<PageLoader sectionName="Base de Conocimiento" />}><ProtectedRoute><Layout><KnowledgeBase /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Sistema */}
      <Route path="/notifications" element={<Suspense fallback={<PageLoader sectionName="Notificaciones" />}><ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/webhooks" element={<Suspense fallback={<PageLoader sectionName="Webhooks" />}><ProtectedRoute><Layout><Webhooks /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/roles-permissions" element={<Suspense fallback={<PageLoader sectionName="Roles y Permisos" />}><ProtectedRoute><Layout><RolesPermissions /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/audit-logs" element={<Suspense fallback={<PageLoader sectionName="Auditoría" />}><ProtectedRoute><Layout><AuditLogs /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Facturación */}
      <Route path="/billing/plans" element={<Suspense fallback={<PageLoader sectionName="Planes" />}><ProtectedRoute><Layout><Plans /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/billing/payments" element={<Suspense fallback={<PageLoader sectionName="Pagos" />}><ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/billing/usage" element={<Suspense fallback={<PageLoader sectionName="Uso" />}><ProtectedRoute><Layout><Usage /></Layout></ProtectedRoute></Suspense>} />
      
      {/* New modules - Super Admin */}
      <Route path="/superadmin/companies" element={<Suspense fallback={<PageLoader sectionName="Empresas" />}><ProtectedRoute><Layout><Companies /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/superadmin/business-metrics" element={<Suspense fallback={<PageLoader sectionName="Métricas del Negocio" />}><ProtectedRoute><Layout><BusinessMetrics /></Layout></ProtectedRoute></Suspense>} />
      <Route path="/superadmin/system-logs" element={<Suspense fallback={<PageLoader sectionName="Logs del Sistema" />}><ProtectedRoute><Layout><SystemLogs /></Layout></ProtectedRoute></Suspense>} />
      
      {/* AI / LLM */}
      <Route path="/ai/providers" element={<Suspense fallback={<PageLoader sectionName="Proveedores LLM" />}><ProtectedRoute><Layout><AIProviderSettings /></Layout></ProtectedRoute></Suspense>} />
      
      {/* Multi-WhatsApp */}
      <Route path="/multi-whatsapp" element={<Suspense fallback={<PageLoader sectionName="WhatsApp Manager" />}><ProtectedRoute><Layout><WhatsAppManager /></Layout></ProtectedRoute></Suspense>} />
    </Routes>
  );
}

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <ConnectionsProvider>
            <WhatsAppProvider>
              <CustomizationProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
              </CustomizationProvider>
            </WhatsAppProvider>
          </ConnectionsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
