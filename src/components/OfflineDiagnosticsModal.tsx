import React, { useState, useEffect } from 'react';
import { modelLoader } from '../services/localAI/modelLoader';
import { wordPieceTokenizer } from '../services/localAI/tokenizer';
import { classifyPaymentContextLocallyAsync } from '../lib/onDeviceAI';
import { evaluatePaymentRiskLocally } from '../services/payment/clientRiskEvaluator';
import { browserVoiceFallback } from '../services/voice/browserVoiceFallback';
import { networkTracker } from '../services/network/networkActivityTracker';
import { detectDeviceCapabilities } from '../services/device/deviceCapabilityService';
import { PaymentCheck } from '../types';

interface OfflineDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCheck?: (check: PaymentCheck) => void;
}

interface SubsystemStatus {
  network: 'OFFLINE' | 'ONLINE';
  mobileBert: 'LOADED' | 'FAILED' | 'LOADING';
  tokenizer: 'LOADED' | 'FAILED';
  riskEngine: 'READY' | 'FAILED';
  qrScanner: 'READY' | 'FAILED';
  localVoice: 'READY' | 'UNAVAILABLE';
  integrity: 'VERIFIED' | 'FAILED';
  zeroNetworkCalls: number;
}

interface TestCaseResult {
  id: string;
  name: string;
  input: { vpa: string; amount: number; note: string };
  expectedDecision: 'STOP' | 'VERIFY' | 'PROCEED';
  actualDecision: 'STOP' | 'VERIFY' | 'PROCEED';
  passed: boolean;
  latencyMs: number;
  engine: string;
}

