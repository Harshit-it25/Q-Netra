import dotenv from 'dotenv';
dotenv.config();

export const SERVER_CONFIG = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim().toLowerCase())
    : [],
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  rateLimits: {
    standardApi: { max: 120, windowMs: 60000 },
    aiAdvisor: { max: 30, windowMs: 60000 }
  }
};
