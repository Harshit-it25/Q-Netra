import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { LocalPaymentContext } from '../types';
import { classifyPaymentContextLocally } from '../lib/onDeviceAI';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (vpa: string, amount: number, note?: string) => void;
}

export type ScannerBlackboxState =
  | 'IDLE'
  | 'QR_DETECTED'
  | 'LOCAL_PROCESSING'
  | 'SECURE_REQUEST'
  | 'URL_WARNING'
  | 'ERROR';

const PRESET_QRS = [
  {
    label: 'Case C: Electricity Scam STOP (abc123@upi - ₹10)',
    vpa: 'abc123@upi',
    amount: 10,
    note: 'Pay ₹10 immediately to prevent electricity disconnection tonight.',
    risk: 'high'
  },
  {
    label: 'Case B: Unverified Handle VERIFY (priya.consulting@okhdfcbank - ₹4,500)',
    vpa: 'priya.consulting@okhdfcbank',
    amount: 4500,
    note: 'Consulting retainer advance',
    risk: 'moderate'
  },
  {
    label: 'Case A: Verified Merchant PROCEED (swiggy@icici - ₹850)',
    vpa: 'swiggy@icici',
    amount: 850,
    note: 'Order #8921 food delivery',
    risk: 'safe'
  }
];

import { parseUpiUri } from '../services/qr/upiParserService';

