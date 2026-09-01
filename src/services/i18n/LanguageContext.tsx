import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  SupportedLanguage,
  getSavedLanguage,
  savePreferredLanguage,
  getSavedVoiceAlertsEnabled,
  saveVoiceAlertsEnabled
} from './languages';
import { getTranslation, LanguageTranslations } from './translations';
import { voiceService } from '../voice/voiceService';
import { languagePreferenceService, LanguageCode } from '../voice/languagePreferenceService';

interface LanguageContextType {
  language: SupportedLanguage;
  bhashiniLocale: LanguageCode;
  setLanguage: (lang: SupportedLanguage) => void;
  voiceAlertsEnabled: boolean;
  setVoiceAlertsEnabled: (enabled: boolean) => void;
  t: LanguageTranslations;
  isTtsSupported: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => getSavedLanguage());
  const [voiceAlertsEnabled, setVoiceAlertsEnabledState] = useState<boolean>(() =>
    getSavedVoiceAlertsEnabled()
  );

  const t = getTranslation(language);
  const isTtsSupported = voiceService.isAvailable();
  const bhashiniLocale: LanguageCode = `${language}-IN` as LanguageCode;

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    savePreferredLanguage(newLang);
    const code: LanguageCode = `${newLang}-IN` as LanguageCode;
    languagePreferenceService.setLanguage(code);
    voiceService.stop();
  };

  const setVoiceAlertsEnabled = (enabled: boolean) => {
    setVoiceAlertsEnabledState(enabled);
    saveVoiceAlertsEnabled(enabled);
    languagePreferenceService.setVoiceAlertsEnabled(enabled);
    if (!enabled) {
      voiceService.stop();
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        bhashiniLocale,
        setLanguage,
        voiceAlertsEnabled,
        setVoiceAlertsEnabled,
        t,
        isTtsSupported
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLang = getSavedLanguage();
    return {
      language: fallbackLang,
      bhashiniLocale: 'en-IN',
      setLanguage: () => {},
      voiceAlertsEnabled: true,
      setVoiceAlertsEnabled: () => {},
      t: getTranslation(fallbackLang),
      isTtsSupported: true
    };
  }
  return context;
}
