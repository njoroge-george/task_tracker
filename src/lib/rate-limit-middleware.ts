/**
 * Rate Limiting Middleware for Next.js API Routes
 * Provides easy-to-use wrappers for applying rate limits
 */

import { NextRequest, NextResponse } from "next/server";
import {
  apiLimiter,
  authLimiter,
  strictLimiter,
  paymentLimiter,
  uploadLimiter,
  getClientIdentifier,
  checkRateLimit,
  createRateLimitHeaders,
  inMemoryApiLimiter,
  inMemoryAuthLimiter,
  inMemoryStrictLimiter,
  inMemoryPaymentLimiter,
  inMemoryUploadLimiter,
} from "./rate-limit";

export type RateLimitType = "api" | "auth" | "strict" | "payment" | "upload";

/**
 * Apply rate limiting to an API route handler
 * 
 * @example
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(req, "auth");
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Your handler logic here
 * }
 * ```
 */
export async function applyRateLimit(
  request: NextRequest,
  type: RateLimitType = "api"
): Promise<{
  success: boolean;
  response?: NextResponse;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const identifier = getClientIdentifier(request);
  
  // Select appropriate limiter
  let limiter;
  let fallbackLimiter;
  
  switch (type) {
    case "auth":
      limiter = authLimiter;
      fallbackLimiter = inMemoryAuthLimiter;
      break;
    case "strict":
      limiter = strictLimiter;
      fallbackLimiter = inMemoryStrictLimiter;
      break;
    case "payment":
      limiter = paymentLimiter;
      fallbackLimiter = inMemoryPaymentLimiter;
      break;
    case "upload":
      limiter = uploadLimiter;
      fallbackLimiter = inMemoryUploadLimiter;
      break;
    case "api":
    default:
      limiter = apiLimiter;
      fallbackLimiter = inMemoryApiLimiter;
      break;
  }

  // Use Redis-based limiter if available, otherwise use in-memory fallback
  let result;
  if (limiter) {
    result = await checkRateLimit(limiter, identifier);
  } else {
    // Fallback to in-memory limiter
    result = await fallbackLimiter.check(identifier);
  }

  const headers = createRateLimitHeaders(result);

  if (!result.success) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((result.reset.getTime() - Date.now()) / 1000);
    headers.set("Retry-After", retryAfter.toString());

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers,
        }
      ),
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return {
    success: true,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   "auth"
 * );
 * ```
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  type: RateLimitType = "api"
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResult = await applyRateLimit(req, type);
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Call the original handler
    const response = await handler(req, ...args);
    
    // Add rate limit headers to successful responses
    const headers = createRateLimitHeaders(rateLimitResult);
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Check if request is rate limited without consuming a request
 * Useful for checking limits before expensive operations
 */
export async function checkRateLimitStatus(
  request: NextRequest,
  type: RateLimitType = "api"
): Promise<{
  limited: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const result = await applyRateLimit(request, type);
  
  return {
    limited: !result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
