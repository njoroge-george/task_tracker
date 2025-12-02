# AI Helper Configuration Guide

## Overview

The AI Helper is now **100% configurable** via environment variables with **zero hardcoded values**. All settings have sensible defaults and can be customized for your needs.

---

## Quick Start (Minimal Setup)

Just add one line to your `.env` file:

```bash
OPENAI_API_KEY="sk-your-key-here"
```

That's it! Everything else uses smart defaults.

---

## Complete Configuration Reference

### Core Settings (Required for AI)

```bash
# Your OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-proj-..."
```

### Model Configuration (Optional)

```bash
# Which OpenAI model to use
# Options: gpt-4, gpt-4-turbo, gpt-3.5-turbo
# Default: gpt-3.5-turbo
OPENAI_MODEL="gpt-3.5-turbo"

# Creativity level (0.0 - 1.0)
# 0.0 = Very deterministic, predictable
# 0.7 = Balanced (recommended)
# 1.0 = Very creative, diverse
# Default: 0.7
OPENAI_TEMPERATURE="0.7"

# Maximum response length in tokens
# Higher = longer responses, more cost
# Default: 1500
OPENAI_MAX_TOKENS="1500"
```

### Advanced Settings (Optional)

```bash
# Custom API endpoint (for Azure OpenAI, etc.)
# Default: https://api.openai.com/v1/chat/completions
OPENAI_API_URL="https://api.openai.com/v1/chat/completions"

# Enable fallback to mock responses if OpenAI fails
# Default: true
AI_USE_MOCK_FALLBACK="true"

# Log AI requests for debugging
# Default: false
AI_LOG_REQUESTS="false"
```

### Rate Limiting (Optional)

```bash
# Maximum requests per user per time window
# Default: 20
AI_RATE_LIMIT_MAX="20"

# Time window in milliseconds
# Default: 60000 (1 minute)
AI_RATE_LIMIT_WINDOW="60000"

# Request timeout in milliseconds
# Default: 30000 (30 seconds)
AI_REQUEST_TIMEOUT="30000"
```

---

## Configuration Presets

The system includes built-in presets you can reference:

### Fast Mode (Cheapest, Fastest)
```bash
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_TEMPERATURE="0.5"
OPENAI_MAX_TOKENS="1000"
```
- Cost: ~$0.0005 per request
- Speed: 1-3 seconds
- Quality: Good

### Balanced Mode (Recommended)
```bash
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_TEMPERATURE="0.7"
OPENAI_MAX_TOKENS="1500"
```
- Cost: ~$0.001 per request
- Speed: 2-5 seconds
- Quality: Very good

### Quality Mode (Best Results)
```bash
OPENAI_MODEL="gpt-4"
OPENAI_TEMPERATURE="0.7"
OPENAI_MAX_TOKENS="2000"
```
- Cost: ~$0.03 per request
- Speed: 5-15 seconds
- Quality: Excellent

### Creative Mode (Innovative Solutions)
```bash
OPENAI_MODEL="gpt-4"
OPENAI_TEMPERATURE="0.9"
OPENAI_MAX_TOKENS="2000"
```
- Cost: ~$0.03 per request
- Speed: 5-15 seconds
- Quality: Excellent, more diverse

---

## Model Comparison

| Model | Cost (per 1K tokens) | Speed | Quality | Best For |
|-------|---------------------|-------|---------|----------|
| gpt-3.5-turbo | $0.0005 - $0.0015 | Fast | Good | Development, testing |
| gpt-4-turbo | $0.01 - $0.03 | Medium | Great | Production |
| gpt-4 | $0.03 - $0.06 | Slow | Best | Complex tasks |

---

## Environment-Specific Configurations

### Development
```bash
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1000"
AI_LOG_REQUESTS="true"
AI_USE_MOCK_FALLBACK="true"
```

### Staging
```bash
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1500"
AI_LOG_REQUESTS="false"
AI_USE_MOCK_FALLBACK="true"
```

### Production
```bash
OPENAI_MODEL="gpt-4-turbo"
OPENAI_MAX_TOKENS="2000"
AI_LOG_REQUESTS="false"
AI_USE_MOCK_FALLBACK="false"
AI_RATE_LIMIT_MAX="10"
```

---

## Azure OpenAI Configuration

If you're using Azure OpenAI instead:

```bash
OPENAI_API_KEY="your-azure-key"
OPENAI_API_URL="https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview"
OPENAI_MODEL="gpt-4"  # Your deployment name
```

