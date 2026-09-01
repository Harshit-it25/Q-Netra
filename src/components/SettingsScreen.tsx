import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { detectHardwareProfile } from '../lib/onDeviceAI';
import { useLanguage } from '../services/i18n/LanguageContext';
import { LANGUAGE_LIST, SupportedLanguage } from '../services/i18n/languages';
import { IndiaFlag } from './IndiaFlag';
import { modelLoader } from '../services/localAI/modelLoader';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onResetDemo?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onResetDemo }) => {
  const { language, setLanguage, voiceAlertsEnabled, setVoiceAlertsEnabled, t, isTtsSupported } = useLanguage();
  const [realTimeClipboard, setRealTimeClipboard] = useState(true);
  const [onDeviceAnalysis, setOnDeviceAnalysis] = useState(true);
  const [smsAutoScan, setSmsAutoScan] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [aiStatus, setAiStatus] = useState(modelLoader.getLocalAIStatus());

  useEffect(() => {
    setAiStatus(modelLoader.getLocalAIStatus());
  }, []);

  const hwProfile = detectHardwareProfile();

  const handleTriggerReset = () => {
    if (onResetDemo) {
      onResetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <main className="flex-grow p-4 md:p-6 max-w-2xl mx-auto w-full pb-28">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-[24px] font-bold text-[#e5e2e1] mb-1 font-['Inter']">
          Settings & Security Shield
        </h2>
        <p className="text-[14px] text-[#c4c9ac]">
          Configure multilingual voice safety alerts, language preference, and on-device risk rules.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Preferred Language Section */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                translate
              </span>
              <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-['Inter']">
                Preferred Safety Language (भाषा)
              </span>
            </div>
            <span className="text-[10px] font-mono-data bg-[#262626] text-[#c4c9ac] px-2 py-0.5 rounded">
              8 Languages
            </span>
          </div>

          <p className="text-xs text-[#c4c9ac] leading-relaxed">
            Controls visible warning text, audible safety alerts, and Voice Q&A responses simultaneously. Risk calculation remains strictly objective and language-independent.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {LANGUAGE_LIST.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-[#1e2f0d] border-[#abd600] text-[#abd600] shadow-[0_0_12px_rgba(171,214,0,0.15)]'
                    : 'bg-[#141414] border-[#2e2e2e] text-[#c4c9ac] hover:border-[#444] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IndiaFlag size="sm" />
                  {language === lang.code && (
                    <span className="material-symbols-outlined text-sm text-[#abd600]">check_circle</span>
                  )}
                </div>
                <span className="font-bold text-xs text-white leading-tight mt-0.5">{lang.nativeName}</span>
                <span className="text-[10px] text-[#888]">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Multilingual Voice Safety Alerts Master Switch */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-['Inter']">
              Audible Safety Warnings
            </span>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${
              voiceAlertsEnabled ? 'bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30' : 'bg-[#262626] text-[#888]'
            }`}>
              {voiceAlertsEnabled ? 'VOICE: ACTIVE' : 'VOICE: DISABLED'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c4c9ac] text-[22px] mt-0.5">
                campaign
              </span>
              <div>
                <h4 className="text-sm font-semibold text-[#e5e2e1]">
                  Voice Safety Alerts (Synchronized Audio)
                </h4>
                <p className="text-xs text-[#c4c9ac] leading-relaxed mt-0.5">
                  When enabled, Q-NETRA automatically speaks the localized decision alert once upon receiving a new payment risk determination. When disabled, visible warning text continues normally while voice output is muted.
                </p>
              </div>
            </div>
            <button
              onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-0.5 ${
                voiceAlertsEnabled ? 'bg-[#abd600]' : 'bg-[#333333]'
              }`}
              title="Toggle voice alerts"
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  voiceAlertsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="bg-[#141414] rounded-xl p-3 border border-[#2a2a2a] text-xs font-mono-data text-[#c4c9ac] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span>Speech Engine:</span>
              <span className="text-[#abd600] font-bold">Device / Browser Web Speech API</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Privacy Guarantee:</span>
              <span className="text-white">Zero audio recording • No server upload</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Voice Service Notice:</span>
              <span className="text-[#c4c9ac]">Voice output depends on device/browser speech-service availability.</span>
            </div>
          </div>
        </div>

        {/* Core Protection Section */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-4">
          <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-['Inter']">
            Autonomous Protection
          </span>

          {/* Toggle 1: Real-time Clipboard */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c4c9ac] text-[22px] mt-0.5">
                content_paste
              </span>
              <div>
                <h4 className="text-sm font-semibold text-[#e5e2e1]">
                  Clipboard VPA Interceptor
                </h4>
                <p className="text-xs text-[#c4c9ac]">
                  Automatically checks risk when any UPI ID is copied to clipboard.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRealTimeClipboard(!realTimeClipboard)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                realTimeClipboard ? 'bg-[#abd600]' : 'bg-[#333333]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  realTimeClipboard ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="h-px bg-[#333333]"></div>

          {/* Toggle 2: On-Device Analysis */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c4c9ac] text-[22px] mt-0.5">
                memory
              </span>
              <div>
                <h4 className="text-sm font-semibold text-[#e5e2e1]">
                  On-Device Local Neural Engine
                </h4>
                <p className="text-xs text-[#c4c9ac]">
                  Zero-latency offline contextual analysis without transmitting personal metadata.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOnDeviceAnalysis(!onDeviceAnalysis)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                onDeviceAnalysis ? 'bg-[#abd600]' : 'bg-[#333333]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  onDeviceAnalysis ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* LOCAL AI ARCHITECTURE SECTION (MobileBERT Primary & Heuristic Fallback) */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                psychology
              </span>
              <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-['Inter']">
                LOCAL AI
              </span>
            </div>
            <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30">
              STATUS: {aiStatus.status}
            </span>
          </div>

          <p className="text-xs text-[#c4c9ac] leading-relaxed">
            Q-NETRA runs an on-device MobileBERT Transformer as its primary contextual intelligence model to evaluate coercion, urgency, and social engineering in real-time.
          </p>

          <div className="bg-[#141414] rounded-xl p-3.5 border border-[#2a2a2a] flex flex-col gap-2 font-mono-data text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Model:</span>
              <span className="text-white font-bold">{aiStatus.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Parameters:</span>
              <span className="text-white font-bold">{aiStatus.parameters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Status:</span>
              <span className="text-[#abd600] font-bold">{aiStatus.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Execution:</span>
              <span className="text-[#abd600] font-bold">{aiStatus.execution}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Latency:</span>
              <span className="text-white font-bold">{aiStatus.latency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Fallback:</span>
              <span className="text-[#c4c9ac] font-medium">{aiStatus.fallback}</span>
            </div>
          </div>
        </div>

        {/* SMS Shield Section (User Controlled & Optional) */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-['Inter']">
              SMS Shield (Optional)
            </span>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${
              smsAutoScan ? 'bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30' : 'bg-[#262626] text-[#888]'
            }`}>
              {smsAutoScan ? 'STATUS: ON' : 'STATUS: OFF'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#e5e2e1]">
                On-Device SMS Scam Inspection (Demo)
              </h4>
              <p className="text-xs text-[#c4c9ac] leading-relaxed mt-0.5">
                {smsAutoScan
                  ? 'Simulated SMS testing is enabled. Messages are inspected locally on-device for payment coercion and APK links. (Native Android inbox reading is not implemented in this web build).'
                  : 'Your messages are not accessed. Q-NETRA operates in Manual Mode with zero SMS inbox access.'}
              </p>
            </div>
            <button
              onClick={() => {
                const nextState = !smsAutoScan;
                setSmsAutoScan(nextState);
                localStorage.setItem('qnetra_sms_permission', nextState ? 'SMS_PERMISSION_GRANTED' : 'SMS_PERMISSION_OFF');
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                smsAutoScan ? 'bg-[#abd600]' : 'bg-[#333333]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  smsAutoScan ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* DEMO STATE CONTROL & HARDENING SECTION */}
        <div className="bg-[#171717] border border-[#383838] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#abd600]">restart_alt</span>
              <h3 className="text-sm font-bold text-[#e5e2e1]">
                Deterministic Demo Controls
              </h3>
            </div>
            <span className="text-[10px] font-mono-data bg-[#242424] text-[#c4c9ac] px-2 py-0.5 rounded">
              Phase 5 Verified
            </span>
          </div>
          <p className="text-xs text-[#c4c9ac] leading-relaxed">
            Instantly restore clean evaluation state for the <strong>3 Golden Demo Scenarios</strong> (Case A: Proceed, Case B: Verify, Case C: Stop) without manual database edits or terminal restarts.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleTriggerReset}
              className="bg-[#abd600] hover:bg-[#c3f400] text-black font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Reset to 3 Golden Demo Cases</span>
            </button>
            {resetSuccess && (
              <span className="text-xs font-mono-data text-[#abd600] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Reset Applied!</span>
              </span>
            )}
          </div>
        </div>

        {/* Emergency Assistance Section */}
        <div className="bg-[#301014]/50 border border-[#ffb4ab]/30 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ab]">emergency</span>
              <h3 className="text-[16px] font-bold text-[#ffb4ab]">
                National Cyber Crime Helpline (India)
              </h3>
            </div>
            <span className="text-xs text-[#ffb4ab] font-bold bg-[#ffb4ab]/10 px-2 py-0.5 rounded">
              24x7 Active
            </span>
          </div>
          <p className="text-xs text-[#c4c9ac] leading-relaxed">
            If you were defrauded or suspect money was transferred to an illegal mule ring, immediately call <strong>1930</strong> within the "Golden Hour" to freeze fund dispersion.
          </p>
          <div className="flex gap-2.5 mt-1">
            <a
              href="tel:1930"
              className="flex-1 bg-[#ffb4ab] text-[#690005] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:bg-white text-center"
            >
              <span className="material-symbols-outlined text-base">call</span>
              <span>Dial 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#1A1A1A] border border-[#ffb4ab]/40 text-[#ffb4ab] font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:bg-[#242424] text-center"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              <span>cybercrime.gov.in</span>
            </a>
          </div>
        </div>

        {/* Accurate Claims & Hardware Meta Info */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-[#c4c9ac]">
          <div className="flex justify-between">
            <span>Risk Decision Basis</span>
            <span className="font-mono-data text-[#abd600] text-right">
              Detected based on available risk indicators
            </span>
          </div>
          <div className="flex justify-between">
            <span>Voice Synthesizer</span>
            <span className="font-mono-data text-white">Browser / Device SpeechSynthesis</span>
          </div>
          <div className="flex justify-between">
            <span>Hardware Platform</span>
            <span className="font-mono-data text-white">{hwProfile.hardwarePlatform}</span>
          </div>
          <div className="flex justify-between">
            <span>Execution Runtime</span>
            <span className="font-mono-data text-[#abd600]">{hwProfile.executionRuntime}</span>
          </div>
          <div className="flex justify-between">
            <span>Q-NETRA Engine Version</span>
            <span className="font-mono-data text-white">v3.5.0-voice-sync</span>
          </div>
        </div>
      </div>
    </main>
  );
};