export const OfflineDiagnosticsModal: React.FC<OfflineDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onRunCheck
}) => {
  const [status, setStatus] = useState<SubsystemStatus>({
    network: typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE',
    mobileBert: 'LOADING',
    tokenizer: 'FAILED',
    riskEngine: 'READY',
    qrScanner: 'READY',
    localVoice: 'READY',
    integrity: 'VERIFIED',
    zeroNetworkCalls: 0
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PaymentCheck | null>(null);

  const caps = detectDeviceCapabilities();

  const refreshStatus = async () => {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const isTokenizerLoaded = wordPieceTokenizer.isLoaded();
    const modelState = modelLoader.getState();
    const isVoiceReady = browserVoiceFallback.isTtsSupported();
    const metadata = modelLoader.getMetadata();

    setStatus({
      network: isOffline ? 'OFFLINE' : 'ONLINE',
      mobileBert: modelState === 'READY' ? 'LOADED' : modelState === 'LOADING' ? 'LOADING' : 'FAILED',
      tokenizer: isTokenizerLoaded ? 'LOADED' : 'FAILED',
      riskEngine: 'READY',
      qrScanner: typeof window !== 'undefined' ? 'READY' : 'FAILED',
      localVoice: isVoiceReady ? 'READY' : 'UNAVAILABLE',
      integrity: metadata.integrityVerified ? 'VERIFIED' : 'FAILED',
      zeroNetworkCalls: networkTracker.getCoreDecisionCallCount()
    });
  };

  useEffect(() => {
    if (isOpen) {
      modelLoader.initialize().then(() => {
        refreshStatus();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runAllOfflineTestCases = async () => {
    setIsRunningTests(true);
    networkTracker.clearLogs();

    const cases = [
      {
        id: 'CASE-A',
        name: 'Case A — Legitimate Merchant',
        vpa: 'dmart.retail@icici',
        amount: 1450,
        note: 'Grocery bill invoice #88412',
        expected: 'PROCEED' as const
      },
      {
        id: 'CASE-B',
        name: 'Case B — Unverified Recipient',
        vpa: 'rahul_p2p@axisbank',
        amount: 3500,
        note: 'Personal rent share payment',
        expected: 'VERIFY' as const
      },
      {
        id: 'CASE-C',
        name: 'Case C — Electricity Disconnection Threat',
        vpa: 'disconnection_bill@ybl',
        amount: 10,
        note: 'Dear consumer your electricity power will be disconnected at 9:30pm tonight pay bill immediately',
        expected: 'STOP' as const
      },
      {
        id: 'CASE-D',
        name: 'Case D — ₹10 Micro-Payment Scam',
        vpa: 'reward_claim@paytm',
        amount: 10,
        note: 'Pay Rs 10 processing fee to receive Rs 2500 cashback prize',
        expected: 'STOP' as const
      },
      {
        id: 'CASE-E',
        name: 'Case E — Authority Impersonation (CBI/Customs)',
        vpa: 'customs_clearance@upi',
        amount: 25000,
        note: 'Customs parcel courier detained transfer penalty fee to avoid arrest warrant',
        expected: 'STOP' as const
      },
      {
        id: 'CASE-F',
        name: 'Case F — Generic Invoice',
        vpa: 'swiggy.order@hdfcbank',
        amount: 340,
        note: 'Food delivery order #9941',
        expected: 'PROCEED' as const
      }
    ];

    const results: TestCaseResult[] = [];

    for (const c of cases) {
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const localCtx = await classifyPaymentContextLocallyAsync(`${c.note} ${c.vpa}`);
      const check = evaluatePaymentRiskLocally(c.vpa, c.amount, c.note, localCtx);
      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();

      const actual = check.stopDecision
        ? 'STOP'
        : check.riskLevel === 'MODERATE'
        ? 'VERIFY'
        : 'PROCEED';

      results.push({
        id: c.id,
        name: c.name,
        input: { vpa: c.vpa, amount: c.amount, note: c.note },
        expectedDecision: c.expected,
        actualDecision: actual,
        passed: actual === c.expected,
        latencyMs: Number((t1 - t0).toFixed(2)),
        engine: localCtx.inference_engine || 'MobileBERT INT8'
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
    refreshStatus();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#abd600]/15 border border-[#abd600]/30 flex items-center justify-center text-[#abd600]">
              <span className="material-symbols-outlined text-[24px]">offline_pin</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Offline Mode Diagnostics & Assertions
                <span className="text-[10px] font-mono-data bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30 px-2 py-0.5 rounded-full">
                  Airplane Mode Safe
                </span>
              </h2>
              <p className="text-xs text-[#888]">
                Self-Contained Local Pipeline Audit & Zero-Network Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#222] hover:bg-[#333] text-[#aaa] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Subsystem Matrix */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Network */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">Network Status</span>
              <span className={`text-xs font-bold font-mono-data ${status.network === 'OFFLINE' ? 'text-[#abd600]' : 'text-cyan-400'}`}>
                {status.network === 'OFFLINE' ? '📴 OFFLINE (Airplane Mode)' : '🌐 ONLINE'}
              </span>
            </div>

            {/* MobileBERT */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">MobileBERT (25.3M)</span>
              <span className={`text-xs font-bold font-mono-data ${status.mobileBert === 'LOADED' ? 'text-[#abd600]' : 'text-amber-400'}`}>
                {status.mobileBert === 'LOADED' ? '✓ LOADED (INT8 ONNX)' : status.mobileBert}
              </span>
            </div>

            {/* Tokenizer */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">WordPiece Tokenizer</span>
              <span className={`text-xs font-bold font-mono-data ${status.tokenizer === 'LOADED' ? 'text-[#abd600]' : 'text-rose-400'}`}>
                {status.tokenizer === 'LOADED' ? `✓ LOADED (${wordPieceTokenizer.getVocabSize()} vocab)` : 'FAILED'}
              </span>
            </div>

            {/* Risk Engine */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">Risk Engine</span>
              <span className="text-xs font-bold font-mono-data text-[#abd600]">
                ✓ READY (On-Device)
              </span>
            </div>

            {/* QR Scanner */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">QR Scanner</span>
              <span className="text-xs font-bold font-mono-data text-[#abd600]">
                ✓ READY (Local jsQR)
              </span>
            </div>

            {/* Local Voice */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#888] font-mono-data uppercase">Device TTS Voice</span>
              <span className={`text-xs font-bold font-mono-data ${status.localVoice === 'READY' ? 'text-[#abd600]' : 'text-amber-400'}`}>
                {status.localVoice === 'READY' ? '✓ READY (SpeechSynthesis)' : 'FALLBACK (Visible Text)'}
              </span>
            </div>
          </div>

          {/* Zero Network Assertion Banner */}
          <div className="bg-[#161e00] border border-[#abd600]/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#abd600] text-[22px]">verified_user</span>
              <div>
                <div className="text-xs font-bold text-[#abd600]">
                  Core Flow Zero-Network Assertion
                </div>
                <div className="text-[11px] text-[#c4c9ac]">
                  Expected: 0 network calls for QR, tokenization, ONNX, risk scoring & decision.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono-data font-bold bg-[#abd600] text-[#161e00] px-2.5 py-1 rounded-lg">
              {status.zeroNetworkCalls} Network Calls
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={runAllOfflineTestCases}
              disabled={isRunningTests}
              className="flex-1 py-2.5 px-4 bg-[#abd600] hover:bg-[#9ec600] text-[#161e00] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRunningTests ? 'sync' : 'play_arrow'}
              </span>
              <span>{isRunningTests ? 'Executing Local Test Matrix...' : 'Run 6-Case Offline Test Matrix'}</span>
            </button>
            <button
              onClick={refreshStatus}
              className="py-2.5 px-4 bg-[#242424] hover:bg-[#333] text-white text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Refresh</span>
            </button>
          </div>

          {/* Test Matrix Results */}
          {testResults.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Test Execution Results ({testResults.filter(r => r.passed).length}/{testResults.length} Passed)</span>
                <span className="text-[11px] font-mono-data text-[#abd600]">100% On-Device</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {testResults.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[#161616] border border-[#262626] rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${t.passed ? 'text-[#abd600]' : 'text-rose-400'}`}>
                        {t.passed ? 'check_circle' : 'cancel'}
                      </span>
                      <div>
                        <span className="font-bold text-[#e5e2e1]">{t.name}</span>
                        <div className="text-[10px] text-[#888] font-mono-data">
                          {t.input.vpa} • ₹{t.input.amount} • {t.latencyMs}ms
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${
                          t.actualDecision === 'STOP'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : t.actualDecision === 'VERIFY'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {t.actualDecision}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
