import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
import { ConnectionsProvider } from './contexts/ConnectionsContext';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PageLoader } from './components/layout/PageLoader';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Users = lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const Conversations = lazy(() => import('./pages/Conversations').then(module => ({ default: module.Conversations })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Billing = lazy(() => import('./pages/Billing').then(module => ({ default: module.Billing })));
const FlowManager = lazy(() => import('./pages/FlowManager').then(module => ({ default: module.FlowManager })));
const Leads = lazy(() => import('./pages/Leads').then(module => ({ default: module.Leads })));
const WhatsAppQR = lazy(() => import('./pages/WhatsAppQR').then(module => ({ default: module.WhatsAppQR })));
const Connections = lazy(() => import('./pages/Connections').then(module => ({ default: module.Connections })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Organizations = lazy(() => import('./pages/Organizations').then(module => ({ default: module.Organizations })));
const StaffManagement = lazy(() => import('./pages/StaffManagement').then(module => ({ default: module.StaffManagement })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const RecoverPassword = lazy(() => import('./pages/RecoverPassword').then(module => ({ default: module.RecoverPassword })));
const TelegramConfig = lazy(() => import('./pages/TelegramConfig').then(module => ({ default: module.TelegramConfig })));
const InstagramConfig = lazy(() => import('./pages/InstagramConfig').then(module => ({ default: module.InstagramConfig })));
const FacebookConfig = lazy(() => import('./pages/FacebookConfig').then(module => ({ default: module.FacebookConfig })));
const TikTokConfig = lazy(() => import('./pages/TikTokConfig').then(module => ({ default: module.TikTokConfig })));
const CRM = lazy(() => import('./pages/CRM').then(module => ({ default: module.CRM })));
const Pipeline = lazy(() => import('./pages/Pipeline').then(module => ({ default: module.Pipeline })));

const ProfileSelectionPage = lazy(() => import('./pages/ProfileSelection').then(module => ({ default: module.ProfileSelection })));

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
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <ConnectionsProvider>
            <WhatsAppProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </WhatsAppProvider>
          </ConnectionsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
