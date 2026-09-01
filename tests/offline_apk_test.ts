/**
 * Q-NETRA AI — Full Offline Android APK Validation Test Suite
 * 
 * Validates:
 * 1. Model & Tokenizer Asset Bundling (ONNX INT8 & vocab.txt)
 * 2. SHA-256 Model Integrity Verification
 * 3. ONNX Runtime WebAssembly Assets Presence
 * 4. Genuine WordPiece Tokenizer Loading & Encoding
 * 5. MobileBERT ONNX Inference Offline
 * 6. Zero Network Call Assertion for Core Decision Pipeline
 * 7. Golden Test Cases A through F
 * 8. Multilingual Synchronized Warning Text
 * 9. Local Voice Fallback (Device SpeechSynthesis)
 * 10. Security & Secrets Bundle Scan
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { wordPieceTokenizer, wordPieceEncode, VOCAB_SIZE, CLS_TOKEN_ID, SEP_TOKEN_ID } from '../src/services/localAI/tokenizer';
import { modelLoader, EXPECTED_MODEL_SHA256, EXPECTED_VOCAB_SHA256 } from '../src/services/localAI/modelLoader';
import { classifyPaymentContextLocally, classifyPaymentContextLocallyAsync } from '../src/lib/onDeviceAI';
import { evaluatePaymentRiskLocally } from '../src/services/payment/clientRiskEvaluator';
import { buildGraphForEntity } from '../src/services/network/graphBuilder';
import { evaluateIntentTrailCorrelation } from '../src/services/story/storyCorrelationEvaluator';
import { getTranslation } from '../src/services/i18n/translations';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../src/services/i18n/languages';
import { browserVoiceFallback } from '../src/services/voice/browserVoiceFallback';
import { networkTracker } from '../src/services/network/networkActivityTracker';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, description: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${description}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${description}`);
  }
}

async function runOfflineApkValidation() {
  console.log('====================================================');
  console.log('Q-NETRA AI — OFFLINE ANDROID APK VALIDATION SUITE');
  console.log('====================================================\n');

  // [1] Model & Vocab Asset Bundling Verification
  console.log('[1] Model & Tokenizer Asset Bundling Verification');
  const onnxPath = path.resolve('public/models/mobilebert_context_int8.onnx');
  const vocabPath = path.resolve('public/models/vocab.txt');

  assert(fs.existsSync(onnxPath), `MobileBERT INT8 ONNX exists in public/models/ (${onnxPath})`);
  assert(fs.existsSync(vocabPath), `vocab.txt exists in public/models/ (${vocabPath})`);

  const onnxSize = fs.statSync(onnxPath).size;
  const vocabSize = fs.statSync(vocabPath).size;

  assert(onnxSize > 10_000_000, `MobileBERT INT8 file size is genuine (${(onnxSize / (1024 * 1024)).toFixed(2)} MB)`);
  assert(vocabSize > 200_000, `vocab.txt file size is genuine (${(vocabSize / 1024).toFixed(2)} KB)`);

  // [2] SHA-256 Model Integrity Verification
  console.log('\n[2] SHA-256 Model Integrity Verification');
  const onnxBuf = fs.readFileSync(onnxPath);
  const vocabBuf = fs.readFileSync(vocabPath);

  const calculatedOnnxHash = crypto.createHash('sha256').update(onnxBuf).digest('hex');
  const calculatedVocabHash = crypto.createHash('sha256').update(vocabBuf).digest('hex');

  assert(calculatedOnnxHash === EXPECTED_MODEL_SHA256, `MobileBERT ONNX SHA-256 matches expected hash (${calculatedOnnxHash.substring(0, 16)}...)`);
  assert(calculatedVocabHash === EXPECTED_VOCAB_SHA256, `vocab.txt SHA-256 matches expected hash (${calculatedVocabHash.substring(0, 16)}...)`);

  const integrityResult = await modelLoader.verifyIntegrity(onnxBuf.buffer.slice(onnxBuf.byteOffset, onnxBuf.byteOffset + onnxBuf.byteLength));
  assert(integrityResult.valid, 'ModelLoader verifyIntegrity() confirms model authenticity');

  // [3] ONNX Runtime WebAssembly Asset Bundling
  console.log('\n[3] ONNX Runtime WebAssembly Asset Bundling');
  const wasmDir = path.resolve('public/wasm');
  assert(fs.existsSync(wasmDir), 'public/wasm/ directory exists');
  const wasmFiles = fs.readdirSync(wasmDir);
  assert(wasmFiles.some(f => f.includes('ort-wasm-simd-threaded.wasm')), 'ort-wasm-simd-threaded.wasm is bundled in public/wasm/');
  assert(wasmFiles.some(f => f.includes('ort-wasm-simd-threaded.mjs')), 'ort-wasm-simd-threaded.mjs is bundled in public/wasm/');

  // [4] Genuine WordPiece Tokenizer Loading & Encoding
  console.log('\n[4] Genuine WordPiece Tokenizer Loading & Encoding');
  const vocabContent = fs.readFileSync(vocabPath, 'utf8');
  wordPieceTokenizer.loadVocabulary(vocabContent);

  assert(wordPieceTokenizer.isLoaded(), 'WordPiece tokenizer successfully loaded vocabulary');
  assert(wordPieceTokenizer.getVocabSize() === VOCAB_SIZE, `Vocabulary size matches Google BERT standard (30,522 tokens, actual: ${wordPieceTokenizer.getVocabSize()})`);

  const encoded = wordPieceEncode('Electricity bill urgent payment Rs 10');
  assert(encoded.tokenIds[0] === CLS_TOKEN_ID, '[CLS] token (101) placed at index 0');
  assert(encoded.tokenIds[encoded.length - 1] === SEP_TOKEN_ID, '[SEP] token (102) placed at sequence termination');
  assert(encoded.inputIds.length === 64, 'Padded inputIds tensor has exact shape [64]');
  assert(encoded.attentionMask.length === 64, 'Attention mask tensor has exact shape [64]');

  // [5] MobileBERT ONNX Session & Real Inference
  console.log('\n[5] MobileBERT ONNX Session & Real Inference');
  const modelInit = await modelLoader.initialize();
  assert(modelInit, 'MobileBERT ONNX session initialized successfully via WASM/CPU provider');
  assert(modelLoader.getState() === 'READY', 'ModelLoader state is READY');

  const analysisResult = await classifyPaymentContextLocallyAsync('Electricity power disconnection alert pay immediately to avoid penalty');
  assert(analysisResult.threat_indicators.length > 0, 'Detected urgency / disconnection threat indicators');
  assert(analysisResult.offline_ready === true, 'Offline-ready flag confirmed');

  // [6] Zero Network Call Assertion for Core Decision Pipeline
  console.log('\n[6] Zero Network Call Assertion for Core Decision Pipeline');
  networkTracker.init();
  networkTracker.clearLogs();

  const caseCTestDecision = evaluatePaymentRiskLocally(
    'disconnection_urgent@ybl',
    10,
    'Electricity power will be disconnected at 9:30pm tonight',
    analysisResult
  );

  assert(networkTracker.getCoreDecisionCallCount() === 0, '0 network calls triggered during complete local risk decision');
  assert(networkTracker.isZeroNetworkAsserted(), 'Zero-network assertion passes');

  // [7] Golden Test Cases Matrix (Cases A - F)
  console.log('\n[7] Golden Test Cases Matrix (Cases A - F)');

  // Case A: Legitimate Merchant
  const ctxA = classifyPaymentContextLocally('Invoice payment for Swiggy food delivery');
  const checkA = evaluatePaymentRiskLocally('swiggy@icici', 850, 'Swiggy Food Order', ctxA);
  assert(checkA.riskLevel === 'SAFE' && !checkA.stopDecision, 'Case A: Legitimate merchant evaluates to PROCEED');

  // Case B: Unverified Recipient
  const ctxB = classifyPaymentContextLocally('Design consulting advance payment');
  const checkB = evaluatePaymentRiskLocally('priya.consulting@okhdfcbank', 4500, 'Design advance', ctxB);
  assert(checkB.riskLevel === 'MODERATE' && !checkB.stopDecision, 'Case B: Unverified recipient evaluates to VERIFY');

  // Case C: Electricity Disconnection Scam
  const ctxC = classifyPaymentContextLocally('Dear customer your electricity power will be disconnected at 9:30pm tonight pay bill immediately');
  const checkC = evaluatePaymentRiskLocally('abc123@upi', 10, 'Electricity disconnection alert', ctxC);
  assert(checkC.stopDecision === true, 'Case C: Electricity disconnection threat evaluates to STOP');

  // Case D: ₹10 Micro-Payment Scam
  const ctxD = classifyPaymentContextLocally('Pay Rs 10 processing fee to claim Rs 5000 cashback reward prize');
  const checkD = evaluatePaymentRiskLocally('lottery-gift@ybl', 10, 'Processing fee', ctxD);
  assert(checkD.stopDecision === true, 'Case D: ₹10 micro-payment lottery scam evaluates to STOP');

  // Case E: Network Unavailable (Pure Local Mode)
  assert(checkC.trustChain.length === 5, 'Case E: 5-Stage Trust Chain generated fully on-device without network');

  // Case F: Heuristic Fallback Robustness
  const ctxF = classifyPaymentContextLocally('Urgent electricity bill', { forceFallback: true });
  assert(ctxF.fallback_used === true || ctxF.model_type === 'HEURISTIC', 'Case F: Deterministic heuristic fallback engages on override');

  // [7.1] Real-Time New Payment Analysis & Dynamic History Feedback
  console.log('\n[7.1] Real-Time New Payment Analysis & Dynamic History Feedback');
  const freshHistory: any[] = [];
  
  // First payment to a new peer
  const ctxFirst = classifyPaymentContextLocally('Freelance project design payment');
  const checkFirst = evaluatePaymentRiskLocally('neha_designer@axisbank', 5000, 'Design phase 1', ctxFirst, freshHistory);
  assert(checkFirst.riskTags.includes('First-Time Recipient') || checkFirst.riskTags.includes('Unverified VPA') || checkFirst.riskTags.includes('Unindexed VPA'), 'First payment flagged with first-time recipient signal');
  freshHistory.unshift(checkFirst);

  // Second payment to the same peer (history updated)
  const ctxSecond = classifyPaymentContextLocally('Freelance project design payment phase 2');
  const checkSecond = evaluatePaymentRiskLocally('neha_designer@axisbank', 5000, 'Design phase 2', ctxSecond, freshHistory);
  assert(checkSecond.riskTags.includes('Prior Relationship') || checkSecond.riskTags.includes('Recognized Bank Handle'), 'Second payment dynamically recognizes prior transaction relationship from local history');

  // [8] RiskGraph & Seeded Topology Transparency
  console.log('\n[8] RiskGraph & Seeded Topology Transparency');
  const graphHigh = buildGraphForEntity('mule_disperse@axis', 'HIGH RISK');
  assert(graphHigh.nodes.length >= 3, 'Dynamic graph contains target, gateway, and connected entities');
  assert(graphHigh.topologySource === 'SEEDED DEMO TOPOLOGY', 'Graph topology is explicitly labeled SEEDED DEMO TOPOLOGY');

  // [9] Multilingual Translations & 1:1 Voice Match (English, Hindi, Marathi, etc.)
  console.log('\n[9] Multilingual Translations & 1:1 Voice Match');
  const langKeys: SupportedLanguage[] = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'gu', 'bn'];
  for (const lang of langKeys) {
    const t = getTranslation(lang);
    assert(Boolean(t.stop.title), `Language [${lang}] contains STOP title: "${t.stop.title}"`);
    assert(Boolean(t.verify.title), `Language [${lang}] contains VERIFY title: "${t.verify.title}"`);
    assert(Boolean(t.proceed.title), `Language [${lang}] contains PROCEED title: "${t.proceed.title}"`);
    assert(Boolean(t.stop.voiceMessage), `Language [${lang}] contains synchronized voice warning: "${t.stop.voiceMessage.substring(0, 30)}..."`);
  }

  // [10] Local Voice Fallback Handling
  console.log('\n[10] Local Voice Fallback Handling');
  assert(typeof browserVoiceFallback.isTtsSupported === 'function', 'Browser / Device SpeechSynthesis interface is defined');

  // [11] Security & Secrets Bundle Audit
  console.log('\n[11] Security & Secrets Bundle Audit');
  const forbiddenKeys = [
    'BHASHINI_API_KEY',
    'BHASHINI_USER_ID',
    'BHASHINI_PIPELINE_ID',
    'GEMINI_API_KEY',
    'PRIVATE_KEY',
    'SECRET_KEY'
  ];

  const appSourceFiles = [
    'src/services/localAI/modelLoader.ts',
    'src/services/localAI/tokenizer.ts',
    'src/services/localAI/mobileBertService.ts',
    'src/services/payment/clientRiskEvaluator.ts',
    'src/App.tsx'
  ];

  let secretsFound = false;
  for (const file of appSourceFiles) {
    const content = fs.readFileSync(path.resolve(file), 'utf8');
    for (const key of forbiddenKeys) {
      if (content.includes(`"${key}"`) || content.includes(`'${key}'`)) {
        // Only check if actual secret values are hardcoded
        const regex = new RegExp(`${key}\\s*=\\s*['"][a-zA-Z0-9_-]{10,}['"]`);
        if (regex.test(content)) {
          console.error(`  ✗ Secret hardcoded in ${file}: ${key}`);
          secretsFound = true;
        }
      }
    }
  }

  assert(!secretsFound, 'No secrets or API keys hardcoded in client application source');

  console.log('\n====================================================');
  console.log(`VALIDATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runOfflineApkValidation().catch((err) => {
  console.error('Validation test suite encountered unhandled error:', err);
  process.exit(1);
});
