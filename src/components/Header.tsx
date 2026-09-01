import React, { useState } from 'react';
import { ScreenType } from '../types';
import { useLanguage } from '../services/i18n/LanguageContext';
import { LANGUAGE_LIST, SUPPORTED_LANGUAGES } from '../services/i18n/languages';
import { IndiaFlag } from './IndiaFlag';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenMenu
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLangInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  const renderLanguagePicker = () => (
    <div className="relative">
      <button
        id="btn-header-language-pill"
        onClick={() => setShowLangMenu(!showLangMenu)}
        className="flex items-center gap-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#383838] px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
        title="Switch Language"
      >
        <IndiaFlag size="sm" />
        <span className="text-[11px] font-mono-data font-bold hidden sm:inline">{currentLangInfo.nativeName}</span>
        <span className="material-symbols-outlined text-[15px] text-[#c4c9ac]">
          {showLangMenu ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {showLangMenu && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[#191919] border border-[#383838] rounded-xl shadow-2xl p-1.5 w-48 flex flex-col gap-1 max-h-64 overflow-y-auto">
          <span className="text-[10px] text-[#888] font-bold px-2 py-1 uppercase tracking-wider">
            {t.voiceUi.selectLanguage}
          </span>
          {LANGUAGE_LIST.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowLangMenu(false);
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                language === lang.code
                  ? 'bg-[#abd600] text-black font-bold'
                  : 'text-[#e5e2e1] hover:bg-[#282828]'
              }`}
            >
              <div className="flex items-center gap-2">
                <IndiaFlag size="sm" />
                <span>{lang.nativeName}</span>
              </div>
              <span className="text-[10px] opacity-75">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (currentScreen === 'home') {
    return (
      <header className="bg-[#131313] w-full top-0 sticky border-b border-[#444933]/50 flex items-center justify-between px-4 h-16 z-40">
        <button
          id="btn-header-shield"
          onClick={() => onNavigate('settings')}
          className="text-[#c4c9ac] hover:bg-[#2a2a2a] transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center cursor-pointer"
          title="Security Center & Settings"
        >
          <span className="material-symbols-outlined text-[24px]">security</span>
        </button>

        <h1 className="text-[20px] sm:text-[24px] font-bold uppercase tracking-tighter text-[#abd600] flex items-center gap-1.5 font-['Inter']">
          Q-NETRA AI
        </h1>

        <div className="flex items-center gap-2">
          {renderLanguagePicker()}
          <button
            id="btn-header-menu"
            onClick={onOpenMenu}
            className="text-[#c4c9ac] hover:bg-[#2a2a2a] transition-colors active:scale-95 duration-100 p-2 rounded-full flex items-center justify-center cursor-pointer"
            title="Voice Assistant"
          >
            <span className="material-symbols-outlined text-[24px]">mic</span>
          </button>
        </div>
      </header>
    );
  }

  // Transactional / Sub-screen Header
  return (
    <header className="w-full top-0 sticky z-40 bg-[#131313] border-b border-[#444933]/40 h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          id="btn-header-back"
          onClick={() => {
            if (currentScreen === 'trust-chain') {
              onNavigate('check-result');
            } else if (currentScreen === 'network' && window.history.length > 1) {
              onNavigate('check-result');
            } else {
              onNavigate('home');
            }
          }}
          aria-label="Go back"
          className="text-[#c4c9ac] hover:text-[#abd600] hover:bg-[#2a2a2a] transition-colors active:scale-95 duration-100 p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#abd600] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className={`text-[17px] sm:text-[19px] font-semibold truncate ${currentScreen === 'trust-chain' ? 'text-[#abd600]' : 'text-[#e5e2e1]'}`}>
          {currentScreen === 'check-result'
            ? 'Q-NETRA Safety Shield'
            : currentScreen === 'trust-chain'
            ? 'Why this payment was flagged'
            : currentScreen === 'network'
            ? 'Network Intelligence'
            : 'Settings & Security'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {renderLanguagePicker()}
        {currentScreen === 'check-result' && (
          <button
            onClick={() => onNavigate('trust-chain')}
            className="text-xs bg-[#242424] hover:bg-[#333333] text-[#c4c9ac] hover:text-[#abd600] px-2.5 py-1.5 rounded border border-[#333333] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">help</span>
            <span>{t.voiceUi.whyButton}</span>
          </button>
        )}
      </div>
    </header>
  );
};
