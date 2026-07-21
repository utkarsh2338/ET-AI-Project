import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  aiResponseLength: 'short' | 'detailed';
  showConfidenceScore: boolean;
  showExplainabilityPanel: boolean;
  autoReportSuggestion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
  liveIncidentNotifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  aiResponseLength: 'detailed',
  showConfidenceScore: true,
  showExplainabilityPanel: true,
  autoReportSuggestion: true,
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  desktopNotifications: true,
  soundAlerts: true,
  liveIncidentNotifications: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'cfs_app_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  function updateSettings(partial: Partial<AppSettings>) {
    setSettingsState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }

  function resetSettings() {
    setSettingsState(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {}
  }

  // Apply theme & accessibility styles dynamically
  useEffect(() => {
    const root = document.documentElement;

    // Theme switching
    const applyTheme = (theme: 'dark' | 'light' | 'system') => {
      let isDark = true;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };

    applyTheme(settings.theme);

    // Listen for OS theme changes if theme === 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Font size
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${settings.fontSize}`);

    // High Contrast
    if (settings.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');

    // Reduced Motion
    if (settings.reducedMotion) root.classList.add('reduced-motion');
    else root.classList.remove('reduced-motion');

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
