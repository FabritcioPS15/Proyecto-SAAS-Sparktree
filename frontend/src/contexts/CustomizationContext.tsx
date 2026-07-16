import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CustomizationContextType {
  accentColor: string;
  tableDensity: string;
  layoutMode: string;
  cardStyle: string;
  fontSize: string;
  radiusSize: string;
  setAccentColor: (v: string) => void;
  setTableDensity: (v: string) => void;
  setLayoutMode: (v: string) => void;
  setCardStyle: (v: string) => void;
  setFontSize: (v: string) => void;
  setRadiusSize: (v: string) => void;
}

const CustomizationContext = createContext<CustomizationContextType>(null!);

const accentShades: Record<string, Record<string, string>> = {
  emerald: {
    '50': '236 253 245', '100': '209 250 229', '200': '167 243 208',
    '300': '110 231 183', '400': '52 211 153', '500': '65 240 165',
    '600': '16 185 129', '700': '5 150 105', '800': '4 120 87',
    '900': '6 95 70', '950': '2 44 34',
  },
  blue: {
    '50': '239 246 255', '100': '219 234 254', '200': '191 219 254',
    '300': '147 197 253', '400': '96 165 250', '500': '59 130 246',
    '600': '37 99 235', '700': '29 78 216', '800': '30 64 175',
    '900': '30 58 138', '950': '23 37 84',
  },
  violet: {
    '50': '245 243 255', '100': '237 233 254', '200': '221 214 254',
    '300': '196 181 253', '400': '167 139 250', '500': '139 92 246',
    '600': '124 58 237', '700': '109 40 217', '800': '91 33 182',
    '900': '76 29 149', '950': '46 16 101',
  },
  rose: {
    '50': '255 241 242', '100': '255 228 235', '200': '254 205 215',
    '300': '253 164 185', '400': '251 113 133', '500': '244 63 94',
    '600': '225 29 72', '700': '190 18 60', '800': '159 18 57',
    '900': '136 19 55', '950': '76 5 25',
  },
  amber: {
    '50': '255 251 235', '100': '254 243 199', '200': '253 230 138',
    '300': '252 211 77', '400': '251 191 36', '500': '245 158 11',
    '600': '217 119 6', '700': '180 83 9', '800': '146 64 14',
    '900': '120 53 15', '950': '69 26 3',
  },
  cyan: {
    '50': '236 254 255', '100': '207 250 254', '200': '165 243 252',
    '300': '103 232 249', '400': '34 211 238', '500': '6 182 212',
    '600': '8 145 178', '700': '14 116 144', '800': '21 94 117',
    '900': '22 78 99', '950': '8 51 68',
  },
};

const radiusMap: Record<string, string> = {
  small: '8px',
  normal: '16px',
  large: '24px',
};

const densityPaddingMap: Record<string, string> = {
  compact: '6px 12px',
  normal: '12px 16px',
  spacious: '20px 24px',
};

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent-color') || 'emerald');
  const [tableDensity, setTableDensity] = useState(() => localStorage.getItem('table-density') || 'normal');
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem('layout-mode') || 'fluid');
  const [cardStyle, setCardStyle] = useState(() => localStorage.getItem('card-style') || 'bordered');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('font-size') || 'normal');
  const [radiusSize, setRadiusSize] = useState(() => localStorage.getItem('radius-size') || 'normal');

  useEffect(() => {
    const root = document.documentElement;
    const shades = accentShades[accentColor] || accentShades.emerald;

    Object.entries(shades).forEach(([shade, rgb]) => {
      root.style.setProperty(`--accent-${shade}`, rgb);
    });

    root.style.setProperty('--radius', radiusMap[radiusSize] || radiusMap.normal);
    root.style.setProperty('--table-cell-padding', densityPaddingMap[tableDensity] || densityPaddingMap.normal);

    root.setAttribute('data-accent', accentColor);
    root.setAttribute('data-density', tableDensity);
    root.setAttribute('data-layout', layoutMode);
    root.setAttribute('data-card-style', cardStyle);

    if (fontSize === 'small') root.style.fontSize = '13px';
    else if (fontSize === 'large') root.style.fontSize = '16px';
    else root.style.fontSize = '';
  }, [accentColor, tableDensity, layoutMode, cardStyle, fontSize, radiusSize]);

  const update = (key: string, value: string, setter: (v: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
  };

  return (
    <CustomizationContext.Provider value={{
      accentColor,
      tableDensity,
      layoutMode,
      cardStyle,
      fontSize,
      radiusSize,
      setAccentColor: (v) => update('accent-color', v, setAccentColor),
      setTableDensity: (v) => update('table-density', v, setTableDensity),
      setLayoutMode: (v) => update('layout-mode', v, setLayoutMode),
      setCardStyle: (v) => update('card-style', v, setCardStyle),
      setFontSize: (v) => update('font-size', v, setFontSize),
      setRadiusSize: (v) => update('radius-size', v, setRadiusSize),
    }}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => useContext(CustomizationContext);
