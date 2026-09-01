/**
 * Q-NETRA AI — Production MobileBERT WordPiece Tokenizer
 * 
 * Implements genuine, standard BERT/MobileBERT WordPiece tokenization matching
 * the official 30,522 vocabulary ID space (google/mobilebert-uncased).
 * 
 * Special Token Mappings:
 *   [PAD]  = 0
 *   [UNK]  = 100
 *   [CLS]  = 101
 *   [SEP]  = 102
 *   [MASK] = 103
 */

export const PAD_TOKEN_ID = 0;
export const UNK_TOKEN_ID = 100;
export const CLS_TOKEN_ID = 101;
export const SEP_TOKEN_ID = 102;
export const MASK_TOKEN_ID = 103;
export const VOCAB_SIZE = 30522;
export const DEFAULT_MAX_LENGTH = 64;

export interface TokenizationResult {
  inputIds: BigInt64Array;
  attentionMask: BigInt64Array;
  tokens: string[];
  tokenIds: number[];
  length: number;
}

/**
 * Checks if character code is a Unicode punctuation mark or symbol.
 */
function isPunctuationCode(cp: number): boolean {
  if (
    (cp >= 33 && cp <= 47) ||
    (cp >= 58 && cp <= 64) ||
    (cp >= 91 && cp <= 96) ||
    (cp >= 123 && cp <= 126)
  ) {
    return true;
  }
  // Indian Rupee Symbol (₹) and common currency / punctuation unicode blocks
  if (cp === 0x20b9 || (cp >= 0x2000 && cp <= 0x206f) || (cp >= 0x2e00 && cp <= 0x2e7f)) {
    return true;
  }
  return false;
}

/**
 * Splits text into basic word/punctuation tokens according to standard BERT uncased tokenization.
 */
export function basicTokenize(rawText: string): string[] {
  const text = String(rawText || '').toLowerCase().trim();
  if (!text) return [];

  const tokens: string[] = [];
  let currentWord = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const cp = char.charCodeAt(0);

    if (/\s/.test(char)) {
      if (currentWord.length > 0) {
        tokens.push(currentWord);
        currentWord = '';
      }
    } else if (isPunctuationCode(cp)) {
      if (currentWord.length > 0) {
        tokens.push(currentWord);
        currentWord = '';
      }
      tokens.push(char);
    } else {
      currentWord += char;
    }
  }

  if (currentWord.length > 0) {
    tokens.push(currentWord);
  }

  return tokens;
}

export class WordPieceTokenizer {
  private vocabMap: Map<string, number> = new Map();
  private invVocab: string[] = [];
  private isInitialized = false;

  constructor() {
    this.tryAutoLoad();
  }

