/**
 * Production-safe logging utility
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console[level](message, ...args);
    } else if (level === 'error') {
      // Production'da sadece error'ları log et
      console.error(message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }
}

export const logger = new Logger();

// Development-only console.log replacement
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};