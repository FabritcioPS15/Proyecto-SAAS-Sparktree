import { ReactNode, useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
}

const LayoutContext = createContext<LayoutContextType>({ isSidebarCollapsed: false });

export const useLayout = () => useContext(LayoutContext);

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed }}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#0a0c10]">
        <Sidebar onCollapsedChange={setIsSidebarCollapsed} />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className={`flex-1 overflow-hidden px-4 sm:px-8 py-8 relative z-10 min-h-0 transition-all duration-300 ${isSidebarCollapsed ? 'max-w-[1800px]' : 'max-w-[1600px]'}`}>
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </LayoutContext.Provider>
  );
};
