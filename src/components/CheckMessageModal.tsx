import React, { useState, useEffect } from 'react';
import { SAMPLE_SCAM_MESSAGES } from '../data';
import {
  SmsPermissionState,
  SmsAnalysisItem,
  getSmsPermissionState,
  setSmsPermissionState,
  analyzeSmsLocally,
  SAMPLE_PERMITTED_SMS_INBOX,
  getSmsAnalysisHistory,
  saveSmsAnalysisHistory,
  deleteSmsAnalysisById,
  clearAllSmsAnalysisHistory
} from '../lib/smsShield';

interface CheckMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCorrelatePayment?: (recipient: string, amount: number, note?: string) => void;
}

export const CheckMessageModal: React.FC<CheckMessageModalProps> = ({
  isOpen,
  onClose,
  onCorrelatePayment
}) => {
  const [permissionState, setPermissionState] = useState<SmsPermissionState>(getSmsPermissionState());
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<SmsAnalysisItem | null>(null);
  const [scannedInbox, setScannedInbox] = useState<SmsAnalysisItem[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentPerm = getSmsPermissionState();
    setPermissionState(currentPerm);

    if (currentPerm === 'SMS_PERMISSION_GRANTED') {
      const analyzed = SAMPLE_PERMITTED_SMS_INBOX.map((s) =>
        analyzeSmsLocally(s.body, s.sender, s.id, s.timestamp)
      );
      setScannedInbox(analyzed);
      saveSmsAnalysisHistory(analyzed);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrantPermission = () => {
    setSmsPermissionState('SMS_PERMISSION_GRANTED');
    setPermissionState('SMS_PERMISSION_GRANTED');
    setShowPermissionPrompt(false);

    const analyzed = SAMPLE_PERMITTED_SMS_INBOX.map((s) =>
      analyzeSmsLocally(s.body, s.sender, s.id, s.timestamp)
    );
    setScannedInbox(analyzed);
    saveSmsAnalysisHistory(analyzed);
  };

  const handleRevokePermission = () => {
    setSmsPermissionState('SMS_PERMISSION_REVOKED');
    setPermissionState('SMS_PERMISSION_REVOKED');
    setScannedInbox([]);
    setSelectedAnalysis(null);
  };

  const handleAnalyzeManualText = () => {
    if (!messageText.trim()) return;
    const analyzed = analyzeSmsLocally(messageText, 'MANUAL_INPUT');
    setSelectedAnalysis(analyzed);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSelectSample = (sampleText: string) => {
    setMessageText(sampleText);
    const analyzed = analyzeSmsLocally(sampleText, 'SAMPLE_VECTOR');
    setSelectedAnalysis(analyzed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#131313] border border-[#333333] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between sticky top-0 bg-[#131313] z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#abd600] text-[22px]">security</span>
            <div>
              <h3 className="text-[17px] font-bold text-[#e5e2e1] font-['Inter']">
                SMS Shield & Link Analyzer
              </h3>
              <p className="text-[11px] text-[#c4c9ac] font-mono-data">
                {permissionState === 'SMS_PERMISSION_GRANTED'
                  ? 'On-Device SMS Inspection • Simulated Test Inbox'
                  : 'Manual Inspection Mode • Zero Inbox Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* SMS SHIELD PERMISSION BANNER */}
          {permissionState !== 'SMS_PERMISSION_GRANTED' ? (
            <div className="bg-[#181818] border border-[#333] rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c4c9ac]/60"></span>
                  <span className="text-xs font-bold text-[#e5e2e1] uppercase tracking-wider font-mono-data">
                    MANUAL MODE (PASTE OR TEST SCENARIOS)
                  </span>
                </div>
                <span className="text-[10px] bg-[#242424] text-[#c4c9ac] px-2 py-0.5 rounded font-mono-data">
                  Web Prototype
                </span>
              </div>
              <p className="text-xs text-[#c4c9ac] leading-relaxed">
                The current web runtime does not access the native Android SMS inbox. SMS content supplied to Q-NETRA is analyzed locally on-device.
              </p>
              <button
                onClick={() => setShowPermissionPrompt(true)}
                className="bg-[#242424] hover:bg-[#303030] text-[#abd600] border border-[#abd600]/40 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start"
              >
                <span className="material-symbols-outlined text-[16px]">inbox</span>
                <span>Load Simulated Demo Inbox</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#15240c] border border-[#abd600]/40 rounded-xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#abd600] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#abd600] uppercase tracking-wider font-mono-data">
                    SIMULATED INBOX LOADED (ON-DEVICE)
                  </span>
                </div>
                <button
                  onClick={handleRevokePermission}
                  className="text-[11px] text-[#ffb4ab] hover:underline font-mono-data cursor-pointer"
                >
                  Unload Inbox
                </button>
              </div>
              <p className="text-xs text-[#c4c9ac] font-mono-data">
                {scannedInbox.length} simulated messages analyzed locally on-device. Zero cloud upload.
              </p>

              {/* Scanned Messages List */}
              <div className="flex flex-col gap-2 mt-1">
                {scannedInbox.map((sms) => (
                  <div
                    key={sms.id}
                    onClick={() => setSelectedAnalysis(sms)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      selectedAnalysis?.id === sms.id
                        ? 'bg-[#222] border-[#abd600]'
                        : 'bg-[#181818] border-[#2e2e2e] hover:border-[#444]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono-data text-[#e5e2e1]">
                        {sms.sender}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded font-mono-data ${
                          sms.riskLevel === 'HIGH RISK'
                            ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                            : sms.riskLevel === 'MODERATE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-[#abd600]/20 text-[#abd600] border border-[#abd600]/40'
                        }`}
                      >
                        {sms.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#c4c9ac] line-clamp-2 leading-snug">
                      {sms.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MANUAL MESSAGE INPUT (Works in both modes) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#c4c9ac] uppercase tracking-wider font-mono-data">
              Analyze Custom SMS / Payment Message
            </label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste suspicious SMS, WhatsApp payment request, or bill notification..."
              className="bg-[#1C1C1C] border border-[#333333] rounded-xl p-3 text-xs sm:text-sm text-[#e5e2e1] focus:outline-none focus:border-[#abd600]/60 placeholder-[#666] resize-none font-['Inter']"
            />
            <button
              onClick={handleAnalyzeManualText}
              disabled={!messageText.trim()}
              className="bg-[#abd600] hover:bg-[#b8e600] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-xs py-2.5 px-4 rounded-xl uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>Inspect Message On-Device</span>
            </button>
          </div>

          {/* SAMPLE TEST VECTORS */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#777] uppercase tracking-wider font-mono-data">
              Test Attack Scenarios
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {SAMPLE_SCAM_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(s.text)}
                  className="p-2.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] text-left text-xs font-mono-data text-[#c4c9ac] hover:text-[#e5e2e1] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="truncate pr-2">{s.title}</span>
                  <span className="material-symbols-outlined text-[14px] text-[#abd600]">arrow_forward</span>
                </button>
              ))}
            </div>
          </div>

          {/* DETAILED ANALYSIS RESULT VIEW */}
          {selectedAnalysis && (
            <div className="mt-2 flex flex-col gap-3 pt-3 border-t border-[#2e2e2e]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#abd600] uppercase font-mono-data">
                  ANALYSIS BREAKDOWN
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono-data ${
                    selectedAnalysis.riskLevel === 'HIGH RISK'
                      ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                      : selectedAnalysis.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-[#abd600]/20 text-[#abd600] border border-[#abd600]/40'
                  }`}
                >
                  {selectedAnalysis.riskLevel}
                </span>
              </div>

              {/* Signals */}
              <div className="bg-[#171717] border border-[#2c2c2c] rounded-xl p-3 flex flex-col gap-1.5 font-mono-data text-xs">
                <span className="text-[10px] text-[#777] uppercase font-bold">Detected Indicators:</span>
                {selectedAnalysis.signals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#e5e2e1]">
                    <span className={selectedAnalysis.riskLevel === 'HIGH RISK' ? 'text-[#ffb4ab]' : 'text-[#abd600]'}>
                      {selectedAnalysis.riskLevel === 'HIGH RISK' ? '✕' : '✓'}
                    </span>
                    <span>{sig}</span>
                  </div>
                ))}
              </div>

              {/* Link Safety Inspection Card (Zero Auto-Navigation) */}
              {selectedAnalysis.urlInfo.hasUrl && selectedAnalysis.urlInfo.url && (
                <div className="bg-[#241014] border border-[#ffb4ab]/40 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-[18px]">link_off</span>
                    <span className="text-xs font-bold font-mono-data uppercase">
                      ⚠️ LINK SAFETY INTERCEPT (Auto-Open Blocked)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c4c9ac] font-mono-data break-all bg-[#120709] p-2 rounded border border-[#ffb4ab]/20">
                    {selectedAnalysis.urlInfo.url}
                  </p>
                  <p className="text-xs text-[#e5e2e1]">
                    {selectedAnalysis.urlInfo.isApk
                      ? 'Critical Warning: Link points directly to an unsigned Android APK executable payload.'
                      : selectedAnalysis.urlInfo.isShortened
                      ? 'Caution: URL is shortened to obscure the final destination server.'
                      : 'Potentially malicious external domain.'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setSelectedAnalysis(null)}
                      className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#e5e2e1] text-xs py-2 px-3 rounded-lg border border-[#333] transition-colors cursor-pointer"
                    >
                      Do Not Open
                    </button>
                    <button
                      onClick={() => handleCopyLink(selectedAnalysis.urlInfo.url!)}
                      className="flex-1 bg-[#2a1317] hover:bg-[#381a1f] text-[#ffb4ab] text-xs py-2 px-3 rounded-lg border border-[#ffb4ab]/30 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>{copiedLink ? 'Copied' : 'Copy Link Only'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3 text-xs text-[#c4c9ac] leading-relaxed">
                <span className="text-[10px] text-[#abd600] uppercase font-bold block mb-1">
                  Action Recommendation:
                </span>
                <p className="text-[#e5e2e1] font-medium">{selectedAnalysis.recommendation}</p>
              </div>

              {/* SMS-to-Payment Correlation Action */}
              {selectedAnalysis.body.toLowerCase().includes('abc123@upi') || selectedAnalysis.body.toLowerCase().includes('electricity') ? (
                <button
                  onClick={() => {
                    onClose();
                    onCorrelatePayment?.('abc123@upi', 10, selectedAnalysis.body);
                  }}
                  className="bg-[#CCFF00] hover:bg-[#d8ff33] text-[#0A0A0A] font-bold text-xs py-3 px-4 rounded-xl uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                >
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  <span>Correlate with Payment Shield (Case C)</span>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* EXPLANATION MODAL BEFORE INBOX TRIGGER */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#abd600]/40 rounded-2xl max-w-sm w-full p-5 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e2f0d] border border-[#abd600]/30 flex items-center justify-center text-[#abd600]">
                <span className="material-symbols-outlined text-[24px]">inbox</span>
              </div>
              <div>
                <h4 className="text-[17px] font-bold text-[#e5e2e1] font-['Inter']">
                  Load Demo SMS Inbox?
                </h4>
                <span className="text-xs text-[#abd600] font-mono-data">
                  Simulated Scam Vectors
                </span>
              </div>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2e2e2e] rounded-xl p-3 text-xs text-[#c4c9ac] leading-relaxed flex flex-col gap-2">
              <p>
                Loads sample electricity, lottery, and phishing messages to demonstrate on-device threat classification.
              </p>
              <div className="flex items-center gap-1.5 text-[#abd600] font-bold text-[11px]">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>100% On-Device • Zero Cloud Ingestion</span>
              </div>
              <p className="text-[11px] text-[#888]">
                Native Android inbox reading is not implemented in this web build. SMS content is supplied by the user or loaded from simulated fixtures.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => setShowPermissionPrompt(false)}
                className="flex-1 min-h-[48px] bg-[#262626] hover:bg-[#333] text-[#e5e2e1] font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-[#3a3a3a]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGrantPermission}
                className="flex-1 min-h-[48px] bg-[#abd600] hover:bg-[#b8e600] text-[#0A0A0A] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Load Demo Inbox</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
