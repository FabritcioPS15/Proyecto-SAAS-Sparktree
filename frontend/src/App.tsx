import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Conversations } from './pages/Conversations';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { FlowBuilder } from './pages/FlowBuilder';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/flows" element={<FlowBuilder />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
