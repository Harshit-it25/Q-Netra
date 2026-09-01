import React from 'react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  // Determine active tab
  const isHome = currentScreen === 'home';
  const isChecks = currentScreen === 'check-result' || currentScreen === 'trust-chain';
  const isNetwork = currentScreen === 'network';
  const isSettings = currentScreen === 'settings';

  return (
    <nav
      id="bottom-nav-bar"
      className="bg-[#0e0e0e] fixed bottom-0 w-full z-50 h-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] border-t border-[#444933]/40 flex justify-around items-center px-2 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      {/* Home */}
      {isHome ? (
        <button
          id="nav-home-btn"
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center bg-[#c3f400] text-[#283500] rounded-full px-5 py-1 active:scale-90 transition-transform duration-200 cursor-pointer shadow-[0_0_12px_rgba(195,244,0,0.25)]"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">Home</span>
        </button>
      ) : (
        <button
          id="nav-home-btn"
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center text-[#c4c9ac] hover:text-[#c3f400] active:scale-90 transition-transform duration-200 px-5 py-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-0.5">Home</span>
        </button>
      )}

      {/* Checks */}
      {isChecks ? (
        <button
          id="nav-checks-btn"
          onClick={() => onNavigate('check-result')}
          className="flex flex-col items-center justify-center bg-[#c3f400] text-[#283500] rounded-full px-5 py-1 active:scale-90 transition-transform duration-200 cursor-pointer shadow-[0_0_12px_rgba(195,244,0,0.25)]"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            fact_check
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">Checks</span>
        </button>
      ) : (
        <button
          id="nav-checks-btn"
          onClick={() => onNavigate('check-result')}
          className="flex flex-col items-center justify-center text-[#c4c9ac] hover:text-[#c3f400] active:scale-90 transition-transform duration-200 px-5 py-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">fact_check</span>
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-0.5">Checks</span>
        </button>
      )}

      {/* Network */}
      {isNetwork ? (
        <button
          id="nav-network-btn"
          onClick={() => onNavigate('network')}
          className="flex flex-col items-center justify-center bg-[#c3f400] text-[#283500] rounded-full px-5 py-1 active:scale-90 transition-transform duration-200 cursor-pointer shadow-[0_0_12px_rgba(195,244,0,0.25)]"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">Network</span>
        </button>
      ) : (
        <button
          id="nav-network-btn"
          onClick={() => onNavigate('network')}
          className="flex flex-col items-center justify-center text-[#c4c9ac] hover:text-[#c3f400] active:scale-90 transition-transform duration-200 px-5 py-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">hub</span>
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-0.5">Network</span>
        </button>
      )}

      {/* Settings */}
      {isSettings ? (
        <button
          id="nav-settings-btn"
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center justify-center bg-[#c3f400] text-[#283500] rounded-full px-5 py-1 active:scale-90 transition-transform duration-200 cursor-pointer shadow-[0_0_12px_rgba(195,244,0,0.25)]"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            settings
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">Settings</span>
        </button>
      ) : (
        <button
          id="nav-settings-btn"
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center justify-center text-[#c4c9ac] hover:text-[#c3f400] active:scale-90 transition-transform duration-200 px-5 py-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-0.5">Settings</span>
        </button>
      )}
    </nav>
  );
};
