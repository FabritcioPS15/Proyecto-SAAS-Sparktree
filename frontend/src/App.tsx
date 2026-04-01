import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
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
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Organizations = lazy(() => import('./pages/Organizations').then(module => ({ default: module.Organizations })));
const StaffManagement = lazy(() => import('./pages/StaffManagement').then(module => ({ default: module.StaffManagement })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader isInitial />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute><Layout fullWidth noPadding><Conversations /></Layout></ProtectedRoute>} />
        <Route path="/conversations/:id" element={<ProtectedRoute><Layout fullWidth noPadding><Conversations /></Layout></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
        <Route path="/flows" element={<ProtectedRoute><Layout><FlowManager /></Layout></ProtectedRoute>} />
        <Route path="/flow-manager" element={<ProtectedRoute><Layout><FlowManager /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/whatsapp-qr" element={<ProtectedRoute><Layout><WhatsAppQR /></Layout></ProtectedRoute>} />
        <Route path="/admin/organizations" element={<ProtectedRoute><Layout><Organizations /></Layout></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute><Layout><StaffManagement /></Layout></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <WhatsAppProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </WhatsAppProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
