import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AI_CONFIG, isAIEnabled, getAIConfigInfo } from "@/lib/ai-config";

const USE_OPENAI = isAIEnabled();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: AI_CONFIG.errors.unauthorized }, { status: 401 });
    }

    const { language, mode, prompt, code, additionalContext } = await request.json();

    if (!language || !mode) {
      return NextResponse.json(
        { error: "Language and mode are required" },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ['generate', 'explain', 'fix', 'optimize'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: AI_CONFIG.errors.invalidMode },
        { status: 400 }
      );
    }

    let response = "";
    const configInfo = getAIConfigInfo();

    // Use OpenAI if configured, otherwise fall back to mock
    if (USE_OPENAI) {
      response = await callOpenAI(mode, language, prompt, code, additionalContext);
    } else {
      // Fall back to mock responses
      switch (mode) {
        case "generate":
          response = await generateCodeMock(language, prompt, code);
          break;
        case "explain":
          response = await explainCodeMock(language, code, additionalContext);
          break;
        case "fix":
          response = await fixCodeMock(language, code, additionalContext);
          break;
        case "optimize":
          response = await optimizeCodeMock(language, code, additionalContext);
          break;
        default:
          return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      response, 
      config: configInfo,
      mode,
      language,
    });
  } catch (error) {
    console.error("AI Helper error:", error);
    return NextResponse.json(
      { error: AI_CONFIG.errors.apiError },
      { status: 500 }
    );
  }
}

// OpenAI Integration
async function callOpenAI(
  mode: string,
  language: string,
  prompt: string,
  code: string,
  additionalContext?: string
): Promise<string> {
  const systemPrompt = AI_CONFIG.systemPrompts[mode as keyof typeof AI_CONFIG.systemPrompts](language);

  const userPrompts = {
    generate: prompt || "Generate code",
    explain: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`,
    fix: `Find and fix issues in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`,
    optimize: `Optimize this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout.requestTimeout);

    const response = await fetch(AI_CONFIG.openai.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompts[mode as keyof typeof userPrompts],
          },
        ],
        temperature: AI_CONFIG.openai.temperature,
        max_tokens: AI_CONFIG.openai.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from AI";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle specific errors
    if (error.name === 'AbortError') {
      return AI_CONFIG.errors.requestTimeout;
    }
    
    // Fall back to mock if OpenAI fails and fallback is enabled
    if (AI_CONFIG.features.useMockFallback) {
      return `⚠️ ${AI_CONFIG.errors.apiError}\n\nFallback response:\n\n${await generateCodeMock(language, prompt, code)}`;
    }
    
    throw error;
  }
}

// Mock functions (fallback when no API key)
async function generateCodeMock(language: string, prompt: string, context?: string): Promise<string>

// Mock functions (fallback when no API key)
async function generateCodeMock(language: string, prompt: string, context?: string): Promise<string> {
  // This would call OpenAI/Anthropic API
  // For demonstration, returning templates

  const templates: Record<string, string> = {
    "fetch data": `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`,
    "loading spinner": `<div class="spinner"></div>

/* CSS */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
    "form validation": `function validateForm(formData) {
  const errors = {};
  
  if (!formData.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}`,
  };

  // Simple matching for demo
  for (const [key, template] of Object.entries(templates)) {
    if (prompt.toLowerCase().includes(key)) {
      return `Here's a ${language} implementation:\n\n\`\`\`${language}\n${template}\n\`\`\``;
    }
  }

  return `I can help you generate ${language} code. Here's a basic template:\n\n\`\`\`${language}\n// Your code will be generated here based on the prompt:\n// "${prompt}"\n\nfunction example() {\n  // Implementation\n}\n\`\`\`\n\n💡 **Tip**: Add OPENAI_API_KEY to your .env file for real AI-powered suggestions!`;
}

async function explainCodeMock(language: string, code: string, context?: string): Promise<string> {
  if (!code || code.trim().length === 0) {
    return "No code provided to explain.";
  }

  // Mock explanation
  return `This ${language} code does the following:

1. **Purpose**: The code appears to implement functionality for [main purpose].

2. **Key Components**:
   - Variables and functions are defined
   - Logic flow follows standard patterns
   - Uses ${language}-specific features

3. **How it works**:
   - Step 1: Initialization
   - Step 2: Processing
   - Step 3: Output/Return

4. **Potential improvements**:
   - Consider adding error handling
   - Code could be optimized for performance
   - Add comments for clarity

💡 **Tip**: Add OPENAI_API_KEY to your .env file for real AI-powered code analysis!

Would you like me to suggest specific improvements?`;
}

async function fixCodeMock(language: string, code: string, context?: string): Promise<string> {
  if (!code || code.trim().length === 0) {
    return "No code provided to fix.";
  }

  // Basic error detection (mock)
  const issues: string[] = [];

  // Check for common issues
  if (language === "js" || language === "javascript") {
    if (!code.includes("try") && code.includes("fetch")) {
      issues.push("Missing error handling for async operations");
    }
    if (code.includes("var ")) {
      issues.push("Consider using 'let' or 'const' instead of 'var'");
    }
    if (/console\.log/.test(code)) {
      issues.push("Remove console.log statements in production");
    }
  }

  if (issues.length === 0) {
    return "No obvious errors found! Your code looks good. However, here are some general recommendations:\n\n" +
           "1. Add more comments for clarity\n" +
           "2. Consider edge cases\n" +
           "3. Add input validation\n" +
           "4. Implement error handling\n\n" +
           "💡 **Tip**: Add OPENAI_API_KEY to your .env file for AI-powered bug detection!";
  }

  return `Found potential issues:\n\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")}\n\n` +
         `Here's the fixed version:\n\n\`\`\`${language}\n// Fixed code with improvements\n${code}\n\`\`\`\n\n` +
         `💡 **Tip**: Add OPENAI_API_KEY to your .env file for real AI-powered fixes!`;
}

async function optimizeCodeMock(language: string, code: string, context?: string): Promise<string> {
  if (!code || code.trim().length === 0) {
    return "No code provided to optimize.";
  }

  return `Here are optimization suggestions for your ${language} code:

**Performance Improvements:**
1. Cache repeated calculations
2. Use more efficient data structures
3. Reduce DOM manipulations (if applicable)
4. Minimize nested loops

**Code Quality:**
1. Extract repeated logic into reusable functions
2. Use descriptive variable names
3. Add proper type checking
4. Implement defensive programming

**Best Practices:**
1. Follow ${language} style guidelines
2. Add comprehensive error handling
3. Write unit tests
4. Document complex logic

💡 **Tip**: Add OPENAI_API_KEY to your .env file for real AI-powered optimization!

Would you like me to provide a specific optimized version?`;
}
