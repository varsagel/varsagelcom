interface SecurityEvent {
  type: 'RATE_LIMIT_EXCEEDED' | 'INVALID_TOKEN' | 'CSRF_VIOLATION' | 'SUSPICIOUS_ACTIVITY' | 'AUTH_FAILURE';
  ip: string;
  userAgent?: string;
  userId?: string;
  path: string;
  method: string;
  timestamp: Date;
  details?: Record<string, any>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔒 Security Event:', {
        type: event.type,
        ip: event.ip,
        path: event.path,
        method: event.method,
        userId: event.userId,
        details: event.details
      });
    }

    // In production, you might want to send this to an external service
    // like Sentry, LogRocket, or your own logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(securityEvent);
    }
  }

  private async sendToExternalService(event: SecurityEvent) {
    try {
      // Example: Send to external logging service
      // await fetch('/api/security-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
      
      // For now, just log to console in production too
      console.error('Security Event:', event);
    } catch (error) {
      console.error('Failed to send security event to external service:', error);
    }
  }

  getEvents(filter?: Partial<Pick<SecurityEvent, 'type' | 'ip' | 'userId'>>): SecurityEvent[] {
    if (!filter) {
      return [...this.events];
    }

    return this.events.filter(event => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.ip && event.ip !== filter.ip) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      return true;
    });
  }

  getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getSuspiciousIPs(threshold: number = 5, minutes: number = 60): string[] {
    const recentEvents = this.getRecentEvents(minutes);
    const ipCounts = new Map<string, number>();

    recentEvents.forEach(event => {
      const count = ipCounts.get(event.ip) || 0;
      ipCounts.set(event.ip, count + 1);
    });

    return Array.from(ipCounts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([ip]) => ip);
  }

  clear() {
    this.events = [];
  }
}

// Singleton instance
const securityLogger = new SecurityLogger();

export function logSecurityEvent(
  type: SecurityEvent['type'],
  ip: string,
  path: string,
  method: string,
  options?: {
    userAgent?: string;
    userId?: string;
    details?: Record<string, any>;
  }
) {
  securityLogger.log({
    type,
    ip,
    path,
    method,
    userAgent: options?.userAgent,
    userId: options?.userId,
    details: options?.details
  });
}

export function getSecurityEvents(filter?: Parameters<SecurityLogger['getEvents']>[0]) {
  return securityLogger.getEvents(filter);
}

export function getRecentSecurityEvents(minutes?: number) {
  return securityLogger.getRecentEvents(minutes);
}

export function getSuspiciousIPs(threshold?: number, minutes?: number) {
  return securityLogger.getSuspiciousIPs(threshold, minutes);
}

export function clearSecurityLogs() {
  securityLogger.clear();
}

export { SecurityLogger, type SecurityEvent };