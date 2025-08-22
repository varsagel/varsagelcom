interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitOptions {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
}

class RateLimiter {
  private tokens: Map<string, { count: number; reset: number }> = new Map();
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const tokenData = this.tokens.get(identifier);

    if (!tokenData || now > tokenData.reset) {
      // Reset or create new token
      const reset = now + this.interval;
      this.tokens.set(identifier, { count: 1, reset });
      
      return {
        success: true,
        limit: this.uniqueTokenPerInterval,
        remaining: this.uniqueTokenPerInterval - 1,
        reset
      };
    }

    if (tokenData.count >= this.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: this.uniqueTokenPerInterval,
        remaining: 0,
        reset: tokenData.reset
      };
    }

    tokenData.count++;
    this.tokens.set(identifier, tokenData);

    return {
      success: true,
      limit: this.uniqueTokenPerInterval,
      remaining: this.uniqueTokenPerInterval - tokenData.count,
      reset: tokenData.reset
    };
  }

  // Clean up expired tokens periodically
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.tokens.entries()) {
      if (now > value.reset) {
        this.tokens.delete(key);
      }
    }
  }
}

// Default rate limiter instances
const defaultLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100 // 100 requests per minute
});

const strictLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute
});

// Clean up expired tokens every 5 minutes
setInterval(() => {
  defaultLimiter.cleanup();
  strictLimiter.cleanup();
}, 5 * 60 * 1000);

export function rateLimit(identifier: string, strict = false): RateLimitResult {
  const limiter = strict ? strictLimiter : defaultLimiter;
  return limiter.check(identifier);
}

export { RateLimiter, type RateLimitResult, type RateLimitOptions };