  /**
   * Attempts automatic loading of vocab.txt from filesystem (Node.js) or embedded cache.
   */
  public tryAutoLoad(): void {
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      try {
        import('fs').then((fs) => {
          import('path').then((path) => {
            const candidatePaths = [
              path.resolve(process.cwd(), 'public', 'models', 'vocab.txt'),
              path.resolve(process.cwd(), 'research', 'models', 'vocab.txt')
            ];

            for (const p of candidatePaths) {
              if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, 'utf8');
                this.loadVocabulary(content);
                return;
              }
            }
          }).catch(() => {});
        }).catch(() => {});
      } catch {
        // Fall through to lazy/manual initialization
      }
    }
  }

  /**
   * Asynchronously loads vocabulary from URL for browser/WebView environments.
   */
  public async loadFromUrl(url: string = '/models/vocab.txt'): Promise<boolean> {
    if (this.isLoaded()) return true;
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          this.loadVocabulary(text);
          return true;
        }
      }
    } catch (err) {
      console.warn('[WordPieceTokenizer] Failed loading vocab from URL:', err);
    }
    return this.isLoaded();
  }

  /**
   * Loads vocabulary from raw vocab.txt content string or array of words.
   */
  public loadVocabulary(vocabContent: string | string[]): void {
    this.vocabMap.clear();
    this.invVocab = [];

    const lines = Array.isArray(vocabContent)
      ? vocabContent
      : vocabContent.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const word = lines[i].trim();
      if (word.length > 0) {
        this.vocabMap.set(word, i);
        this.invVocab.push(word);
      }
    }

    this.isInitialized = this.vocabMap.size > 0;
  }

  public isLoaded(): boolean {
    return this.isInitialized && this.vocabMap.size > 0;
  }

  public getVocabSize(): number {
    return this.vocabMap.size;
  }

  /**
   * Tokenizes a single word into WordPiece subword tokens.
   */
  private tokenizeWord(word: string): { tokens: string[]; ids: number[] } {
    if (this.vocabMap.has(word)) {
      return {
        tokens: [word],
        ids: [this.vocabMap.get(word)!]
      };
    }

    const subTokens: string[] = [];
    const subIds: number[] = [];
    let isBad = false;
    let start = 0;

    while (start < word.length) {
      let end = word.length;
      let curSubstr = '';
      let curId = -1;

      while (start < end) {
        let substr = word.slice(start, end);
        if (start > 0) {
          substr = '##' + substr;
        }

        if (this.vocabMap.has(substr)) {
          curSubstr = substr;
          curId = this.vocabMap.get(substr)!;
          break;
        }
        end--;
      }

      if (curId === -1) {
        isBad = true;
        break;
      }

      subTokens.push(curSubstr);
      subIds.push(curId);
      start = end;
    }

    if (isBad || subTokens.length === 0) {
      return {
        tokens: ['[UNK]'],
        ids: [UNK_TOKEN_ID]
      };
    }

    return {
      tokens: subTokens,
      ids: subIds
    };
  }

  /**
   * Tokenizes raw text into WordPiece string tokens and integer token IDs.
   */
  public tokenize(text: string): { tokens: string[]; ids: number[] } {
    if (!this.isLoaded()) {
      this.tryAutoLoad();
    }

    const words = basicTokenize(text);
    const allTokens: string[] = [];
    const allIds: number[] = [];

    for (const w of words) {
      const res = this.tokenizeWord(w);
      for (let i = 0; i < res.tokens.length; i++) {
        allTokens.push(res.tokens[i]);
        allIds.push(res.ids[i]);
      }
    }

    return {
      tokens: allTokens,
      ids: allIds
    };
  }

  /**
   * Encodes raw text into padded and truncated tensors for MobileBERT ONNX inference.
   */
  public encode(text: string, maxLength: number = DEFAULT_MAX_LENGTH): TokenizationResult {
    const { tokens, ids } = this.tokenize(text);

    // Max tokens that can fit between [CLS] and [SEP]
    const maxBody = Math.max(0, maxLength - 2);
    const truncatedTokens = tokens.slice(0, maxBody);
    const truncatedIds = ids.slice(0, maxBody);

    const fullTokens: string[] = ['[CLS]', ...truncatedTokens, '[SEP]'];
    const fullIds: number[] = [CLS_TOKEN_ID, ...truncatedIds, SEP_TOKEN_ID];

    const inputIds = new BigInt64Array(maxLength);
    const attentionMask = new BigInt64Array(maxLength);

    const validLength = fullIds.length;

    for (let i = 0; i < maxLength; i++) {
      if (i < validLength) {
        inputIds[i] = BigInt(fullIds[i]);
        attentionMask[i] = 1n;
      } else {
        inputIds[i] = BigInt(PAD_TOKEN_ID);
        attentionMask[i] = 0n;
      }
    }

    return {
      inputIds,
      attentionMask,
      tokens: fullTokens,
      tokenIds: fullIds,
      length: validLength
    };
  }
}

// Global Singleton Instance
export const wordPieceTokenizer = new WordPieceTokenizer();

/**
 * Convenience export for direct encoding
 */
export function wordPieceEncode(text: string, maxLength: number = DEFAULT_MAX_LENGTH): TokenizationResult {
  return wordPieceTokenizer.encode(text, maxLength);
}

export { wordPieceEncode as tokenizeInput };
export { wordPieceTokenizer as tokenizer };
