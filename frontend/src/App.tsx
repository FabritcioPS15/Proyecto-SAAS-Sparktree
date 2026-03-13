import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/layout/Layout';
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

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/flows" element={<FlowBuilder />} />
              <Route path="/flow-manager" element={<FlowManager />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/whatsapp-qr" element={<WhatsAppQR />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
