/**
 * In-memory rate limiter
 * For production, replace with Upstash Redis
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

// In-memory stores for different rate limit types
const messageBurstStore: RateLimitStore = new Map();
const messageHourlyStore: RateLimitStore = new Map();
const ipStore: RateLimitStore = new Map();

// Rate limit configurations
const RATE_LIMITS = {
  // 1 message per 10 seconds per agent
  messageBurst: {
    limit: 1,
    windowMs: 10 * 1000,
  },
  // 50 messages per hour per agent
  messageHourly: {
    limit: 50,
    windowMs: 60 * 60 * 1000,
  },
  // 60 requests per minute for unauthenticated IPs (spectator mode)
  ipRequests: {
    limit: 60,
    windowMs: 60 * 1000,
  },
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
};

function checkLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // If no entry or window has passed, reset
  if (!entry || entry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Check message burst rate limit (1 per 10 seconds)
 */
export function checkMessageBurstLimit(agentId: string): RateLimitResult {
  return checkLimit(
    messageBurstStore,
    agentId,
    RATE_LIMITS.messageBurst.limit,
    RATE_LIMITS.messageBurst.windowMs
  );
}

/**
 * Check message hourly rate limit (50 per hour)
 */
export function checkMessageHourlyLimit(agentId: string): RateLimitResult {
  return checkLimit(
    messageHourlyStore,
    agentId,
    RATE_LIMITS.messageHourly.limit,
    RATE_LIMITS.messageHourly.windowMs
  );
}

/**
 * Check IP-based rate limit for unauthenticated requests
 */
export function checkIpRateLimit(ip: string): RateLimitResult {
  return checkLimit(
    ipStore,
    ip,
    RATE_LIMITS.ipRequests.limit,
    RATE_LIMITS.ipRequests.windowMs
  );
}

/**
 * Combined rate limit check for sending messages
 * Returns the most restrictive result
 */
export function checkMessageRateLimits(agentId: string): RateLimitResult {
  const burstResult = checkMessageBurstLimit(agentId);
  if (!burstResult.allowed) {
    return burstResult;
  }

  const hourlyResult = checkMessageHourlyLimit(agentId);
  if (!hourlyResult.allowed) {
    return hourlyResult;
  }

  // Return the result with fewer remaining requests
  return burstResult.remaining < hourlyResult.remaining
    ? burstResult
    : hourlyResult;
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait before trying again.",
        retryAfter: result.retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter || 10),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const store of [messageBurstStore, messageHourlyStore, ipStore]) {
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt <= now) {
          store.delete(key);
        }
      }
    }
  }, 5 * 60 * 1000);
}
