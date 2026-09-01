import React from 'react';
import { PaymentCheck, ScreenType } from '../types';

interface TrustChainScreenProps {
  check: PaymentCheck;
  onNavigate: (screen: ScreenType) => void;
  onViewNetwork: () => void;
}

export const TrustChainScreen: React.FC<TrustChainScreenProps> = ({
  check,
  onNavigate,
  onViewNetwork
}) => {
  const isHighRisk = check.riskLevel === 'HIGH RISK' || check.stopDecision;
  const [expandedStep, setExpandedStep] = React.useState<number | null>(null);

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  const steps = [
    {
      num: '01',
      stage: 'PAYMENT CONTEXT',
      question: 'What are they asking me to do?',
      status: check.localContext?.payment_pressure
        ? 'Payment pressure detected'
        : isHighRisk
        ? 'Payment pressure detected'
        : 'Standard organic request',
      level: isHighRisk ? 'error' : 'safe',
      icon: isHighRisk ? 'warning' : 'check_circle',
      evidence: check.trustChain[0]?.detail || 'On-device AI detected urgency and coercive payment intent.'
    },
    {
      num: '02',
      stage: 'RECIPIENT IDENTITY',
      question: 'Who is receiving the money?',
      status: isHighRisk
        ? `Elevated risk indicators (${check.recipient})`
        : check.riskLevel === 'MODERATE'
        ? `Unverified handle (${check.recipient})`
        : `Verified recipient (${check.recipient})`,
      level: isHighRisk ? 'error' : check.riskLevel === 'MODERATE' ? 'warning' : 'safe',
      icon: 'person',
      evidence: check.trustChain[1]?.detail || 'VPA handle reputation and merchant KYC verification status.'
    },
    {
      num: '03',
      stage: 'NETWORK TRAIL',
      question: 'What is behind that recipient?',
      status: isHighRisk
        ? `${check.connectedEntities || 7} connected entities (3 mule hops)`
        : check.riskLevel === 'MODERATE'
        ? `${check.connectedEntities || 4} connected entities (shallow trust)`
        : `${check.connectedEntities || 2} connected entity (Primary Bank)`,
      level: isHighRisk ? 'error' : check.riskLevel === 'MODERATE' ? 'warning' : 'safe',
      icon: 'hub',
      evidence: check.trustChain[2]?.detail || 'Multi-hop graph topology and account clearing routes.'
    },
    {
      num: '04',
      stage: 'STORY CORRELATION',
      question: 'Does the story match the money trail?',
      status: isHighRisk
        ? 'INCONSISTENT (Story contradicts trail)'
        : check.riskLevel === 'MODERATE'
        ? 'INTENT UNVERIFIED (Insufficient evidence)'
        : 'TRAIL ALIGNED (Story matches entity KYC)',
      level: isHighRisk ? 'error' : check.riskLevel === 'MODERATE' ? 'warning' : 'safe',
      icon: 'compare_arrows',
      evidence: check.storyCorrelation?.explanation || 'Correlation synthesis between claimed purpose and financial clearing route.'
    },
    {
      num: '05',
      stage: 'DECISION',
      question: 'What should the user do?',
      status: isHighRisk
        ? 'STOP — Do not proceed'
        : check.riskLevel === 'MODERATE'
        ? 'VERIFY — Additional check recommended'
        : 'PROCEED — No significant risk indicators',
      level: isHighRisk ? 'error' : check.riskLevel === 'MODERATE' ? 'warning' : 'safe',
      icon: isHighRisk ? 'block' : check.riskLevel === 'MODERATE' ? 'gpp_maybe' : 'check_circle',
      evidence: check.stopReason
    }
  ];

  return (
    <main className="flex-grow p-4 md:p-6 max-w-2xl mx-auto w-full pb-28">
      {/* Top Navigation & Title */}
      <div className="mb-4">
        <button
          onClick={() => onNavigate('check-result')}
          className="flex items-center gap-1 text-xs text-[#c4c9ac] hover:text-[#abd600] transition-colors mb-3 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Decision</span>
        </button>
        <div className="inline-flex items-center gap-1.5 bg-[#1C1C1C] border border-[#333333] px-2.5 py-0.5 rounded-full mb-1.5">
          <span className="text-[10px] font-bold text-[#abd600] uppercase tracking-wider font-mono-data">
            STORY → PERSON → TRAIL → DECISION
          </span>
        </div>
        <h2 className="text-[24px] sm:text-[26px] font-bold text-[#e5e2e1] font-['Inter']">
          Evidence Timeline
        </h2>
        <p className="text-[13px] text-[#c4c9ac] mt-0.5">
          Step-by-step reasoning cascade from on-device context to network correlation.
        </p>
      </div>

      {/* Vertical Stepper / Evidence Timeline */}
      <div className="relative pl-7 space-y-3 before:absolute before:inset-y-3 before:left-[11px] before:w-[2px] before:bg-[#2e2e2e]">
        {steps.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          const isError = step.level === 'error';
          const isWarning = step.level === 'warning';

          return (
            <div key={idx} className="relative flex items-start group">
              {/* Step indicator node */}
              <div className={`absolute left-[-28px] top-3 flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#0A0A0A] z-10 transition-colors ${
                isError ? 'bg-[#93000a] text-[#ffb4ab]' : isWarning ? 'bg-amber-600 text-amber-100' : 'bg-[#1e2f0d] text-[#abd600]'
              }`}>
                <span className="material-symbols-outlined text-[13px]">
                  {step.icon}
                </span>
              </div>

              {/* Tappable Step Card */}
              <div
                onClick={() => toggleStep(idx)}
                className={`bg-[#161616] border rounded-xl p-3.5 w-full transition-all cursor-pointer ${
                  isExpanded ? 'border-[#abd600]/60 bg-[#1A1A1A]' : 'border-[#2c2c2c] hover:border-[#444]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-data font-bold text-[#abd600] px-1.5 py-0.5 bg-[#222] rounded">
                      {step.num}
                    </span>
                    <h3 className="text-[14px] font-bold text-[#e5e2e1] font-['Inter'] uppercase tracking-wide">
                      {step.stage}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#c4c9ac] transition-transform">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                <p className="text-[11px] text-[#c4c9ac] mt-0.5 mb-1.5 font-['Inter']">
                  {step.question}
                </p>

                <p className={`text-[13px] font-mono-data font-semibold leading-tight ${
                  isError ? 'text-[#ffb4ab]' : isWarning ? 'text-amber-400' : 'text-[#abd600]'
                }`}>
                  {step.status}
                </p>

                {/* Expanded underlying evidence */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#2a2a2a] text-xs font-mono-data text-[#c4c9ac] leading-relaxed bg-[#101010] p-2.5 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#abd600] block mb-1">
                      Underlying Evidence:
                    </span>
                    {step.evidence}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onViewNetwork}
          className="flex-1 bg-[#242424] hover:bg-[#333333] text-[#abd600] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#333333] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>EXPLORE RISKGRAPH</span>
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#e5e2e1] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#2a2a2a] transition-colors cursor-pointer"
        >
          <span>RETURN HOME</span>
        </button>
      </div>
    </main>
  );
};
