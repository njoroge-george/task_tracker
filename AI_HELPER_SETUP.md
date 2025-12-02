# AI Helper Setup Guide

## Current Status

🟡 **MOCK MODE** - The AI Helper is currently running in demo/mock mode with pre-defined responses.

To enable **real AI-powered suggestions**, you need to configure OpenAI.

---

## How to Enable OpenAI Integration

### Option 1: Quick Setup (Recommended)

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Add to Your .env File**
   ```bash
   # Add this line to your .env or .env.local file
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

4. **That's it!** The AI Helper will now use real OpenAI GPT-4 🎉

---

## How It Works

The `/api/code/ai-helper` route automatically detects if `OPENAI_API_KEY` is set:

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_OPENAI = !!OPENAI_API_KEY;

if (USE_OPENAI) {
  // ✅ Call OpenAI GPT-4
  response = await callOpenAI(...);
} else {
  // ⚠️ Fall back to mock responses
  response = await generateCodeMock(...);
}
```

### Mock Mode (Current)
- ❌ No API key required
- ❌ Returns generic, template-based responses
- ✅ Shows you how the UI works
- ✅ Includes reminder to add API key

### OpenAI Mode (After Setup)
- ✅ Real AI-powered suggestions
- ✅ GPT-4 for best quality
- ✅ Context-aware code generation
- ✅ Intelligent bug detection
- ✅ Smart code optimization

---

## OpenAI Models Available

You can change the model in `/src/app/api/code/ai-helper/route.ts`:

```typescript
model: "gpt-4",              // Best quality, slower, more expensive
// OR
model: "gpt-3.5-turbo",      // Fast, cheaper, good quality
// OR  
model: "gpt-4-turbo",        // Balanced option
```

---

## Cost Estimates

OpenAI pricing (as of 2024):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4 | $30 | $60 |
| GPT-3.5-turbo | $0.50 | $1.50 |
| GPT-4-turbo | $10 | $30 |

**Typical usage per request**: ~200-500 tokens = $0.01-0.03 per request (GPT-4)

💡 **Tip**: Start with GPT-3.5-turbo for cost savings, upgrade to GPT-4 for better results.

---

## Alternative: Use Anthropic Claude

If you prefer Claude over ChatGPT, you can modify the route:

1. Get Anthropic API key from https://console.anthropic.com/

2. Add to .env:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. Update the code to call Anthropic's API instead of OpenAI

---

## Features by Mode

### 4 AI Modes Available:

1. **🤖 Generate** - Create code from descriptions
   - Input: "Create a function to fetch user data"
   - Output: Complete working code

2. **📖 Explain** - Understand existing code
   - Input: Your code
   - Output: Detailed explanation of what it does

3. **🔧 Fix** - Debug and fix errors
   - Input: Buggy code
   - Output: Fixed code with explanations

4. **⚡ Optimize** - Improve performance
   - Input: Working code
   - Output: Optimized version with improvements

---

## Testing the Integration

After adding your API key:

1. Go to `/dashboard/playground`
2. Click "🤖 AI Helper" button
3. Try any mode
4. You should see real AI responses instead of generic templates

---

## Troubleshooting

### ❌ Error: "OpenAI API error: 401"
- Your API key is invalid or expired
- Regenerate a new key from OpenAI dashboard

### ❌ Error: "OpenAI API error: 429"  
- You've hit rate limits
- Wait a few minutes or upgrade your OpenAI plan

### ❌ Still seeing mock responses
- Make sure `.env` file is in the project root
- Restart your dev server after adding the key
- Check the key doesn't have extra spaces or quotes

### ⚠️ Responses are slow
- GPT-4 can take 3-10 seconds for complex requests
- Consider switching to GPT-3.5-turbo for faster responses

---

## Security Best Practices

✅ **DO:**
- Keep API keys in `.env` files (never commit to git)
- Add `.env` to `.gitignore`
- Use environment variables for production
- Rotate keys periodically

❌ **DON'T:**
- Hard-code API keys in source code
- Share keys publicly
- Commit `.env` files to version control
- Use the same key across multiple projects

---

## Production Deployment

For production (Vercel, Netlify, etc.):

1. Add environment variable in your hosting dashboard:
   - Variable name: `OPENAI_API_KEY`
   - Value: Your OpenAI key

2. The code will automatically detect it

3. No code changes needed!

---

## Summary

| Feature | Mock Mode | OpenAI Mode |
|---------|-----------|-------------|
| API Key Required | ❌ No | ✅ Yes |
| Cost | Free | ~$0.01-0.03/request |
| Quality | Generic templates | AI-powered |
| Speed | Instant | 2-10 seconds |
| Setup | None | 2 minutes |

**Current Mode**: 🟡 MOCK (add OPENAI_API_KEY to upgrade)

---

## Need Help?

- OpenAI Docs: https://platform.openai.com/docs
- API Keys: https://platform.openai.com/api-keys
- Pricing: https://openai.com/pricing
