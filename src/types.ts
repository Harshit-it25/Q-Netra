export type ScreenType = 
  | 'home'
  | 'check-result'
  | 'trust-chain'
  | 'network'
  | 'settings'
  | 'scanner'
  | 'check-message'
  | 'enter-payment'
  | 'ask-ai';

export * from './domain/risk/types';
export * from './domain/payment/types';
export * from './domain/identity/types';
export * from './domain/network/types';
export * from './domain/story/types';
export * from './domain/trust/types';
export * from './domain/message/types';
export * from './domain/voice/types';
