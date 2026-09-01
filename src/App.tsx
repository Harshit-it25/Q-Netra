import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { CheckResultScreen } from './components/CheckResultScreen';
import { TrustChainScreen } from './components/TrustChainScreen';
import { NetworkGraphScreen } from './components/NetworkGraphScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { QrScannerModal } from './components/QrScannerModal';
import { CheckMessageModal } from './components/CheckMessageModal';
import { EnterPaymentModal } from './components/EnterPaymentModal';
import { AskQNetraModal } from './components/AskQNetraModal';
import { PaymentCheck, ScreenType, LocalPaymentContext } from './types';
import { classifyPaymentContextLocally } from './lib/onDeviceAI';
import { paymentApi } from './services/api/paymentApi';
import {
  loadPaymentHistory,
  savePaymentHistory,
  deletePaymentById,
  resetPaymentHistory
} from './lib/paymentHistory';
import { LanguageProvider } from './services/i18n/LanguageContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Q-NETRA Application Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ff5449]/10 border border-[#ff5449]/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#ff5449] text-3xl">warning</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Q-NETRA Shield Initializing</h1>
          <p className="text-sm text-[#8E919A] max-w-md mb-6">
            An unexpected render issue occurred. Click reload to reinitialize the on-device safety engine.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#c3f400] text-[#161e00] font-semibold rounded-xl text-sm shadow-lg hover:bg-[#b2df00] transition"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [checks, setChecks] = useState<PaymentCheck[]>(() => loadPaymentHistory());
  const [selectedCheck, setSelectedCheck] = useState<PaymentCheck | null>(() => {
    const loaded = loadPaymentHistory();
    return loaded.length > 0 ? loaded[0] : null;
  });

  // Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckMessageOpen, setIsCheckMessageOpen] = useState(false);
  const [isEnterPaymentOpen, setIsEnterPaymentOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    savePaymentHistory(checks);
  }, [checks]);

  const handleSelectCheck = (check: PaymentCheck) => {
    setSelectedCheck(check);
    setCurrentScreen('check-result');
  };

  const handlePaymentAnalysis = async (recipient: string, amount: number, note?: string) => {
    setIsAnalyzing(true);
    
    // Step 1: Real on-device AI context classification (Runs immediately on the client)
    const rawContextText = [note, recipient].filter(Boolean).join(' ');
    const localContext: LocalPaymentContext = classifyPaymentContextLocally(rawContextText);

    try {
      // Step 2: Transmit structured context + recipient to backend
      const data = await paymentApi.analyzePayment({
        recipient,
        amount,
        note,
        context: localContext
      });

      if (data.success) {
        const newCheck: PaymentCheck = {
          id: `chk-${Date.now()}`,
          recipient: data.recipient,
          amount: data.amount,
          date: 'Just now',
          timestamp: Date.now(),
          riskLevel: data.riskLevel,
          stopDecision: data.stopDecision,
          headline: data.headline,
          stopReason: data.stopReason,
          connectedEntities: data.connectedEntities,
          elevatedRiskConnections: data.elevatedRiskConnections,
          riskTags: data.riskTags,
          note,
          localContext: data.localContext || localContext,
          trustChain: data.trustChain,
          aiExplanation: data.aiExplanation
        };

        setChecks((prev) => [newCheck, ...prev]);
        setSelectedCheck(newCheck);
        setCurrentScreen('check-result');
      } else {
        createFallbackCheck(recipient, amount, note, localContext);
      }
    } catch {
      createFallbackCheck(recipient, amount, note, localContext);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeletePayment = (id: string) => {
    const result = deletePaymentById(id);
    setChecks(result.remainingChecks);
    if (selectedCheck?.id === id) {
      setSelectedCheck(result.remainingChecks.length > 0 ? result.remainingChecks[0] : null);
      setCurrentScreen('home');
    }
  };

  const handleResetDemoState = () => {
    const restored = resetPaymentHistory();
    setChecks(restored);
    setSelectedCheck(restored[0]);
    setCurrentScreen('home');
  };

  const createFallbackCheck = (recipient: string, amount: number, note?: string, localCtx?: LocalPaymentContext) => {
    const localContext = localCtx || classifyPaymentContextLocally([note, recipient].filter(Boolean).join(' '));
    const isHigh =
      recipient.toLowerCase().includes('abc') ||
      recipient.toLowerCase().includes('refund') ||
      recipient.toLowerCase().includes('lottery') ||
      recipient.toLowerCase().includes('disconnection') ||
      amount >= 20000 ||
      localContext.payment_pressure ||
      localContext.authority_claim;

    // FAIL-SAFE PRINCIPLE: Never show SAFE merely because backend was unreachable.
    const riskLevel: 'HIGH RISK' | 'MODERATE' = isHigh ? 'HIGH RISK' : 'MODERATE';
    const stopDecision = isHigh;

    const newCheck: PaymentCheck = {
      id: `chk-${Date.now()}`,
      recipient,
      amount,
      date: 'Just now (Offline Mode)',
      timestamp: Date.now(),
      riskLevel,
      stopDecision,
      headline: isHigh
        ? "The payment looks normal. The network behind it doesn't."
        : "Recipient / network verification unavailable (Offline Mode)",
      stopReason: isHigh
        ? 'Transaction halted based on on-device threat classification.'
        : 'Network verification unavailable. Local AI analyzed context on-device, but cloud risk graph could not be queried. Verify recipient before sending funds.',
      connectedEntities: isHigh ? 7 : 0,
      elevatedRiskConnections: isHigh ? 3 : 0,
      riskTags: isHigh
        ? ['Payment pressure detected (Local AI)', 'Threat Pattern Flagged', 'Offline Guard Active']
        : ['Offline Fallback', 'Network Check Unavailable', 'Unverified Counterparty'],
      note,
      localContext,
      trustChain: [
        {
          stage: 'Payment Request',
          status: isHigh ? 'Payment pressure detected' : 'Standard organic request',
          level: isHigh ? 'error' : 'safe',
          icon: isHigh ? 'warning' : 'check_circle',
          detail: `On-Device AI (${localContext.inference_engine}, ${localContext.latency_ms}ms): ${
            localContext.payment_pressure
              ? `Threat indicators: ${localContext.threat_indicators.join(', ') || 'Pressure detected'}`
              : 'Clean organic transaction intent verified on-device.'
          }`
        },
        {
          stage: 'Recipient',
          status: recipient,
          level: 'warning',
          icon: 'person',
          detail: 'Recipient network verification unavailable (Device is offline or backend unreachable).'
        },
        {
          stage: 'Network',
          status: 'Network verification unavailable',
          level: 'warning',
          icon: 'hub',
          detail: 'Cloud Graph Neural Engine could not be reached. Local fail-safe mode active.'
        },
        {
          stage: 'Risk Pattern',
          status: isHigh ? 'Suspicious pattern detected locally' : 'Unverified offline baseline',
          level: isHigh ? 'error' : 'warning',
          icon: isHigh ? 'pattern' : 'help',
          detail: isHigh
            ? 'On-device classifier flagged coercive or phishing signatures.'
            : 'Caution: Offline checks cannot confirm historical counterparties or mule links.'
        }
      ]
    };

    setChecks((prev) => [newCheck, ...prev]);
    setSelectedCheck(newCheck);
    setCurrentScreen('check-result');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col selection:bg-[#c3f400] selection:text-[#161e00] font-['Inter'] relative">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenMenu={() => setIsAskAiOpen(true)}
      />

      {/* Screen Views */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen
            recentChecks={checks}
            onSelectCheck={handleSelectCheck}
            onNavigate={setCurrentScreen}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenCheckMessage={() => setIsCheckMessageOpen(true)}
            onOpenEnterPayment={() => setIsEnterPaymentOpen(true)}
            onOpenAskAi={() => setIsAskAiOpen(true)}
            onDeletePayment={handleDeletePayment}
            onResetDemo={handleResetDemoState}
          />
        )}

        {currentScreen === 'check-result' && (
          <CheckResultScreen
            check={selectedCheck || checks[0]}
            onViewTrustChain={() => setCurrentScreen('trust-chain')}
            onViewNetwork={() => setCurrentScreen('network')}
            onOpenAskAi={() => setIsAskAiOpen(true)}
          />
        )}

        {currentScreen === 'trust-chain' && (
          <TrustChainScreen
            check={selectedCheck || checks[0]}
            onNavigate={setCurrentScreen}
            onViewNetwork={() => setCurrentScreen('network')}
          />
        )}

        {currentScreen === 'network' && (
          <NetworkGraphScreen
            check={selectedCheck || checks[0]}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onNavigate={setCurrentScreen}
            onResetDemo={handleResetDemoState}
          />
        )}
      </div>

      {/* Persistent Bottom Nav Bar */}
      <BottomNavBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Interactive Modals */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handlePaymentAnalysis}
      />

      <CheckMessageModal
        isOpen={isCheckMessageOpen}
        onClose={() => setIsCheckMessageOpen(false)}
        onCorrelatePayment={handlePaymentAnalysis}
      />

      <EnterPaymentModal
        isOpen={isEnterPaymentOpen}
        onClose={() => setIsEnterPaymentOpen(false)}
        onSubmit={handlePaymentAnalysis}
      />

      <AskQNetraModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        activeCheck={selectedCheck || checks[0]}
      />

      {/* Fullscreen Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(171,214,0,0.15)] border border-[#abd600]/40 flex items-center justify-center text-[#abd600] animate-pulse mb-4">
            <span className="material-symbols-outlined text-[32px] animate-spin">sync</span>
          </div>
          <h3 className="text-lg font-bold text-[#e5e2e1]">Q-NETRA AI Neural Scan</h3>
          <p className="text-xs text-[#c4c9ac] font-mono-data mt-1">
            Analyzing multi-hop money laundering risk & trust chain...
          </p>
        </div>
      )}
    </div>
  );
}