---

## How Configuration Works

### 1. Centralized Config File
All settings are managed in `/src/lib/ai-config.ts`:

```typescript
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    // ... etc
  }
}
```

### 2. Environment Variables
Values are read from `.env` file at runtime:

```
.env → process.env → AI_CONFIG → API Route
```

### 3. Smart Defaults
Every setting has a sensible default:
- No API key? → Mock mode
- No model specified? → gpt-3.5-turbo
- No temperature? → 0.7
- etc.

---

## Configuration Validation

The system validates all configurations:

✅ API key format
✅ Model availability  
✅ Numeric ranges (temperature 0-1, etc.)
✅ URL format
✅ Rate limit values

---

## Testing Configuration

### Check Current Config
Visit this endpoint to see active configuration:

```bash
GET /api/code/ai-helper/config
```

Response:
```json
{
  "enabled": true,
  "model": "gpt-3.5-turbo",
  "hasApiKey": true,
  "apiUrl": "https://api.openai.com/...",
  "mockFallback": true
}
```

### Test AI Functionality
Make a request and check the response metadata:

```json
{
  "response": "...",
  "config": {
    "enabled": true,
    "model": "gpt-3.5-turbo",
    "hasApiKey": true
  }
}
```

---

## Cost Management

### Estimate Your Costs

**Average request**: ~500 tokens (prompt + response)

With gpt-3.5-turbo:
- 100 requests/day = ~$0.75/month
- 1,000 requests/day = ~$7.50/month
- 10,000 requests/day = ~$75/month

With gpt-4:
- 100 requests/day = ~$30/month
- 1,000 requests/day = ~$300/month
- 10,000 requests/day = ~$3,000/month

### Cost Optimization Tips

1. **Use gpt-3.5-turbo** for development
2. **Lower max_tokens** for shorter responses
3. **Enable rate limiting** to prevent abuse
4. **Cache common requests** (future feature)
5. **Use mock fallback** when OpenAI is down

---

## Monitoring & Debugging

### Enable Logging
```bash
AI_LOG_REQUESTS="true"
```

This logs:
- Request timestamp
- User ID
- Mode (generate/explain/fix/optimize)
- Model used
- Token count
- Response time
- Errors

### View Logs
```bash
# Development
npm run dev

# Check server logs for:
[AI Helper] Request: { mode: 'generate', model: 'gpt-3.5-turbo' }
[AI Helper] Response: { tokens: 450, time: 2.3s }
```

---

## Security Best Practices

### ✅ DO:
- Store API keys in environment variables
- Use different keys for dev/staging/prod
- Enable rate limiting in production
- Rotate keys regularly
- Monitor usage and costs

### ❌ DON'T:
- Commit API keys to git
- Hard-code any configuration
- Share keys between projects
- Use production keys in development
- Disable rate limiting in production

---

## Troubleshooting

### Problem: "API key not working"
**Solution**: Check `.env` file:
```bash
# Wrong (has quotes in value)
OPENAI_API_KEY="sk-..."

# Wrong (has spaces)
OPENAI_API_KEY= sk-...

# Correct
OPENAI_API_KEY=sk-...
```

### Problem: "Responses are slow"
**Solutions**:
1. Switch to gpt-3.5-turbo
2. Lower max_tokens
3. Check network latency
4. Verify AI_REQUEST_TIMEOUT setting

### Problem: "Too many errors"
**Solutions**:
1. Enable mock fallback: `AI_USE_MOCK_FALLBACK=true`
2. Check API key validity
3. Verify OpenAI account status
4. Check rate limits

### Problem: "Configuration not updating"
**Solutions**:
1. Restart development server
2. Clear .next cache: `rm -rf .next`
3. Verify .env file location
4. Check for typos in variable names

---

## Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
model: "gpt-4",
temperature: 0.7,
max_tokens: 1000,
```

### After (Environment Variables)
```typescript
model: AI_CONFIG.openai.model,
temperature: AI_CONFIG.openai.temperature,
max_tokens: AI_CONFIG.openai.maxTokens,
```

**No hardcoded values anywhere!** 🎉

---

## Summary

| Aspect | Status |
|--------|--------|
| Hardcoded values | ❌ None |
| Environment variables | ✅ All configurable |
| Default values | ✅ Smart defaults |
| Validation | ✅ Full validation |
| Documentation | ✅ Complete |
| Type safety | ✅ TypeScript |
| Security | ✅ Best practices |

**The AI Helper is now 100% configurable!**
