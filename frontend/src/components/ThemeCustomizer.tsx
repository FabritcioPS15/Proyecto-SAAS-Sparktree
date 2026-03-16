import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Type, Sliders, RotateCcw, Save, Moon, Sun, MessageSquare } from 'lucide-react';

export const ThemeCustomizer = () => {
  const { theme, themeConfig, toggleTheme, updateThemeConfig, resetThemeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'chat'>('colors');
  const [showSaved, setShowSaved] = useState(false);

  const showSaveIndicator = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    updateThemeConfig({
      colors: {
        ...themeConfig.colors,
        [colorKey]: value,
      },
    });
    showSaveIndicator();
  };

  const handleTypographyChange = (key: string, value: string) => {
    if (key === 'fontFamily') {
      updateThemeConfig({
        typography: {
          ...themeConfig.typography,
          fontFamily: value,
        },
      });
    } else if (themeConfig.typography.fontSize[key as keyof typeof themeConfig.typography.fontSize]) {
      updateThemeConfig({
        typography: {
          ...themeConfig.typography,
          fontSize: {
            ...themeConfig.typography.fontSize,
            [key]: value,
          },
        },
      });
    } else if (themeConfig.typography.fontWeight[key as keyof typeof themeConfig.typography.fontWeight]) {
      updateThemeConfig({
        typography: {
          ...themeConfig.typography,
          fontWeight: {
            ...themeConfig.typography.fontWeight,
            [key]: value,
          },
        },
      });
    }
    showSaveIndicator();
  };

  const handleSpacingChange = (key: string, value: string) => {
    updateThemeConfig({
      spacing: {
        ...themeConfig.spacing,
        [key]: value,
      },
    });
    showSaveIndicator();
  };

  const handleBorderRadiusChange = (key: string, value: string) => {
    updateThemeConfig({
      borderRadius: {
        ...themeConfig.borderRadius,
        [key]: value,
      },
    });
    showSaveIndicator();
  };

  const fontFamilies = [
    'Inter, system-ui, sans-serif',
    'Roboto, system-ui, sans-serif',
    'Poppins, system-ui, sans-serif',
    'Playfair Display, serif',
    'Monaco, monospace',
    'Georgia, serif',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalizar Tema</h2>
            {showSaved && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium animate-in fade-in zoom-in duration-300">
                <Save className="w-4 h-4" />
                Guardado
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Oscuro</span>
                </>
              )}
            </button>
            <button
              onClick={resetThemeConfig}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'colors'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colores
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'typography'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          Tipografía
        </button>
        <button
          onClick={() => setActiveTab('spacing')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'spacing'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Espaciado
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Colores del Tema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(themeConfig.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key === 'textSecondary' ? 'Texto Secundario' : key}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tipografía</h3>
            
            {/* Font Family */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fuente Principal
              </label>
              <select
                value={themeConfig.typography.fontFamily}
                onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Sizes */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Tamaños de Fuente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themeConfig.typography.fontSize).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key === 'xs' ? 'Extra Pequeño' : 
                       key === 'sm' ? 'Pequeño' :
                       key === 'base' ? 'Base' :
                       key === 'lg' ? 'Grande' :
                       key === 'xl' ? 'Extra Grande' :
                       key === '2xl' ? '2x Grande' : '3x Grande'}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleTypographyChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="1rem"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Font Weights */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Grosor de Fuente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themeConfig.typography.fontWeight).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key === 'light' ? 'Ligero' :
                       key === 'normal' ? 'Normal' :
                       key === 'medium' ? 'Medio' :
                       key === 'semibold' ? 'Semi Negrita' : 'Negrita'}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleTypographyChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Espaciado y Bordes</h3>
            
            {/* Spacing */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Espaciado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themeConfig.spacing).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key === 'xs' ? 'Extra Pequeño' : 
                       key === 'sm' ? 'Pequeño' :
                       key === 'md' ? 'Medio' :
                       key === 'lg' ? 'Grande' : 'Extra Grande'}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleSpacingChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="1rem"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Bordes Redondeados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themeConfig.borderRadius).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key === 'sm' ? 'Pequeño' : 
                       key === 'md' ? 'Medio' :
                       key === 'lg' ? 'Grande' :
                       key === 'xl' ? 'Extra Grande' :
                       key === '2xl' ? '2x Grande' : '3x Grande'}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleBorderRadiusChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="0.5rem"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Colores de Chat</h3>
            <div className="space-y-6">
              {/* Chat Bubble Colors */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Burbujas de Mensaje</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Burbuja Enviada
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.chatBubbleSent}
                        onChange={(e) => handleColorChange('chatBubbleSent', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.chatBubbleSent}
                        onChange={(e) => handleColorChange('chatBubbleSent', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#dcf8c6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Burbuja Recibida
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.chatBubbleReceived}
                        onChange={(e) => handleColorChange('chatBubbleReceived', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.chatBubbleReceived}
                        onChange={(e) => handleColorChange('chatBubbleReceived', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Estados de Chat</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usuario en Línea
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.chatOnline}
                        onChange={(e) => handleColorChange('chatOnline', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.chatOnline}
                        onChange={(e) => handleColorChange('chatOnline', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#25d366"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado Escribiendo
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.chatTyping}
                        onChange={(e) => handleColorChange('chatTyping', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.chatTyping}
                        onChange={(e) => handleColorChange('chatTyping', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#53bdeb"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Colors */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Colores del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Éxito
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.success}
                        onChange={(e) => handleColorChange('success', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.success}
                        onChange={(e) => handleColorChange('success', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Advertencia
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.warning}
                        onChange={(e) => handleColorChange('warning', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.warning}
                        onChange={(e) => handleColorChange('warning', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Error
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.error}
                        onChange={(e) => handleColorChange('error', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.error}
                        onChange={(e) => handleColorChange('error', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Información
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeConfig.colors.info}
                        onChange={(e) => handleColorChange('info', e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeConfig.colors.info}
                        onChange={(e) => handleColorChange('info', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
