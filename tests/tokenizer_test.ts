import assert from 'assert';
import {
  wordPieceTokenizer,
  wordPieceEncode,
  PAD_TOKEN_ID,
  UNK_TOKEN_ID,
  CLS_TOKEN_ID,
  SEP_TOKEN_ID,
  MASK_TOKEN_ID,
  VOCAB_SIZE
} from '../src/services/localAI/tokenizer';

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

import fs from 'fs';
import path from 'path';

async function runTokenizerTests() {
  console.log('\n========================================');
  console.log('Q-NETRA AI — MOBILEBERT WORDPIECE TOKENIZER AUDIT');
  console.log('========================================\n');

  const vocabPath = path.resolve(process.cwd(), 'public', 'models', 'vocab.txt');
  if (fs.existsSync(vocabPath)) {
    const vocabContent = fs.readFileSync(vocabPath, 'utf8');
    wordPieceTokenizer.loadVocabulary(vocabContent);
  }

  console.log('[1] Vocabulary & Special Token Configuration');
  await test('Loads complete 30,522 vocabulary from vocab.txt', () => {
    assert.strictEqual(wordPieceTokenizer.isLoaded(), true, 'Tokenizer must be loaded with vocab.txt');
    assert.strictEqual(wordPieceTokenizer.getVocabSize(), VOCAB_SIZE, `Vocab size must be ${VOCAB_SIZE}`);
  });

  await test('Verifies exact special token IDs against MobileBERT standard', () => {
    assert.strictEqual(PAD_TOKEN_ID, 0, '[PAD] ID must be 0');
    assert.strictEqual(UNK_TOKEN_ID, 100, '[UNK] ID must be 100');
    assert.strictEqual(CLS_TOKEN_ID, 101, '[CLS] ID must be 101');
    assert.strictEqual(SEP_TOKEN_ID, 102, '[SEP] ID must be 102');
    assert.strictEqual(MASK_TOKEN_ID, 103, '[MASK] ID must be 103');
  });

  console.log('\n[2] Exact Subword String & Token ID Verification (Cross-Checked with Reference)');
  
  await test('Case 1: "hello" -> [101, 7592, 102]', () => {
    const res = wordPieceEncode('hello', 64);
    assert.deepStrictEqual(res.tokens.slice(0, 3), ['[CLS]', 'hello', '[SEP]']);
    assert.deepStrictEqual(res.tokenIds.slice(0, 3), [101, 7592, 102]);
    assert.strictEqual(Number(res.inputIds[0]), 101);
    assert.strictEqual(Number(res.inputIds[1]), 7592);
    assert.strictEqual(Number(res.inputIds[2]), 102);
    assert.strictEqual(Number(res.inputIds[3]), 0); // Padding
  });

  await test('Case 2: "electricity bill" -> [101, 6451, 3021, 102]', () => {
    const res = wordPieceEncode('electricity bill', 64);
    assert.deepStrictEqual(res.tokens.slice(0, 4), ['[CLS]', 'electricity', 'bill', '[SEP]']);
    assert.deepStrictEqual(res.tokenIds.slice(0, 4), [101, 6451, 3021, 102]);
  });

  await test('Case 3: "Pay immediately or your electricity will be disconnected"', () => {
    const text = 'Pay immediately or your electricity will be disconnected';
    const res = wordPieceEncode(text, 64);
    const expectedTokens = ['[CLS]', 'pay', 'immediately', 'or', 'your', 'electricity', 'will', 'be', 'disconnected', '[SEP]'];
    const expectedIds = [101, 3477, 3202, 2030, 2115, 6451, 2097, 2022, 23657, 102];
    assert.deepStrictEqual(res.tokens.slice(0, expectedTokens.length), expectedTokens);
    assert.deepStrictEqual(res.tokenIds.slice(0, expectedIds.length), expectedIds);
  });

  await test('Case 4: "Your HDFC account has been credited" (splits into ## continuation tokens)', () => {
    const text = 'Your HDFC account has been credited';
    const res = wordPieceEncode(text, 64);
    const expectedTokens = ['[CLS]', 'your', 'hd', '##fc', 'account', 'has', 'been', 'credited', '[SEP]'];
    const expectedIds = [101, 2115, 10751, 11329, 4070, 2038, 2042, 5827, 102];
    assert.deepStrictEqual(res.tokens.slice(0, expectedTokens.length), expectedTokens);
    assert.deepStrictEqual(res.tokenIds.slice(0, expectedIds.length), expectedIds);
  });

  await test('Case 5: Continuation token splitting for complex words', () => {
    const res = wordPieceEncode('unverified', 64);
    assert.ok(res.tokens.includes('##ver') || res.tokens.includes('##verified') || res.tokens.length > 3);
    assert.strictEqual(res.tokens[0], '[CLS]');
    assert.strictEqual(res.tokens[res.tokens.length - 1], '[SEP]');
  });

  await test('Case 6: Out-of-vocabulary / unusual unicode character maps to [UNK] (100)', () => {
    const res = wordPieceEncode('hello 你 world', 64);
    assert.ok(res.tokens.includes('[UNK]'));
    assert.ok(res.tokenIds.includes(100));
  });

  console.log('\n[3] Tensor Format, Padding & Attention Mask Compliance');

  await test('Generates BigInt64Array tensors of exact shape [64] with compliant attention mask', () => {
    const res = wordPieceEncode('Test payment alert', 64);
    assert.strictEqual(res.inputIds.length, 64);
    assert.strictEqual(res.attentionMask.length, 64);
    assert.strictEqual(res.inputIds instanceof BigInt64Array, true);
    assert.strictEqual(res.attentionMask instanceof BigInt64Array, true);

    const validCount = res.length;
    for (let i = 0; i < 64; i++) {
      if (i < validCount) {
        assert.strictEqual(res.attentionMask[i], 1n, `Attention mask at ${i} should be 1`);
        assert.notStrictEqual(res.inputIds[i], 0n, `Input ID at ${i} should not be 0`);
      } else {
        assert.strictEqual(res.attentionMask[i], 0n, `Attention mask at ${i} should be 0`);
        assert.strictEqual(res.inputIds[i], 0n, `Input ID at ${i} should be 0`);
      }
    }
  });

  await test('Applies truncation properly when text exceeds max length', () => {
    const longText = 'payment warning electricity bill due '.repeat(30);
    const res = wordPieceEncode(longText, 64);
    assert.strictEqual(res.inputIds.length, 64);
    assert.strictEqual(res.tokens.length, 64);
    assert.strictEqual(res.tokens[0], '[CLS]');
    assert.strictEqual(res.tokens[63], '[SEP]');
    assert.strictEqual(res.tokenIds[0], 101);
    assert.strictEqual(res.tokenIds[63], 102);
  });

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTokenizerTests();
