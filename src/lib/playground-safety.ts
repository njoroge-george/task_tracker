// Code execution safety utilities

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
}

// Timeout mechanism for infinite loops
export class ExecutionTimeout extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionTimeout';
  }
}

// Check for potentially dangerous code patterns
export function validateCode(code: string, language: 'js' | 'html' | 'css' | 'python'): SafetyCheckResult {
  if (!code || code.trim().length === 0) {
    return { safe: true };
  }

  // Check for extremely long code (potential DOS)
  if (code.length > 50000) {
    return {
      safe: false,
      reason: 'Code exceeds maximum length (50,000 characters)',
    };
  }

  // JavaScript-specific checks
  if (language === 'js') {
    // Block eval and Function constructor
    const dangerousPatterns = [
      /\beval\s*\(/gi,
      /new\s+Function\s*\(/gi,
      /\bsetTimeout\s*\([^)]*(?:eval|Function)/gi,
      /\bsetInterval\s*\([^)]*(?:eval|Function)/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'Code contains potentially unsafe constructs (eval, Function constructor)',
        };
      }
    }

    // Check for excessive nested loops (potential infinite loop)
    const loopMatches = code.match(/\b(for|while|do)\b/g);
    if (loopMatches && loopMatches.length > 10) {
      return {
        safe: false,
        reason: 'Too many nested loops detected (maximum 10)',
      };
    }

    // Block access to sensitive browser APIs
    const blockedAPIs = [
      /\blocalStorage\b/gi,
      /\bsessionStorage\b/gi,
      /\bindexedDB\b/gi,
      /\bnavigator\.(?:geolocation|mediaDevices)/gi,
    ];

    for (const pattern of blockedAPIs) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'Code attempts to access restricted browser APIs',
        };
      }
    }
  }

  // HTML-specific checks
  if (language === 'html') {
    // Block inline scripts with dangerous patterns
    if (/<script[^>]*>[\s\S]*?\beval\b[\s\S]*?<\/script>/gi.test(code)) {
      return {
        safe: false,
        reason: 'HTML contains inline scripts with unsafe code',
      };
    }

    // Block iframes with javascript: protocol
    if (/<iframe[^>]*\bsrc\s*=\s*["']javascript:/gi.test(code)) {
      return {
        safe: false,
        reason: 'HTML contains iframes with javascript: protocol',
      };
    }
  }

  // Python-specific checks
  if (language === 'python') {
    const pythonDangerousPatterns = [
      /\bimport\s+os\b/gi,
      /\bimport\s+sys\b/gi,
      /\bimport\s+subprocess\b/gi,
      /\b__import__\b/gi,
      /\bexec\s*\(/gi,
      /\beval\s*\(/gi,
      /\bopen\s*\(/gi,
    ];

    for (const pattern of pythonDangerousPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'Python code contains potentially unsafe constructs (os, sys, exec, eval, file operations)',
        };
      }
    }
  }

  return { safe: true };
}

// Wrap code execution with timeout
export function executeWithTimeout<T>(
  fn: () => T,
  timeoutMs: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new ExecutionTimeout(`Execution timeout after ${timeoutMs}ms. Possible infinite loop detected.`));
    }, timeoutMs);

    try {
      const result = fn();
      clearTimeout(timeoutId);
      
      // Handle promises
      if (result instanceof Promise) {
        result
          .then((res) => {
            clearTimeout(timeoutId);
            resolve(res);
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            reject(err);
          });
      } else {
        resolve(result);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

// Sanitize user input before execution
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Limit excessive whitespace
  sanitized = sanitized.replace(/\n{10,}/g, '\n\n\n');
  
  return sanitized;
}

// Create a safe execution context for code
export function createSafeExecutionContext() {
  const logs: Array<{ type: string; args: any[] }> = [];
  
  const safeConsole = {
    log: (...args: any[]) => logs.push({ type: 'log', args }),
    error: (...args: any[]) => logs.push({ type: 'error', args }),
    warn: (...args: any[]) => logs.push({ type: 'warn', args }),
    info: (...args: any[]) => logs.push({ type: 'info', args }),
    debug: (...args: any[]) => logs.push({ type: 'debug', args }),
  };

  return {
    console: safeConsole,
    logs,
  };
}

// Monitor code execution performance
export interface ExecutionMetrics {
  executionTime: number;
  memoryUsed?: number;
  outputLines: number;
}

export function measureExecution<T>(fn: () => T): { result: T; metrics: ExecutionMetrics } {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize;
  
  const result = fn();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize;
  
  const metrics: ExecutionMetrics = {
    executionTime: endTime - startTime,
    outputLines: 0,
  };

  if (startMemory !== undefined && endMemory !== undefined) {
    metrics.memoryUsed = endMemory - startMemory;
  }

  return { result, metrics };
}

// Rate limiting for code execution
export class ExecutionRateLimiter {
  private executions: number[] = [];
  private maxExecutions: number;
  private windowMs: number;

  constructor(maxExecutions: number = 50, windowMs: number = 60000) {
    this.maxExecutions = maxExecutions;
    this.windowMs = windowMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    
    // Remove old executions outside the window
    this.executions = this.executions.filter(time => now - time < this.windowMs);
    
    if (this.executions.length >= this.maxExecutions) {
      return false;
    }
    
    this.executions.push(now);
    return true;
  }

  getRemainingExecutions(): number {
    const now = Date.now();
    this.executions = this.executions.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxExecutions - this.executions.length);
  }

  reset(): void {
    this.executions = [];
  }
}
