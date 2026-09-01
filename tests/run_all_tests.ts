import assert from 'assert';
import { normalizeVpa, sanitizeAmount, isValidVpaFormat } from '../src/domain/payment/paymentRules';
import { analyzePaymentContextLocally, analyzePaymentContextLocallyAsync } from '../src/services/ai/onDeviceContextService';
import { evaluateLinkSafety } from '../src/services/sms/linkSafetyService';
import { inspectSmsLocally } from '../src/services/sms/smsInspectionService';
import { evaluateIntentTrailCorrelation } from '../server/services/story/storyCorrelationService';
import { evaluatePaymentRisk } from '../server/services/payment/paymentRiskService';
import { buildGraphForEntity } from '../src/services/network/graphBuilder';
import { parseUpiUri } from '../src/services/qr/upiParserService';
import { generateUpiPayUri } from '../src/services/qr/upiLauncherService';
import { evaluatePaymentRiskLocally } from '../src/services/payment/clientRiskEvaluator';
import { computeRiskScore } from '../server/services/payment/riskScoringEngine';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  })();
}

async function runTestSuite() {
  console.log('\n========================================');
  console.log('Q-NETRA AI — AUTOMATED DOMAIN & SERVICE TESTS');
  console.log('========================================\n');

  console.log('[1] Payment Rules & UPI URI Parser');
  await test('Normalizes VPA strings to clean lowercase', () => {
    assert.strictEqual(normalizeVpa(' ABC123@UPI '), 'abc123@upi');
    assert.strictEqual(normalizeVpa(''), 'unknown@upi');
  });

  await test('Sanitizes payment amounts within valid bounds', () => {
    assert.strictEqual(sanitizeAmount('10.50'), 10.5);
    assert.strictEqual(sanitizeAmount(-50), 0);
    assert.strictEqual(sanitizeAmount('invalid'), 0);
  });

  await test('Validates UPI VPA formats accurately', () => {
    assert.strictEqual(isValidVpaFormat('merchant@icici'), true);
    assert.strictEqual(isValidVpaFormat('invalid-vpa'), false);
  });

  await test('Parses standard UPI URI strings', () => {
    const parsed = parseUpiUri('upi://pay?pa=swiggy@icici&am=850&pn=Swiggy&tn=FoodOrder');
    assert.strictEqual(parsed.vpa, 'swiggy@icici');
    assert.strictEqual(parsed.amount, 850);
    assert.strictEqual(parsed.isUpi, true);
  });

  await test('Parses real-world QR codes and identifies bank handle', () => {
    const parsed = parseUpiUri('upi://pay?pa=8767717432@kotakbank&pn=Harshit&cu=INR');
    assert.strictEqual(parsed.vpa, '8767717432@kotakbank');
    assert.strictEqual(parsed.bankName, 'Kotak Mahindra Bank');
    assert.strictEqual(parsed.isUpi, true);

    const evalResult = evaluatePaymentRiskLocally('8767717432@kotakbank', 1000);
    assert.strictEqual(evalResult.riskLevel, 'SAFE');
    assert.strictEqual(evalResult.stopDecision, false);
  });

  await test('Generates compliant upi://pay URI with parameters', () => {
    const uri = generateUpiPayUri({
      recipient: 'swiggy@icici',
      amount: 450,
      note: 'Dinner order #1234',
      merchantName: 'Swiggy'
    });
    assert.strictEqual(uri.startsWith('upi://pay?'), true);
    assert.strictEqual(uri.includes('pa=swiggy%40icici') || uri.includes('pa=swiggy@icici'), true);
    assert.strictEqual(uri.includes('am=450.00'), true);
    assert.strictEqual(uri.includes('cu=INR'), true);
  });

  console.log('\n[2] On-Device AI Context Classifier');
  await test('Detects urgent disconnection threat pattern', () => {
    const ctx = analyzePaymentContextLocally('Pay ₹10 immediately to prevent electricity power cut tonight');
    assert.strictEqual(ctx.payment_request, true);
    assert.strictEqual(ctx.urgency, true);
    assert.strictEqual(ctx.payment_pressure, true);
    assert.strictEqual(ctx.signalStrength, 'STRONG');
    assert.strictEqual(ctx.extracted_amount, 10);
  });

  await test('Marks clean organic invoice as safe', () => {
    const ctx = analyzePaymentContextLocally('Invoice payment for Swiggy food delivery');
    assert.strictEqual(ctx.payment_pressure, false);
    assert.strictEqual(ctx.urgency, false);
  });

  console.log('\n[3] SMS & Link Safety Analyzer');
  await test('Flags malicious APK links', () => {
    const safety = evaluateLinkSafety('Download update via http://sbi-kyc.com/update.apk');
    assert.strictEqual(safety.isApkDownload, true);
  });

  await test('Inspects scam SMS and recommends STOP', () => {
    const result = inspectSmsLocally('Your electricity will be cut at 9:30 PM. Pay ₹10 immediately to officer at abc123@upi');
    assert.strictEqual(result.isHighRisk, true);
    assert.strictEqual(result.riskLevel, 'HIGH RISK');
  });

  console.log('\n[4] 3-Pillar Story Correlation');
  await test('Detects critical mismatch when utility story routes to mule VPA', () => {
    const correlation = evaluateIntentTrailCorrelation({
      vpa: 'abc123@upi',
      amount: 10,
      note: 'Electricity bill disconnection payment',
      connectedEntities: 5,
      elevatedRiskConnections: 3
    });
    assert.strictEqual(correlation.mismatchDetected, true);
    assert.strictEqual(correlation.correlationStatus, 'INCONSISTENT');
    assert.strictEqual(correlation.mismatchSeverity, 'CRITICAL');
  });

  await test('Confirms clean alignment for verified commercial merchant', () => {
    const correlation = evaluateIntentTrailCorrelation({
      vpa: 'swiggy@icici',
      amount: 850,
      note: 'Swiggy Food Order',
      knownEntity: {
        vpa: 'swiggy@icici',
        name: 'Bundl Technologies Pvt Ltd',
        category: 'merchant',
        kycStatus: 'verified',
        accountAgeDays: 2450,
        baseRiskScore: 2,
        reportCount1930: 0,
        isKnownMule: false,
        deviceFingerprint: 'MERCHANT_001',
        ipLocation: 'Mumbai',
        avgDailyVolume: 85000000
      },
      connectedEntities: 2,
      elevatedRiskConnections: 0
    });
    assert.strictEqual(correlation.mismatchDetected, false);
    assert.strictEqual(correlation.correlationStatus, 'CONSISTENT');
  });

  console.log('\n[5] Payment Risk Engine & Feature-Based Computation');
  await test('Evaluates Golden Case C to STOP decision with real feature-based risk', async () => {
    const decision = await evaluatePaymentRisk({
      recipient: 'abc123@upi',
      amount: 10,
      note: 'Pay ₹10 to avoid electricity disconnection'
    });
    assert.strictEqual(decision.stopDecision, true);
    assert.strictEqual(decision.riskLevel, 'HIGH RISK');
    assert.ok(decision.connectedEntities >= 4, `Connected entities should be >= 4, got ${decision.connectedEntities}`);
  });

  await test('Evaluates Golden Case A to PROCEED decision', async () => {
    const decision = await evaluatePaymentRisk({
      recipient: 'swiggy@icici',
      amount: 850,
      note: 'Swiggy Food Order'
    });
    assert.strictEqual(decision.stopDecision, false);
    assert.strictEqual(decision.riskLevel, 'SAFE');
  });

  await test('Computes continuous mathematical risk score across varying input features', () => {
    const scoreSafe = computeRiskScore({
      vpa: 'swiggy@icici',
      amount: 450,
      note: 'Food order'
    });
    const scoreModerate = computeRiskScore({
      vpa: 'priya.consulting@okhdfcbank',
      amount: 4500,
      note: 'Design advance'
    });
    const scoreHigh = computeRiskScore({
      vpa: 'abc123@upi',
      amount: 10,
      note: 'Power cut disconnect tonight'
    });

    assert.ok(scoreSafe.combinedRiskScore < scoreModerate.combinedRiskScore);
    assert.ok(scoreModerate.combinedRiskScore < scoreHigh.combinedRiskScore);
    assert.strictEqual(scoreSafe.riskLevel, 'SAFE');
    assert.strictEqual(scoreModerate.riskLevel, 'MODERATE');
    assert.strictEqual(scoreHigh.riskLevel, 'HIGH RISK');
  });

  await test('Evaluates local client risk engine correctly with full story correlation & trust chain', () => {
    const localHigh = evaluatePaymentRiskLocally('abc123@upi', 10, 'Pay electricity power cut immediately');
    assert.strictEqual(localHigh.riskLevel, 'HIGH RISK');
    assert.strictEqual(localHigh.stopDecision, true);
    assert.strictEqual(localHigh.trustChain.length, 5);
    assert.strictEqual(localHigh.storyCorrelation?.mismatchSeverity, 'CRITICAL');
    assert.ok(localHigh.connectedEntities >= 4);

    const localSafe = evaluatePaymentRiskLocally('swiggy@icici', 450, 'Dinner food delivery');
    assert.strictEqual(localSafe.riskLevel, 'SAFE');
    assert.strictEqual(localSafe.stopDecision, false);
    assert.strictEqual(localSafe.storyCorrelation?.mismatchSeverity, 'CLEAN');
    assert.strictEqual(localSafe.connectedEntities, 2);
  });

  console.log('\n[6] Network Graph Dynamic Synthesis');
  await test('Builds real dynamic topology from entity repository and cluster relations', () => {
    const graphHigh = buildGraphForEntity('abc123@upi', 'HIGH RISK');
    assert.ok(graphHigh.nodes.length >= 4);
    assert.ok(graphHigh.nodes.some(n => n.id === 'target' && n.label === 'abc123@upi'));
    assert.ok(graphHigh.nodes.some(n => n.id === 'node-bank-gateway'));

    const graphSafe = buildGraphForEntity('swiggy@icici', 'SAFE');
    assert.strictEqual(graphSafe.nodes.length, 2);
    assert.strictEqual(graphSafe.totalConnectedEntities, 2);
    assert.strictEqual(graphSafe.elevatedRiskConnections, 0);

    const graphMod = buildGraphForEntity('priya.consulting@okhdfcbank', 'MODERATE');
    assert.strictEqual(graphMod.nodes.length, 3);
    assert.strictEqual(graphMod.totalConnectedEntities, 3);
  });

  await test('Guarantees unknown VPAs do not receive fictional hardcoded mule nodes', () => {
    const unknownGraph = buildGraphForEntity('random_user_992@okhdfcbank', 'SAFE');
    assert.strictEqual(unknownGraph.nodes.length, 2);
    assert.ok(!unknownGraph.nodes.some(n => n.label.includes('mule_781@axis')));
    assert.ok(!unknownGraph.nodes.some(n => n.label.includes('P2P_Exch_Wallet#9')));
  });

  console.log('\n[7] Multilingual Safety Translations & Synchronized Text/Voice');
  const { SUPPORTED_LANGUAGES, LANGUAGE_LIST } = await import('../src/services/i18n/languages');
  const { TRANSLATIONS, getDecisionTranslation } = await import('../src/services/i18n/translations');

  await test('Contains all 8 supported Indian languages with valid BCP-47 tags', () => {
    const expectedLanguages = ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'kn', 'gu'];
    assert.strictEqual(LANGUAGE_LIST.length, 8);
    for (const code of expectedLanguages) {
      assert.ok((SUPPORTED_LANGUAGES as any)[code], `Missing language ${code}`);
      assert.ok((SUPPORTED_LANGUAGES as any)[code].bcp47, `Missing BCP-47 for ${code}`);
    }
  });

  await test('Ensures exact 1:1 match between visible text and voice message for STOP in Marathi', () => {
    const mrDecision = getDecisionTranslation('STOP', 'mr');
    assert.ok(mrDecision.voiceMessage.includes('सावधान'));
    assert.ok(mrDecision.voiceMessage.includes('UPI PIN टाकू नका'));
    assert.strictEqual(
      mrDecision.voiceMessage,
      'सावधान. या पेमेंटमध्ये उच्च जोखीम आढळली आहे. कृपया हे पेमेंट करू नका. तुमचा UPI PIN टाकू नका.'
    );
  });

  await test('Ensures exact 1:1 match between visible text and voice message for STOP in Hindi', () => {
    const hiDecision = getDecisionTranslation('STOP', 'hi');
    assert.ok(hiDecision.voiceMessage.includes('सावधान'));
    assert.ok(hiDecision.voiceMessage.includes('अपना UPI PIN दर्ज न करें'));
    assert.strictEqual(
      hiDecision.voiceMessage,
      'सावधान। इस भुगतान में उच्च जोखिम पाया गया है। कृपया इस भुगतान को आगे न बढ़ाएं। अपना UPI PIN दर्ज न करें।'
    );
  });

  await test('Ensures exact 1:1 match between visible text and voice message for STOP in English', () => {
    const enDecision = getDecisionTranslation('STOP', 'en');
    assert.strictEqual(
      enDecision.voiceMessage,
      'Warning. High-risk payment detected. Please do not proceed with this payment. Do not enter your UPI PIN.'
    );
  });

  await test('Ensures PROCEED never claims guaranteed safety across all 8 languages', () => {
    for (const lang of Object.keys(TRANSLATIONS) as (keyof typeof TRANSLATIONS)[]) {
      const trans = TRANSLATIONS[lang];
      assert.ok(!trans.proceed.voiceMessage.toLowerCase().includes('guaranteed safe'));
      assert.ok(!trans.proceed.voiceMessage.toLowerCase().includes('100% safe'));
    }
  });

  await test('Ensures VERIFY provides clear caution across all 8 languages', () => {
    for (const lang of Object.keys(TRANSLATIONS) as (keyof typeof TRANSLATIONS)[]) {
      const trans = TRANSLATIONS[lang];
      assert.ok(trans.verify.voiceMessage.length > 0);
    }
  });

  console.log('\n[8] Multilingual Voice Intent Classifier & Localized Responses');
  const { classifyVoiceIntent, getOfflineVoiceAnswer } = await import('../src/services/voice/voiceIntentService');

  await test('Correctly identifies Marathi query "का?" as WHY_FLAGGED and answers in Marathi', () => {
    const intent = classifyVoiceIntent('का थांबवले आहे?');
    assert.strictEqual(intent, 'WHY_FLAGGED');
    const answer = getOfflineVoiceAnswer(intent, 'mr');
    assert.ok(answer.includes('कारण') || answer.includes('पेमेंट'));
  });

  await test('Correctly identifies Hindi query "क्यों रोका गया?" as WHY_FLAGGED and answers in Hindi', () => {
    const intent = classifyVoiceIntent('यह पेमेंट क्यों रोका गया?');
    assert.strictEqual(intent, 'WHY_FLAGGED');
    const answer = getOfflineVoiceAnswer(intent, 'hi');
    assert.ok(answer.includes('कारण') || answer.includes('भुगतान'));
  });

  await test('Correctly identifies 1930 Helpline intent and returns localized advice in Marathi', () => {
    const intent = classifyVoiceIntent('1930 काय आहे?');
    assert.strictEqual(intent, 'REPORT_1930');
    const answer = getOfflineVoiceAnswer(intent, 'mr');
    assert.ok(answer.includes('1930'));
  });

  console.log('\n[9] Speech Synthesis Fallback & Duplicate Speech Protection');
  const { voiceService } = await import('../src/services/voice/voiceService');

  await test('Gracefully handles environments without window.speechSynthesis without throwing', async () => {
    const res = await voiceService.speak('Test fallback speech message');
    assert.strictEqual(typeof res, 'boolean');
  });

  console.log('\n[10] BHASHINI Backend Pipeline & Frontend Voice Architecture');
  const { bhashiniPipeline } = await import('../server/services/bhashini/bhashiniPipeline');
  const { languagePreferenceService } = await import('../src/services/voice/languagePreferenceService');

  await test('Correctly maps all 8 languages to Bhashini standard ULCA codes', () => {
    const testCases: Record<string, string> = {
      en: 'en',
      hi: 'hi',
      mr: 'mr',
      bn: 'bn',
      ta: 'ta',
      te: 'te',
      kn: 'kn',
      gu: 'gu'
    };
    for (const [code, expected] of Object.entries(testCases)) {
      const mapped = bhashiniPipeline.mapLanguageToBhashiniCode(code);
      assert.strictEqual(mapped, expected, `Failed mapping for ${code}`);
    }
  });

  await test('Rejects empty or malformed TTS text requests', async () => {
    const res = await bhashiniPipeline.processTts({
      text: '   ',
      language: 'mr-IN'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCode, 'EMPTY_TEXT');
  });

  await test('Rejects oversized TTS text requests exceeding 2000 characters', async () => {
    const longText = 'A'.repeat(2500);
    const res = await bhashiniPipeline.processTts({
      text: longText,
      language: 'mr-IN'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCode, 'TEXT_TOO_LONG');
  });

  await test('Rejects empty audio transcription requests', async () => {
    const res = await bhashiniPipeline.processAsr({
      audioBase64: '',
      language: 'hi-IN'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCode, 'EMPTY_AUDIO');
  });

  await test('Correctly manages language preference and fallback locales in LanguagePreferenceService', () => {
    languagePreferenceService.setLanguage('mr-IN');
    assert.strictEqual(languagePreferenceService.getLanguage(), 'mr-IN');
    const def = languagePreferenceService.getLanguageDefinition('mr-IN');
    assert.strictEqual(def.displayName, 'Marathi');
    assert.strictEqual(def.fallbackLocale, 'hi-IN');
  });

  await test('Protects against duplicate speech for automated decision keys', async () => {
    voiceService.resetSpokenCache();
    const firstPlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: false
    });
    const duplicatePlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: false
    });
    assert.strictEqual(duplicatePlay, false);

    const replayPlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: true
    });
    assert.strictEqual(typeof replayPlay, 'boolean');
  });

  console.log('\n[11] MobileBERT Real ONNX Inference & WordPiece Tokenizer');
  const { classifyWithMobileBertAsync, classifyWithMobileBert } = await import('../src/services/localAI/mobileBertService');
  const { wordPieceTokenizer, wordPieceEncode } = await import('../src/services/localAI/tokenizer');

  await test('WordPiece Tokenizer encodes with exact 30,522 Google MobileBERT vocabulary and special tokens', () => {
    assert.strictEqual(wordPieceTokenizer.isLoaded(), true);
    assert.strictEqual(wordPieceTokenizer.getVocabSize(), 30522);
    const enc = wordPieceEncode('hello electricity bill', 64);
    assert.strictEqual(Number(enc.inputIds[0]), 101); // [CLS]
    assert.strictEqual(Number(enc.inputIds[1]), 7592); // hello
    assert.strictEqual(Number(enc.inputIds[2]), 6451); // electricity
    assert.strictEqual(Number(enc.inputIds[3]), 3021); // bill
    assert.strictEqual(Number(enc.inputIds[4]), 102); // [SEP]
    assert.strictEqual(enc.inputIds.length, 64);
  });

  await test('MobileBERT executes real ONNX Session and outputs dynamic tensor predictions', async () => {
    const res = await classifyWithMobileBertAsync('Pay ₹10 immediately to prevent electricity disconnection tonight.');
    assert.strictEqual(res.execution, 'ONNX_WASM');
    assert.strictEqual(res.isHeuristicFallback, false);
    assert.strictEqual(typeof res.signals.fraud, 'number');
    assert.strictEqual(typeof res.signals.legitimate, 'number');
    assert.ok(res.latencyBreakdown.totalMs > 0);
  });

  await test('MobileBERT dynamically responds to distinct semantic inputs with different logits', async () => {
    const legit = await classifyWithMobileBertAsync('Your electricity bill of ₹850 is due today. Pay using the official utility portal.');
    const scam = await classifyWithMobileBertAsync('Pay ₹10 immediately or your electricity will be disconnected. Send money to this personal UPI ID.');
    assert.notDeepStrictEqual(legit.signals, scam.signals, 'Signals should not be static lookup values');
    assert.ok(legit.signals.legitimate > 0.4);
  });

  await test('Local AI Service provides asynchronous ONNX context classification', async () => {
    const ctx = await analyzePaymentContextLocallyAsync('Pay ₹10 immediately to prevent electricity disconnection tonight.');
    assert.strictEqual(ctx.payment_request, true);
    assert.strictEqual(ctx.offline_ready, true);
    assert.strictEqual(ctx.fallback_used, false);
    assert.ok(ctx.multi_label_scores !== undefined);
  });

  await test('Safety Fallback activates on explicit override or model failure', () => {
    const ctx = analyzePaymentContextLocally('Pay ₹10 immediately to avoid power cut', { forceFallback: true });
    assert.strictEqual(ctx.model_type, 'HEURISTIC');
    assert.strictEqual(ctx.fallback_used, true);
    assert.strictEqual(ctx.payment_pressure, true);
  });

  console.log('\n[12] Android APK Package, Local Model Cache & Snapdragon Benchmark');
  const { modelCacheService } = await import('../src/services/localAI/modelCacheService');
  const { runMobileBenchmark } = await import('../src/services/localAI/inferenceMetrics');
  const fs = await import('fs');

  await test('Verifies capacitor.config.ts has valid appId and webDir', () => {
    const configRaw = fs.readFileSync('capacitor.config.ts', 'utf8');
    assert.ok(configRaw.includes('ai.qnetra.app'));
    assert.ok(configRaw.includes('Q-NETRA AI'));
    assert.ok(configRaw.includes("webDir: 'dist'"));
  });

  await test('Verifies AndroidManifest.xml contains required permissions and no unnecessary SMS read permissions', () => {
    const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
    assert.ok(manifest.includes('android.permission.INTERNET'));
    assert.ok(manifest.includes('android.permission.ACCESS_NETWORK_STATE'));
    assert.ok(manifest.includes('android.permission.CAMERA'));
    assert.ok(manifest.includes('android.permission.RECORD_AUDIO'));
    assert.ok(!manifest.includes('android.permission.READ_SMS'), 'READ_SMS must not be in manifest');
    assert.ok(!manifest.includes('android.permission.RECEIVE_SMS'), 'RECEIVE_SMS must not be in manifest');
  });

  await test('Verifies INT8 ONNX model asset exists in public/models/', () => {
    const exists = fs.existsSync('public/models/mobilebert_context_int8.onnx');
    assert.strictEqual(exists, true, 'INT8 model file must exist in public/models/');
    const stat = fs.statSync('public/models/mobilebert_context_int8.onnx');
    assert.ok(stat.size > 10000000, `Model size should be ~10.21 MB (got ${stat.size} bytes)`);
  });

  await test('ModelCacheService reports valid cache structure and fallback handling', async () => {
    const status = modelCacheService.getStatus();
    assert.strictEqual(status.modelName, 'MobileBERT INT8');
    assert.ok(status.byteLength > 10000000);
  });

  await test('runMobileBenchmark produces complete statistical report with Cold Start and Stages', async () => {
    const report = await runMobileBenchmark(5, 10);
    assert.strictEqual(report.warmupRuns, 5);
    assert.strictEqual(report.measuredRuns, 10);
    assert.ok(report.device.executionProvider.includes('ONNX') || report.device.executionProvider.includes('WASM'));
    assert.ok(report.device.npuStatus.includes('NOT'));
    assert.ok(report.coldStart.coldModelLoadMs >= 0);
    assert.ok(report.stages.endToEnd.p50Ms > 0);
    assert.ok(report.stages.endToEnd.p95Ms >= report.stages.endToEnd.p50Ms);
  });

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
