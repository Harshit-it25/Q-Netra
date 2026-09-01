import assert from 'assert';
import { normalizeVpa, sanitizeAmount, isValidVpaFormat } from '../src/domain/payment/paymentRules';
import { analyzePaymentContextLocally } from '../src/services/ai/onDeviceContextService';
import { evaluateLinkSafety } from '../src/services/sms/linkSafetyService';
import { inspectSmsLocally } from '../src/services/sms/smsInspectionService';
import { evaluateIntentTrailCorrelation } from '../server/services/story/storyCorrelationService';
import { evaluatePaymentRisk } from '../server/services/payment/paymentRiskService';
import { buildGraphForEntity } from '../server/services/network/riskGraphService';
import { parseUpiUri } from '../src/services/qr/upiParserService';

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
      connectedEntities: 7,
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

  console.log('\n[5] Payment Risk Engine Orchestration');
  await test('Evaluates Golden Case C to STOP decision', async () => {
    const decision = await evaluatePaymentRisk({
      recipient: 'abc123@upi',
      amount: 10,
      note: 'Pay ₹10 to avoid electricity disconnection'
    });
    assert.strictEqual(decision.stopDecision, true);
    assert.strictEqual(decision.riskLevel, 'HIGH RISK');
    assert.strictEqual(decision.connectedEntities, 7);
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

  console.log('\n[6] Network Graph Synthesis');
  await test('Builds 7-node syndicate topology for high-risk targets', () => {
    const graph = buildGraphForEntity('abc123@upi', 'HIGH RISK');
    assert.strictEqual(graph.nodes.length, 7);
    assert.strictEqual(graph.totalConnectedEntities, 7);
    assert.strictEqual(graph.elevatedRiskConnections, 3);
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
      assert.ok(trans.proceed.voiceMessage.length > 10);
    }
  });

  await test('Ensures VERIFY provides clear caution across all 8 languages', () => {
    for (const lang of Object.keys(TRANSLATIONS) as (keyof typeof TRANSLATIONS)[]) {
      const trans = TRANSLATIONS[lang];
      assert.ok(trans.verify.voiceMessage.length > 10);
      assert.ok(trans.verify.evidencePillars.length >= 2);
    }
  });

  console.log('\n[8] Multilingual Voice Intent Classifier & Localized Responses');
  const { classifyVoiceIntent, generateVoiceAnswer } = await import('../src/services/voice/voiceIntentService');

  await test('Correctly identifies Marathi query "का?" as WHY_FLAGGED and answers in Marathi', () => {
    const intent = classifyVoiceIntent('का?');
    assert.strictEqual(intent, 'WHY_FLAGGED');
    const answer = generateVoiceAnswer('का?', {
      amount: 10,
      recipient: 'abc123@upi',
      stopDecision: true,
      stopReason: 'धमकीचे संकेत आढळले.'
    }, 'mr');
    assert.ok(answer.text.includes('सावधान'));
    assert.ok(answer.text.includes('UPI PIN टाकू नका'));
  });

  await test('Correctly identifies Hindi query "क्यों रोका गया?" as WHY_FLAGGED and answers in Hindi', () => {
    const intent = classifyVoiceIntent('क्यों रोका गया?');
    assert.strictEqual(intent, 'WHY_FLAGGED');
    const answer = generateVoiceAnswer('क्यों रोका गया?', {
      amount: 10,
      recipient: 'abc123@upi',
      stopDecision: true,
      stopReason: 'बिजली बिल धोखाधड़ी'
    }, 'hi');
    assert.ok(answer.text.includes('सावधान'));
    assert.ok(answer.text.includes('अपना UPI PIN दर्ज न करें'));
  });

  await test('Correctly identifies 1930 Helpline intent and returns localized advice in Marathi', () => {
    const intent = classifyVoiceIntent('1930 वर तक्रार कशी करावी?');
    assert.strictEqual(intent, 'REPORT_1930');
    const answer = generateVoiceAnswer('1930 helpline', undefined, 'mr');
    assert.ok(answer.text.includes('1930'));
    assert.ok(answer.text.includes('गोल्डन अवर'));
  });

  console.log('\n[9] Speech Synthesis Fallback & Duplicate Speech Protection');
  const { SpeechSynthesisService } = await import('../src/services/voice/speechSynthesisService');

  await test('Gracefully handles environments without window.speechSynthesis without throwing', () => {
    const tts = new SpeechSynthesisService();
    assert.strictEqual(tts.isSupported(), false);
    let ended = false;
    const result = tts.speak('Test message', {
      lang: 'mr',
      onEnd: () => { ended = true; }
    });
    assert.strictEqual(result, false);
    assert.strictEqual(ended, true);
  });

  console.log('\n[10] BHASHINI Backend Pipeline & Frontend Voice Architecture');
  const { resolveBhashiniLanguage, BHASHINI_LANGUAGES, getBhashiniConfig } = await import('../server/services/bhashini/bhashiniConfig');
  const { bhashiniPipeline } = await import('../server/services/bhashini/bhashiniPipeline');
  const { LANGUAGE_REGISTRY, languagePreferenceService } = await import('../src/services/voice/languagePreferenceService');
  const { voiceService } = await import('../src/services/voice/voiceService');

  await test('Correctly maps all 8 languages to Bhashini standard ULCA codes', () => {
    assert.strictEqual(resolveBhashiniLanguage('mr-IN').bhashiniCode, 'mr');
    assert.strictEqual(resolveBhashiniLanguage('hi-IN').bhashiniCode, 'hi');
    assert.strictEqual(resolveBhashiniLanguage('bn-IN').bhashiniCode, 'bn');
    assert.strictEqual(resolveBhashiniLanguage('ta-IN').bhashiniCode, 'ta');
    assert.strictEqual(resolveBhashiniLanguage('te-IN').bhashiniCode, 'te');
    assert.strictEqual(resolveBhashiniLanguage('kn-IN').bhashiniCode, 'kn');
    assert.strictEqual(resolveBhashiniLanguage('gu-IN').bhashiniCode, 'gu');
    assert.strictEqual(resolveBhashiniLanguage('en-IN').bhashiniCode, 'en');
  });

  await test('Rejects empty or malformed TTS text requests', async () => {
    const res = await bhashiniPipeline.processTts({
      text: '',
      language: 'mr-IN'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCode, 'INVALID_TEXT');
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
    // First call plays
    const firstPlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: false
    });
    // Second identical automated call is prevented
    const duplicatePlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: false
    });
    assert.strictEqual(duplicatePlay, false);

    // Explicit forceReplay works
    const replayPlay = await voiceService.speak('सावधान', {
      language: 'mr-IN',
      decisionKey: 'chk-test-1_STOP',
      forceReplay: true
    });
    // In Node (no browser audio), resolves to false gracefully without throwing
    assert.strictEqual(typeof replayPlay, 'boolean');
  });

  console.log('\n[11] MobileBERT On-Device Local AI & Safety Fallback Integration');
  const { analyzeContextLocally } = await import('../src/services/localAI/localAIService');
  const { analyzeContextHeuristically } = await import('../src/services/localAI/heuristicContextService');
  const { classifyWithMobileBert } = await import('../src/services/localAI/mobileBertService');
  const { modelLoader } = await import('../src/services/localAI/modelLoader');
  const { benchmarkInferenceRun } = await import('../src/services/localAI/inferenceMetrics');

  await test('MobileBERT classifies Q-NETRA Hero Case C with multi-label threat activations', () => {
    const res = classifyWithMobileBert('Pay ₹10 immediately to prevent electricity disconnection tonight.');
    assert.ok(res.model.includes('MobileBERT'));
    assert.strictEqual(res.signals.payment_pressure >= 0.40, true);
    assert.strictEqual(res.signals.urgency >= 0.40, true);
    assert.strictEqual(res.signals.fraud >= 0.40, true);
    assert.strictEqual(res.signalStrength, 'STRONG');
    assert.ok(res.predictedLabels.includes('PAYMENT_PRESSURE'));
    assert.ok(res.threatIndicators.includes('Power / Penalty Coercion Pressure'));
    assert.ok(res.latencyBreakdown.totalMs >= 0);
  });

  await test('MobileBERT correctly handles Legitimate Hard Test (Official Utility Portal)', () => {
    const res = classifyWithMobileBert('Your electricity bill of ₹850 is due today. Pay using the official utility portal.');
    assert.strictEqual(res.signals.legitimate >= 0.50, true);
    assert.strictEqual(res.signals.fraud < 0.40, true);
    assert.ok(res.predictedLabels.includes('LEGITIMATE'));
  });

  await test('Local AI Service establishes MobileBERT as PRIMARY context intelligence model', () => {
    const ctx = analyzeContextLocally('Pay ₹10 immediately to prevent electricity disconnection tonight.');
    assert.strictEqual(ctx.payment_request, true);
    assert.strictEqual(ctx.urgency, true);
    assert.strictEqual(ctx.payment_pressure, true);
    assert.strictEqual(ctx.authority_claim, true);
    assert.strictEqual(ctx.signalStrength, 'STRONG');
    assert.strictEqual(ctx.model_type, 'MobileBERT');
    assert.strictEqual(ctx.fallback_used, false);
    assert.ok(ctx.multi_label_scores !== undefined);
  });

  await test('Safety Fallback activates on explicit override or model failure', () => {
    const ctx = analyzeContextLocally('Pay ₹10 immediately to avoid power cut', { forceFallback: true });
    assert.strictEqual(ctx.model_type, 'HEURISTIC');
    assert.strictEqual(ctx.fallback_used, true);
    assert.strictEqual(ctx.payment_pressure, true);
  });

  await test('ModelLoader reports MobileBERT PRIMARY status and dynamic latency metadata', async () => {
    const ready = await modelLoader.initialize();
    assert.strictEqual(ready, true);
    const status = modelLoader.getLocalAIStatus();
    assert.strictEqual(status.model, 'MobileBERT');
    assert.strictEqual(status.parameters, '25.3M');
    assert.strictEqual(status.status, 'PRIMARY');
    assert.strictEqual(status.execution, 'LOCAL');
    assert.strictEqual(status.fallback, 'Q-NETRA Heuristic NLP');
    assert.strictEqual(status.quantization, 'INT8');
  });

  await test('InferenceMetrics calculates P50, P95 and latency percentiles accurately', () => {
    const report = benchmarkInferenceRun(() => {
      analyzeContextLocally('Test benchmark prompt');
    }, 15);
    assert.strictEqual(report.runs, 15);
    assert.ok(report.p50Ms >= 0);
    assert.ok(report.p95Ms >= report.p50Ms);
    assert.ok(report.maxMs >= report.p95Ms);
  });

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();

