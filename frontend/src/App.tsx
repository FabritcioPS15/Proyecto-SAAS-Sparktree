import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Conversations } from './pages/Conversations';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { FlowBuilder } from './pages/FlowBuilder';
import { FlowManager } from './pages/FlowManager';
import { Leads } from './pages/Leads';
import { WhatsAppQR } from './pages/WhatsAppQR';
import { ReportsPage } from './pages/Reports';
import { Organizations } from './pages/Organizations';
import { StaffManagement } from './pages/StaffManagement';
import { Login } from './pages/Login';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="/conversations" element={<ProtectedRoute><Layout><Conversations /></Layout></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
      <Route path="/flows" element={<ProtectedRoute><Layout><FlowBuilder /></Layout></ProtectedRoute>} />
      <Route path="/flow-manager" element={<ProtectedRoute><Layout><FlowManager /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/whatsapp-qr" element={<ProtectedRoute><Layout><WhatsAppQR /></Layout></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute><Layout><Organizations /></Layout></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute><Layout><StaffManagement /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
