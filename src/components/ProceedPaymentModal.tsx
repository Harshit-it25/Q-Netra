import React, { useState } from 'react';
import { PaymentCheck } from '../types';
import { generateUpiPayUri, copyToClipboard, POPULAR_UPI_APPS } from '../services/qr/upiLauncherService';

interface ProceedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  check: PaymentCheck;
}

export const ProceedPaymentModal: React.FC<ProceedPaymentModalProps> = ({
  isOpen,
  onClose,
  check
}) => {
  const [selectedAppId, setSelectedAppId] = useState('default');
  const [copiedType, setCopiedType] = useState<'vpa' | 'link' | null>(null);
  const [hasConfirmedHighRisk, setHasConfirmedHighRisk] = useState(false);
  const [hasConfirmedVerify, setHasConfirmedVerify] = useState(false);
  const [launchedToast, setLaunchedToast] = useState(false);

  if (!isOpen) return null;

  const isHighRisk = check.riskLevel === 'HIGH RISK' || check.stopDecision;
  const isModerate = check.riskLevel === 'MODERATE';
  const isSafe = !isHighRisk && !isModerate;

  const upiUri = generateUpiPayUri({
    recipient: check.recipient,
    amount: check.amount,
    note: check.note,
  });

  const handleCopy = async (type: 'vpa' | 'link') => {
    const textToCopy = type === 'vpa' ? check.recipient : upiUri;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleLaunchUpi = () => {
    if (isHighRisk && !hasConfirmedHighRisk) return;
    if (isModerate && !hasConfirmedVerify) return;

    try {
      window.location.href = upiUri;
      setLaunchedToast(true);
      setTimeout(() => setLaunchedToast(false), 4000);
    } catch (err) {
      console.warn('Failed to launch UPI URL directly:', err);
    }
  };

  const isProceedDisabled = (isHighRisk && !hasConfirmedHighRisk) || (isModerate && !hasConfirmedVerify);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proceed-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg flex items-center justify-center ${
                isSafe
                  ? 'bg-[#abd600]/15 text-[#abd600]'
                  : isModerate
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSafe ? 'check_circle' : isModerate ? 'gpp_maybe' : 'gpp_bad'}
              </span>
            </div>
            <div>
              <h3 id="proceed-modal-title" className="text-base font-bold text-[#e5e2e1] font-['Inter']">
                Proceed with Payment
              </h3>
              <span className="text-[11px] text-[#c4c9ac] font-mono-data">
                UPI Standard Payment Transfer
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Payment Details Card */}
          <div className="bg-[#1A1A1A] border border-[#2e2e2e] rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#c4c9ac] uppercase font-bold tracking-wider font-mono-data">
                Amount to Send
              </span>
              <span className="text-xl font-bold text-[#abd600] font-mono-data">
                ₹{check.amount.toLocaleString()}
              </span>
            </div>

            <div className="h-px bg-[#2a2a2a]" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#c4c9ac]">Recipient VPA:</span>
              <div className="flex items-center gap-1.5 font-mono-data text-[#e5e2e1] font-medium">
                <span className="truncate max-w-[200px]">{check.recipient}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('vpa')}
                  title="Copy UPI ID"
                  className="text-[#abd600] hover:text-white p-1 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedType === 'vpa' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>

            {check.note && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#c4c9ac]">Note / Purpose:</span>
                <span className="text-[#e5e2e1] truncate max-w-[220px]">{check.note}</span>
              </div>
            )}
          </div>

          {/* RISK LEVEL CONTEXT BANNER */}
          {isHighRisk ? (
            <div className="bg-[#260c0f] border border-[#ffb4ab]/40 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#ffb4ab] font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>CRITICAL FRAUD WARNING (STOP DECISION)</span>
              </div>
              <p className="text-[11px] text-[#ffdad5] leading-relaxed">
                Q-NETRA flagged elevated risk indicators (mule link or coercion signatures) for this recipient. Proceeding may result in irreversible fund loss.
              </p>
              <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConfirmedHighRisk}
                  onChange={(e) => setHasConfirmedHighRisk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#180709] border-[#ffb4ab]/50 accent-[#ffb4ab] cursor-pointer"
                />
                <span className="text-xs text-[#ffb4ab] font-medium leading-tight">
                  I understand the high-risk alert and explicitly choose to proceed anyway.
                </span>
              </label>
            </div>
          ) : isModerate ? (
            <div className="bg-[#241a08] border border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                <span>VERIFICATION RECOMMENDED</span>
              </div>
              <p className="text-[11px] text-amber-200 leading-relaxed">
                This recipient has limited historical transaction depth. Please independently confirm their identity before paying.
              </p>
              <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConfirmedVerify}
                  onChange={(e) => setHasConfirmedVerify(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#181105] border-amber-500/50 accent-amber-400 cursor-pointer"
                />
                <span className="text-xs text-amber-300 font-medium leading-tight">
                  I have verified the recipient and want to proceed with payment.
                </span>
              </label>
            </div>
          ) : (
            <div className="bg-[#121f08] border border-[#abd600]/40 rounded-xl p-3 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#abd600] text-[20px] shrink-0">
                verified
              </span>
              <p className="text-xs text-[#ddff88] leading-tight font-medium">
                No significant risk detected. Ready to launch UPI application.
              </p>
            </div>
          )}

          {/* Quick UPI App Selector Pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#c4c9ac] uppercase font-bold tracking-wider font-mono-data">
              Select UPI Handler / App:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_UPI_APPS.map((app) => (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedAppId === app.id
                      ? 'bg-[#253215] border-[#abd600] text-[#abd600] shadow-[0_0_10px_rgba(171,214,0,0.2)]'
                      : 'bg-[#1a1a1a] border-[#2e2e2e] text-[#c4c9ac] hover:bg-[#242424] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5" style={{ color: app.color }}>
                    {app.icon}
                  </span>
                  <span className="text-[11px] font-semibold truncate w-full">{app.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toast / Status Banner */}
          {copiedType && (
            <div className="bg-[#1e2f0d] border border-[#abd600]/40 text-[#abd600] px-3 py-2 rounded-lg text-xs font-mono-data flex items-center justify-center gap-1.5 animate-pulse">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{copiedType === 'vpa' ? 'UPI ID (VPA) copied!' : 'UPI Payment Link copied!'}</span>
            </div>
          )}

          {launchedToast && (
            <div className="bg-[#1e2f0d] border border-[#abd600]/40 text-[#abd600] px-3 py-2 rounded-lg text-xs font-mono-data flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Launching UPI application... If it doesn't open, copy the VPA below.</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            id="btn-launch-upi-intent"
            type="button"
            onClick={handleLaunchUpi}
            disabled={isProceedDisabled}
            className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide transition-all cursor-pointer ${
              isProceedDisabled
                ? 'bg-[#222] text-[#666] border border-[#333] cursor-not-allowed opacity-60'
                : isHighRisk
                ? 'bg-[#93000a] hover:bg-[#b3141f] text-[#ffdad5] border border-[#ffb4ab]/40 shadow-[0_0_15px_rgba(147,0,10,0.4)]'
                : isModerate
                ? 'bg-amber-600 hover:bg-amber-500 text-black border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[#CCFF00] hover:bg-[#d8ff33] text-[#0A0A0A] shadow-[0_0_20px_rgba(204,255,0,0.35)]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isHighRisk ? 'warning' : 'open_in_new'}
            </span>
            <span>
              {isHighRisk
                ? 'Override & Open UPI App'
                : isModerate
                ? 'Proceed to Pay via UPI'
                : `Proceed to Pay (₹${check.amount.toLocaleString()})`}
            </span>
          </button>

          {/* Copy Actions Footnote */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => handleCopy('vpa')}
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-xs text-[#c4c9ac] hover:text-[#abd600] border border-[#2e2e2e] flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-mono-data"
            >
              <span className="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Copy UPI ID</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy('link')}
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-xs text-[#c4c9ac] hover:text-[#abd600] border border-[#2e2e2e] flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-mono-data"
            >
              <span className="material-symbols-outlined text-[15px]">link</span>
              <span>Copy UPI Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