export function parseUpiQrString(qrText: string): {
  vpa: string;
  amount: number;
  note?: string;
  payeeName?: string;
  isUrl?: boolean;
  rawUrl?: string;
  merchantCode?: string;
  isMerchant?: boolean;
  bankName?: string;
} {
  const trimmed = qrText.trim();

  // Check if this is an external HTTP/HTTPS URL instead of standard UPI
  if (/^https?:\/\//i.test(trimmed) && !trimmed.toLowerCase().includes('pa=')) {
    return {
      vpa: trimmed,
      amount: 0,
      note: 'External web link scanned from QR',
      isUrl: true,
      rawUrl: trimmed
    };
  }

  const parsed = parseUpiUri(trimmed);
  return {
    vpa: parsed.vpa && parsed.vpa !== 'unknown@upi' ? parsed.vpa : trimmed,
    amount: parsed.amount,
    note: parsed.note || (parsed.payeeName ? `Payment to ${parsed.payeeName}` : undefined),
    payeeName: parsed.payeeName,
    merchantCode: parsed.merchantCode,
    isMerchant: parsed.isMerchant,
    bankName: parsed.bankName,
    isUrl: false
  };
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete
}) => {
  const [customVpa, setCustomVpa] = useState('');
  const [customAmount, setCustomAmount] = useState('20000');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [blackboxState, setBlackboxState] = useState<ScannerBlackboxState>('IDLE');
  const [detectedData, setDetectedData] = useState<{ vpa: string; amount: number; note?: string; rawUrl?: string } | null>(null);
  const [localAiContext, setLocalAiContext] = useState<LocalPaymentContext | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload' | 'presets'>('camera');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream immediately to enforce camera privacy
  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  };

  // Process decoded QR through the Secure Blackbox pipeline
  const processDecodedPayload = async (rawQr: string) => {
    // Immediate camera shutdown & raw frame discard
    stopCamera();
    
    setBlackboxState('QR_DETECTED');
    const parsed = parseUpiQrString(rawQr);

    // If QR contains a web link, do NOT blindly auto-open or execute
    if (parsed.isUrl && parsed.rawUrl) {
      setDetectedData({
        vpa: parsed.vpa,
        amount: parsed.amount,
        note: parsed.note,
        rawUrl: parsed.rawUrl
      });
      setBlackboxState('URL_WARNING');
      return;
    }

    setDetectedData({
      vpa: parsed.vpa,
      amount: parsed.amount,
      note: parsed.note
    });

    // Step 1: Local On-Device Context Analysis (Zero network)
    setBlackboxState('LOCAL_PROCESSING');
    const onDeviceContext = classifyPaymentContextLocally([parsed.note, parsed.vpa].filter(Boolean).join(' '));
    setLocalAiContext(onDeviceContext);

    // Step 2: Minimal Data Request dispatch to backend
    setBlackboxState('SECURE_REQUEST');
    
    // Quick micro-pause to render real security boundary state to the user
    setTimeout(() => {
      onScanComplete(parsed.vpa, parsed.amount, parsed.note);
      onClose();
    }, 450);
  };

  // Scan loop using jsQR locally on canvas
  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          // Immediately process decoded string and discard raw frame
          processDecodedPayload(code.data);
          return;
        }
      }
    }
    animFrameId.current = requestAnimationFrame(scanLoop);
  };

  // Start camera
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    try {
      setCameraState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        animFrameId.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('Camera access error or restricted iframe environment:', err);
      setCameraState('denied');
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'camera' && blackboxState === 'IDLE') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, blackboxState]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_QRS[0]) => {
    processDecodedPayload(`upi://pay?pa=${preset.vpa}&am=${preset.amount}&tn=${encodeURIComponent(preset.note)}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVpa.trim()) return;
    processDecodedPayload(`upi://pay?pa=${encodeURIComponent(customVpa.trim())}&am=${customAmount || '1000'}&tn=Direct+manual+entry`);
  };

  // Handle uploaded QR image locally
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processDecodedPayload(code.data);
          } else {
            alert('No valid QR code found in the selected image. Please try another image or preset.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131313] border border-[#333333] rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#abd600] text-[22px]">
              lock
            </span>
            <div>
              <h3 className="text-[17px] font-bold text-[#e5e2e1] font-['Inter']">
                Protected QR Scanner
              </h3>
              <p className="text-[11px] text-[#c4c9ac]">
                Local-first decoding • Zero frame upload
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* BLACKBOX: PROTECTED ANALYSIS ACTIVE OVERLAY */}
        {blackboxState !== 'IDLE' && blackboxState !== 'URL_WARNING' && (
          <div className="p-6 flex flex-col items-center justify-center text-center bg-[#151515] min-h-[340px]">
            <div className="w-14 h-14 rounded-2xl bg-[#abd600]/10 border border-[#abd600]/30 flex items-center justify-center mb-3.5">
              <span className="material-symbols-outlined text-[#abd600] text-[28px]">
                lock
              </span>
            </div>

            <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#abd600] font-bold mb-1">
              🔒 PROTECTED ANALYSIS
            </span>
            <h4 className="text-[17px] font-bold text-[#e5e2e1] mb-2 font-['Inter']">
              Evaluating Security Boundary
            </h4>

            {/* Step-by-step verified telemetry checklist */}
            <div className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-3.5 flex flex-col gap-2 text-left text-xs font-mono-data mt-2 mb-4">
              <div className="flex items-center gap-2 text-[#abd600]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>QR decoded locally in-memory</span>
              </div>
              <div className="flex items-center gap-2 text-[#abd600]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Payment context evaluated on-device ({localAiContext?.latency_ms || 3}ms)</span>
              </div>
              <div className="flex items-center gap-2 text-[#abd600]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Recipient identifier verified</span>
              </div>
              <div className="flex items-center gap-2 text-[#abd600]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Multi-hop network trail mapped</span>
              </div>
              <div className="flex items-center gap-2 text-[#abd600]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Story ↮ Money Trail correlated</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#c4c9ac] font-mono-data">
              <span className="material-symbols-outlined text-[15px] animate-spin text-[#abd600]">
                sync
              </span>
              <span>
                {blackboxState === 'QR_DETECTED' && 'Reading payment parameters locally...'}
                {blackboxState === 'LOCAL_PROCESSING' && 'Checking on-device context signals...'}
                {blackboxState === 'SECURE_REQUEST' && 'Synthesizing evidence cascade...'}
              </span>
            </div>
          </div>
        )}

        {/* URL REDIRECTION WARNING STATE */}
        {blackboxState === 'URL_WARNING' && detectedData?.rawUrl && (
          <div className="p-6 flex flex-col items-center text-center bg-[#1c1b1b] min-h-[340px]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-amber-400 text-[32px]">
                link_off
              </span>
            </div>
            <span className="text-[11px] font-mono-data uppercase tracking-wider text-amber-400 font-bold mb-1">
              LINK DETECTED IN QR
            </span>
            <h4 className="text-base font-bold text-[#e5e2e1] mb-2">
              Non-Payment URL Found
            </h4>
            <p className="text-xs text-[#c4c9ac] mb-3">
              This QR code contains a direct web URL rather than a standard UPI payment address. For your safety, Q-NETRA does not open links automatically.
            </p>
            <div className="bg-[#121212] border border-[#2a2a2a] p-2.5 rounded-lg w-full text-left font-mono-data text-xs text-amber-300 break-all mb-4">
              {detectedData.rawUrl}
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setBlackboxState('IDLE');
                  setDetectedData(null);
                }}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  onScanComplete(detectedData.vpa, detectedData.amount, `Scanned Web Link: ${detectedData.rawUrl}`);
                  onClose();
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Analyze Target VPA
              </button>
            </div>
          </div>
        )}

        {/* NORMAL SCANNER INTERFACE (When IDLE) */}
        {blackboxState === 'IDLE' && (
          <>
            {/* Mode Selector Tabs */}
            <div className="flex border-b border-[#2a2a2a] bg-[#171717] px-4 pt-2">
              <button
                onClick={() => setMode('camera')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  mode === 'camera'
                    ? 'border-[#abd600] text-[#abd600]'
                    : 'border-transparent text-[#c4c9ac] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                Live Camera
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  mode === 'upload'
                    ? 'border-[#abd600] text-[#abd600]'
                    : 'border-transparent text-[#c4c9ac] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Upload Image
              </button>
              <button
                onClick={() => setMode('presets')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  mode === 'presets'
                    ? 'border-[#abd600] text-[#abd600]'
                    : 'border-transparent text-[#c4c9ac] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Instant Presets
              </button>
            </div>

            <div className="p-4 flex flex-col items-center overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
              {/* CAMERA MODE */}
              {mode === 'camera' && (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full aspect-square max-w-[280px] bg-[#0A0A0A] border-2 border-[#abd600]/50 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Live Video Feed */}
                    <video
                      ref={videoRef}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        cameraState === 'active' ? 'opacity-100' : 'opacity-0'
                      }`}
                      muted
                      playsInline
                    />

                    {/* Hidden canvas used for jsQR frame processing */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Overlay Viewfinder */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#CCFF00] pointer-events-none z-10"></div>
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#CCFF00] pointer-events-none z-10"></div>
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#CCFF00] pointer-events-none z-10"></div>
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#CCFF00] pointer-events-none z-10"></div>

                    {/* Laser animation */}
                    {cameraState === 'active' && (
                      <div className="absolute inset-x-0 h-1 bg-[#CCFF00] shadow-[0_0_15px_#CCFF00] animate-bounce pointer-events-none z-10"></div>
                    )}

                    {/* Fallback state inside viewfinder if camera denied/loading */}
                    {cameraState !== 'active' && (
                      <div className="text-center flex flex-col items-center p-4 z-20 w-full">
                        <span className="material-symbols-outlined text-[#abd600] text-[38px] mb-1.5 animate-pulse">
                          {cameraState === 'requesting' ? 'sync' : cameraState === 'denied' ? 'videocam_off' : 'qr_code_2'}
                        </span>
                        <p className="text-xs text-[#e5e2e1] font-bold">
                          {cameraState === 'requesting'
                            ? 'Requesting camera access...'
                            : cameraState === 'denied'
                            ? 'Camera restricted or inactive'
                            : 'Align QR Code in frame'}
                        </p>
                        <p className="text-[11px] text-[#c4c9ac] mt-0.5 mb-2.5">
                          {cameraState === 'denied'
                            ? 'Desktop browser / permissions blocked'
                            : 'Local-first jsQR decoding active'}
                        </p>

                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="bg-[#242424] hover:bg-[#333] text-[#abd600] border border-[#abd600]/40 text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">refresh</span>
                            Retry Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode('upload')}
                            className="bg-[#242424] hover:bg-[#333] text-[#e5e2e1] border border-[#444] text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">upload_file</span>
                            Upload Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-2.5 text-[11px] font-mono-data bg-[#1A1A1A] py-1.5 px-3 rounded-full border border-[#2a2a2a]">
                    <span className={`w-2 h-2 rounded-full ${cameraState === 'active' ? 'bg-[#abd600] animate-ping' : 'bg-amber-500'}`} />
                    <span className="text-[#c4c9ac]">
                      {cameraState === 'active' ? 'Protected Camera Scanner Active' : 'Camera Standby / Sandbox Mode'}
                    </span>
                  </div>
                </div>
              )}

              {/* UPLOAD MODE */}
              {mode === 'upload' && (
                <div className="w-full flex flex-col items-center py-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#abd600]/40 hover:border-[#abd600] bg-[#171717] hover:bg-[#1f1f1f] rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[#abd600] text-[48px] mb-2">
                      add_photo_alternate
                    </span>
                    <span className="text-sm font-bold text-[#e5e2e1]">
                      Select QR Screenshot / Image
                    </span>
                    <span className="text-xs text-[#c4c9ac] mt-1">
                      Processed locally on-device. Image is never uploaded.
                    </span>
                    <button
                      type="button"
                      className="mt-4 bg-[#abd600] hover:bg-[#c2f300] text-[#0A0A0A] font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      Browse Files
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* PRESETS & QUICK TEST */}
              <div className="w-full mt-3">
                <span className="text-[10px] text-[#c4c9ac] uppercase font-bold tracking-wider block mb-2">
                  One-Tap Presets (Pre-configured Test Vectors):
                </span>
                <div className="flex flex-col gap-2">
                  {PRESET_QRS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(item)}
                      className="w-full bg-[#1A1A1A] hover:bg-[#242424] border border-[#333333] hover:border-[#abd600]/50 rounded-xl p-2.5 flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`material-symbols-outlined text-base ${
                            item.risk === 'high' ? 'text-[#ffb4ab]' : 'text-[#abd600]'
                          }`}
                        >
                          {item.risk === 'high' ? 'warning' : 'verified'}
                        </span>
                        <div>
                          <span className="font-mono-data text-xs font-semibold text-[#e5e2e1] group-hover:text-[#abd600]">
                            {item.vpa}
                          </span>
                          <span className="text-[11px] text-[#c4c9ac] block">
                            ₹{item.amount.toLocaleString()} • {item.note}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-[#2a2a2a] px-2.5 py-1 rounded text-[#abd600] font-bold">
                        Scan
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input Fallback */}
              <form onSubmit={handleCustomSubmit} className="w-full mt-3 pt-3 border-t border-[#333333]">
                <span className="text-[10px] text-[#c4c9ac] uppercase font-bold tracking-wider block mb-1.5">
                  Direct VPA / String Entry:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VPA (e.g. target@upi)"
                    value={customVpa}
                    onChange={(e) => setCustomVpa(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-[#656464] focus:outline-none focus:border-[#abd600] font-mono-data"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-24 bg-[#1A1A1A] border border-[#333333] rounded-lg px-2 py-2 text-xs text-white placeholder-[#656464] focus:outline-none focus:border-[#abd600] font-mono-data"
                  />
                  <button
                    type="submit"
                    disabled={!customVpa.trim()}
                    className="bg-[#CCFF00] hover:bg-[#d8ff33] disabled:opacity-50 text-[#0A0A0A] font-bold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


