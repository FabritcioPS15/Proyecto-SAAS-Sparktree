import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    chatBubbleSent: string;
    chatBubbleReceived: string;
    chatOnline: string;
    chatTyping: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
}

const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    chatBubbleSent: '#dcf8c6',
    chatBubbleReceived: '#ffffff',
    chatOnline: '#25d366',
    chatTyping: '#53bdeb',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  updateThemeConfig: (updates: Partial<ThemeConfig>) => void;
  resetThemeConfig: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultThemeConfig);

  // Cargar configuración guardada del localStorage al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedThemeConfig = localStorage.getItem('theme-config');
    
    if (savedTheme) {
      setTheme(savedTheme as Theme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    
    if (savedThemeConfig) {
      try {
        const parsedConfig = JSON.parse(savedThemeConfig);
        setThemeConfig({ ...defaultThemeConfig, ...parsedConfig });
      } catch (error) {
        console.error('Error loading theme config:', error);
      }
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('theme-config', JSON.stringify(themeConfig));
    
    // Aplicar variables CSS al documento
    const root = document.documentElement;
    
    // Aplicar colores
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Aplicar tipografía
    root.style.setProperty('--font-family', themeConfig.typography.fontFamily);
    Object.entries(themeConfig.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    Object.entries(themeConfig.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    // Aplicar espaciado
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Aplicar bordes redondeados
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  }, [themeConfig]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prevConfig => ({
      ...prevConfig,
      ...updates,
      colors: { ...prevConfig.colors, ...updates.colors },
      typography: {
        ...prevConfig.typography,
        ...updates.typography,
        fontSize: { ...prevConfig.typography.fontSize, ...updates.typography?.fontSize },
        fontWeight: { ...prevConfig.typography.fontWeight, ...updates.typography?.fontWeight },
      },
      spacing: { ...prevConfig.spacing, ...updates.spacing },
      borderRadius: { ...prevConfig.borderRadius, ...updates.borderRadius },
    }));
  };

  const resetThemeConfig = () => {
    setThemeConfig(defaultThemeConfig);
    localStorage.removeItem('theme-config');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeConfig, 
      toggleTheme, 
      updateThemeConfig, 
      resetThemeConfig 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
