/**
 * Rate Limiting Utility
 * Protects API routes from abuse and DoS attacks
 * 
 * @requires UPSTASH_REDIS_REST_URL - Redis REST URL from Upstash
 * @requires UPSTASH_REDIS_REST_TOKEN - Redis REST token from Upstash
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * General API rate limiter
 * Limit: 60 requests per minute per IP
 */
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

/**
 * Authentication rate limiter
 * Limit: 5 attempts per minute per IP (prevents brute force)
 */
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * Strict rate limiter for sensitive operations
 * Limit: 10 requests per 10 seconds per IP
 */
export const strictLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "ratelimit:strict",
    })
  : null;

/**
 * Payment/billing rate limiter
 * Limit: 3 requests per minute per IP (prevents payment spam)
 */
export const paymentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "ratelimit:payment",
    })
  : null;

/**
 * File upload rate limiter
 * Limit: 20 uploads per hour per IP
 */
export const uploadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:upload",
    })
  : null;

/**
 * Helper function to get client identifier from request
 * Uses IP address or falls back to a default identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (depending on hosting provider)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  
  const ip = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
  
  return ip.trim();
}

/**
 * Helper function to apply rate limiting to a request
 * Returns { success: boolean, limit: number, remaining: number, reset: Date }
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  // If Redis is not configured (development), allow all requests
  if (!limiter) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Rate limiting disabled (Redis not configured)');
    }
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: new Date(Date.now() + 60000),
    };
  }

  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(rateLimit: {
  limit: number;
  remaining: number;
  reset: Date;
}): Headers {
  const headers = new Headers();
  
  headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  headers.set("X-RateLimit-Reset", rateLimit.reset.toISOString());
  
  return headers;
}

/**
 * Development mode: In-memory rate limiter (fallback when Redis not available)
 * This is NOT suitable for production with multiple server instances
 */
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async check(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetAt) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: new Date(now + this.windowMs),
      };
    }

    // Within existing window
    if (entry.count >= this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: new Date(entry.resetAt),
      };
    }

    entry.count++;
    
    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - entry.count,
      reset: new Date(entry.resetAt),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

// Fallback in-memory limiters for development
export const inMemoryApiLimiter = new InMemoryRateLimiter(60, 60000); // 60/minute
export const inMemoryAuthLimiter = new InMemoryRateLimiter(5, 60000); // 5/minute
export const inMemoryStrictLimiter = new InMemoryRateLimiter(10, 10000); // 10/10s
export const inMemoryPaymentLimiter = new InMemoryRateLimiter(3, 60000); // 3/minute
export const inMemoryUploadLimiter = new InMemoryRateLimiter(20, 3600000); // 20/hour
