/**
 * Security utilities for the playground
 * Handles code validation, sandboxing, and protection against malicious code
 */

// Maximum execution time for code (milliseconds)
const MAX_EXECUTION_TIME = 5000;

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /XMLHttpRequest/gi,
  /\.innerHTML\s*=/gi,
  /document\.write/gi,
  /import\s+/gi,
  /require\s*\(/gi,
  /process\./gi,
  /child_process/gi,
  /fs\./gi,
  /__dirname/gi,
  /___filename/gi,
  /global\./gi,
];

// System-level commands to block in Python
const PYTHON_DANGEROUS_PATTERNS = [
  /import\s+os/gi,
  /import\s+sys/gi,
  /import\s+subprocess/gi,
  /from\s+os\s+import/gi,
  /from\s+sys\s+import/gi,
  /exec\s*\(/gi,
  /eval\s*\(/gi,
  /__import__/gi,
  /open\s*\(/gi,
  /file\s*\(/gi,
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate JavaScript code for security issues
 */
export function validateJavaScript(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || code.trim().length === 0) {
    return { isValid: true, errors, warnings };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Blocked: Unsafe code pattern detected (${pattern.source})`);
    }
  }

  // Check for infinite loop patterns
  if (/while\s*\(\s*true\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Warning: Potential infinite loop detected (while(true) without break)');
  }

  if (/for\s*\(\s*;\s*;\s*\)/.test(code)) {
    warnings.push('Warning: Potential infinite loop detected (for(;;))');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Python code for security issues
 */
export function validatePython(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || code.trim().length === 0) {
    return { isValid: true, errors, warnings };
  }

  // Check for dangerous patterns
  for (const pattern of PYTHON_DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Blocked: Unsafe Python pattern detected (${pattern.source})`);
    }
  }

  // Check for infinite loops
  if (/while\s+True\s*:/.test(code) && !/break/.test(code)) {
    warnings.push('Warning: Potential infinite loop detected (while True without break)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Wrap JavaScript code with timeout protection
 */
export function wrapWithTimeout(code: string, timeout: number = MAX_EXECUTION_TIME): string {
  return `
    (function() {
      const startTime = Date.now();
      const checkTimeout = () => {
        if (Date.now() - startTime > ${timeout}) {
          throw new Error('Code execution timeout (${timeout}ms exceeded)');
        }
      };
      
      // Override console methods to include timeout check
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.log = function(...args) {
        checkTimeout();
        originalLog.apply(console, args);
      };
      
      console.error = function(...args) {
        checkTimeout();
        originalError.apply(console, args);
      };
      
      console.warn = function(...args) {
        checkTimeout();
        originalWarn.apply(console, args);
      };
      
      try {
        ${code}
      } catch (error) {
        if (error.message.includes('timeout')) {
          console.error('⚠️ TIMEOUT: Code execution stopped after ${timeout}ms');
        } else {
          console.error('Error:', error.message);
        }
      }
    })();
  `;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  let sanitized = html;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Create a sandboxed execution environment
 */
export function createSandbox() {
  return {
    // Restricted global objects
    console: {
      log: (...args: any[]) => console.log('[Sandbox]', ...args),
      error: (...args: any[]) => console.error('[Sandbox]', ...args),
      warn: (...args: any[]) => console.warn('[Sandbox]', ...args),
    },
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    // Block dangerous globals
    eval: undefined,
    Function: undefined,
    setTimeout: undefined,
    setInterval: undefined,
    XMLHttpRequest: undefined,
    fetch: undefined,
    import: undefined,
    require: undefined,
  };
}

/**
 * Validate and sanitize all code before execution
 */
export function validateAndSanitize(html: string, css: string, js: string, python: string): {
  html: string;
  css: string;
  js: string;
  python: string;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate JavaScript
  const jsValidation = validateJavaScript(js);
  errors.push(...jsValidation.errors);
  warnings.push(...jsValidation.warnings);

  // Validate Python
  const pyValidation = validatePython(python);
  errors.push(...pyValidation.errors);
  warnings.push(...pyValidation.warnings);

  // Sanitize HTML (optional - can be disabled for trusted users)
  // const sanitizedHTML = sanitizeHTML(html);

  return {
    html, // Use original or sanitizedHTML
    css,
    js: jsValidation.isValid ? js : '', // Block if invalid
    python: pyValidation.isValid ? python : '', // Block if invalid
    errors,
    warnings,
  };
}

/**
 * Rate limiting for code execution
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number = 10;
  private readonly windowMs: number = 60000; // 1 minute

  canExecute(userId: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(userId, recentAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
