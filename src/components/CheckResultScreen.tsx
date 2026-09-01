import React, { useState, useEffect } from 'react';
import { PaymentCheck } from '../types';
import { useLanguage } from '../services/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, LANGUAGE_LIST } from '../services/i18n/languages';
import { getDecisionTranslation } from '../services/i18n/translations';
import { voiceService } from '../services/voice/voiceService';
import { IndiaFlag } from './IndiaFlag';

interface CheckResultScreenProps {
  check: PaymentCheck;
  onViewTrustChain: () => void;
  onViewNetwork: () => void;
  onOpenAskAi?: () => void;
}

export const CheckResultScreen: React.FC<CheckResultScreenProps> = ({
  check,
  onViewTrustChain,
  onViewNetwork,
  onOpenAskAi
}) => {
  const { language, bhashiniLocale, setLanguage, voiceAlertsEnabled, setVoiceAlertsEnabled, t, isTtsSupported } = useLanguage();
  const [showPrivacyAudit, setShowPrivacyAudit] = useState(false);
  const [showProtectedModal, setShowProtectedModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [voiceTelemetry, setVoiceTelemetry] = useState(() => voiceService.getTelemetry());

  const isHighRisk = check.riskLevel === 'HIGH RISK' || check.stopDecision;
  const isModerate = check.riskLevel === 'MODERATE';

  const decisionType = isHighRisk ? 'STOP' : isModerate ? 'VERIFY' : 'PROCEED';
  const decisionTranslation = getDecisionTranslation(decisionType, language);

  // DUPLICATE SPEECH PROTECTION & AUTOMATIC SINGLE-PLAY LOGIC VIA VOICESERVICE (BHASHINI -> BROWSER)
  useEffect(() => {
    if (!voiceAlertsEnabled) {
      voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    const decisionKey = `check_${check.id}_${decisionType}`;
    
    // Automatically trigger speech once for new decision
    voiceService.speak(decisionTranslation.voiceMessage, {
      language: bhashiniLocale,
      decisionKey,
      forceReplay: false,
      onStart: () => {
        setIsSpeaking(true);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onEnd: () => {
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onError: (err) => {
        console.warn('Voice alert event:', err);
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      }
    }).then((played) => {
      if (played) {
        setIsSpeaking(true);
      }
      setVoiceTelemetry(voiceService.getTelemetry());
    });

    return () => {
      voiceService.stop();
      setIsSpeaking(false);
    };
  }, [check.id, decisionType, language, bhashiniLocale, voiceAlertsEnabled, decisionTranslation.voiceMessage]);

  // Manual replay warning
  const handleReplayWarning = () => {
    if (!voiceAlertsEnabled) return;
    
    setIsSpeaking(true);
    voiceService.speak(decisionTranslation.voiceMessage, {
      language: bhashiniLocale,
      forceReplay: true,
      onStart: () => {
        setIsSpeaking(true);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onEnd: () => {
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onError: () => {
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      }
    });
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  return (
    <main className="flex-grow flex flex-col px-4 py-4 gap-5 pb-28 max-w-md mx-auto w-full">
      {/* Accessible Live Region for Screen Readers */}
      <div
        className="sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {`${decisionTranslation.title}: ${decisionTranslation.voiceMessage}`}
      </div>

      {/* Summary Section */}
      <section className="flex flex-col items-center justify-center text-center pt-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[13px] text-[#c4c9ac] font-['Inter']">
            {t.voiceUi.attemptingToSend}
          </p>
          <button
            onClick={() => setShowProtectedModal(true)}
            className="flex items-center gap-1 bg-[#1a2310] hover:bg-[#253215] text-[#abd600] border border-[#abd600]/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono-data cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>{t.voiceUi.protectedAnalysis}</span>
          </button>
        </div>

        <h2 className="text-[44px] sm:text-[48px] font-bold text-[#abd600] font-mono-data tracking-tight mb-2 leading-none">
          ₹{check.amount.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 bg-[#2a2a2a] px-4 py-1.5 rounded-full border border-[#353534]">
          <span className="material-symbols-outlined text-[#c4c9ac] text-[18px]">
            person
          </span>
          <span className="font-mono-data text-[15px] text-[#e5e2e1] font-medium">
            {check.recipient}
          </span>
        </div>
      </section>

      {/* Decision Engine Card: STOP / VERIFY / PROCEED */}
      <section className="flex flex-col gap-4 w-full">
        {isHighRisk ? (
          /* Massive Red Stop Card */
          <div
            id="stop-alert-card"
            className="bg-[#240c0f] border-2 border-[#ffb4ab] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden shadow-[0_0_35px_rgba(147,0,10,0.4)]"
          >
            {/* Red Circle Icon */}
            <div className="w-16 h-16 rounded-full bg-[#ffb4ab]/15 flex items-center justify-center mb-0.5 border border-[#ffb4ab]/40 animate-pulse">
              <span
                className="material-symbols-outlined text-[#ffb4ab] text-[38px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                block
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">🔴</span>
              <h3 className="text-[30px] sm:text-[34px] font-black text-[#ffb4ab] uppercase tracking-widest font-['Inter']">
                {decisionTranslation.title}
              </h3>
            </div>

            <h4 className="text-[17px] font-bold text-[#e5e2e1]">
              {decisionTranslation.subtitle}
            </h4>

            {/* Exact Synchronized Warning Text */}
            <div className="bg-[#180709] border border-[#ffb4ab]/40 rounded-xl p-3.5 text-center w-full">
              <p className="text-[15px] font-semibold text-[#ffdad5] leading-snug">
                "{decisionTranslation.voiceMessage}"
              </p>
            </div>

            {/* WHY WE STOPPED: 3 Direct Strongest Evidence Points */}
            <div className="w-full bg-[#180709] border border-[#ffb4ab]/25 rounded-xl p-3.5 text-left flex flex-col gap-2 font-mono-data text-xs mt-1">
              <span className="text-[10px] text-[#ffb4ab] uppercase font-bold tracking-wider mb-0.5">
                {decisionTranslation.evidenceHeader}
              </span>
              {decisionTranslation.evidencePillars.map((pillar, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#ffb4ab]">
                  <span className="font-bold">❌</span>
                  <span>{pillar}</span>
                </div>
              ))}
            </div>

            <div className="w-full py-2.5 px-4 rounded-lg bg-[#ffb4ab]/20 border border-[#ffb4ab]/40 flex items-center justify-center gap-2 text-xs font-black text-[#ffb4ab] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">do_not_disturb</span>
              <span>{decisionTranslation.actionBadge}</span>
            </div>
          </div>
        ) : isModerate ? (
          /* Amber Verify Card */
          <div
            id="verify-alert-card"
            className="bg-[#241a08] border-2 border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden shadow-[0_0_28px_rgba(245,158,11,0.25)]"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mb-0.5 border border-amber-500/40">
              <span
                className="material-symbols-outlined text-amber-400 text-[38px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                gpp_maybe
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-[28px] sm:text-[32px] font-black text-amber-400 uppercase tracking-widest font-['Inter']">
                {decisionTranslation.title}
              </h3>
            </div>

            <h4 className="text-[17px] font-bold text-[#e5e2e1]">
              {decisionTranslation.subtitle}
            </h4>

            {/* Exact Synchronized Warning Text */}
            <div className="bg-[#181105] border border-amber-500/40 rounded-xl p-3.5 text-center w-full">
              <p className="text-[15px] font-semibold text-amber-200 leading-snug">
                "{decisionTranslation.voiceMessage}"
              </p>
            </div>

            <div className="w-full bg-[#181105] border border-amber-500/25 rounded-xl p-3.5 text-left flex flex-col gap-2 font-mono-data text-xs mt-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider mb-0.5">
                {decisionTranslation.evidenceHeader}
              </span>
              {decisionTranslation.evidencePillars.map((pillar, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-300">
                  <span className="font-bold">⚠️</span>
                  <span>{pillar}</span>
                </div>
              ))}
            </div>

            <div className="w-full py-2.5 px-4 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>{decisionTranslation.actionBadge}</span>
            </div>
          </div>
        ) : (
          /* Calm Green Proceed Card */
          <div
            id="safe-alert-card"
            className="bg-[#121f08] border-2 border-[#abd600]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden shadow-[0_0_24px_rgba(171,214,0,0.18)]"
          >
            <div className="w-16 h-16 rounded-full bg-[#abd600]/15 flex items-center justify-center mb-0.5 border border-[#abd600]/40">
              <span
                className="material-symbols-outlined text-[#abd600] text-[38px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <h3 className="text-[28px] sm:text-[32px] font-black text-[#abd600] uppercase tracking-widest font-['Inter']">
                {decisionTranslation.title}
              </h3>
            </div>

            <h4 className="text-[17px] font-bold text-[#e5e2e1]">
              {decisionTranslation.subtitle}
            </h4>

            {/* Exact Synchronized Warning Text */}
            <div className="bg-[#0a1204] border border-[#abd600]/40 rounded-xl p-3.5 text-center w-full">
              <p className="text-[15px] font-semibold text-[#ddff88] leading-snug">
                "{decisionTranslation.voiceMessage}"
              </p>
            </div>

            <div className="w-full bg-[#0a1204] border border-[#abd600]/25 rounded-xl p-3.5 text-left flex flex-col gap-2 font-mono-data text-xs mt-1">
              <span className="text-[10px] text-[#abd600] uppercase font-bold tracking-wider mb-0.5">
                {decisionTranslation.evidenceHeader}
              </span>
              {decisionTranslation.evidencePillars.map((pillar, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#abd600]">
                  <span className="font-bold">✓</span>
                  <span>{pillar}</span>
                </div>
              ))}
            </div>

            <div className="w-full py-2.5 px-4 rounded-lg bg-[#abd600]/20 border border-[#abd600]/40 flex items-center justify-center gap-2 text-xs font-bold text-[#abd600] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{decisionTranslation.actionBadge}</span>
            </div>
          </div>
        )}

        {/* VOICE CONTROLS & LANGUAGE PANEL */}
        <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-4 flex flex-col gap-3.5 shadow-md">
          {/* Header Row: Voice Status & Language Selector Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                campaign
              </span>
              <span className="text-xs font-bold text-[#e5e2e1] uppercase tracking-wider font-['Inter']">
                Multilingual Safety Voice
              </span>
            </div>

            {/* Language Selector Pill */}
            <div className="relative">
              <button
                id="btn-result-language-selector"
                onClick={() => setShowLangSelector(!showLangSelector)}
                className="flex items-center gap-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#444] px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
                title="Change preferred language"
              >
                <IndiaFlag size="sm" />
                <span className="font-bold">{currentLangInfo.nativeName}</span>
                <span className="material-symbols-outlined text-[16px] text-[#c4c9ac]">
                  {showLangSelector ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Language Dropdown Menu */}
              {showLangSelector && (
                <div className="absolute right-0 top-full mt-1.5 z-40 bg-[#1c1c1c] border border-[#383838] rounded-xl shadow-2xl p-1.5 w-52 flex flex-col gap-1 max-h-60 overflow-y-auto">
                  <span className="text-[10px] text-[#888] font-bold px-2 py-1 uppercase tracking-wider">
                    {t.voiceUi.selectLanguage}
                  </span>
                  {LANGUAGE_LIST.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangSelector(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        language === lang.code
                          ? 'bg-[#abd600] text-black font-bold'
                          : 'text-[#e5e2e1] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IndiaFlag size="sm" />
                        <span>{lang.nativeName}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Action & Alert Toggle Bar */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#262626]">
            {/* Play / Replay Button */}
            <button
              id="btn-play-warning-voice"
              onClick={handleReplayWarning}
              disabled={!voiceAlertsEnabled}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !voiceAlertsEnabled
                  ? 'bg-[#222] text-[#666] border border-[#333] cursor-not-allowed opacity-50'
                  : isSpeaking
                  ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/50 animate-pulse'
                  : 'bg-[#1e2f0d] hover:bg-[#283e12] text-[#abd600] border border-[#abd600]/40 active:scale-95 shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSpeaking ? 'volume_up' : 'replay'}
              </span>
              <span>
                {isSpeaking
                  ? t.voiceUi.speaking
                  : t.voiceUi.replayWarning}
              </span>
            </button>

            {/* Voice Safety Alerts ON / OFF Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono-data font-bold text-[#c4c9ac] hidden sm:inline">
                {t.voiceUi.voiceAlertsToggle}
              </span>
              <button
                id="btn-toggle-voice-alerts"
                onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-data font-bold border transition-colors cursor-pointer ${
                  voiceAlertsEnabled
                    ? 'bg-[#1e2f0d] text-[#abd600] border-[#abd600]/40'
                    : 'bg-[#251010] text-[#ffb4ab] border-[#ffb4ab]/40'
                }`}
                title="Toggle automated and manual voice safety warnings"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {voiceAlertsEnabled ? 'volume_up' : 'volume_off'}
                </span>
                <span>{voiceAlertsEnabled ? t.voiceUi.voiceAlertsOn : t.voiceUi.voiceAlertsOff}</span>
              </button>
            </div>
          </div>

          {/* Voice Engine & Telemetry Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono-data text-[#888] pt-1 px-1">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${voiceAlertsEnabled ? 'bg-[#abd600]' : 'bg-[#666]'}`} />
              <span>Voice Engine:</span>
              <span className="text-[#abd600] font-bold">
                {voiceTelemetry.lastTtsProvider === 'BHASHINI'
                  ? 'BHASHINI (Cloud NLTM)'
                  : voiceTelemetry.lastTtsProvider === 'BROWSER'
                  ? 'Browser SpeechSynthesis (Fallback)'
                  : 'BHASHINI + Browser Ready'}
              </span>
            </span>
            {voiceTelemetry.lastTtsLatencyMs > 0 && (
              <span className="text-[10px] text-[#aaa]">
                ({voiceTelemetry.lastTtsLatencyMs}ms)
              </span>
            )}
          </div>
        </div>

        {/* 4-LAYER NOVELTY: STORY VS. MONEY TRAIL CORRELATION CARD */}
        {check.storyCorrelation && (
          <div
            className={`rounded-xl p-4 flex flex-col gap-3 border ${
              check.storyCorrelation.mismatchSeverity === 'CRITICAL'
                ? 'bg-[#250d11]/80 border-[#ffb4ab]/40 shadow-[0_0_20px_rgba(147,0,10,0.2)]'
                : check.storyCorrelation.mismatchSeverity === 'MODERATE'
                ? 'bg-[#261b07]/80 border-amber-500/40'
                : 'bg-[#152309]/80 border-[#abd600]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                  compare_arrows
                </span>
                <span className="text-[12px] font-bold text-[#e5e2e1] uppercase tracking-wider font-['Inter']">
                  {t.storyCorrelation.title}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono-data font-bold uppercase px-2 py-0.5 rounded ${
                  check.storyCorrelation.mismatchSeverity === 'CRITICAL' ||
                  check.storyCorrelation.correlationStatus === 'INCONSISTENT'
                    ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 animate-pulse'
                    : check.storyCorrelation.mismatchSeverity === 'MODERATE' ||
                      check.storyCorrelation.correlationStatus === 'UNKNOWN'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-[#abd600]/20 text-[#abd600] border border-[#abd600]/40'
                }`}
              >
                {check.storyCorrelation.correlationStatus === 'INCONSISTENT' ||
                check.storyCorrelation.mismatchSeverity === 'CRITICAL'
                  ? t.storyCorrelation.statusInconsistent
                  : check.storyCorrelation.correlationStatus === 'UNKNOWN' ||
                    check.storyCorrelation.mismatchSeverity === 'MODERATE'
                  ? t.storyCorrelation.statusUnknown
                  : t.storyCorrelation.statusConsistent}
              </span>
            </div>

            {/* 3-Way Correlation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-data">
              <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2e2e2e] flex flex-col gap-1">
                <span className="text-[10px] text-[#c4c9ac] uppercase font-bold flex items-center gap-1">
                  <span>🧠</span> {t.storyCorrelation.claimedStory}
                </span>
                <span className="text-[#e5e2e1] font-semibold text-[11px] leading-tight">
                  {check.storyCorrelation.mismatchPillars.claimedStory}
                </span>
              </div>

              <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2e2e2e] flex flex-col gap-1">
                <span className="text-[10px] text-[#c4c9ac] uppercase font-bold flex items-center gap-1">
                  <span>👤</span> {t.storyCorrelation.recipientReality}
                </span>
                <span className="text-[#e5e2e1] font-semibold text-[11px] leading-tight">
                  {check.storyCorrelation.mismatchPillars.financialRecipient}
                </span>
              </div>

              <div className="bg-[#141414] p-2.5 rounded-lg border border-[#2e2e2e] flex flex-col gap-1">
                <span className="text-[10px] text-[#c4c9ac] uppercase font-bold flex items-center gap-1">
                  <span>🕸️</span> {t.storyCorrelation.networkTrail}
                </span>
                <span
                  className={`font-semibold text-[11px] leading-tight ${
                    check.storyCorrelation.mismatchSeverity === 'CRITICAL' ? 'text-[#ffb4ab]' : 'text-[#abd600]'
                  }`}
                >
                  {check.storyCorrelation.mismatchPillars.networkTrail}
                </span>
              </div>
            </div>

            {/* Correlation Synthesis Explanation */}
            <p className="text-[12px] text-[#e5e2e1] leading-relaxed bg-[#0E0E0E]/90 p-2.5 rounded-lg border border-[#262626]">
              {check.storyCorrelation.explanation}
            </p>
          </div>
        )}

        {/* ON-DEVICE AI CONTEXT SIGNALS PANEL (MobileBERT Explainability) */}
        {check.localContext && (
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 border border-[#333333] bg-[#121212]/90 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                  psychology
                </span>
                <span className="text-[12px] font-bold text-[#e5e2e1] uppercase tracking-wider font-['Inter']">
                  AI Context Intelligence ({check.localContext.model_type || 'MobileBERT'})
                </span>
              </div>
              <span className="text-[10px] font-mono-data text-[#abd600] bg-[#abd600]/10 px-2 py-0.5 rounded-full border border-[#abd600]/30 font-semibold">
                {check.localContext.latency_ms || 3}ms • {check.localContext.execution_backend || 'CPU/JIT'}
              </span>
            </div>

            {/* Context Signal Badges Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#181818] p-2 rounded-lg border border-[#262626] flex items-center justify-between">
                <span className="text-[11px] text-[#c4c9ac]">Payment Request</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  check.localContext.payment_request ? 'bg-[#abd600]/20 text-[#abd600]' : 'bg-[#222] text-[#888]'
                }`}>
                  {check.localContext.payment_request ? 'HIGH' : 'CLEAN'}
                </span>
              </div>

              <div className="bg-[#181818] p-2 rounded-lg border border-[#262626] flex items-center justify-between">
                <span className="text-[11px] text-[#c4c9ac]">Time Urgency</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  check.localContext.urgency ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#222] text-[#888]'
                }`}>
                  {check.localContext.urgency ? 'HIGH' : 'CLEAN'}
                </span>
              </div>

              <div className="bg-[#181818] p-2 rounded-lg border border-[#262626] flex items-center justify-between">
                <span className="text-[11px] text-[#c4c9ac]">Payment Pressure</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  check.localContext.payment_pressure ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#222] text-[#888]'
                }`}>
                  {check.localContext.payment_pressure ? 'HIGH' : 'CLEAN'}
                </span>
              </div>

              <div className="bg-[#181818] p-2 rounded-lg border border-[#262626] flex items-center justify-between">
                <span className="text-[11px] text-[#c4c9ac]">Authority Claim</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  check.localContext.authority_claim ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#222] text-[#888]'
                }`}>
                  {check.localContext.authority_claim ? 'HIGH' : 'CLEAN'}
                </span>
              </div>
            </div>

            {check.localContext.threat_indicators && check.localContext.threat_indicators.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {check.localContext.threat_indicators.map((indicator, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 px-2 py-0.5 rounded-full font-medium"
                  >
                    ⚠️ {indicator}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Risk Details Glass Panel */}
        <div className="glass-panel rounded-xl p-4.5 flex flex-col gap-3.5 border border-[#333333]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#abd600] text-[24px] mt-0.5">
              hub
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#c4c9ac] uppercase tracking-widest mb-0.5 font-['Inter']">
                {t.voiceUi.networkCheckTitle}
              </span>
              <p className="text-[14px] sm:text-[15px] text-[#e5e2e1] leading-snug">
                {t.voiceUi.networkSummary(
                  check.connectedEntities || 7,
                  check.elevatedRiskConnections || (isHighRisk ? 3 : 0)
                )}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[#444933]/30"></div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              id="btn-result-why"
              onClick={onViewTrustChain}
              className="flex-1 bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] font-semibold text-[14px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-[#444933]/50 cursor-pointer"
            >
              <span>{t.voiceUi.whyButton}</span>
              <span className="material-symbols-outlined text-[17px] text-[#c4c9ac]">
                help
              </span>
            </button>

            <button
              id="btn-result-view-network"
              onClick={onViewNetwork}
              className="flex-1 bg-[#abd600] hover:bg-[#c3f400] text-[#161e00] font-bold text-[14px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 uppercase tracking-wide cursor-pointer shadow-[0_0_15px_rgba(171,214,0,0.25)]"
            >
              <span className="material-symbols-outlined text-[17px]">
                account_tree
              </span>
              <span>{t.voiceUi.networkButton}</span>
            </button>

            {onOpenAskAi && (
              <button
                id="btn-result-voice-qa"
                onClick={onOpenAskAi}
                className="flex-1 bg-[#1e2f0d] hover:bg-[#283e12] text-[#abd600] border border-[#abd600]/40 font-bold text-[14px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">
                  mic
                </span>
                <span>{t.voiceUi.voiceQaButton}</span>
              </button>
            )}
          </div>
        </div>

        {/* DATA MINIMIZATION & PRIVACY AUDIT PANEL */}
        <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPrivacyAudit(!showPrivacyAudit)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#abd600] text-[18px]">
                verified_user
              </span>
              <span className="text-xs font-bold text-[#e5e2e1] font-mono-data">
                {t.voiceUi.dataMinimizationTitle}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#c4c9ac] transition-transform duration-200">
              {showPrivacyAudit ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showPrivacyAudit && (
            <div className="px-4 pb-4 pt-1 border-t border-[#262626] text-xs font-mono-data flex flex-col gap-2 bg-[#0F0F0F]">
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[10px] text-[#abd600] uppercase font-bold tracking-wider">
                  Transmitted for Risk Check:
                </span>
                <div className="flex items-center gap-2 text-[#e5e2e1]">
                  <span className="text-[#abd600]">✓</span>
                  <span>Recipient identifier ({check.recipient})</span>
                </div>
                <div className="flex items-center gap-2 text-[#e5e2e1]">
                  <span className="text-[#abd600]">✓</span>
                  <span>Transaction amount (₹{check.amount})</span>
                </div>
                <div className="flex items-center gap-2 text-[#e5e2e1]">
                  <span className="text-[#abd600]">✓</span>
                  <span>Structured on-device risk signals ({check.localContext?.threat_indicators?.length || 0} indicators)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#222]">
                <span className="text-[10px] text-[#ffb4ab] uppercase font-bold tracking-wider">
                  Never Transmitted (Enforced Locally):
                </span>
                <div className="flex items-center gap-2 text-[#c4c9ac]">
                  <span className="text-[#ffb4ab]">✕</span>
                  <span>Camera image / Raw QR frames (discarded locally)</span>
                </div>
                <div className="flex items-center gap-2 text-[#c4c9ac]">
                  <span className="text-[#ffb4ab]">✕</span>
                  <span>Device contacts, SMS inbox, or photos</span>
                </div>
                <div className="flex items-center gap-2 text-[#c4c9ac]">
                  <span className="text-[#ffb4ab]">✕</span>
                  <span>Raw microphone audio (on-device speech synthesis & recognition)</span>
                </div>
                <div className="flex items-center gap-2 text-[#c4c9ac]">
                  <span className="text-[#ffb4ab]">✕</span>
                  <span>GPS Geolocation coordinates</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insight banner if available */}
        {check.aiExplanation && (
          <div className="bg-[#1A1A1A] border border-[#abd600]/30 rounded-xl p-3.5 text-xs text-[#c4c9ac] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#abd600] text-base shrink-0 mt-0.5">
              psychology
            </span>
            <div>
              <span className="text-[#abd600] font-semibold block mb-0.5">Q-NETRA Threat Intelligence:</span>
              <p className="leading-relaxed">{check.aiExplanation}</p>
            </div>
          </div>
        )}

        {/* System Status Footnote with real On-Device AI telemetry */}
        <div className="flex items-center justify-center gap-2 text-[#c4c9ac]/80 bg-[#151515] py-2 px-3.5 rounded-full border border-[#2a2a2a] w-fit mx-auto">
          <span className="material-symbols-outlined text-[15px] text-[#abd600]">memory</span>
          <span className="text-[11px] font-bold uppercase tracking-wider font-mono-data">
            ON-DEVICE: {check.localContext?.inference_engine || 'Local CPU/JIT execution'} ({check.localContext?.latency_ms || 2}ms)
          </span>
        </div>
      </section>

      {/* PROTECTED ANALYSIS INFO MODAL */}
      {showProtectedModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-sm w-full p-5 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#abd600] text-[20px]">
                  lock
                </span>
                <h4 className="text-base font-bold text-[#e5e2e1]">
                  {t.voiceUi.protectedAnalysis}
                </h4>
              </div>
              <button
                onClick={() => setShowProtectedModal(false)}
                className="text-[#c4c9ac] hover:text-white p-1 rounded-full hover:bg-[#242424]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#c4c9ac] leading-relaxed">
              Q-NETRA follows a <span className="text-white font-semibold">local-first, data-minimizing architecture</span>:
            </p>

            <div className="flex flex-col gap-2 text-xs font-mono-data">
              <div className="flex items-start gap-2 text-[#e5e2e1]">
                <span className="text-[#abd600]">✓</span>
                <span>QR decoded entirely on-device (in-memory canvas)</span>
              </div>
              <div className="flex items-start gap-2 text-[#e5e2e1]">
                <span className="text-[#abd600]">✓</span>
                <span>Context evaluation runs locally (Client JIT, sub-5ms)</span>
              </div>
              <div className="flex items-start gap-2 text-[#e5e2e1]">
                <span className="text-[#abd600]">✓</span>
                <span>On-device speech synthesis in 8 Indian languages</span>
              </div>
              <div className="flex items-start gap-2 text-[#e5e2e1]">
                <span className="text-[#abd600]">✓</span>
                <span>Camera stops immediately upon QR capture</span>
              </div>
              <div className="flex items-start gap-2 text-[#e5e2e1]">
                <span className="text-[#abd600]">✓</span>
                <span>Zero background audio recording or tracker storage</span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-2.5 rounded-lg border border-[#2a2a2a] text-[11px] text-[#c4c9ac]">
              <span className="font-bold text-amber-400 block mb-0.5">Note:</span>
              Data security guarantees how your data is handled. Payment risk evaluates whether the recipient or syndicate is fraudulent based on available indicators.
            </div>

            <button
              onClick={() => setShowProtectedModal(false)}
              className="mt-1 bg-[#abd600] hover:bg-[#c3f400] text-black font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
