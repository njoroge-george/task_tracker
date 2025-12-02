/**
 * AI Helper Configuration
 * 
 * Centralized configuration for AI-powered code assistance.
 * All values can be overridden via environment variables.
 */

export const AI_CONFIG = {
  // OpenAI API Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
  },

  // Feature flags
  features: {
    enabled: !!process.env.OPENAI_API_KEY,
    useMockFallback: process.env.AI_USE_MOCK_FALLBACK !== 'false', // Default: true
    logRequests: process.env.AI_LOG_REQUESTS === 'true', // Default: false
  },

  // Rate limiting (requests per minute per user)
  rateLimit: {
    maxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX || '20'),
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '60000'), // 1 minute
  },

  // Timeout settings
  timeout: {
    requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000'), // 30 seconds
  },

  // Model presets for different use cases
  modelPresets: {
    fast: {
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 1000,
    },
    balanced: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1500,
    },
    quality: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    },
    creative: {
      model: 'gpt-4',
      temperature: 0.9,
      maxTokens: 2000,
    },
  },

  // System prompts for different modes
  systemPrompts: {
    generate: (language: string) => 
      `You are an expert ${language} developer. Generate clean, well-commented, production-ready code based on the user's request. Follow best practices and modern coding standards. Return only the code with brief inline comments explaining complex parts.`,
    
    explain: (language: string) => 
      `You are an expert ${language} developer and teacher. Explain the provided code clearly and concisely. Break down what it does, how it works, key concepts used, and suggest potential improvements. Use simple language and examples.`,
    
    fix: (language: string) => 
      `You are an expert ${language} developer and debugger. Analyze the code for bugs, errors, security issues, and code smells. Provide the fixed version with detailed explanations of what was wrong and how you fixed it.`,
    
    optimize: (language: string) => 
      `You are an expert ${language} developer focused on performance and code quality. Analyze and optimize the provided code for better performance, readability, maintainability, and adherence to best practices. Explain each optimization clearly.`,
  },

  // Error messages
  errors: {
    noApiKey: 'AI features require an OpenAI API key. Add OPENAI_API_KEY to your .env file.',
    rateLimitExceeded: 'Too many AI requests. Please wait a moment and try again.',
    requestTimeout: 'AI request timed out. Please try again with a smaller code snippet.',
    apiError: 'AI service temporarily unavailable. Please try again later.',
    invalidMode: 'Invalid AI mode specified.',
    unauthorized: 'You must be logged in to use AI features.',
  },
} as const;

/**
 * Get the current AI configuration preset
 */
export function getAIPreset(preset: keyof typeof AI_CONFIG.modelPresets = 'balanced') {
  return AI_CONFIG.modelPresets[preset];
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return AI_CONFIG.features.enabled;
}

/**
 * Get AI configuration for logging/debugging
 */
export function getAIConfigInfo() {
  return {
    enabled: AI_CONFIG.features.enabled,
    model: AI_CONFIG.openai.model,
    hasApiKey: !!AI_CONFIG.openai.apiKey,
    apiUrl: AI_CONFIG.openai.apiUrl,
    mockFallback: AI_CONFIG.features.useMockFallback,
  };
}
