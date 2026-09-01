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
import { DeviceBenchmarkModal } from './components/DeviceBenchmarkModal';
import { OfflineDiagnosticsModal } from './components/OfflineDiagnosticsModal';
import { PaymentCheck, ScreenType, LocalPaymentContext } from './types';
import { classifyPaymentContextLocally, classifyPaymentContextLocallyAsync } from './lib/onDeviceAI';
import { evaluatePaymentRiskLocally } from './services/payment/clientRiskEvaluator';
import { modelLoader } from './services/localAI/modelLoader';
import { networkTracker } from './services/network/networkActivityTracker';
import {
  loadPaymentHistory,
  savePaymentHistory,
  deletePaymentById,
  resetPaymentHistory
} from './lib/paymentHistory';
import { LanguageProvider } from './services/i18n/LanguageContext';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isOfflineDiagOpen, setIsOfflineDiagOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    networkTracker.init();
    modelLoader.initialize().catch(console.warn);
  }, []);

  useEffect(() => {
    savePaymentHistory(checks);
  }, [checks]);

  const handleSelectCheck = (check: PaymentCheck) => {
    setSelectedCheck(check);
    setCurrentScreen('check-result');
  };

  /**
   * 100% On-Device Payment Risk Evaluation Pipeline (Zero Server Dependency)
   * Executes local context analysis (MobileBERT INT8) -> Feature engine -> RiskGraph -> 5-stage Trust Chain
   */
  const handlePaymentAnalysis = async (recipient: string, amount: number, note?: string) => {
    setIsAnalyzing(true);
    
    // Step 1: Real on-device AI context classification (MobileBERT INT8 or Heuristic fallback)
    const rawContextText = [note, recipient].filter(Boolean).join(' ');
    let localContext: LocalPaymentContext;
    try {
      localContext = await classifyPaymentContextLocallyAsync(rawContextText);
    } catch {
      localContext = classifyPaymentContextLocally(rawContextText);
    }

    // Step 2: 100% On-Device Risk Engine & Trust Chain Synthesis using current + historical local signals
    const newCheck = evaluatePaymentRiskLocally(recipient, amount, note, localContext, checks);

    setChecks((prev) => [newCheck, ...prev]);
    setSelectedCheck(newCheck);
    setCurrentScreen('check-result');
    setIsAnalyzing(false);
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col selection:bg-[#c3f400] selection:text-[#161e00] font-['Inter'] relative">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenMenu={() => setIsAskAiOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenOfflineDiagnostics={() => setIsOfflineDiagOpen(true)}
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
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
            onOpenOfflineDiagnostics={() => setIsOfflineDiagOpen(true)}
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

      <DeviceBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <OfflineDiagnosticsModal
        isOpen={isOfflineDiagOpen}
        onClose={() => setIsOfflineDiagOpen(false)}
      />

      {/* Fullscreen Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(171,214,0,0.15)] border border-[#abd600]/40 flex items-center justify-center text-[#abd600] animate-pulse mb-4">
            <span className="material-symbols-outlined text-[32px] animate-spin">sync</span>
          </div>
          <h3 className="text-lg font-bold text-[#e5e2e1]">Q-NETRA AI On-Device Scan</h3>
          <p className="text-xs text-[#c4c9ac] font-mono-data mt-1">
            Analyzing multi-hop money laundering risk & trust chain locally...
          </p>
        </div>
      )}
    </div>
  );
}
