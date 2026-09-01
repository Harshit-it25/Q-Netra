import React, { useState, useEffect } from 'react';
import { NETWORK_GRAPH_DATA } from '../data';
import { NetworkNode, NetworkLink, PaymentCheck, ScreenType } from '../types';
import { networkApi } from '../services/api/networkApi';

interface NetworkGraphScreenProps {
  check?: PaymentCheck;
  onNavigate: (screen: ScreenType) => void;
}

export const NetworkGraphScreen: React.FC<NetworkGraphScreenProps> = ({ check, onNavigate }) => {
  const [nodes, setNodes] = useState<NetworkNode[]>(NETWORK_GRAPH_DATA.nodes);
  const [links, setLinks] = useState<NetworkLink[]>(NETWORK_GRAPH_DATA.links);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(NETWORK_GRAPH_DATA.nodes[0]);
  const [simulatingFlow, setSimulatingFlow] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!check) return;

    // Fetch dynamic graph for current check target
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await networkApi.getGraph(check.recipient, check.riskLevel);
        if (data.success && data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
          setLinks(data.links);
          setSelectedNode(data.nodes[0]);
        } else {
          // Fallback to local default with updated target label
          const updatedNodes = NETWORK_GRAPH_DATA.nodes.map((n) => 
            n.id === 'target' ? { ...n, label: check.recipient } : n
          );
          setNodes(updatedNodes);
          setLinks(NETWORK_GRAPH_DATA.links);
          setSelectedNode(updatedNodes[0]);
        }
      } catch {
        const updatedNodes = NETWORK_GRAPH_DATA.nodes.map((n) => 
          n.id === 'target' ? { ...n, label: check.recipient } : n
        );
        setNodes(updatedNodes);
        setLinks(NETWORK_GRAPH_DATA.links);
        setSelectedNode(updatedNodes[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [check]);

  const [dossier, setDossier] = useState<any | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const handleOpenDossier = async () => {
    setLoadingDossier(true);
    setIsDossierOpen(true);
    try {
      const targetVpa = selectedNode?.label || check?.recipient || 'abc123@upi';
      const data = await networkApi.getInvestigationDossier(targetVpa);
      if (data.success && data.dossier) {
        setDossier(data.dossier);
      }
    } catch {
      // Offline dossier fallback
      setDossier({
        targetVpa: selectedNode?.label || check?.recipient || 'abc123@upi',
        identifiedSyndicate: 'Mule Ring Alpha (Local Cached Dossier)',
        totalRiskHops: 3,
        flaggedMuleNodes: ['mule_781@axis', 'quick_pay88@sbi'],
        cryptoOffRamp: 'P2P_Exch_Wallet#9 (USDT Escrow)',
        recommendedAction: 'Dial 1930 / Freeze linked IFSC clearing immediately.',
        telemetryTimestamp: new Date().toISOString()
      });
    } finally {
      setLoadingDossier(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col p-4 max-w-4xl mx-auto w-full pb-28">
      {/* Investigative Handoff Banner */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-data bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30 px-2 py-0.5 rounded font-bold uppercase">
            📱 DETECT → 💻 INVESTIGATE
          </span>
          <span className="text-xs text-[#c4c9ac] font-mono-data">
            Mobile stops payment • Desktop traces syndicate topology
          </span>
        </div>
        <button
          onClick={handleOpenDossier}
          className="text-xs px-3 py-1 rounded-lg border bg-[#1E1E1E] hover:bg-[#282828] text-[#abd600] border-[#abd600]/40 font-mono-data flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[15px]">description</span>
          <span>Investigation Summary</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#abd600] text-[22px]">hub</span>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#e5e2e1] font-['Inter']">
              Multi-Hop Fraud Ring Analysis
            </h2>
            <span className="text-[9px] font-mono-data bg-[#222] text-[#abd600] border border-[#abd600]/30 px-2 py-0.5 rounded font-bold uppercase">
              SEEDED DEMO TOPOLOGY
            </span>
          </div>
          <p className="text-[13px] text-[#c4c9ac] mt-0.5">
            {check ? `Relational topology mapped for target ${check.recipient} (Modeled after documented I4C mule clusters)` : 'Relational graph mapping connected entities around target VPA.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatingFlow(!simulatingFlow)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono-data flex items-center gap-1.5 transition-colors cursor-pointer ${
              simulatingFlow
                ? 'bg-[rgba(171,214,0,0.15)] text-[#abd600] border-[#abd600]/40'
                : 'bg-[#242424] text-[#c4c9ac] border-[#333333]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {simulatingFlow ? 'sync' : 'pause'}
            </span>
            <span>{simulatingFlow ? 'Tracing Flow' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Network Canvas / SVG Container */}
      <div className="relative bg-[#131313] border border-[#333333] rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-center justify-center shadow-inner">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#333333_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

        <svg className="w-full h-[380px] sm:h-[420px] relative z-10" viewBox="0 0 640 400">
          <defs>
            <linearGradient id="link-grad-alert" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93000a" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="link-grad-safe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#abd600" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#444933" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links */}
          {links.map((link, idx) => {
            const src = nodes.find((n) => n.id === link.source);
            const tgt = nodes.find((n) => n.id === link.target);
            if (!src || !tgt) return null;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={link.isSuspicious ? '#ffb4ab' : '#abd600'}
                  strokeWidth={link.isSuspicious ? 2.5 : 1.5}
                  strokeDasharray={simulatingFlow ? '6 4' : undefined}
                  className={simulatingFlow ? 'animate-pulse' : ''}
                  opacity={0.65}
                />
                {/* Edge Label */}
                <rect
                  x={midX - 35}
                  y={midY - 9}
                  width="70"
                  height="18"
                  rx="4"
                  fill="#1a1a1a"
                  stroke={link.isSuspicious ? '#ffb4ab' : '#333'}
                  strokeWidth="0.8"
                  opacity="0.9"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  fill={link.isSuspicious ? '#ffb4ab' : '#c4c9ac'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {link.amount}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isTarget = node.type === 'target';
            const isHighRisk = node.risk === 'high';

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-transform hover:scale-105"
                transform={`translate(${node.x}, ${node.y})`}
              >
                {/* Outer halo */}
                {isTarget && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#abd600"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                    opacity="0.7"
                  />
                )}
                {isHighRisk && (
                  <circle
                    r="28"
                    fill="rgba(255, 180, 171, 0.12)"
                    stroke={isSelected ? '#ffb4ab' : 'rgba(255, 180, 171, 0.4)'}
                    strokeWidth={isSelected ? '2' : '1'}
                    className={simulatingFlow ? 'animate-ping' : ''}
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={isTarget ? 24 : 19}
                  fill={isTarget ? '#161e00' : isHighRisk ? '#301014' : '#1c1b1b'}
                  stroke={isTarget ? '#abd600' : isHighRisk ? '#ffb4ab' : '#444933'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />

                {/* Node Icon or Text */}
                <text
                  textAnchor="middle"
                  dy="4.5"
                  fill={isTarget ? '#abd600' : isHighRisk ? '#ffb4ab' : '#e5e2e1'}
                  fontSize={isTarget ? '11' : '9'}
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                >
                  {isTarget ? 'TARGET' : node.type.toUpperCase().slice(0, 4)}
                </text>

                {/* Label under node */}
                <rect
                  x="-55"
                  y={isTarget ? 28 : 22}
                  width="110"
                  height="18"
                  rx="4"
                  fill="#0e0e0e"
                  stroke={isSelected ? '#abd600' : '#2a2a2a'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y={isTarget ? 40 : 34}
                  textAnchor="middle"
                  fill={isSelected ? '#abd600' : '#e5e2e1'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="500"
                >
                  {node.label.length > 15 ? node.label.slice(0, 14) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 border border-[#333333] rounded-lg p-2.5 text-xs text-[#c4c9ac] flex flex-col gap-1.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#abd600] inline-block"></span>
            <span>Target Recipient</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] inline-block"></span>
            <span>Flagged Mule Node</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c8c6c5] inline-block"></span>
            <span>Associated Entity</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="mt-4 bg-[#1A1A1A] border border-[#333333] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedNode.risk === 'high'
                  ? 'bg-[rgba(255,180,171,0.15)] text-[#ffb4ab]'
                  : 'bg-[rgba(171,214,0,0.15)] text-[#abd600]'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {selectedNode.type === 'target'
                  ? 'target'
                  : selectedNode.type === 'exchange'
                  ? 'currency_exchange'
                  : 'device_hub'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[16px] font-bold text-[#e5e2e1] font-mono-data">
                  {selectedNode.label}
                </h4>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedNode.risk === 'high'
                      ? 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30'
                      : 'bg-[rgba(171,214,0,0.15)] text-[#abd600]'
                  }`}
                >
                  Risk Score: {selectedNode.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-[#c4c9ac] mt-0.5">{selectedNode.subtext}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenDossier}
              className="bg-[#242424] hover:bg-[#333333] text-[#abd600] text-xs font-semibold px-3 py-2 rounded-lg border border-[#333333] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">search</span>
              <span>Investigation Summary</span>
            </button>
            <button
              onClick={() => onNavigate('trust-chain')}
              className="bg-[#242424] hover:bg-[#333333] text-[#e5e2e1] hover:text-[#abd600] text-xs font-semibold px-3 py-2 rounded-lg border border-[#333333] transition-colors cursor-pointer"
            >
              Trust Chain
            </button>
          </div>
        </div>
      )}

      {/* INVESTIGATION SUMMARY MODAL (DEMO DATA) */}
      {isDossierOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-lg w-full p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#abd600] text-[22px]">
                  folder_special
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[#e5e2e1]">
                      Investigation Summary
                    </h4>
                    <span className="text-[9px] font-mono-data bg-[#242424] text-[#abd600] px-1.5 py-0.5 rounded border border-[#abd600]/30 font-bold uppercase">
                      Demo Data
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-[#c4c9ac]">
                    Case Ref: {dossier?.caseId || 'Generating...'} (Simulated)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDossierOpen(false)}
                className="text-[#c4c9ac] hover:text-white p-1 rounded-full hover:bg-[#242424]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {loadingDossier ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[32px] text-[#abd600] animate-spin mb-2">
                  sync
                </span>
                <p className="text-xs text-[#c4c9ac]">Synthesizing multi-hop investigation summary...</p>
              </div>
            ) : dossier ? (
              <div className="flex flex-col gap-3 text-xs font-mono-data">
                <div className="bg-[#1C1C1C] p-3 rounded-xl border border-[#2a2a2a] flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#c4c9ac]">Target Identifier:</span>
                    <span className="text-white font-bold">{dossier.targetVpa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c4c9ac]">Entity Classification:</span>
                    <span className="text-[#ffb4ab] font-bold uppercase">{dossier.category} ({dossier.kycStatus})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c4c9ac]">Helpline Reports (Seeded):</span>
                    <span className="text-white">{dossier.reportCount1930} complaints logged</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c4c9ac]">Simulated Device Profile:</span>
                    <span className="text-[#abd600]">{dossier.deviceFingerprint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c4c9ac]">Simulated Node Origin:</span>
                    <span className="text-white">{dossier.ipOrigin}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#abd600] uppercase font-bold tracking-wider">
                    Contextual Advisory Actions:
                  </span>
                  {dossier.recommendedActions?.map((act: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[#e5e2e1] bg-[#1a1a1a] p-2 rounded border border-[#262626]">
                      <span className="text-[#ffb4ab] font-bold">#{idx + 1}</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#111] p-2.5 rounded border border-[#222] text-[10px] text-[#c4c9ac] leading-relaxed">
                  <span className="text-[#abd600] font-bold block mb-0.5">Advisory Notice:</span>
                  This summary presents seeded demonstration evidence. Q-NETRA AI evaluates risk before payment authorization and does not independently freeze accounts or issue legal orders.
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setIsDossierOpen(false)}
              className="mt-1 bg-[#abd600] hover:bg-[#c3f400] text-black font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
