import * as fs from 'fs';
import * as path from 'path';
import { ConsoleLogger, LogLevel } from '@nestjs/common';

/**
 * Log Level Priority (lower = more verbose)
 * debug < verbose < log < warn < error
 */
const LOG_LEVEL_PRIORITY: Record<string, number> = {
  debug: 0,
  verbose: 1,
  log: 2,
  warn: 3,
  error: 4,
};

/**
 * Custom File Logger
 * Extends NestJS ConsoleLogger và ghi thêm vào file
 * Console vẫn giữ nguyên format và màu sắc của NestJS
 * 
 * Respects LOG_LEVEL env variable:
 * - LOG_LEVEL=debug: Shows all logs (debug, verbose, log, warn, error)
 * - LOG_LEVEL=info: Shows log, warn, error only (default for production)
 * - LOG_LEVEL=warn: Shows warn, error only
 * - LOG_LEVEL=error: Shows errors only
 */
export class FileLogger extends ConsoleLogger {
  private logsDir: string;
  private minLogLevel: number;

  constructor() {
    super();
    
    // Determine minimum log level from environment
    const envLogLevel = (process.env.LOG_LEVEL || 'debug').toLowerCase();
    // Map 'info' to 'log' for NestJS compatibility
    const normalizedLevel = envLogLevel === 'info' ? 'log' : envLogLevel;
    this.minLogLevel = LOG_LEVEL_PRIORITY[normalizedLevel] ?? LOG_LEVEL_PRIORITY.debug;
    
    // Ensure logs directory exists
    this.logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Clear log files khi restart backend (ghi mới từ đầu)
    const logFiles = ['combined.log', 'app.log', 'error.log', 'warn.log'];
    logFiles.forEach(file => {
      const filePath = path.join(this.logsDir, file);
      fs.writeFileSync(filePath, ''); // Truncate file về empty
    });
  }

  /**
   * Check if a log level should be output based on LOG_LEVEL setting
   */
  private shouldLog(level: string): boolean {
    const levelPriority = LOG_LEVEL_PRIORITY[level] ?? 0;
    return levelPriority >= this.minLogLevel;
  }

  private writeToFile(level: string, message: string) {
    try {
      // Write to combined log
      const combinedPath = path.join(this.logsDir, 'combined.log');
      fs.appendFileSync(combinedPath, message + '\n');

      // Write to specific log file
      if (level === 'error') {
        const errorPath = path.join(this.logsDir, 'error.log');
        fs.appendFileSync(errorPath, message + '\n');
      } else if (level === 'warn') {
        const warnPath = path.join(this.logsDir, 'warn.log');
        fs.appendFileSync(warnPath, message + '\n');
      } else {
        const appPath = path.join(this.logsDir, 'app.log');
        fs.appendFileSync(appPath, message + '\n');
      }
    } catch (err) {
      // Silently fail to avoid breaking the app
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    const formatted = this.formatLogMessage('LOG', message, context);
    this.writeToFile('log', formatted);
  }

  error(message: any, stackOrContext?: string, context?: string) {
    super.error(message, stackOrContext, context);
    const formatted = this.formatLogMessage('ERROR', message, context || stackOrContext);
    this.writeToFile('error', formatted);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    const formatted = this.formatLogMessage('WARN', message, context);
    this.writeToFile('warn', formatted);
  }

  debug(message: any, context?: string) {
    // Only output to console if log level allows
    if (this.shouldLog('debug')) {
      super.debug(message, context);
    }
    // Always write to file for debugging
    const formatted = this.formatLogMessage('DEBUG', message, context);
    this.writeToFile('debug', formatted);
  }

  verbose(message: any, context?: string) {
    // Only output to console if log level allows
    if (this.shouldLog('verbose')) {
      super.verbose(message, context);
    }
    // Always write to file for debugging
    const formatted = this.formatLogMessage('VERBOSE', message, context);
    this.writeToFile('verbose', formatted);
  }

  private formatLogMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toLocaleString('en-US');
    const pid = process.pid;
    const contextStr = context ? `[${context}] ` : '';
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    // Format: [Nest] 4508  - 01/19/2026, 12:20:31 AM   LOG [Context] Message
    return `[Nest] ${pid}  - ${timestamp}   ${level} ${contextStr}${messageStr}`;
  }
}

